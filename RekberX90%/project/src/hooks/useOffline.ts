import { useState, useEffect } from 'react';
import { useToast } from './useToast';

interface OfflineQueueItem {
  id: string;
  action: () => Promise<any>;
  description: string;
  timestamp: Date;
}

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const toast = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Koneksi Pulih', 'Anda kembali online. Memproses data yang tertunda...');
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Offline', 'Anda sedang offline. Data akan disinkronkan saat koneksi pulih.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const addToOfflineQueue = (action: () => Promise<any>, description: string) => {
    const item: OfflineQueueItem = {
      id: Date.now().toString(),
      action,
      description,
      timestamp: new Date()
    };

    setOfflineQueue(prev => [...prev, item]);
    
    // Store in localStorage for persistence
    const stored = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    stored.push({
      ...item,
      action: action.toString() // Store function as string (limited functionality)
    });
    localStorage.setItem('offline_queue', JSON.stringify(stored));
  };

  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    toast.info('Sinkronisasi', `Memproses ${offlineQueue.length} item yang tertunda...`);

    const results = await Promise.allSettled(
      offlineQueue.map(item => item.action())
    );

    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        failureCount++;
        console.error(`Failed to process offline item: ${offlineQueue[index].description}`, result.reason);
      }
    });

    // Clear processed items
    setOfflineQueue([]);
    localStorage.removeItem('offline_queue');

    if (successCount > 0) {
      toast.success('Sinkronisasi Berhasil', `${successCount} item berhasil diproses.`);
    }

    if (failureCount > 0) {
      toast.error('Sinkronisasi Gagal', `${failureCount} item gagal diproses.`);
    }
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
    localStorage.removeItem('offline_queue');
  };

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue,
    processOfflineQueue,
    clearOfflineQueue
  };
};