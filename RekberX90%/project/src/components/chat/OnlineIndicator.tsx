import React from 'react';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ isOnline, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full ${
      isOnline ? 'bg-green-500' : 'bg-gray-400'
    } border-2 border-white shadow-sm`} />
  );
};

export default OnlineIndicator;