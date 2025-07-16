import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { AuthService } from '../services/auth.service';
import type { User } from '../lib/supabase/types';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setAuthUser(session.user);
        const userProfile = await AuthService.getCurrentUser();
        setUser(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setAuthUser(session.user);
          const userProfile = await AuthService.getCurrentUser();
          setUser(userProfile);
        } else {
          setAuthUser(null);
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await AuthService.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    const result = await AuthService.register(username, password);
    return result.success;
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    setAuthUser(null);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role === 'owner';
  };

  const isOwner = (): boolean => {
    return user?.role === 'owner';
  };

  return {
    user,
    authUser,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isOwner
  };
};