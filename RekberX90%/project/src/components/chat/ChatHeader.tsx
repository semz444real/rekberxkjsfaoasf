import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  currentRoom: any;
  onBackClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ currentRoom, onBackClick }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2.5 flex items-center space-x-3 shadow-lg flex-shrink-0">
      <button
        onClick={onBackClick}
        className="p-1.5 hover:bg-blue-700 rounded-full transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="font-bold text-xs">
          {currentRoom?.name ? currentRoom.name.charAt(0) : '?'}
        </span>
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold text-base">
          {currentRoom?.type === 'public' ? `JB ${currentRoom?.name || 'Unknown'}` : 
           currentRoom?.type === 'private' ? `💬 ${currentRoom?.name || 'Unknown'}` :
           currentRoom?.name || 'Unknown'}
        </h3>
        <p className="text-blue-100 text-xs flex items-center">
          {currentRoom?.type === 'public' ? 'Chat Jual Beli' : 
           currentRoom?.type === 'private' ? 'Chat Pribadi' :
           'Grup Rekber'}
          <span className="mx-1">•</span>
          <span className="text-green-200">Online</span>
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;