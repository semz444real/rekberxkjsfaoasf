import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from '../services/chat.service';
import { GameTopicsService } from '../services/gameTopics.service';
import { RekberService } from '../services/rekber.service';
import { StorageService } from '../services/storage.service';
import { supabase } from '../lib/supabase/client';
import type { 
  ChatRoom, 
  Message, 
  GameTopic, 
  RekberInvite,
  MessageInsert 
} from '../lib/supabase/types';

// FIXED: Enhanced Supabase hook with proper subscription management
export const useSupabaseChat = (userId?: string) => {
  const [rooms, setRooms] = useState<(ChatRoom & { messages?: Message[] })[]>([]);
  const [gameTopics, setGameTopics] = useState<GameTopic[]>([]);
  const [invites, setInvites] = useState<RekberInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  
  // FIXED: Use refs to track subscriptions and prevent memory leaks
  const subscriptionsRef = useRef<any[]>([]);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // FIXED: Cleanup function to properly unsubscribe
  const cleanupSubscriptions = useCallback(() => {
    console.log('🧹 Cleaning up subscriptions...');
    
    // Unsubscribe from all channels
    subscriptionsRef.current.forEach(subscription => {
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error('❌ Error unsubscribing:', error);
      }
    });
    subscriptionsRef.current = [];

    // Clear presence interval
    if (presenceIntervalRef.current) {
      clearInterval(presenceIntervalRef.current);
      presenceIntervalRef.current = null;
    }
  }, []);

  // FIXED: Load initial data from Supabase only
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🔄 Loading initial chat data from Supabase...');
        setLoading(true);
        
        // FIXED: All data comes from Supabase database
        const [roomsData, topicsData, invitesData] = await Promise.all([
          ChatService.getChatRooms(),
          GameTopicsService.getGameTopics(),
          userId ? RekberService.getRekberInvites(userId) : Promise.resolve([])
        ]);

        console.log('📊 Initial data loaded:', {
          rooms: roomsData.length,
          topics: topicsData.length,
          invites: invitesData.length
        });

        // FIXED: Load messages for each room from database
        const roomsWithMessages = await Promise.all(
          roomsData.map(async (room) => {
            try {
              const messages = await ChatService.getMessages(room.id);
              return { ...room, messages };
            } catch (error) {
              console.error('❌ Error loading messages for room:', room.id, error);
              return { ...room, messages: [] };
            }
          })
        );

        setRooms(roomsWithMessages);
        setGameTopics(topicsData);
        setInvites(invitesData);

        console.log('✅ Initial data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading initial chat data:', error);
        // FIXED: Don't fallback to localStorage - show actual error
        setRooms([]);
        setGameTopics([]);
        setInvites([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userId]);

  // FIXED: Enhanced realtime subscriptions with proper cleanup
  useEffect(() => {
    if (!userId) return;

    console.log('📡 Setting up realtime subscriptions for user:', userId);
    
    // Cleanup previous subscriptions
    cleanupSubscriptions();

    try {
      // FIXED: Subscribe to new messages with unique channel names
      const messagesSubscription = supabase
        .channel(`messages_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('📨 New message received:', payload.new);
            const newMessage = payload.new as Message;
            setRooms(prev => prev.map(room => {
              if (room.id === newMessage.room_id) {
                return {
                  ...room,
                  messages: [...(room.messages || []), newMessage],
                  last_message_at: newMessage.created_at,
                  message_count: (room.message_count || 0) + 1
                };
              }
              return room;
            }));
          }
        )
        .subscribe((status) => {
          console.log('📡 Messages subscription status:', status);
        });

      subscriptionsRef.current.push(messagesSubscription);

      // FIXED: Subscribe to message updates with unique channel
      const messageUpdatesSubscription = supabase
        .channel(`message_updates_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('✏️ Message updated:', payload.new);
            const updatedMessage = payload.new as Message;
            setRooms(prev => prev.map(room => {
              if (room.id === updatedMessage.room_id) {
                return {
                  ...room,
                  messages: (room.messages || []).map(msg => 
                    msg.id === updatedMessage.id ? updatedMessage : msg
                  )
                };
              }
              return room;
            }));
          }
        )
        .subscribe((status) => {
          console.log('📡 Message updates subscription status:', status);
        });

      subscriptionsRef.current.push(messageUpdatesSubscription);

      // FIXED: Subscribe to message deletions with unique channel
      const messageDeletionsSubscription = supabase
        .channel(`message_deletions_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('🗑️ Message deleted:', payload.old);
            const deletedMessage = payload.old as Message;
            setRooms(prev => prev.map(room => {
              if (room.id === deletedMessage.room_id) {
                return {
                  ...room,
                  messages: (room.messages || []).filter(msg => msg.id !== deletedMessage.id),
                  message_count: Math.max((room.message_count || 1) - 1, 0)
                };
              }
              return room;
            }));
          }
        )
        .subscribe((status) => {
          console.log('📡 Message deletions subscription status:', status);
        });

      subscriptionsRef.current.push(messageDeletionsSubscription);

      // FIXED: Subscribe to chat room changes with unique channel
      const roomsSubscription = supabase
        .channel(`chat_rooms_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_rooms'
          },
          async (payload) => {
            console.log('🏠 Chat room changed:', payload);
            if (payload.eventType === 'INSERT') {
              const newRoom = payload.new as ChatRoom;
              const messages = await ChatService.getMessages(newRoom.id);
              setRooms(prev => [...prev, { ...newRoom, messages }]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedRoom = payload.new as ChatRoom;
              setRooms(prev => prev.map(room => 
                room.id === updatedRoom.id 
                  ? { ...room, ...updatedRoom }
                  : room
              ));
            } else if (payload.eventType === 'DELETE') {
              const deletedRoom = payload.old as ChatRoom;
              setRooms(prev => prev.filter(room => room.id !== deletedRoom.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Chat rooms subscription status:', status);
        });

      subscriptionsRef.current.push(roomsSubscription);

      // FIXED: Subscribe to game topics changes with unique channel
      const topicsSubscription = supabase
        .channel(`game_topics_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_topics'
          },
          (payload) => {
            console.log('🎮 Game topic changed:', payload);
            if (payload.eventType === 'INSERT') {
              const newTopic = payload.new as GameTopic;
              setGameTopics(prev => [...prev, newTopic]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedTopic = payload.new as GameTopic;
              setGameTopics(prev => prev.map(topic => 
                topic.id === updatedTopic.id ? updatedTopic : topic
              ));
            } else if (payload.eventType === 'DELETE') {
              const deletedTopic = payload.old as GameTopic;
              setGameTopics(prev => prev.filter(topic => topic.id !== deletedTopic.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Game topics subscription status:', status);
        });

      subscriptionsRef.current.push(topicsSubscription);

      // FIXED: Subscribe to rekber invites with unique channel
      const invitesSubscription = supabase
        .channel(`rekber_invites_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rekber_invites',
            filter: `to_user_id=eq.${userId}`
          },
          (payload) => {
            console.log('🛡️ Rekber invite changed:', payload);
            if (payload.eventType === 'INSERT') {
              const newInvite = payload.new as RekberInvite;
              setInvites(prev => [newInvite, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedInvite = payload.new as RekberInvite;
              setInvites(prev => prev.map(invite => 
                invite.id === updatedInvite.id ? updatedInvite : invite
              ));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Rekber invites subscription status:', status);
        });

      subscriptionsRef.current.push(invitesSubscription);

      // FIXED: Enhanced user presence tracking with proper cleanup
      const updatePresence = async () => {
        if (userId) {
          try {
            await supabase.rpc('update_user_presence', {
              user_id_param: userId,
              username_param: 'User' // This should be actual username from context
            });
          } catch (error) {
            console.error('❌ Error updating presence:', error);
          }
        }
      };

      updatePresence();
      presenceIntervalRef.current = setInterval(updatePresence, 30000);

      // FIXED: Subscribe to user presence changes with unique channel
      const presenceSubscription = supabase
        .channel(`user_presence_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_sessions'
          },
          (payload) => {
            console.log('👥 User presence changed:', payload);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const session = payload.new;
              setOnlineUsers(prev => {
                const filtered = prev.filter(id => id !== session.user_id);
                return [...filtered, session.user_id];
              });
            } else if (payload.eventType === 'DELETE') {
              const session = payload.old;
              setOnlineUsers(prev => prev.filter(id => id !== session.user_id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 User presence subscription status:', status);
        });

      subscriptionsRef.current.push(presenceSubscription);

      // FIXED: Subscribe to typing indicators with unique channel
      const typingSubscription = supabase
        .channel(`typing_indicators_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'typing_indicators'
          },
          (payload) => {
            console.log('⌨️ Typing indicator changed:', payload);
            if (payload.eventType === 'INSERT') {
              const typing = payload.new;
              setTypingUsers(prev => ({
                ...prev,
                [typing.room_id]: [...(prev[typing.room_id] || []), typing.username]
              }));
            } else if (payload.eventType === 'DELETE') {
              const typing = payload.old;
              setTypingUsers(prev => ({
                ...prev,
                [typing.room_id]: (prev[typing.room_id] || []).filter(u => u !== typing.username)
              }));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Typing indicators subscription status:', status);
        });

      subscriptionsRef.current.push(typingSubscription);

      console.log('✅ All realtime subscriptions set up successfully');

    } catch (error) {
      console.error('❌ Error setting up realtime subscriptions:', error);
    }

    // FIXED: Cleanup function
    return () => {
      console.log('🔌 Cleaning up realtime subscriptions...');
      cleanupSubscriptions();
      
      // Clean up presence on unmount
      if (userId) {
        supabase
          .from('user_sessions')
          .delete()
          .eq('user_id', userId)
          .then(() => console.log('✅ User presence cleaned up'))
          .catch(error => console.error('❌ Error cleaning up presence:', error));
      }
    };
  }, [userId, cleanupSubscriptions]);

  // FIXED: Send message with proper error handling
  const sendMessage = useCallback(async (
    roomId: string, 
    content: string, 
    messageType: 'text' | 'image' = 'text',
    imageFile?: File
  ): Promise<boolean> => {
    if (!userId) {
      console.error('❌ Cannot send message: No user ID');
      return false;
    }

    try {
      console.log('📤 Sending message:', { roomId, content: content.substring(0, 50), messageType });
      
      let imageUrl: string | undefined;

      if (imageFile && messageType === 'image') {
        console.log('📷 Uploading image...');
        const uploadResult = await StorageService.uploadImage(imageFile);
        if (!uploadResult.success) {
          console.error('❌ Image upload failed:', uploadResult.error);
          throw new Error(uploadResult.error);
        }
        imageUrl = uploadResult.url;
        console.log('✅ Image uploaded successfully');
      }

      const messageData: MessageInsert = {
        room_id: roomId,
        sender_id: userId,
        sender_username: 'User', // This should be fetched from user context
        content,
        message_type: messageType,
        image_url: imageUrl
      };

      const result = await ChatService.sendMessage(messageData);
      
      if (result.success) {
        // Clear typing indicator
        try {
          await supabase
            .from('typing_indicators')
            .delete()
            .eq('room_id', roomId)
            .eq('user_id', userId);
        } catch (error) {
          console.error('❌ Error clearing typing indicator:', error);
        }
        
        console.log('✅ Message sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send message:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }, [userId]);

  // FIXED: Edit message with database update
  const editMessage = useCallback(async (messageId: string, content: string): Promise<boolean> => {
    try {
      console.log('✏️ Editing message:', messageId);
      const result = await ChatService.editMessage(messageId, content);
      
      if (result.success) {
        console.log('✅ Message edited successfully');
        return true;
      } else {
        console.error('❌ Failed to edit message:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error editing message:', error);
      return false;
    }
  }, []);

  // FIXED: Delete message from database
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting message:', messageId);
      const success = await ChatService.deleteMessage(messageId);
      
      if (success) {
        console.log('✅ Message deleted successfully');
        return true;
      } else {
        console.error('❌ Failed to delete message');
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      return false;
    }
  }, []);

  // FIXED: Send typing indicator to database
  const sendTypingIndicator = useCallback(async (roomId: string, isTyping: boolean) => {
    if (!userId) return;

    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            room_id: roomId,
            user_id: userId,
            username: 'User', // This should be actual username
            expires_at: new Date(Date.now() + 5000).toISOString() // 5 seconds
          });
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
    }
  }, [userId]);

  // FIXED: Send rekber invite to database
  const sendRekberInvite = useCallback(async (
    targetUserId: string,
    targetUsername: string,
    game: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      console.log('🛡️ Sending rekber invite:', { targetUserId, game });
      
      const result = await RekberService.sendRekberInvite({
        from_user_id: userId,
        from_username: 'User', // This should be fetched from user context
        to_user_id: targetUserId,
        to_username: targetUsername,
        game
      });

      if (result.success) {
        console.log('✅ Rekber invite sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send rekber invite:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending rekber invite:', error);
      return false;
    }
  }, [userId]);

  // FIXED: Accept rekber invite in database
  const acceptRekberInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      console.log('✅ Accepting rekber invite:', inviteId);
      
      const result = await RekberService.acceptRekberInvite(inviteId, userId);
      if (result.success && result.room) {
        const messages = await ChatService.getMessages(result.room.id);
        setRooms(prev => [...prev, { ...result.room!, messages }]);
        console.log('✅ Rekber invite accepted successfully');
        return true;
      } else {
        console.error('❌ Failed to accept rekber invite:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error accepting rekber invite:', error);
      return false;
    }
  }, [userId]);

  // FIXED: Reject rekber invite in database
  const rejectRekberInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    try {
      console.log('❌ Rejecting rekber invite:', inviteId);
      
      const success = await RekberService.rejectRekberInvite(inviteId);
      if (success) {
        console.log('✅ Rekber invite rejected successfully');
        return true;
      } else {
        console.error('❌ Failed to reject rekber invite');
        return false;
      }
    } catch (error) {
      console.error('❌ Error rejecting rekber invite:', error);
      return false;
    }
  }, []);

  // FIXED: Get messages for a room from state
  const getRoomMessages = useCallback((roomId: string): Message[] => {
    const room = rooms.find(r => r.id === roomId);
    return room?.messages || [];
  }, [rooms]);

  // FIXED: Get unread invites count
  const getUnreadInvitesCount = useCallback((): number => {
    return invites.filter(invite => 
      invite.to_user_id === userId && invite.status === 'pending'
    ).length;
  }, [invites, userId]);

  return {
    rooms,
    gameTopics,
    invites,
    loading,
    onlineUsers,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    sendRekberInvite,
    acceptRekberInvite,
    rejectRekberInvite,
    getRoomMessages,
    getUnreadInvitesCount
  };
};