import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { OnboardingWizard, TaskItem } from '@/components/onboarding/OnboardingWizard';
import { FirstTimeUserGuide } from '@/components/onboarding/FirstTimeUserGuide';
import type RespectfulOnboarding, { OnboardingData } from '@/components/onboarding/RespectfulOnboarding';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFeatureFlag } from '@/config/features';


interface UserFlowManagerProps {
  children: React.ReactNode;
}

type FlowState = 'loading' | 'onboarding' | 'first_time_guide' | 'dashboard';

export const UserFlowManager: React.FC<UserFlowManagerProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation('ui-common');
  const { trackAction } = useAnalytics({ componentName: 'UserFlowManager', userJourneyStage: 'authentication' });
  const [flowState, setFlowState] = useState<FlowState>('loading');
  const [onboardingTasks, setOnboardingTasks] = useState<TaskItem[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  
  // Feature flags
  // See docs/feature-flags.md for semantics and rollout strategy
  const useRespectfulOnboarding = useFeatureFlag('respectfulOnboarding');

  // Debug logging
  console.log('UserFlowManager state:', {
    isLoaded,
    user: user?.id,
    flowState,
    useRespectfulOnboarding
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // User is not signed in with Clerk, show the main content (which should be Landing page or Login)
      // Don't try to show onboarding without a Clerk user
      setFlowState('dashboard');
      return;
    }

    // User is signed in, determine their flow state
    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    const firstTimeGuideCompleted = localStorage.getItem('firstTimeGuideCompleted') === 'true';
    const onboardingSkipped = localStorage.getItem('onboardingSkipped') === 'true';
    
    // Track onboarding version
    const onboardingVersion = localStorage.getItem('onboardingVersion');
    if (!onboardingVersion && onboardingCompleted) {
      // User completed old onboarding, mark as legacy
      localStorage.setItem('onboardingVersion', 'legacy');
    }

    // Check if this is a truly new user (created in the last 5 minutes)
    const userCreatedAt = new Date(user.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - userCreatedAt.getTime();
    const isNewUser = timeDiff < 5 * 60 * 1000; // 5 minutes

    if (isNewUser && !onboardingCompleted && !onboardingSkipped) {
      // New user who hasn't completed onboarding
      setFlowState('onboarding');
      trackAction('new_user_detected', { 
        user_id: user.id,
        onboarding_type: useRespectfulOnboarding ? 'respectful' : 'legacy'
      });
      // Set onboarding version for new users
      localStorage.setItem('onboardingVersion', useRespectfulOnboarding ? 'respectful' : 'legacy');
    } else if (onboardingCompleted && !firstTimeGuideCompleted) {
      // User completed onboarding but not the guide
      setFlowState('first_time_guide');
    } else {
      // Returning user or user who skipped onboarding
      setFlowState('dashboard');
      if (!onboardingCompleted && !onboardingSkipped) {
        trackAction('returning_user_detected', { user_id: user.id });
      }
    }
  }, [user, isLoaded, trackAction, useRespectfulOnboarding]);

  const handleOnboardingComplete = (tasks: TaskItem[]) => {
    setOnboardingTasks(tasks);
    setFlowState('first_time_guide');
    trackAction('onboarding_flow_completed', { 
      user_id: user?.id,
      tasks_generated: tasks.length,
      onboarding_type: useRespectfulOnboarding ? 'respectful' : 'legacy'
    });
    // Store completion with version
    localStorage.setItem('onboardingVersion', useRespectfulOnboarding ? 'respectful' : 'legacy');
  };

  const handleRespectfulOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setFlowState('first_time_guide');
    trackAction('respectful_onboarding_flow_completed', { 
      user_id: user?.id,
      documents_uploaded: data.documents?.length || 0,
      recommendations_generated: data.recommendations?.length || 0,
      onboarding_type: 'respectful'
    });
    // Store completion with version
    localStorage.setItem('onboardingVersion', 'respectful');
  };

  const handleOnboardingClose = () => {
    // User skipped onboarding, go directly to dashboard
    setFlowState('dashboard');
    trackAction('onboarding_flow_skipped', { user_id: user?.id });
  };

  const handleFirstTimeGuideComplete = () => {
    setFlowState('dashboard');
    trackAction('first_time_guide_flow_completed', { user_id: user?.id });
  };

  // Show loading state while determining flow
  if (flowState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">{t('ui.loading')}</div>
      </div>
    );
  }

  // Show onboarding wizard for new users
  if (flowState === 'onboarding') {
    if (useRespectfulOnboarding) {
      return (
        <RespectfulOnboarding
          isOpen={true}
          onComplete={handleRespectfulOnboardingComplete}
          onClose={handleOnboardingClose}
          userName={user?.firstName || undefined}
        />
      );
    } else {
      return (
        <OnboardingWizard
          isOpen={true}
          onComplete={handleOnboardingComplete}
          onClose={handleOnboardingClose}
          useLifeQuestions={true}
        />
      );
    }
  }

  // Show first time user guide
  if (flowState === 'first_time_guide') {
    return (
      <FirstTimeUserGuide
        onComplete={handleFirstTimeGuideComplete}
      />
    );
  }

  // Show main application
  return <>{children}</>;
};

export default UserFlowManager;

