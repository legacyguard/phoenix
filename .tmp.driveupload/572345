import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: 'user' | 'admin' | 'premium';
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [],
  requiredRole,
  requireAll = false
}) => {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check role if required
        if (requiredRole) {
          const { role } = await authService.getUserPermissions(user.id);
          if (role !== requiredRole && requiredRole !== 'user') {
            setHasAccess(false);
            setIsChecking(false);
            return;
          }
        }

        // Check permissions if required
        if (requiredPermissions.length > 0) {
          const hasPermission = requireAll
            ? await authService.hasAllPermissions(user.id, requiredPermissions)
            : await authService.hasAnyPermission(user.id, requiredPermissions);
          
          setHasAccess(hasPermission);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isLoaded) {
      checkAccess();
    }
  }, [user, isLoaded, requiredPermissions, requiredRole, requireAll]);

  // Show loading while Clerk is loading
  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not signed in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If doesn't have access, show access denied
  if (hasAccess === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <a href="/dashboard" className="btn btn-primary">
          Return to Dashboard
        </a>
      </div>
    );
  }

  // Has access
  return <SignedIn>{children}</SignedIn>;
};

// Specific route protectors for common use cases
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const PremiumRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={['unlimited_wills', 'unlimited_assets']} requireAll={false}>
    {children}
  </ProtectedRoute>
);
