import { useState, useEffect, useCallback } from 'react';
import { analytics } from '@/services/analytics';
import type { AnalyticsEvent, UserMetrics } from '@/types/analytics';
import { determineJourneyStage } from '@/utils/analyticsHelpers';
import { supabase } from '@/integrations/supabase/client';

interface UserJourneyState {
  currentStage: AnalyticsEvent['user_journey_stage'];
  completedSteps: string[];
  metrics: UserMetrics | null;
  isLoading: boolean;
}

export function useUserJourney() {
  const [state, setState] = useState<UserJourneyState>({
    currentStage: 'onboarding',
    completedSteps: [],
    metrics: null,
    isLoading: true,
  });

  // Load user journey data on mount
  const loadUserJourney = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get user metrics
      const metrics = await analytics.getUserMetrics(user.id);

      // Get completed steps from local storage (for immediate access)
      const storedSteps = localStorage.getItem(`journey_steps_${user.id}`);
      const completedSteps = storedSteps ? JSON.parse(storedSteps) : [];

      // Determine current stage based on progress
      const currentStage = await determineCurrentStage(user.id);

      setState({
        currentStage,
        completedSteps,
        metrics,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading user journey:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
     
    loadUserJourney();
  }, [loadUserJourney]);

  const determineCurrentStage = async (userId: string): Promise<AnalyticsEvent['user_journey_stage']> => {
    try {
      // Check onboarding completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (!profile?.onboarding_completed) {
        return 'onboarding';
      }

      // Check document count
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Check family members
      const { count: familyCount } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return determineJourneyStage(
        true, // onboarding completed
        documentCount || 0,
        familyCount || 0
      );
    } catch {
      return 'onboarding';
    }
  };

  // Mark a step as completed
  const completeStep = useCallback(async (stepName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updatedSteps = [...state.completedSteps, stepName];
    
    // Update local state
    setState(prev => ({
      ...prev,
      completedSteps: updatedSteps,
    }));

    // Persist to local storage
    localStorage.setItem(`journey_steps_${user.id}`, JSON.stringify(updatedSteps));

    // Track in analytics
    analytics.track(
      'journey_step_completed',
      { step: stepName },
      'accomplished',
      state.currentStage
    );

    // Check if stage should be updated
    const newStage = await determineCurrentStage(user.id);
    if (newStage !== state.currentStage) {
      setState(prev => ({ ...prev, currentStage: newStage }));
      
      analytics.track(
        'journey_stage_advanced',
        { 
          from_stage: state.currentStage,
          to_stage: newStage,
        },
        'accomplished',
        newStage
      );
    }
  }, [state.completedSteps, state.currentStage]);

  // Get progress for current stage
  const getStageProgress = useCallback((): number => {
    switch (state.currentStage) {
      case 'onboarding':
        return state.metrics?.onboarding_completion_rate || 0;
      
      case 'setup':
        return state.metrics?.document_completion_percentage || 0;
      
      case 'family_prep':
        return state.metrics?.family_preparedness_score || 0;
      
      case 'maintenance': {
        // In maintenance, we track overall completion
        const avgCompletion = state.metrics ? 
          (state.metrics.document_completion_percentage + 
           state.metrics.family_preparedness_score) / 2 : 0;
        return avgCompletion;
      }
      
      default:
        return 0;
    }
  }, [state.currentStage, state.metrics]);

  // Get suggested next actions
  const getSuggestedActions = useCallback((): string[] => {
    const suggestions: string[] = [];

    switch (state.currentStage) {
      case 'onboarding':
        if (!state.completedSteps.includes('profile_completed')) {
          suggestions.push('Complete your profile information');
        }
        if (!state.completedSteps.includes('first_question_answered')) {
          suggestions.push('Answer your first planning question');
        }
        break;

      case 'setup':
        suggestions.push('Upload important documents');
        suggestions.push('Categorize your documents');
        if (state.metrics && state.metrics.document_completion_percentage < 50) {
          suggestions.push('Complete document organization');
        }
        break;

      case 'family_prep':
        suggestions.push('Add a guardian for emergencies');
        suggestions.push('Invite family members');
        suggestions.push('Share important documents');
        break;

      case 'maintenance':
        suggestions.push('Review document expiration dates');
        suggestions.push('Update beneficiary information');
        suggestions.push('Check family access permissions');
        break;
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }, [state.currentStage, state.completedSteps, state.metrics]);

  // Track journey events
  const trackJourneyEvent = useCallback((
    event: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.track(
      event,
      {
        ...properties,
        journey_stage: state.currentStage,
        completed_steps: state.completedSteps.length,
      },
      undefined,
      state.currentStage
    );
  }, [state.currentStage, state.completedSteps]);

  // Check and track milestones
  const checkMilestones = useCallback(() => {
    // First document uploaded
    if (state.metrics && 
        state.metrics.document_completion_percentage > 0 && 
        !state.completedSteps.includes('first_document_milestone')) {
      analytics.trackEmotionalMilestone('first_peace_of_mind');
      completeStep('first_document_milestone');
    }

    // Family member added
    if (state.metrics && 
        state.metrics.family_preparedness_score > 0 && 
        !state.completedSteps.includes('family_protection_milestone')) {
      analytics.trackEmotionalMilestone('family_protection_realized');
      completeStep('family_protection_milestone');
    }

    // High completion rate
    if (state.metrics && 
        state.metrics.document_completion_percentage > 80 && 
        !state.completedSteps.includes('procrastination_overcome_milestone')) {
      analytics.trackEmotionalMilestone('procrastination_overcome');
      completeStep('procrastination_overcome_milestone');
    }
  }, [state.metrics, state.completedSteps, completeStep]);

  // Check milestones when metrics update
  useEffect(() => {
     
    if (state.metrics) {
      checkMilestones();
    }
  }, [state.metrics, checkMilestones]);

  return {
    currentStage: state.currentStage,
    completedSteps: state.completedSteps,
    metrics: state.metrics,
    isLoading: state.isLoading,
    completeStep,
    getStageProgress,
    getSuggestedActions,
    trackJourneyEvent,
    refreshJourney: loadUserJourney,
  };
}
