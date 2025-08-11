import { useCallback, useEffect, useRef, useState } from 'react';
import { analytics } from '@/services/analytics';
import type { AnalyticsEvent } from '@/types/analytics';
import { inferEmotionalContext } from '@/utils/analyticsHelpers';
import type { ConsentPreferences } from '@/components/privacy/ConsentManager';

interface UseAnalyticsOptions {
  componentName: string;
  userJourneyStage?: AnalyticsEvent['user_journey_stage'];
}

export function useAnalytics({ componentName, userJourneyStage = 'maintenance' }: UseAnalyticsOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const retryCountRef = useRef<Record<string, number>>({});
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  
  // Check consent preferences on mount
  useEffect(() => {
    const checkConsent = () => {
      const consentPrefs = localStorage.getItem('legacyguard-consent-preferences');
      if (consentPrefs) {
        const parsed: ConsentPreferences = JSON.parse(consentPrefs);
        setIsTrackingEnabled(parsed.analytics || false);
      }
    };
    
    checkConsent();
    
    // Listen for storage changes (consent updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'legacyguard-consent-preferences') {
        checkConsent();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Track component mount
  useEffect(() => {
    if (isTrackingEnabled) {
      analytics.track(
        'component_viewed',
        { component: componentName },
        undefined,
        userJourneyStage
      );
    }

    // Track component unmount with time spent
    return () => {
      if (isTrackingEnabled) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
        const timeSpent = Date.now() - startTimeRef.current;
        analytics.track(
          'component_exited',
          { 
            component: componentName,
            time_spent_ms: timeSpent,
            time_spent_seconds: Math.floor(timeSpent / 1000)
          },
          undefined,
          userJourneyStage
        );
      }
    };
  }, [componentName, userJourneyStage, isTrackingEnabled]);

  // Track user action with automatic emotional context inference
  const trackAction = useCallback((
    action: string,
    properties?: Record<string, unknown>,
    emotionalContext?: AnalyticsEvent['emotional_context']
  ) => {
    if (!isTrackingEnabled) return;
    
    const timing = Date.now() - startTimeRef.current;
    const retryCount = retryCountRef.current[action] || 0;

    // Infer emotional context if not provided
    const context = emotionalContext || inferEmotionalContext(action, timing, retryCount);

    analytics.track(
      action,
      {
        ...properties,
        component: componentName,
        timing_ms: timing,
      },
      context,
      userJourneyStage
    );
  }, [componentName, userJourneyStage, isTrackingEnabled]);

  // Track errors or retries
  const trackError = useCallback((
    error: string,
    details?: Record<string, unknown>
  ) => {
    if (!isTrackingEnabled) return;
    
    const action = `error_${error}`;
    retryCountRef.current[action] = (retryCountRef.current[action] || 0) + 1;

    analytics.track(
      'error_occurred',
      {
        error,
        ...details,
        component: componentName,
        retry_count: retryCountRef.current[action],
      },
      'frustrated',
      userJourneyStage
    );
  }, [componentName, userJourneyStage, isTrackingEnabled]);

  // Track feature usage
  const trackFeature = useCallback((
    feature: string,
    accepted: boolean = true,
    details?: Record<string, unknown>
  ) => {
    if (!isTrackingEnabled) return;
    
    analytics.trackFeatureUsage(feature, accepted);
    
    if (details) {
      trackAction(`feature_${feature}_${accepted ? 'accepted' : 'rejected'}`, details);
    }
  }, [trackAction, isTrackingEnabled]);

  // Track timing for specific actions
  const startTimer = useCallback((actionName: string) => {
     
    const timerId = `${actionName}_${Date.now()}`;
    sessionStorage.setItem(`analytics_timer_${timerId}`, Date.now().toString());
    return timerId;
  }, []);

  const endTimer = useCallback((
    timerId: string,
    success: boolean = true,
    properties?: Record<string, unknown>
  ) => {
    const startTime = sessionStorage.getItem(`analytics_timer_${timerId}`);
    if (!startTime) return;

    const duration = Date.now() - parseInt(startTime);
    sessionStorage.removeItem(`analytics_timer_${timerId}`);

    const [action] = timerId.split('_');
    trackAction(
      `${action}_${success ? 'completed' : 'failed'}`,
      {
        ...properties,
        duration_ms: duration,
        duration_seconds: Math.floor(duration / 1000),
      }
    );
  }, [trackAction]);

  // Track form interactions
  const trackFormInteraction = useCallback((
    formName: string,
    interaction: 'started' | 'field_changed' | 'submitted' | 'abandoned',
    fieldName?: string
  ) => {
    trackAction(
      `form_${interaction}`,
      {
        form_name: formName,
        field_name: fieldName,
      }
    );
  }, [trackAction]);

  // Track document-specific actions
  const trackDocument = useCallback((
    action: 'uploaded' | 'categorized' | 'shared',
    documentType?: string,
    details?: Record<string, unknown>
  ) => {
    if (!isTrackingEnabled) return;
    
    analytics.trackDocumentAction(action, documentType);
    
    if (details) {
      trackAction(`document_${action}`, {
        document_type: documentType,
        ...details,
      });
    }
  }, [trackAction, isTrackingEnabled]);

  // Track family-related actions
  const trackFamily = useCallback((
    action: 'guardian_added' | 'beneficiary_updated' | 'member_invited',
    details?: Record<string, unknown>
  ) => {
    if (!isTrackingEnabled) return;
    
    analytics.trackFamilyAction(action);
    
    if (details) {
      trackAction(action, details);
    }
  }, [trackAction, isTrackingEnabled]);

  // Track emotional milestones
  const trackMilestone = useCallback((
    milestone: 'first_peace_of_mind' | 'family_protection_realized' | 'procrastination_overcome' | string,
    details?: Record<string, unknown>
  ) => {
    if (!isTrackingEnabled) return;
    
    if (milestone === 'first_peace_of_mind' || milestone === 'family_protection_realized' || milestone === 'procrastination_overcome') {
      analytics.trackEmotionalMilestone(milestone);
    }
    
    if (details || typeof milestone === 'string') {
      trackAction('milestone_reached', {
        milestone,
        ...details,
      });
    }
  }, [trackAction, isTrackingEnabled]);

  // Control functions for consent management
  const enableTracking = useCallback(() => {
     
    setIsTrackingEnabled(true);
  }, []);
  
  const disableTracking = useCallback(() => {
     
    setIsTrackingEnabled(false);
  }, []);
  
  // Add navigation tracking for compatibility
  const trackNavigation = useCallback((
    from: string,
    to: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!isTrackingEnabled) return;
    
    trackAction('navigation', {
      from,
      to,
      ...metadata,
    });
  }, [trackAction, isTrackingEnabled]);

  return {
    trackAction,
    trackError,
    trackFeature,
    startTimer,
    endTimer,
    trackFormInteraction,
    trackDocument,
    trackFamily,
    trackMilestone,
    trackNavigation,
    enableTracking,
    disableTracking,
    isTrackingEnabled,
  };
}
