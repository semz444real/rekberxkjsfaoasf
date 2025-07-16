import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// FIXED: Enhanced environment variable validation with detailed logging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced environment validation
console.log('🔧 Environment Check:', {
  NODE_ENV: import.meta.env.MODE,
  url: supabaseUrl ? '✅ URL Set' : '❌ URL Missing',
  key: supabaseAnonKey ? '✅ Key Set' : '❌ Key Missing',
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0,
  keyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'not-set'
});

// FIXED: Better error handling for missing env vars
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Validate API key format (should be a JWT token)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY appears to be invalid (should start with "eyJ")');
  console.warn('⚠️ API key format warning - please verify your anon key from Supabase dashboard');
}

// FIXED: Enhanced Supabase client with better error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 5 // FIXED: Reduced to prevent overload
    }
  },
  global: {
    headers: {
      'x-client-info': 'rekberx-app'
    }
  }
});

// FIXED: Enhanced connection test with timeout and retry
export const checkSupabaseConnection = async (): Promise<{
  isConnected: boolean;
  latency: number | null;
  error: string | null;
}> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('🔗 URL:', supabaseUrl);
    console.log('🔑 Key length:', supabaseAnonKey.length);
    
    // FIXED: First check if URL is reachable
    try {
      // Use REST API endpoint instead of /health which requires auth
      const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        signal: AbortSignal.timeout(5000)
      });
      console.log('🏥 Health check response:', healthCheck.status);
    } catch (healthError) {
      console.warn('⚠️ Health check failed:', healthError.message);
      return {
        isConnected: false,
        latency: null,
        error: `Cannot reach Supabase URL: ${healthError.message}. Please check your VITE_SUPABASE_URL in .env file.`
      };
    }
    
    const start = Date.now();
    
    // FIXED: Test database connection with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const { data, error } = await supabase
      .from('users')
      .select('id')
        .limit(1)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      const latency = Date.now() - start;
      
      if (error) {
        console.error('❌ Database query failed:', error);
        
        // FIXED: Provide specific error messages
        if (error.code === '42P01') {
          return {
            isConnected: false,
            latency: null,
            error: 'Database tables not found. Please run the SQL schema in your Supabase dashboard.'
          };
        }
        
        if (error.code === 'PGRST116') {
          return {
            isConnected: false,
            latency: null,
            error: 'Authentication failed. Please check your VITE_SUPABASE_ANON_KEY in .env file.'
          };
        }
        
        return {
          isConnected: false,
          latency: null,
          error: `Database error (${error.code}): ${error.message}`
        };
      }
      
      console.log('✅ Database connected successfully:', { 
        latency, 
        recordCount: data?.length || 0 
      });
      
      return {
        isConnected: true,
        latency,
        error: null
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          isConnected: false,
          latency: null,
          error: 'Connection timeout after 15 seconds. Please check your internet connection and Supabase project status.'
        };
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    
    // FIXED: Better error categorization
    if (error.message.includes('fetch')) {
      return {
        isConnected: false,
        latency: null,
        error: 'Network error: Cannot reach Supabase. Check your internet connection and Supabase project URL.'
      };
    }
    
    return {
      isConnected: false,
      latency: null,
      error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// FIXED: Environment info with better validation
export const getEnvironmentInfo = () => {
  const info = {
    hasUrl: !!supabaseUrl && supabaseUrl.includes('supabase.co'),
    hasKey: !!supabaseAnonKey && supabaseAnonKey.length > 100,
    mode: import.meta.env.MODE || 'development',
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : 'not-set',
    keyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'not-set'
  };
  
  console.log('🌍 Environment info:', info);
  return info;
};

// FIXED: Enhanced realtime test with proper cleanup
export const testRealtimeConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing realtime connection...');
    
    const channelName = `connection-test-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Realtime connection test timeout');
        try {
          channel.unsubscribe();
        } catch (error) {
          console.error('❌ Error unsubscribing test channel:', error);
        }
        resolve(false);
      }, 8000); // FIXED: Increased timeout
      
      channel
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, () => {
          console.log('📡 Realtime test event received');
        })
        .subscribe((status) => {
          console.log('📡 Realtime test subscription status:', status);
          clearTimeout(timeout);
          
          const isConnected = status === 'SUBSCRIBED';
          
          // FIXED: Proper cleanup with delay
          setTimeout(() => {
            try {
              channel.unsubscribe();
            } catch (error) {
              console.error('❌ Error unsubscribing test channel:', error);
            }
          }, 500);
          
          resolve(isConnected);
        });
    });
  } catch (error) {
    console.error('❌ Realtime connection test failed:', error);
    return false;
  }
};