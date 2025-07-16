import { supabase } from '../lib/supabase/client';
import { errorService } from './error.service';
import { ValidationService } from '../utils/validation';
import type { User, UserInsert, UserUpdate } from '../lib/supabase/types';

// FIXED: Removed all localStorage fallbacks - pure Supabase implementation
export class AuthService {
  // FIXED: Register with proper error handling - no localStorage fallback
  static async register(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Starting registration process for:', username);
      
      // Validate input
      const validation = ValidationService.validate(
        { username, password },
        ValidationService.schemas.user
      );
      
      if (!validation.isValid) {
        const error = validation.errors[0];
        errorService.logError(error);
        return { success: false, error: error.message };
      }
      
      // FIXED: Check username uniqueness in Supabase (not localStorage)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking username:', checkError);
        const dbError = errorService.createDatabaseError(
          'Failed to check username availability',
          'select',
          'users'
        );
        errorService.logError(dbError);
        return { success: false, error: 'Database connection error' };
      }

      if (existingUser) {
        return { success: false, error: 'Username sudah digunakan' };
      }

      // FIXED: Generate unique user ID with database check
      let userId: string;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        userId = (100000 + Math.floor(Math.random() * 900000)).toString();
        
        const { data: existingId } = await supabase
          .from('users')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (!existingId) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return { success: false, error: 'Failed to generate unique user ID' };
      }

      // FIXED: Check if this is the first user (owner) from database
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Error counting users:', countError);
        return { success: false, error: 'Database error' };
      }

      const isFirstUser = count === 0;
      const isSpecialOwner = username === 'semz444';
      const userRole = (isFirstUser || isSpecialOwner) ? 'owner' : 'user';

      // FIXED: Create auth user with proper email
      const userEmail = `${username}@rekberx.local`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: {
            username,
            user_id: userId!,
            role: userRole
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        errorService.logError({
          code: 'AUTH_SIGNUP_ERROR',
          message: authError.message,
          timestamp: new Date(),
          severity: 'high'
        });
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create auth user' };
      }

      // FIXED: Create user profile in database
      const userProfile: UserInsert = {
        id: authData.user.id,
        username,
        user_id: userId!,
        email: userEmail,
        role: userRole
      };

      const { data: user, error: profileError } = await supabase
        .from('users')
        .insert(userProfile)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        const dbError = errorService.createDatabaseError(
          'Failed to create user profile',
          'insert',
          'users'
        );
        errorService.logError(dbError);
        return { success: false, error: profileError.message };
      }

      console.log('✅ User registered successfully:', user.username);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      errorService.logError({
        code: 'REGISTRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown registration error',
        timestamp: new Date(),
        severity: 'high'
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Login with database verification - no localStorage
  static async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Starting login process for:', username);
      
      // FIXED: Get user from database (not localStorage)
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (userError) {
        console.error('❌ Error fetching user:', userError);
        return { success: false, error: 'Database connection error' };
      }

      if (!userProfile) {
        return { success: false, error: 'Username atau password salah' };
      }

      // FIXED: Sign in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userProfile.email || `${username}@rekberx.local`,
        password
      });

      if (authError) {
        console.error('❌ Auth login error:', authError);
        return { success: false, error: 'Username atau password salah' };
      }

      console.log('✅ User logged in successfully:', userProfile.username);
      return { success: true, user: userProfile };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Logout with proper cleanup
  static async logout(): Promise<void> {
    try {
      console.log('🔐 Logging out user...');
      await supabase.auth.signOut();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  // FIXED: Get current user from database - no localStorage fallback
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log('ℹ️ No authenticated user found');
        return null;
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // FIXED: All CRUD operations use Supabase directly
  static async updateUser(id: string, updates: UserUpdate): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔄 Updating user:', id, updates);
      
      const { data: user, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ User updated successfully');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Update user error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // FIXED: Get all users from database
  static async getAllUsers(): Promise<User[]> {
    try {
      console.log('📋 Fetching all users from database...');
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        return [];
      }

      console.log('✅ Fetched users:', users?.length || 0);
      return users || [];
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  }

  // FIXED: Delete user from database
  static async deleteUser(username: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting user:', username);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('username', username);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return false;
      }

      console.log('✅ User deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return false;
    }
  }

  // FIXED: Update user ID in database
  static async updateUserId(username: string, newUserId: string): Promise<boolean> {
    try {
      console.log('🔄 Updating user ID:', username, '->', newUserId);
      
      const { error } = await supabase
        .from('users')
        .update({ user_id: newUserId, updated_at: new Date().toISOString() })
        .eq('username', username);

      if (error) {
        console.error('❌ Error updating user ID:', error);
        return false;
      }

      console.log('✅ User ID updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Update user ID error:', error);
      return false;
    }
  }

  // FIXED: Set custom role in database
  static async setCustomRole(username: string, role: string, color: string, emoji: string): Promise<boolean> {
    try {
      console.log('👑 Setting custom role:', username, role);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          custom_role: role,
          custom_role_color: color,
          custom_role_emoji: emoji,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (error) {
        console.error('❌ Error setting custom role:', error);
        return false;
      }

      console.log('✅ Custom role set successfully');
      return true;
    } catch (error) {
      console.error('❌ Set custom role error:', error);
      return false;
    }
  }

  // FIXED: Remove custom role from database
  static async removeCustomRole(username: string): Promise<boolean> {
    try {
      console.log('🗑️ Removing custom role:', username);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          custom_role: null,
          custom_role_color: null,
          custom_role_emoji: null,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (error) {
        console.error('❌ Error removing custom role:', error);
        return false;
      }

      console.log('✅ Custom role removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Remove custom role error:', error);
      return false;
    }
  }
}