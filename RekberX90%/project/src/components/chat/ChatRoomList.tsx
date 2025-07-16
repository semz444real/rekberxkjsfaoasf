import React from 'react';
import { MessageCircle, Users, ArrowLeft, Trash2 } from 'lucide-react';
import { useChat } from '../../contexts/SupabaseChatContext';
import ConfirmModal from '../common/ConfirmModal';

interface ChatRoomListProps {
  filteredRooms: any[];
  activeTab: 'jb' | 'rekber' | 'private';
  setActiveTab: (tab: 'jb' | 'rekber' | 'private') => void;
  onRoomSelect: (roomId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  filteredRooms,
  activeTab,
  setActiveTab,
  onRoomSelect,
  onDeleteRoom
}) => {
  const { gameTopics, user } = useChat();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Function to get game topic data including custom icon
  const getGameTopicData = (gameName: string) => {
    return gameTopics.find(topic => topic.name === gameName);
  };

  const canDeleteRoom = (room: any) => {
    if (activeTab === 'jb') return false; // JB rooms cannot be deleted
    if (activeTab === 'private') return true; // Private chats can always be deleted
    if (activeTab === 'rekber') {
      // Rekber rooms can only be deleted if not pending/active
      return room.status !== 'active' && room.status !== 'pending';
    }
    return false;
  };

  const handleDeleteClick = (e: React.MouseEvent, room: any) => {
    console.log('🗑️ TRASH BUTTON CLICKED for room:', room.id, room.name);
    e.stopPropagation();
    
    if (activeTab === 'rekber' && (room.status === 'active' || !room.status)) {
      console.log('❌ Cannot delete active Rekber room');
      setDeleteError('Grup Rekber yang sedang aktif tidak dapat dihapus. Tunggu hingga transaksi selesai atau dibatalkan.');
      return;
    }
    
    console.log('✅ Setting showDeleteConfirm to:', room.id);
    setShowDeleteConfirm(room.id);
  };

  const handleConfirmDelete = () => {
    console.log('🔴 CONFIRM DELETE BUTTON CLICKED');
    console.log('🔴 showDeleteConfirm:', showDeleteConfirm);
    console.log('🔴 onDeleteRoom function exists:', typeof onDeleteRoom);
    
    if (showDeleteConfirm && onDeleteRoom) {
      console.log('🔴 Calling onDeleteRoom with:', showDeleteConfirm);
      onDeleteRoom(showDeleteConfirm);
      setShowDeleteConfirm(null);
      console.log('🔴 Modal closed, showDeleteConfirm set to null');
    } else {
      console.error('❌ Cannot delete - missing data:', { showDeleteConfirm, onDeleteRoom: typeof onDeleteRoom });
    }
  };

  const getDeleteMessage = () => {
    if (!showDeleteConfirm) return '';
    
    const room = filteredRooms.find(r => r.id === showDeleteConfirm);
    if (!room) return '';
    
    if (activeTab === 'private') {
      return `Chat pribadi dengan "${room.name}" akan dihapus permanen. Semua riwayat pesan akan hilang dan tidak dapat dikembalikan.`;
    } else if (activeTab === 'rekber') {
      return `Grup Rekber "${room.name}" akan dihapus permanen. Pastikan transaksi sudah selesai sebelum menghapus grup ini.`;
    }
    
    return 'Room ini akan dihapus permanen.';
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
            <h1 className="text-2xl font-bold">Pilih Game</h1>
            <p className="text-blue-100 mt-1">Pilih game untuk mulai chat</p>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('jb')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'jb'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Chat JB
              </button>
              <button
                onClick={() => setActiveTab('rekber')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'rekber'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Chat Rekber
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'private'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Chat Pribadi
              </button>
            </div>
          </div>

          {/* Room List */}
          <div className="p-4">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  {activeTab === 'jb' ? 'Pilih game untuk mulai JB' : 
                   activeTab === 'rekber' ? 'Belum ada grup Rekber' : 
                   'Belum ada chat pribadi'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === 'jb' ? 'Chat JB tersedia untuk semua game' : 
                   activeTab === 'rekber' ? 'Grup Rekber akan dibuat otomatis saat ada undangan' :
                   'Klik username di chat untuk memulai chat pribadi'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room.id)}
                    className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-blue-300 transition-all duration-200 group relative"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        {(() => {
                          const topicData = getGameTopicData(room.game || room.name);
                          if (topicData?.iconUrl) {
                            return (
                              <img
                                src={topicData.iconUrl}
                                alt={room.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to text icon if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'block';
                                }}
                              />
                            );
                          }
                          return null;
                        })()}
                        <span 
                          className="text-white font-bold text-xl"
                          style={{ 
                            display: (() => {
                              const topicData = getGameTopicData(room.game || room.name);
                              return topicData?.iconUrl ? 'none' : 'block';
                            })()
                          }}
                        >
                          {(() => {
                            const topicData = getGameTopicData(room.game || room.name);
                            return topicData?.icon || (room.name ? room.name.charAt(0) : '?');
                          })()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {activeTab === 'jb' ? `JB ${room.name}` : 
                           activeTab === 'private' ? `💬 ${room.name}` : 
                           room.name}
                        </h3>
                        <p className="text-gray-500 mt-1">
                          {room.messages && room.messages.length > 0 
                            ? `${room.messages[room.messages.length - 1].sender}: ${room.messages[room.messages.length - 1].content.substring(0, 40)}...`
                            : 'Belum ada pesan'
                          }
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{room.messages ? room.messages.length : 0} pesan</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(activeTab === 'rekber' || activeTab === 'private') && canDeleteRoom(room) && (
                          <button
                            onClick={(e) => handleDeleteClick(e, room)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Hapus Chat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <div className="text-blue-600">
                          <ArrowLeft className="h-6 w-6 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title={activeTab === 'private' ? 'Hapus Chat Pribadi' : 'Hapus Grup Rekber'}
        message={getDeleteMessage()}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Error Modal for Rekber */}
      <ConfirmModal
        isOpen={deleteError !== null}
        onClose={() => setDeleteError(null)}
        onConfirm={() => setDeleteError(null)}
        title="Tidak Dapat Menghapus"
        message={deleteError || ''}
        confirmText="Mengerti"
        cancelText=""
        type="warning"
      />
    </>
  );
};

export default ChatRoomList;