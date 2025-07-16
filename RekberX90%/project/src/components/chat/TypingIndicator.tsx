import React from 'react';

interface TypingIndicatorProps {
  typingUsers: string[];
  currentUser?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUser }) => {
  const filteredUsers = typingUsers.filter(user => user !== currentUser);
  
  if (filteredUsers.length === 0) return null;

  const getTypingText = () => {
    if (filteredUsers.length === 1) {
      return `${filteredUsers[0]} sedang mengetik...`;
    } else if (filteredUsers.length === 2) {
      return `${filteredUsers[0]} dan ${filteredUsers[1]} sedang mengetik...`;
    } else {
      return `${filteredUsers[0]} dan ${filteredUsers.length - 1} lainnya sedang mengetik...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic flex items-center space-x-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;