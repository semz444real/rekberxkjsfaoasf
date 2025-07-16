import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useChat } from '../contexts/SupabaseChatContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useOffline } from '../hooks/useOffline';
import { StorageService } from '../services/storage.service';
import { useToast } from '../hooks/useToast';
import NetworkErrorFallback from '../components/common/NetworkErrorFallback';
import LoadingFallback from '../components/common/LoadingFallback';
import { MessageCircle } from 'lucide-react';
import ChatHeader from '../components/chat/ChatHeader';
import ChatRoomList from '../components/chat/ChatRoomList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import UserModal from '../components/chat/UserModal';
import TypingIndicator from '../components/chat/TypingIndicator';
import OnlineIndicator from '../components/chat/OnlineIndicator';

const Chat: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { 
    rooms, 
    sendMessage, 
    editMessage,
    deleteMessage,
    canEditMessage,
    canDeleteMessage,
    sendRekberInvite, 
    createPrivateChat,
    gameTopics,
    deleteRoom,
    onlineUsers,
    typingUsers,
    sendTypingIndicator
  } = useChat();
  
  // Local state for active room
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, username: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'jb' | 'rekber' | 'private'>('jb');
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [currentRoomTyping, setCurrentRoomTyping] = useState<string[]>([]);
  const toast = useToast();
  const { handleError, withErrorHandling, error: chatError } = useErrorHandler();
  const { isOnline, addToOfflineQueue } = useOffline();

  const currentRoom = rooms.find(room => room.id === activeRoom);
  
  // Update typing users for current room
  useEffect(() => {
    if (activeRoom && typingUsers[activeRoom]) {
      setCurrentRoomTyping(typingUsers[activeRoom]);
    } else {
      setCurrentRoomTyping([]);
    }
  }, [activeRoom, typingUsers]);

  // Filter rooms based on active tab and game topics
  const filteredRooms = rooms.filter(room => {
    if (activeTab === 'jb') {
      return room.type === 'public';
    } else if (activeTab === 'private') {
      return room.type === 'private' && room.participants?.includes(user?.userId || '');
    } else {
      return room.type === 'rekber';
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [currentRoom?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || !activeRoom) return;

    const messageToSend = message.trim() || 'Gambar';
    const imageFile = selectedImage;
    
    // Clear form immediately for better UX
    setMessage('');
    setSelectedImage(null);
    
    if (!isOnline) {
      // Queue for offline processing
      addToOfflineQueue(
        () => sendMessage(activeRoom, messageToSend, imageFile ? 'image' : 'text', imageFile),
        `Send message: ${messageToSend.substring(0, 30)}...`
      );
      toast.info('Pesan Disimpan', 'Pesan akan dikirim saat koneksi pulih.');
      return;
    }
    
    const result = await withErrorHandling(async () => {
      if (selectedImage) {
        const uploadResult = await StorageService.uploadImage(selectedImage);
        if (uploadResult.success && uploadResult.url) {
          return await sendMessage(activeRoom, messageToSend, 'image', uploadResult.url);
        } else {
          throw new Error(uploadResult.error || 'Failed to upload image');
        }
      } else {
        return await sendMessage(activeRoom, messageToSend);
      }
    }, 'send_message');
    
    if (!result) {
      // Restore form data on error
      setMessage(messageToSend === 'Gambar' ? '' : messageToSend);
      setSelectedImage(imageFile);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;
    
    const result = await withErrorHandling(async () => {
      return await editMessage(messageId, editingContent);
    }, 'edit_message');
    
    if (result) {
      setEditingMessageId(null);
      setEditingContent('');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await withErrorHandling(async () => {
      return await deleteMessage(messageId);
    }, 'delete_message');
  };

  const startEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const getTimeRemaining = (timestamp: string, limitMinutes: number): string => {
    const messageTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const remainingMs = (limitMinutes * 60 * 1000) - (currentTime - messageTime);
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
    return remainingMinutes > 0 ? `${remainingMinutes}m` : '0m';
  };

  const handleUserClick = (senderId: string, senderName: string) => {
    if (senderId !== user?.userId && senderId !== 'SYSTEM' && user) {
      setSelectedUser({ id: senderId, username: senderName });
      setShowUserModal(true);
    }
  };

  const handleInviteRekber = () => {
    if (selectedUser && currentRoom) {
      sendRekberInvite(selectedUser.id, selectedUser.username, currentRoom.game || currentRoom.name);
      setShowUserModal(false);
      setSelectedUser(null);
      toast.success(
        'Undangan Rekber Dikirim!', 
        `Undangan telah dikirim ke ${selectedUser.username}. Tunggu konfirmasi dari user tersebut.`
      );
    }
  };

  const handlePrivateChat = () => {
    if (selectedUser) {
      const privateChatId = createPrivateChat(selectedUser.id, selectedUser.username);
      setActiveRoom(privateChatId);
      setActiveTab('private');
      
      setShowUserModal(false);
      setSelectedUser(null);
    }
  };

  const handleReport = (reason: string, description: string) => {
    if (selectedUser) {
      // TODO: Implement report functionality
      console.log('Report submitted:', {
        reportedUserId: selectedUser.id,
        reportedUsername: selectedUser.username,
        reason,
        description,
        reporterId: user?.userId,
        reporterUsername: user?.username
      });
      toast.success(
        'Laporan Dikirim!', 
        `Laporan terhadap ${selectedUser.username} telah dikirim ke admin untuk ditinjau.`
      );
    }
  };

  const handleMute = (duration: number) => {
    if (selectedUser) {
      // TODO: Implement mute functionality
      console.log('Mute user:', {
        userId: selectedUser.id,
        username: selectedUser.username,
        duration,
        adminId: user?.userId
      });
      const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds} detik`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} menit`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam`;
        return `${Math.floor(seconds / 86400)} hari`;
      };
      
      toast.warning(
        'User Di-Mute!', 
        `${selectedUser.username} telah di-mute selama ${formatDuration(duration)}.`
      );
    }
  };

  const handleBan = () => {
    if (selectedUser) {
      // TODO: Implement ban functionality
      console.log('Ban user:', {
        userId: selectedUser.id,
        username: selectedUser.username,
        adminId: user?.userId
      });
      toast.error(
        'User Di-Ban!', 
        `${selectedUser.username} telah di-ban permanent dan tidak bisa mengakses chat.`
      );
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    console.log('🗑️ handleDeleteRoom called with:', roomId);
    
    try {
      const success = await deleteRoom(roomId);
      console.log('Delete result:', success);
      if (success) {
        toast.success('Chat Dihapus!', 'Chat berhasil dihapus dari daftar.');
      } else {
        toast.error('Gagal Menghapus!', 'Terjadi kesalahan saat menghapus chat.');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Gagal Menghapus!', 'Terjadi kesalahan saat menghapus chat.');
    }
  };

  if (!user) {
    return (
      <NetworkErrorFallback
        title="Login Required"
        message="Silakan login untuk mengakses chat"
        showRetry={false}
      />
    );
  }
  
  // Show error fallback for critical chat errors
  if (chatError && chatError.severity === 'critical') {
    return (
      <NetworkErrorFallback
        error={chatError}
        onRetry={() => window.location.reload()}
        title="Chat Error"
        message="Terjadi kesalahan pada sistem chat"
      />
    );
  }

  // Room List View
  if (!activeRoom) {
    return (
      <ChatRoomList
        filteredRooms={filteredRooms}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRoomSelect={setActiveRoom}
        onDeleteRoom={handleDeleteRoom}
      />
    );
  }

  // Chat View - Full Screen WhatsApp Style
  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col overflow-hidden">
      <ChatHeader 
        currentRoom={currentRoom}
        onBackClick={() => setActiveRoom(null)}
      />

      <MessageList
        messages={currentRoom?.messages || []}
        currentUser={user}
        editingMessageId={editingMessageId}
        editingContent={editingContent}
        setEditingContent={setEditingContent}
        editInputRef={editInputRef}
        canEditMessage={canEditMessage}
        canDeleteMessage={canDeleteMessage}
        onUserClick={handleUserClick}
        onStartEdit={startEditMessage}
        onCancelEdit={cancelEdit}
        onSaveEdit={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        getTimeRemaining={getTimeRemaining}
        messagesEndRef={messagesEndRef}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        isDeleting={isDeleting}
        onlineUsers={onlineUsers}
      />

      {/* Typing Indicator */}
      <TypingIndicator 
        typingUsers={currentRoomTyping}
        currentUser={user?.username}
      />

      <MessageInput
        message={message}
        setMessage={setMessage}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        isUploading={isUploading}
        onSubmit={handleSendMessage}
        onTyping={(isTyping) => {
          if (activeRoom) {
            sendTypingIndicator(activeRoom, isTyping);
          }
        }}
      />

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        selectedUser={selectedUser}
        currentUser={user}
        isAdmin={isAdmin()}
        onInviteRekber={handleInviteRekber}
        onPrivateChat={handlePrivateChat}
        onReport={handleReport}
        onMute={handleMute}
        onBan={handleBan}
      />
    </div>
  );
};

export default Chat;