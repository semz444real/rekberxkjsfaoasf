import React from 'react';
import { MessageCircle, Edit2, Trash2, Check, X } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import OnlineIndicator from './OnlineIndicator';

interface MessageListProps {
  messages: any[];
  currentUser: any;
  editingMessageId: string | null;
  editingContent: string;
  setEditingContent: (content: string) => void;
  editInputRef: React.RefObject<HTMLTextAreaElement>;
  canEditMessage: (message: any, userId: string) => boolean;
  canDeleteMessage: (message: any, userId: string) => boolean;
  onUserClick: (senderId: string, senderName: string) => void;
  onStartEdit: (messageId: string, content: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  getTimeRemaining: (timestamp: string, limitMinutes: number) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (messageId: string | null) => void;
  isDeleting: boolean;
  onlineUsers: string[];
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  editingMessageId,
  editingContent,
  setEditingContent,
  editInputRef,
  canEditMessage,
  canDeleteMessage,
  onUserClick,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteMessage,
  getTimeRemaining,
  messagesEndRef,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting,
  onlineUsers
}) => {
  const handleDeleteClick = (messageId: string) => {
    setShowDeleteConfirm(messageId);
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteMessage(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const getDeleteConfirmMessage = () => {
    if (!showDeleteConfirm) return '';
    
    const message = messages.find(m => m.id === showDeleteConfirm);
    if (!message) return '';
    
    const isOwnMessage = message.senderId === currentUser?.userId;
    
    if (isOwnMessage) {
      return 'Pesan ini akan dihapus secara permanen dan tidak dapat dikembalikan.';
    } else {
      return `Pesan dari ${message.sender} akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`;
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-3 py-2">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="group mb-1">
                {msg.sender === currentUser.username ? (
                  // Own message (right side) - Compact & Elegant
                  <div className="flex justify-end mb-2 group">
                    <div className="flex flex-col items-end max-w-xs lg:max-w-md">
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-br-md shadow-sm relative">
                        {/* Compact header for own messages */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-100 text-xs font-medium">You</span>
                          
                          {currentUser && (canEditMessage(msg, currentUser.userId) || canDeleteMessage(msg, currentUser.userId)) && editingMessageId !== msg.id && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              {canEditMessage(msg, currentUser.userId) && (
                                <button
                                  onClick={() => onStartEdit(msg.id, msg.content)}
                                  className="p-1 text-blue-200 hover:text-white hover:bg-blue-500/30 rounded transition-colors"
                                  title={`Edit (${getTimeRemaining(msg.timestamp, 15)} left)`}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              )}
                              {canDeleteMessage(msg, currentUser.userId) && (
                                <button
                                  onClick={() => handleDeleteClick(msg.id)}
                                  className="p-1 text-blue-200 hover:text-red-200 hover:bg-red-500/30 rounded transition-colors"
                                  title={
                                    msg.senderId === currentUser.userId 
                                      ? `Delete (${getTimeRemaining(msg.timestamp, 30)} left)`
                                      : 'Delete message (Admin)'
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {msg.messageType === 'image' && msg.imageUrl && (
                          <div className="mb-2">
                            <img
                              src={msg.imageUrl}
                              alt="Shared image"
                              className="max-w-full h-auto rounded-lg"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                        
                        {editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              ref={editInputRef}
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full p-2 text-gray-900 rounded-lg resize-none border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-sm"
                              rows={2}
                              placeholder="Edit your message..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  onSaveEdit(msg.id);
                                } else if (e.key === 'Escape') {
                                  onCancelEdit();
                                }
                              }}
                            />
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={onCancelEdit}
                                className="p-1 text-white hover:text-red-200 hover:bg-red-500/20 rounded transition-colors"
                                title="Cancel (Esc)"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => onSaveEdit(msg.id)}
                                disabled={!editingContent.trim()}
                                className="p-1 text-white hover:text-green-200 hover:bg-green-500/20 rounded transition-colors disabled:opacity-50"
                                title="Save (Enter)"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="leading-relaxed text-sm">{msg.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {msg.isEdited && (
                                  <span className="text-xs text-blue-200 italic">edited</span>
                                )}
                              </div>
                              <span className="text-xs text-blue-200">
                                {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Other's message (left side) - Compact & Clean
                  <div className="flex items-start space-x-2 mb-2 group">
                    <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {msg.sender.charAt(0).toUpperCase()}
                      </span>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineIndicator 
                          isOnline={onlineUsers.includes(msg.senderId)} 
                          size="sm"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white text-gray-900 px-3 py-2 rounded-2xl rounded-bl-md max-w-xs lg:max-w-md shadow-sm border border-gray-100 flex-1">
                      {/* Compact header with user info */}
                      <div className="flex items-center space-x-2 mb-1 pb-1 border-b border-gray-100">
                        <button
                          onClick={() => onUserClick(msg.senderId, msg.sender)}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-sm"
                        >
                          {msg.sender}
                        </button>
                        
                        {msg.senderId !== 'SYSTEM' && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                            {msg.senderId}
                          </span>
                        )}
                        
                        {/* Role badges - compact */}
                        {msg.senderId !== 'SYSTEM' && (
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                            msg.senderId === '971968' ? 'bg-yellow-100 text-yellow-800' :
                            msg.senderId.startsWith('200') ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {msg.senderId === '971968' ? '👑' :
                             msg.senderId.startsWith('200') ? '🛡️' :
                             '👤'}
                          </span>
                        )}
                        
                        {/* Custom Role Badge - compact */}
                        {(() => {
                          const users = JSON.parse(localStorage.getItem('rekberx_users') || '[]');
                          const messageUser = users.find((u: any) => u.userId === msg.senderId);
                          if (messageUser?.customRole) {
                            return (
                              <span 
                                className="px-1.5 py-0.5 text-xs font-medium rounded text-white"
                                style={{ backgroundColor: messageUser.customRoleColor }}
                              >
                                {messageUser.customRoleEmoji || '⭐'}
                              </span>
                            );
                          }
                          return null;
                        })()}
                        
                        {msg.senderId === 'SYSTEM' && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            🤖
                          </span>
                        )}
                      </div>
                      
                      {msg.messageType === 'image' && msg.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={msg.imageUrl}
                            alt="Shared image"
                            className="max-w-full h-auto rounded-lg"
                            style={{ maxHeight: '150px' }}
                          />
                        </div>
                      )}
                      
                      <p className="text-gray-800 leading-relaxed text-sm">{msg.content}</p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div>
                          {msg.isEdited && (
                            <span className="text-xs text-gray-400 italic">edited</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Admin delete button - compact */}
                    {currentUser && canDeleteMessage(msg, currentUser.userId) && editingMessageId !== msg.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => handleDeleteClick(msg.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="Delete message (Admin)"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pesan</p>
              <p className="text-gray-400 text-sm">Mulai percakapan dengan mengirim pesan</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pesan"
        message={getDeleteConfirmMessage()}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default MessageList;