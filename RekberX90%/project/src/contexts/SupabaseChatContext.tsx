import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseChat } from '../hooks/useSupabaseChat';
import { useAuth } from './SupabaseAuthContext';
import { ChatService } from '../services/chat.service';
import { GameTopicsService } from '../services/gameTopics.service';
import { RekberService } from '../services/rekber.service';
import { ReportsService } from '../services/reports.service';
import type { 
  ChatRoom, 
  Message, 
  GameTopic, 
  RekberInvite,
  GameTopicInsert,
  UserReportInsert
} from '../lib/supabase/types';

interface ChatContextType {
  rooms: ChatRoom[];
  gameTopics: GameTopic[];
  invites: RekberInvite[];
  loading: boolean;
  sendMessage: (roomId: string, content: string, messageType?: 'text' | 'image', imageFile?: File) => Promise<boolean>;
  editMessage: (messageId: string, content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  getRoomMessages: (roomId: string) => Message[];
  sendRekberInvite: (targetUserId: string, targetUsername: string, game: string) => Promise<boolean>;
  acceptRekberInvite: (inviteId: string) => Promise<boolean>;
  rejectRekberInvite: (inviteId: string) => Promise<boolean>;
  getUnreadInvitesCount: () => number;
  createPrivateChat: (targetUserId: string, targetUsername: string) => Promise<string | null>;
  deleteRoom: (roomId: string) => Promise<boolean>;
  addGameTopic: (name: string, description: string, icon: string, iconUrl?: string) => Promise<boolean>;
  updateGameTopic: (id: string, updates: Partial<GameTopic>) => Promise<boolean>;
  deleteGameTopic: (id: string) => Promise<boolean>;
  claimRekberGroup: (roomId: string, adminId: string) => Promise<boolean>;
  updateRekberStatus: (roomId: string, status: string) => Promise<boolean>;
  getRekberGroups: () => ChatRoom[];
  submitReport: (reportData: UserReportInsert) => Promise<boolean>;
  canEditMessage: (message: Message, currentUserId: string) => boolean;
  canDeleteMessage: (message: Message, currentUserId: string) => boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const {
    rooms,
    gameTopics,
    invites,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    sendRekberInvite,
    acceptRekberInvite,
    rejectRekberInvite,
    getRoomMessages,
    getUnreadInvitesCount
  } = useSupabaseChat(user?.user_id);

  // Time limits for edit/delete (in minutes)
  const EDIT_TIME_LIMIT = 15;
  const DELETE_TIME_LIMIT = 30;

  const canEditMessage = (message: Message, currentUserId: string): boolean => {
    if (message.sender_id !== currentUserId || message.sender_id === 'SYSTEM') {
      return false;
    }
    
    const messageTime = new Date(message.created_at).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - messageTime) / (1000 * 60);
    
    return timeDiff <= EDIT_TIME_LIMIT;
  };

  const canDeleteMessage = (message: Message, currentUserId: string): boolean => {
    if (message.sender_id === 'SYSTEM') return false;
    
    if (message.sender_id === currentUserId) {
      const messageTime = new Date(message.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = (currentTime - messageTime) / (1000 * 60);
      return timeDiff <= DELETE_TIME_LIMIT;
    }
    
    return isAdmin();
  };

  const createPrivateChat = async (targetUserId: string, targetUsername: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const participants = [user.user_id, targetUserId].sort();
      const roomName = `${user.username} & ${targetUsername}`;
      
      // Check if room already exists
      const existingRoom = rooms.find(room => 
        room.type === 'private' && 
        room.participants?.includes(user.user_id) &&
        room.participants?.includes(targetUserId)
      );

      if (existingRoom) {
        return existingRoom.id;
      }

      const result = await ChatService.createChatRoom({
        name: roomName,
        type: 'private',
        participants,
        created_by: user.id
      });

      if (result.success && result.room) {
        // Add welcome message
        await ChatService.sendMessage({
          room_id: result.room.id,
          sender_id: 'SYSTEM',
          sender_username: 'RekberX System',
          content: `💬 Chat pribadi antara ${user.username} dan ${targetUsername} telah dimulai.`,
          message_type: 'text'
        });

        return result.room.id;
      }

      return null;
    } catch (error) {
      console.error('Error creating private chat:', error);
      return null;
    }
  };

  const deleteRoom = async (roomId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return false;

      // Check permissions
      if (room.type === 'public') return false;
      if (room.type === 'rekber' && room.status === 'active') return false;
      if (room.type === 'private' && !room.participants?.includes(user.user_id)) return false;

      return await ChatService.deleteChatRoom(roomId);
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  };

  const addGameTopic = async (name: string, description: string, icon: string, iconUrl?: string): Promise<boolean> => {
    if (!user || !isAdmin()) return false;

    try {
      const topicData: GameTopicInsert = {
        name,
        description,
        icon,
        icon_url: iconUrl,
        created_by: user.id
      };

      const result = await GameTopicsService.addGameTopic(topicData);
      return result.success;
    } catch (error) {
      console.error('Error adding game topic:', error);
      return false;
    }
  };

  const updateGameTopic = async (id: string, updates: Partial<GameTopic>): Promise<boolean> => {
    if (!isAdmin()) return false;

    try {
      const result = await GameTopicsService.updateGameTopic(id, updates);
      return result.success;
    } catch (error) {
      console.error('Error updating game topic:', error);
      return false;
    }
  };

  const deleteGameTopic = async (id: string): Promise<boolean> => {
    if (!isAdmin()) return false;

    try {
      return await GameTopicsService.deleteGameTopic(id);
    } catch (error) {
      console.error('Error deleting game topic:', error);
      return false;
    }
  };

  const claimRekberGroup = async (roomId: string, adminId: string): Promise<boolean> => {
    if (!isAdmin()) return false;

    try {
      return await RekberService.claimRekberGroup(roomId, adminId);
    } catch (error) {
      console.error('Error claiming rekber group:', error);
      return false;
    }
  };

  const updateRekberStatus = async (roomId: string, status: string): Promise<boolean> => {
    if (!isAdmin()) return false;

    try {
      return await RekberService.updateRekberStatus(roomId, status);
    } catch (error) {
      console.error('Error updating rekber status:', error);
      return false;
    }
  };

  const getRekberGroups = (): ChatRoom[] => {
    return rooms.filter(room => room.type === 'rekber');
  };

  const submitReport = async (reportData: UserReportInsert): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await ReportsService.submitReport({
        ...reportData,
        reporter_id: user.user_id,
        reporter_username: user.username
      });

      return result.success;
    } catch (error) {
      console.error('Error submitting report:', error);
      return false;
    }
  };

  const contextValue: ChatContextType = {
    rooms,
    gameTopics,
    invites,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    getRoomMessages,
    sendRekberInvite,
    acceptRekberInvite,
    rejectRekberInvite,
    getUnreadInvitesCount,
    createPrivateChat,
    deleteRoom,
    addGameTopic,
    updateGameTopic,
    deleteGameTopic,
    claimRekberGroup,
    updateRekberStatus,
    getRekberGroups,
    submitReport,
    canEditMessage,
    canDeleteMessage
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};