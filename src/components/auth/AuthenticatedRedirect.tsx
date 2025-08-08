import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

interface AuthenticatedRedirectProps {
  children: React.ReactNode;
}

export const AuthenticatedRedirect: React.FC<AuthenticatedRedirectProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user) {
      // User is authenticated with Clerk, redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoaded, navigate]);

  // Show loading while checking authentication
  if (isLoaded && user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show children (landing page) if user is not authenticated with Clerk
  // This allows users to see the landing page even after passing the password wall
  return <>{children}</>;
};
