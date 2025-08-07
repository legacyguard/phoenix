interface UserAction {
  type: string;
  timestamp: Date;
  data?: any;
}

interface TimingContext {
  recentActions: UserAction[];
  currentContext: string;
  userMood?: 'engaged' | 'rushed' | 'thoughtful';
}

interface ContextualSuggestion {
  trigger: string;
  timing: 'immediate' | 'delayed' | 'next_session';
  message: string;
  action: string;
}

export const analyzeTimingContext = (recentActions: UserAction[]): TimingContext => {
  const lastAction = recentActions[recentActions.length - 1];
  const sessionDuration = recentActions.length > 0 
    ? Date.now() - recentActions[0].timestamp.getTime()
    : 0;
  
  // Determine current context based on recent actions
  let currentContext = 'general';
  let userMood: 'engaged' | 'rushed' | 'thoughtful' = 'engaged';
  
  if (lastAction) {
    switch (lastAction.type) {
      case 'asset_added':
        currentContext = 'asset_management';
        break;
      case 'executor_selected':
        currentContext = 'executor_planning';
        break;
      case 'will_completed':
        currentContext = 'will_completion';
        break;
      case 'document_uploaded':
        currentContext = 'document_organization';
        break;
    }
  }
  
  // Analyze user mood based on behavior
  if (sessionDuration < 5 * 60 * 1000) { // Less than 5 minutes
    userMood = 'rushed';
  } else if (sessionDuration > 30 * 60 * 1000) { // More than 30 minutes
    userMood = 'thoughtful';
  }
  
  return {
    recentActions,
    currentContext,
    userMood
  };
};

export const generateContextualSuggestions = (
  timingContext: TimingContext
): ContextualSuggestion[] => {
  const suggestions: ContextualSuggestion[] = [];
  
  // Context-specific suggestions
  switch (timingContext.currentContext) {
    case 'asset_management':
      suggestions.push({
        trigger: 'after_asset_added',
        timing: 'immediate',
        message: 'Now let\'s think about who should inherit these assets',
        action: 'navigate_to_beneficiaries'
      });
      break;
      
    case 'executor_planning':
      suggestions.push({
        trigger: 'after_executor_selected',
        timing: 'immediate',
        message: 'Let\'s make sure your executor knows where to find everything',
        action: 'create_executor_guide'
      });
      break;
      
    case 'will_completion':
      suggestions.push({
        trigger: 'after_will_completed',
        timing: 'delayed',
        message: 'Consider adding personal messages for your family',
        action: 'create_personal_messages'
      });
      break;
      
    case 'document_organization':
      suggestions.push({
        trigger: 'after_document_uploaded',
        timing: 'immediate',
        message: 'Let\'s add context about when your family might need this document',
        action: 'add_document_context'
      });
      break;
  }
  
  // Mood-based timing adjustments
  if (timingContext.userMood === 'rushed') {
    // Delay non-critical suggestions for rushed users
    suggestions.forEach(s => {
      if (s.timing === 'immediate' && !isHighPriority(s)) {
        s.timing = 'next_session';
      }
    });
  }
  
  return suggestions;
};

// Special timing for seasonal suggestions
export const getSeasonalSuggestions = (): ContextualSuggestion[] => {
  const suggestions: ContextualSuggestion[] = [];
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const dayOfMonth = currentDate.getDate();
  
  // Tax season (January - April)
  if (month >= 0 && month <= 3) {
    suggestions.push({
      trigger: 'tax_season',
      timing: 'immediate',
      message: 'Tax season is a perfect time to organize financial documents',
      action: 'organize_financial_docs'
    });
  }
  
  // New Year planning (December - January)
  if (month === 11 || month === 0) {
    suggestions.push({
      trigger: 'new_year_planning',
      timing: 'immediate',
      message: 'Start the new year with updated family protection plans',
      action: 'review_annual_plans'
    });
  }
  
  // Life insurance awareness month (September)
  if (month === 8) {
    suggestions.push({
      trigger: 'life_insurance_month',
      timing: 'immediate',
      message: 'September is Life Insurance Awareness Month - review your coverage',
      action: 'review_life_insurance'
    });
  }
  
  return suggestions;
};

// Track suggestion effectiveness
interface SuggestionMetrics {
  suggestionId: string;
  displayContext: TimingContext;
  userResponse: 'accepted' | 'dismissed' | 'ignored';
  responseTime: number; // milliseconds from display to response
}

export const trackSuggestionEffectiveness = (metrics: SuggestionMetrics): void => {
  // This would typically send data to analytics
  // Used to improve timing algorithms
  console.log('Suggestion effectiveness:', {
    context: metrics.displayContext.currentContext,
    mood: metrics.displayContext.userMood,
    response: metrics.userResponse,
    responseTime: metrics.responseTime
  });
};

// Helper to determine if a suggestion is high priority
const isHighPriority = (suggestion: ContextualSuggestion): boolean => {
  const highPriorityTriggers = [
    'after_asset_added',
    'after_executor_selected',
    'missing_guardian'
  ];
  
  return highPriorityTriggers.includes(suggestion.trigger);
};

// Get optimal timing for re-engagement
export const getReengagementTiming = (
  lastActivityDate: Date,
  userPattern: 'daily' | 'weekly' | 'monthly' | 'sporadic'
): Date | null => {
  const daysSinceLastActivity = Math.floor(
    (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let reengagementDays: number;
  
  switch (userPattern) {
    case 'daily':
      reengagementDays = 3; // Re-engage after 3 days of inactivity
      break;
    case 'weekly':
      reengagementDays = 10; // Re-engage after 10 days
      break;
    case 'monthly':
      reengagementDays = 35; // Re-engage after 35 days
      break;
    case 'sporadic':
      reengagementDays = 60; // Give more time for sporadic users
      break;
  }
  
  if (daysSinceLastActivity >= reengagementDays) {
    return new Date(); // Re-engage now
  }
  
  // Calculate next re-engagement date
  const nextReengagement = new Date(lastActivityDate);
  nextReengagement.setDate(nextReengagement.getDate() + reengagementDays);
  
  return nextReengagement;
};
