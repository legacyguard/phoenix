import React, { useEffect, useState } from "react";
import { useUser } from '@clerk/clerk-react';
import { LifeInventoryDashboard } from '@/features/dashboard/components/LifeInventoryDashboard';
import FirstTimeUserGuide from '@/components/guides/FirstTimeUserGuide';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardPage = () => {
  const { user, isLoaded } = useUser();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if this is user's first time on dashboard after onboarding
    if (user && isLoaded) {
      const guideShown = localStorage.getItem('firstTimeGuideShown');
      const onboardingComplete = user.publicMetadata?.onboardingComplete;
      
      // Show guide only if onboarding is complete and guide hasn't been shown
      if (onboardingComplete && !guideShown) {
        setShowGuide(true);
        // Don't set localStorage here - let the guide component handle it when completed
      }
    }
  }, [user, isLoaded]);

  // Show loading skeleton while Clerk loads
  if (!isLoaded) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <LifeInventoryDashboard />
      {showGuide && <FirstTimeUserGuide />}
    </div>
  );
};

export default DashboardPage;
