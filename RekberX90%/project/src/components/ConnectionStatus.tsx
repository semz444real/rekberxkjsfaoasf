import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { checkSupabaseConnection, getEnvironmentInfo, testRealtimeConnection } from '../lib/supabase/client';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ConnectionStatusProps {
  onConnectionChange?: (status: ConnectionState) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onConnectionChange }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // FIXED: Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // FIXED: Enhanced connection check with better error handling
  const checkConnection = async () => {
    console.log('🔍 Starting connection check...');
    setConnectionState('connecting');
    
    try {
      // Test database connection first
      const dbResult = await checkSupabaseConnection();
      console.log('📊 Database result:', dbResult);
      
      if (dbResult.isConnected) {
        // Test realtime connection
        const realtimeResult = await testRealtimeConnection();
        console.log('📡 Realtime result:', realtimeResult);
        setRealtimeStatus(realtimeResult);
        
        setConnectionState('connected');
        setLatency(dbResult.latency || null);
        setError(null);
        onConnectionChange?.('connected');
      } else {
        setConnectionState('error');
        setError(dbResult.error || 'Database connection failed');
        setLatency(null);
        setRealtimeStatus(false);
        onConnectionChange?.('error');
      }
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      setConnectionState('error');
      setError(error instanceof Error ? error.message : 'Connection failed');
      setLatency(null);
      setRealtimeStatus(false);
      onConnectionChange?.('error');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkConnection();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    switch (connectionState) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (isRefreshing) return 'Refreshing...';
    
    switch (connectionState) {
      case 'connected':
        return `Connected${latency ? ` (${latency}ms)` : ''}`;
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    if (isRefreshing) return 'bg-blue-50 border-blue-200 text-blue-800';
    
    switch (connectionState) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'connecting':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const envInfo = getEnvironmentInfo();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium transition-colors ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Connection Status</h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className={connectionState === 'connected' ? 'text-green-600' : 'text-red-600'}>
                  {connectionState === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Realtime:</span>
                <span className={realtimeStatus ? 'text-green-600' : 'text-red-600'}>
                  {realtimeStatus ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {latency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Latency:</span>
                  <span className="text-gray-900">{latency}ms</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="text-gray-900">{envInfo.mode}</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-xs">{error}</p>
              </div>
            )}

            {connectionState === 'error' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-xs">
                  <strong>Troubleshooting:</strong>
                  <br />• Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
                  <br />• Check if Supabase project is active (not paused)
                  <br />• Ensure database schema has been applied
                  <br />• Check your internet connection
                  <br />• Restart dev server after changing .env
                </p>
              </div>
            )}

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs">
                <strong>Environment Check:</strong>
                <br />• URL: {envInfo.hasUrl ? '✅' : '❌'} {envInfo.urlPreview}
                <br />• Key: {envInfo.hasKey ? '✅' : '❌'} {envInfo.keyPreview}
                <br />• Project: {envInfo.hasUrl ? envInfo.urlPreview.split('//')[1]?.split('.')[0] : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;