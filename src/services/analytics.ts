import { AnalyticsEvent, UserMetrics } from '@/types/analytics';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface QueuedEvent extends AnalyticsEvent {
  attempts: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private eventQueue: QueuedEvent[] = [];
  private isOnline: boolean = navigator.onLine;
  private consentGiven: boolean = false;
  private processingQueue: boolean = false;

  private constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initializeEventListeners();
    this.loadConsent();
    this.processQueuedEvents();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getOrCreateSessionId(): string {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;
    
    const newId = uuidv4();
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  }

  private initializeEventListeners(): void {
    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Process queue before page unload
    window.addEventListener('beforeunload', () => {
      this.flushQueue();
    });
  }

  private loadConsent(): void {
    const consent = localStorage.getItem('analytics_consent');
    this.consentGiven = consent === 'true';
  }

  setConsent(given: boolean): void {
    this.consentGiven = given;
    localStorage.setItem('analytics_consent', given.toString());
    
    if (!given) {
      // Clear any queued events if consent is revoked
      this.eventQueue = [];
    }
  }

  async track(
    eventName: string,
    properties: Record<string, any> = {},
    emotionalContext?: AnalyticsEvent['emotional_context'],
    userJourneyStage: AnalyticsEvent['user_journey_stage'] = 'maintenance'
  ): Promise<void> {
    if (!this.consentGiven) return;

    try {
      const userId = await this.getUserId();
      
      const event: AnalyticsEvent = {
        event_name: eventName,
        user_id: userId,
        session_id: this.sessionId,
        timestamp: new Date(),
        properties: this.sanitizeProperties(properties),
        emotional_context: emotionalContext,
        user_journey_stage: userJourneyStage,
      };

      if (this.isOnline) {
        await this.sendEvent(event);
      } else {
        this.queueEvent(event);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Fail silently to not disrupt user experience
    }
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch {
      return undefined;
    }
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    // Remove any PII or sensitive data
    const sanitized = { ...properties };
    const sensitiveKeys = ['email', 'name', 'phone', 'ssn', 'address', 'password'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: event.event_name,
        user_id: event.user_id,
        session_id: event.session_id,
        timestamp: event.timestamp.toISOString(),
        properties: event.properties,
        emotional_context: event.emotional_context,
        user_journey_stage: event.user_journey_stage,
      });

    if (error) {
      throw error;
    }
  }

  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push({ ...event, attempts: 0 });
    
    // Store in localStorage for persistence
    localStorage.setItem('analytics_queue', JSON.stringify(this.eventQueue));
  }

  private async processQueuedEvents(): Promise<void> {
    if (this.processingQueue || !this.isOnline || this.eventQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    // Load from localStorage in case of page reload
    const stored = localStorage.getItem('analytics_queue');
    if (stored) {
      try {
        const parsedQueue = JSON.parse(stored);
        this.eventQueue = [...parsedQueue, ...this.eventQueue];
        localStorage.removeItem('analytics_queue');
      } catch {
        // Ignore parsing errors
      }
    }

    const failedEvents: QueuedEvent[] = [];

    for (const queuedEvent of this.eventQueue) {
      try {
        await this.sendEvent(queuedEvent);
      } catch (error) {
        queuedEvent.attempts++;
        if (queuedEvent.attempts < 3) {
          failedEvents.push(queuedEvent);
        }
      }
    }

    this.eventQueue = failedEvents;
    this.processingQueue = false;

    // Retry failed events after delay
    if (failedEvents.length > 0) {
      setTimeout(() => this.processQueuedEvents(), 30000); // 30 seconds
    }
  }

  private flushQueue(): void {
    if (this.eventQueue.length > 0) {
      // Use sendBeacon for reliability during page unload
      const payload = JSON.stringify(this.eventQueue);
      navigator.sendBeacon('/api/analytics/batch', payload);
    }
  }

  // Predefined event tracking methods
  trackOnboardingStep(step: string, completed: boolean): void {
    this.track(
      completed ? 'onboarding_step_completed' : 'onboarding_step_started',
      { step },
      completed ? 'satisfied' : undefined,
      'onboarding'
    );
  }

  trackDocumentAction(action: 'uploaded' | 'categorized' | 'shared', documentType?: string): void {
    this.track(
      `document_${action}`,
      { document_type: documentType },
      action === 'uploaded' ? 'accomplished' : 'satisfied',
      'setup'
    );
  }

  trackFamilyAction(action: 'guardian_added' | 'beneficiary_updated' | 'member_invited'): void {
    this.track(
      action,
      {},
      'accomplished',
      'family_prep'
    );
  }

  trackEmotionalMilestone(milestone: 'first_peace_of_mind' | 'family_protection_realized' | 'procrastination_overcome'): void {
    this.track(
      'emotional_milestone_reached',
      { milestone },
      'accomplished',
      'maintenance'
    );
  }

  trackFeatureUsage(feature: string, accepted: boolean = true): void {
    this.track(
      'feature_used',
      { feature, accepted },
      accepted ? 'satisfied' : 'confused',
      'maintenance'
    );
  }

  // User metrics calculation
  async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    try {
      // Fetch user events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error || !events) return null;

      // Calculate metrics
      const metrics: UserMetrics = {
        onboarding_completion_rate: this.calculateOnboardingCompletion(events),
        time_to_first_value: this.calculateTimeToFirstValue(events),
        feature_adoption_rates: this.calculateFeatureAdoption(events),
        document_completion_percentage: this.calculateDocumentCompletion(events),
        family_preparedness_score: this.calculateFamilyPreparedness(events),
      };

      return metrics;
    } catch (error) {
      console.error('Error calculating user metrics:', error);
      return null;
    }
  }

  private calculateOnboardingCompletion(events: any[]): number {
    const onboardingEvents = events.filter(e => e.user_journey_stage === 'onboarding');
    const completedSteps = new Set(
      onboardingEvents
        .filter(e => e.event_name === 'onboarding_step_completed')
        .map(e => e.properties?.step)
    );
    
    // Assuming 5 total onboarding steps
    return (completedSteps.size / 5) * 100;
  }

  private calculateTimeToFirstValue(events: any[]): number {
    const firstEvent = events[0];
    const firstValueEvent = events.find(e => 
      e.event_name === 'document_uploaded' || 
      e.event_name === 'guardian_added'
    );

    if (!firstEvent || !firstValueEvent) return 0;

    const timeDiff = new Date(firstValueEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime();
    return Math.floor(timeDiff / 60000); // Convert to minutes
  }

  private calculateFeatureAdoption(events: any[]): Record<string, number> {
    const features = ['ai_suggestions', 'manual_mode', 'privacy_mode', 'family_sharing'];
    const adoption: Record<string, number> = {};

    features.forEach(feature => {
      const used = events.some(e => 
        e.event_name === 'feature_used' && 
        e.properties?.feature === feature
      );
      adoption[feature] = used ? 100 : 0;
    });

    return adoption;
  }

  private calculateDocumentCompletion(events: any[]): number {
    const uploadedDocs = events.filter(e => e.event_name === 'document_uploaded').length;
    const categorizedDocs = events.filter(e => e.event_name === 'document_categorized').length;
    
    if (uploadedDocs === 0) return 0;
    return (categorizedDocs / uploadedDocs) * 100;
  }

  private calculateFamilyPreparedness(events: any[]): number {
    const familyActions = ['guardian_added', 'beneficiary_updated', 'member_invited'];
    const completedActions = familyActions.filter(action =>
      events.some(e => e.event_name === action)
    );

    return (completedActions.length / familyActions.length) * 100;
  }

  // Session tracking
  startNewSession(): void {
    this.sessionId = uuidv4();
    sessionStorage.setItem('analytics_session_id', this.sessionId);
    
    this.track('session_started', {
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    });
  }

  endSession(): void {
    this.track('session_ended', {
      duration: this.getSessionDuration(),
    });
  }

  private getSessionDuration(): number {
    // Implementation would track actual session start time
    return 0;
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
