import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

export const RequireOnboarding: React.FC<RequireOnboardingProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after user data is loaded
    if (isLoaded && user) {
      const onboardingComplete = user.publicMetadata?.onboardingComplete;
      
      // If onboarding is not complete, redirect to onboarding intro
      if (!onboardingComplete) {
        navigate('/onboarding/intro', { replace: true });
      }
    }
  }, [user, isLoaded, navigate]);

  // Show loading state while checking user status
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If user exists but onboarding is not complete, show loading
  // (they will be redirected by the useEffect)
  if (user && !user.publicMetadata?.onboardingComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  // If onboarding is complete, render children
  return <>{children}</>;
};

export default RequireOnboarding;
