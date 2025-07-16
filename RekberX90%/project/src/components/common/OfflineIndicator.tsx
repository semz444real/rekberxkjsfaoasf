import React from 'react';
import { WifiOff, Wifi, Clock } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { isOnline, offlineQueue } = useOffline();

  if (isOnline && offlineQueue.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
      isOnline ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Online</span>
          {offlineQueue.length > 0 && (
            <>
              <Clock className="h-4 w-4" />
              <span className="text-sm">{offlineQueue.length} pending</span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Offline</span>
          {offlineQueue.length > 0 && (
            <>
              <Clock className="h-4 w-4" />
              <span className="text-sm">{offlineQueue.length} queued</span>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;