import { useState, useEffect } from 'react';

export interface SupabaseStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useSupabase = (): SupabaseStatus => {
  const [status, setStatus] = useState<SupabaseStatus>({
    isConnected: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Simulate connection check
    const timer = setTimeout(() => {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: 'Demo mode - using localStorage'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return status;
};