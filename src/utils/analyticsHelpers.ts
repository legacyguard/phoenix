import type { AnalyticsEvent } from '@/types/analytics';

/**
 * Determines emotional context based on user actions and timing
 */
export function inferEmotionalContext(
  action: string,
  timing?: number,
  retryCount?: number
): AnalyticsEvent['emotional_context'] | undefined {
  // Quick successful actions indicate satisfaction
  if (timing && timing < 5000 && !retryCount) {
    return 'satisfied';
  }

  // Multiple retries suggest frustration
  if (retryCount && retryCount > 2) {
    return 'frustrated';
  }

  // Long pauses might indicate confusion
  if (timing && timing > 30000) {
    return 'confused';
  }

  // Completing major milestones
  const accomplishmentActions = [
    'onboarding_completed',
    'document_uploaded',
    'guardian_added',
    'will_created',
    'family_member_invited'
  ];

  if (accomplishmentActions.includes(action)) {
    return 'accomplished';
  }

  return undefined;
}

/**
 * Determines the user journey stage based on user actions
 */
export function determineJourneyStage(
  hasCompletedOnboarding: boolean,
  documentsUploaded: number,
  familyMembersAdded: number
): AnalyticsEvent['user_journey_stage'] {
  if (!hasCompletedOnboarding) {
    return 'onboarding';
  }

  if (documentsUploaded < 3) {
    return 'setup';
  }

  if (familyMembersAdded === 0) {
    return 'family_prep';
  }

  return 'maintenance';
}

/**
 * Calculates a family preparedness score (0-100)
 */
export function calculateFamilyScore(metrics: {
  hasGuardian: boolean;
  hasBeneficiaries: boolean;
  documentsShared: number;
  emergencyContactsAdded: number;
  scenariosViewed: number;
}): number {
  let score = 0;

  if (metrics.hasGuardian) score += 25;
  if (metrics.hasBeneficiaries) score += 25;
  if (metrics.documentsShared > 0) score += 20;
  if (metrics.emergencyContactsAdded > 0) score += 15;
  if (metrics.scenariosViewed > 0) score += 15;

  return Math.min(score, 100);
}

/**
 * Formats analytics data for dashboard display
 */
export function formatMetricsForDisplay(value: number, type: 'percentage' | 'time' | 'count'): string {
  switch (type) {
    case 'percentage':
      return `${Math.round(value)}%`;
    case 'time':
      if (value < 60) {
        return `${value} min`;
      }
      return `${Math.round(value / 60)} hours`;
    case 'count':
      return value.toLocaleString();
    default:
      return value.toString();
  }
}

/**
 * Groups events by time period for trend analysis
 */
export function groupEventsByPeriod(
  events: AnalyticsEvent[],
  period: 'hour' | 'day' | 'week' | 'month'
): Record<string, AnalyticsEvent[]> {
  const grouped: Record<string, AnalyticsEvent[]> = {};

  events.forEach(event => {
    const date = new Date(event.timestamp);
    let key: string;

    switch (period) {
      case 'hour':
        key = `${date.toISOString().slice(0, 13)}:00`;
        break;
      case 'day':
        key = date.toISOString().slice(0, 10);
        break;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      }
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });

  return grouped;
}

/**
 * Identifies user behavior patterns for insights
 */
export function identifyPatterns(events: AnalyticsEvent[]): {
  mostActiveTime: string;
  preferredFeatures: string[];
  dropOffPoints: string[];
  emotionalTrend: 'improving' | 'stable' | 'declining';
} {
  // Time analysis
  const hourCounts: Record<number, number> = {};
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const mostActiveHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0];
  
  const mostActiveTime = mostActiveHour 
    ? `${mostActiveHour[0]}:00 - ${parseInt(mostActiveHour[0]) + 1}:00`
    : 'Unknown';

  // Feature preferences
  const featureUsage: Record<string, number> = {};
  events
    .filter(e => e.event_name === 'feature_used')
    .forEach(e => {
      const feature = e.properties?.feature;
      if (feature) {
        featureUsage[feature] = (featureUsage[feature] || 0) + 1;
      }
    });
  
  const preferredFeatures = Object.entries(featureUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([feature]) => feature);

  // Drop-off analysis
  const sessionGroups = groupEventsBySession(events);
  const dropOffPoints = identifyDropOffPoints(sessionGroups);

  // Emotional trend
  const emotionalTrend = analyzeEmotionalTrend(events);

  return {
    mostActiveTime,
    preferredFeatures,
    dropOffPoints,
    emotionalTrend,
  };
}

function groupEventsBySession(events: AnalyticsEvent[]): Record<string, AnalyticsEvent[]> {
  const sessions: Record<string, AnalyticsEvent[]> = {};
  
  events.forEach(event => {
    if (!sessions[event.session_id]) {
      sessions[event.session_id] = [];
    }
    sessions[event.session_id].push(event);
  });

  return sessions;
}

function identifyDropOffPoints(sessions: Record<string, AnalyticsEvent[]>): string[] {
  const dropOffCounts: Record<string, number> = {};

  Object.values(sessions).forEach(sessionEvents => {
    if (sessionEvents.length > 0) {
      const lastEvent = sessionEvents[sessionEvents.length - 1];
      const eventName = lastEvent.event_name;
      
      // Only count if session didn't end with a completion event
      if (!eventName.includes('completed') && !eventName.includes('success')) {
        dropOffCounts[eventName] = (dropOffCounts[eventName] || 0) + 1;
      }
    }
  });

  return Object.entries(dropOffCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([event]) => event);
}

function analyzeEmotionalTrend(events: AnalyticsEvent[]): 'improving' | 'stable' | 'declining' {
  const recentEvents = events
    .filter(e => e.emotional_context)
    .slice(-20); // Last 20 events with emotional context

  if (recentEvents.length < 5) return 'stable';

  const emotionScores: Record<NonNullable<AnalyticsEvent['emotional_context']>, number> = {
    'frustrated': -2,
    'confused': -1,
    'satisfied': 1,
    'accomplished': 2,
  };

  const firstHalf = recentEvents.slice(0, Math.floor(recentEvents.length / 2));
  const secondHalf = recentEvents.slice(Math.floor(recentEvents.length / 2));

  const firstScore = firstHalf.reduce((sum, e) => 
    sum + (emotionScores[e.emotional_context!] || 0), 0
  ) / firstHalf.length;

  const secondScore = secondHalf.reduce((sum, e) => 
    sum + (emotionScores[e.emotional_context!] || 0), 0
  ) / secondHalf.length;

  if (secondScore > firstScore + 0.3) return 'improving';
  if (secondScore < firstScore - 0.3) return 'declining';
  return 'stable';
}

/**
 * Generates actionable insights from analytics data
 */
export function generateInsights(
  events: AnalyticsEvent[],
  metrics: {
    onboarding_completion_rate: number;
    time_to_first_value: number;
    document_completion_percentage: number;
    family_preparedness_score: number;
  }
): string[] {
  const insights: string[] = [];

  // Onboarding insights
  if (metrics.onboarding_completion_rate < 50) {
    insights.push('Over 50% of users are not completing onboarding. Consider simplifying the process.');
  }

  // Time to value insights
  if (metrics.time_to_first_value > 1440) { // 24 hours
    insights.push('Users take over 24 hours to reach first value. Add quick wins in onboarding.');
  }

  // Document completion insights
  if (metrics.document_completion_percentage < 70) {
    insights.push('Many uploaded documents lack categorization. Improve AI suggestions or UX.');
  }

  // Family preparedness insights
  if (metrics.family_preparedness_score < 30) {
    insights.push('Family features have low adoption. Consider highlighting benefits more prominently.');
  }

  // Pattern-based insights
  const patterns = identifyPatterns(events);
  
  if (patterns.emotionalTrend === 'declining') {
    insights.push('User satisfaction is trending downward. Review recent changes and user feedback.');
  }

  if (patterns.dropOffPoints.length > 0) {
    insights.push(`High drop-off at: ${patterns.dropOffPoints[0]}. This step may need improvement.`);
  }

  return insights;
}
