import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { AuthService } from '../services/auth.service';
import type { User } from '../lib/supabase/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isOwner: () => boolean;
  updateUserId: (targetUsername: string, newUserId: string) => Promise<boolean>;
  updateUserRole: (targetUsername: string, newRole: 'user' | 'admin') => Promise<boolean>;
  createAdmin: (username: string, password: string, userId: string) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (username: string) => Promise<boolean>;
  setCustomRole: (targetUsername: string, customRole: string, color: string, emoji: string) => Promise<boolean>;
  removeCustomRole: (targetUsername: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, login, register, logout, isAdmin, isOwner } = useSupabaseAuth();

  const updateUserId = async (targetUsername: string, newUserId: string): Promise<boolean> => {
    if (!isOwner()) return false;
    return await AuthService.updateUserId(targetUsername, newUserId);
  };

  const updateUserRole = async (targetUsername: string, newRole: 'user' | 'admin'): Promise<boolean> => {
    if (!isOwner()) return false;
    
    try {
      const users = await AuthService.getAllUsers();
      const targetUser = users.find(u => u.username === targetUsername);
      
      if (!targetUser) return false;

      const result = await AuthService.updateUser(targetUser.id, { role: newRole });
      return result.success;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  };

  const createAdmin = async (username: string, password: string, userId: string): Promise<boolean> => {
    if (!isOwner()) return false;
    
    const result = await AuthService.register(username, password);
    if (result.success && result.user) {
      // Update the created user to admin role and custom user ID
      const updateResult = await AuthService.updateUser(result.user.id, {
        role: 'admin',
        user_id: userId
      });
      return updateResult.success;
    }
    
    return false;
  };

  const getAllUsers = async (): Promise<User[]> => {
    return await AuthService.getAllUsers();
  };

  const deleteUser = async (username: string): Promise<boolean> => {
    if (!isOwner()) return false;
    return await AuthService.deleteUser(username);
  };

  const setCustomRole = async (targetUsername: string, customRole: string, color: string, emoji: string): Promise<boolean> => {
    if (!isOwner()) return false;
    return await AuthService.setCustomRole(targetUsername, customRole, color, emoji);
  };

  const removeCustomRole = async (targetUsername: string): Promise<boolean> => {
    if (!isOwner()) return false;
    return await AuthService.removeCustomRole(targetUsername);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isOwner,
    updateUserId,
    updateUserRole,
    createAdmin,
    getAllUsers,
    deleteUser,
    setCustomRole,
    removeCustomRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};