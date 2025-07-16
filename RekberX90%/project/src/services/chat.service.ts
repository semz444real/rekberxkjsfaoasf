import { supabase } from '../lib/supabase/client';
import type { 
  ChatRoom, 
  ChatRoomInsert, 
  ChatRoomUpdate,
  Message,
  MessageInsert,
  MessageUpdate
} from '../lib/supabase/types';

// FIXED: Pure Supabase implementation - no localStorage fallbacks
export class ChatService {
  // FIXED: Get all chat rooms from Supabase database
  static async getChatRooms(): Promise<ChatRoom[]> {
    try {
      console.log('📋 Fetching chat rooms from database...');
      
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching chat rooms:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Fetched chat rooms:', rooms?.length || 0);
      return rooms || [];
    } catch (error) {
      console.error('❌ Error fetching chat rooms:', error);
      throw error; // FIXED: Throw error instead of returning empty array
    }
  }

  // FIXED: Get messages from Supabase with proper error handling
  static async getMessages(roomId: string): Promise<Message[]> {
    try {
      console.log('💬 Fetching messages for room:', roomId);
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Fetched messages:', messages?.length || 0);
      return messages || [];
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      throw error;
    }
  }

  // FIXED: Send message to Supabase with realtime update
  static async sendMessage(message: MessageInsert): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      console.log('📤 Sending message to database:', message.content.substring(0, 50));
      
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Message sent successfully');
      return { success: true, message: newMessage };
    } catch (error) {
      console.error('❌ Send message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Edit message in Supabase
  static async editMessage(messageId: string, content: string): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      console.log('✏️ Editing message:', messageId);
      
      const { data: updatedMessage, error } = await supabase
        .from('messages')
        .update({
          content,
          is_edited: true,
          edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error editing message:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Message edited successfully');
      return { success: true, message: updatedMessage };
    } catch (error) {
      console.error('❌ Edit message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Delete message from Supabase
  static async deleteMessage(messageId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Error deleting message:', error);
        return false;
      }

      console.log('✅ Message deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Delete message error:', error);
      return false;
    }
  }

  // FIXED: Create chat room in Supabase
  static async createChatRoom(room: ChatRoomInsert): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    try {
      console.log('🏠 Creating chat room:', room.name);
      
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert(room)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating chat room:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Chat room created successfully');
      return { success: true, room: newRoom };
    } catch (error) {
      console.error('❌ Create chat room error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Update chat room in Supabase
  static async updateChatRoom(roomId: string, updates: ChatRoomUpdate): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    try {
      console.log('🔄 Updating chat room:', roomId);
      
      const { data: updatedRoom, error } = await supabase
        .from('chat_rooms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating chat room:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Chat room updated successfully');
      return { success: true, room: updatedRoom };
    } catch (error) {
      console.error('❌ Update chat room error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Delete chat room from Supabase
  static async deleteChatRoom(roomId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting chat room:', roomId);
      
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('❌ Error deleting chat room:', error);
        return false;
      }

      console.log('✅ Chat room deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Delete chat room error:', error);
      return false;
    }
  }

  // FIXED: Enhanced realtime subscriptions with proper error handling
  static subscribeToMessages(roomId: string, callback: (message: Message) => void) {
    console.log('🔔 Subscribing to messages for room:', roomId);
    
    return supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new);
          callback(payload.new as Message);
        }
      )
      .subscribe((status) => {
        console.log('📡 Message subscription status:', status);
      });
  }

  // FIXED: Subscribe to message updates
  static subscribeToMessageUpdates(roomId: string, callback: (message: Message) => void) {
    console.log('🔔 Subscribing to message updates for room:', roomId);
    
    return supabase
      .channel(`message_updates:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('✏️ Message updated:', payload.new);
          callback(payload.new as Message);
        }
      )
      .subscribe((status) => {
        console.log('📡 Message update subscription status:', status);
      });
  }

  // FIXED: Subscribe to message deletions
  static subscribeToMessageDeletions(roomId: string, callback: (messageId: string) => void) {
    console.log('🔔 Subscribing to message deletions for room:', roomId);
    
    return supabase
      .channel(`message_deletions:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('🗑️ Message deleted:', payload.old);
          callback(payload.old.id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Message deletion subscription status:', status);
      });
  }

  // FIXED: Subscribe to chat room changes
  static subscribeToChatRooms(callback: (room: ChatRoom) => void) {
    console.log('🔔 Subscribing to chat room changes');
    
    return supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          console.log('🏠 Chat room changed:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as ChatRoom);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Chat room subscription status:', status);
      });
  }
}