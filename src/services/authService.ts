import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  role: 'user' | 'admin' | 'premium';
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  metadata?: Record<string, any>;
}

class AuthService {
  /**
   * Sync Clerk user with Supabase user profile
   */
  async syncUserWithSupabase(clerkUser: any): Promise<void> {
    if (!clerkUser?.id) return;

    try {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', clerkUser.id)
        .single();

      const profileData = {
        user_id: clerkUser.id,
        full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress,
        preferred_language: clerkUser.publicMetadata?.language || 'en',
        role: clerkUser.publicMetadata?.role || 'user',
        subscription_status: clerkUser.publicMetadata?.subscriptionStatus || 'free',
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingProfile) {
        // Update existing profile
        await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', clerkUser.id);
      } else {
        // Create new profile
        await supabase
          .from('user_profiles')
          .insert({
            id: clerkUser.id,
            ...profileData,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error);
    }
  }

  /**
   * Get user's role and permissions
   */
  async getUserPermissions(userId: string): Promise<{
    role: string;
    permissions: string[];
  }> {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('role, subscription_status')
        .eq('user_id', userId)
        .single();

      if (!data) {
        return { role: 'user', permissions: this.getPermissionsForRole('user') };
      }

      const permissions = this.getPermissionsForRole(data.role);
      
      // Add premium permissions if user has active subscription
      if (data.subscription_status === 'premium' || data.subscription_status === 'enterprise') {
        permissions.push(...this.getPermissionsForRole('premium'));
      }

      return { role: data.role, permissions: [...new Set(permissions)] };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return { role: 'user', permissions: this.getPermissionsForRole('user') };
    }
  }

  /**
   * Get permissions for a specific role
   */
  private getPermissionsForRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      user: [
        'view_own_profile',
        'edit_own_profile',
        'create_will',
        'view_own_wills',
        'create_time_capsule',
        'view_own_time_capsules',
        'upload_documents',
        'view_own_documents'
      ],
      premium: [
        'unlimited_wills',
        'unlimited_assets',
        'unlimited_guardians',
        'advanced_encryption',
        'emergency_access',
        'version_history',
        'legal_templates',
        'priority_support',
        'sharing_links',
        'advanced_notifications'
      ],
      admin: [
        'view_all_users',
        'edit_all_users',
        'view_analytics',
        'manage_subscriptions',
        'access_admin_panel',
        'view_error_logs',
        'manage_templates'
      ]
    };

    return rolePermissions[role] || rolePermissions.user;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const { permissions } = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(p => userPermissions.permissions.includes(p));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(p => userPermissions.permissions.includes(p));
  }

  /**
   * Update user's role
   */
  async updateUserRole(userId: string, newRole: 'user' | 'admin' | 'premium'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  /**
   * Get Supabase token for authenticated requests
   */
  async getSupabaseToken(getToken: () => Promise<string | null>): Promise<string | null> {
    try {
      // Get the Clerk session token
      const token = await getToken({ template: 'supabase' });
      
      if (token) {
        // Set the Supabase auth token
        const { data, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token
        });

        if (error) {
          console.error('Error setting Supabase session:', error);
          return null;
        }

        return token;
      }

      return null;
    } catch (error) {
      console.error('Error getting Supabase token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();

/**
 * Custom hook to sync Clerk auth with Supabase
 */
export function useAuthSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useClerkAuth();

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user data
      authService.syncUserWithSupabase(user);
      
      // Set up Supabase session
      authService.getSupabaseToken(getToken);
    }
  }, [user, isLoaded, getToken]);
}

/**
 * Custom hook to check user permissions
 */
export function usePermissions() {
  const { user } = useUser();

  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!user?.id) return false;
    return authService.hasPermission(user.id, permission);
  };

  const checkAnyPermission = async (permissions: string[]): Promise<boolean> => {
    if (!user?.id) return false;
    return authService.hasAnyPermission(user.id, permissions);
  };

  const checkAllPermissions = async (permissions: string[]): Promise<boolean> => {
    if (!user?.id) return false;
    return authService.hasAllPermissions(user.id, permissions);
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions
  };
}
