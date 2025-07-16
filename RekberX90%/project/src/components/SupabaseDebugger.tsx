import React, { useState, useEffect } from 'react';
import { checkSupabaseConnection, getEnvironmentInfo } from '../lib/supabase/client';
import { supabase } from '../lib/supabase/client';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const SupabaseDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setTesting(true);
    
    const envInfo = getEnvironmentInfo();
    const connectionResult = await checkSupabaseConnection();
    
    // Test basic queries
    let tableTests = {};
    
    if (envInfo.hasUrl && envInfo.hasKey) {
      try {
        // Test each table
        const tables = ['users', 'chat_rooms', 'messages', 'game_topics', 'rekber_invites'];
        
        for (const table of tables) {
          try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            tableTests[table] = {
              success: !error,
              error: error?.message,
              count: data?.length || 0
            };
          } catch (err) {
            tableTests[table] = {
              success: false,
              error: err.message,
              count: 0
            };
          }
        }
      } catch (err) {
        console.error('Table test error:', err);
      }
    }

    setDebugInfo({
      environment: envInfo,
      connection: connectionResult,
      tableTests,
      timestamp: new Date().toISOString()
    });
    
    setTesting(false);
  };

  if (!debugInfo) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-800">Running diagnostics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <AlertCircle className="h-6 w-6 mr-2 text-orange-500" />
          Supabase Connection Diagnostics
        </h2>

        {/* Environment Variables */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Environment Variables</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>VITE_SUPABASE_URL:</span>
              <span className={debugInfo.environment.hasUrl ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.environment.hasUrl ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VITE_SUPABASE_ANON_KEY:</span>
              <span className={debugInfo.environment.hasKey ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.environment.hasKey ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-mono">{debugInfo.environment.mode}</span>
            </div>
            {debugInfo.environment.hasUrl && (
              <div className="flex justify-between">
                <span>URL Preview:</span>
                <span className="font-mono text-sm">{debugInfo.environment.urlPreview}</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Connection Test</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              {debugInfo.connection.isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={debugInfo.connection.isConnected ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.connection.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {debugInfo.connection.latency && (
              <p className="text-sm text-gray-600">Latency: {debugInfo.connection.latency}ms</p>
            )}
            {debugInfo.connection.error && (
              <p className="text-sm text-red-600 mt-2">Error: {debugInfo.connection.error}</p>
            )}
          </div>
        </div>

        {/* Table Tests */}
        {Object.keys(debugInfo.tableTests).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Database Tables</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {Object.entries(debugInfo.tableTests).map(([table, result]: [string, any]) => (
                <div key={table} className="flex justify-between items-center">
                  <span className="font-mono">{table}</span>
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? 'OK' : 'Error'}
                    </span>
                    {result.error && (
                      <span className="text-xs text-red-500">({result.error})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
          <div className="space-y-3">
            {!debugInfo.environment.hasUrl && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  <strong>Missing VITE_SUPABASE_URL:</strong> Add your Supabase project URL to environment variables
                </p>
              </div>
            )}
            {!debugInfo.environment.hasKey && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  <strong>Missing VITE_SUPABASE_ANON_KEY:</strong> Add your Supabase anon key to environment variables
                </p>
              </div>
            )}
            {debugInfo.environment.hasUrl && debugInfo.environment.hasKey && !debugInfo.connection.isConnected && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm">
                  <strong>Connection Failed:</strong> Check if your Supabase project is active and credentials are correct
                </p>
              </div>
            )}
            {debugInfo.connection.isConnected && Object.values(debugInfo.tableTests).some((t: any) => !t.success) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Database Schema Issues:</strong> Some tables are missing or have permission issues
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            <span>Re-run Diagnostics</span>
          </button>
          
          <button
            onClick={() => {
              const info = JSON.stringify(debugInfo, null, 2);
              navigator.clipboard.writeText(info);
              alert('Debug info copied to clipboard!');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Copy Debug Info
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(debugInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SupabaseDebugger;