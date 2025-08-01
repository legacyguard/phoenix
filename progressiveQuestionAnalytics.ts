import { UserContext } from './ProgressiveQuestionLogic';

// Analytics event types
export type AnalyticsEventType = 
  | 'question_viewed'
  | 'answer_selected'
  | 'flow_completed'
  | 'flow_abandoned'
  | 'branch_entered'
  | 'context_changed';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  questionId: string;
  answer?: string;
  context?: UserContext;
  flowPath?: string[];
  timeSpent?: number;
}

export interface FlowMetrics {
  completionRate: number;
  averageTimePerQuestion: number;
  mostCommonPaths: string[][];
  dropOffPoints: { questionId: string; rate: number }[];
  userArchetypes: UserArchetype[];
}

export interface UserArchetype {
  name: string;
  description: string;
  typicalContext: Partial<UserContext>;
  commonPaths: string[][];
  percentage: number;
}

// Flow analytics tracker
export class ProgressiveFlowAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessionStartTime: number;
  private questionStartTimes: Map<string, number> = new Map();
  
  constructor() {
    this.sessionStartTime = Date.now();
  }
  
  // Track when a question is viewed
  trackQuestionView(questionId: string) {
    this.questionStartTimes.set(questionId, Date.now());
    this.events.push({
      eventType: 'question_viewed',
      timestamp: Date.now(),
      questionId
    });
  }
  
  // Track answer selection
  trackAnswer(questionId: string, answer: string, context: UserContext) {
    const startTime = this.questionStartTimes.get(questionId);
    const timeSpent = startTime ? Date.now() - startTime : undefined;
    
    this.events.push({
      eventType: 'answer_selected',
      timestamp: Date.now(),
      questionId,
      answer,
      context,
      timeSpent
    });
  }
  
  // Track flow completion
  trackCompletion(flowPath: string[], finalContext: UserContext) {
    this.events.push({
      eventType: 'flow_completed',
      timestamp: Date.now(),
      questionId: flowPath[flowPath.length - 1],
      context: finalContext,
      flowPath,
      timeSpent: Date.now() - this.sessionStartTime
    });
  }
  
  // Track flow abandonment
  trackAbandonment(currentQuestionId: string, flowPath: string[]) {
    this.events.push({
      eventType: 'flow_abandoned',
      timestamp: Date.now(),
      questionId: currentQuestionId,
      flowPath,
      timeSpent: Date.now() - this.sessionStartTime
    });
  }
  
  // Get flow metrics
  getMetrics(): FlowMetrics {
    const completions = this.events.filter(e => e.eventType === 'flow_completed').length;
    const starts = new Set(this.events.filter(e => e.eventType === 'question_viewed' && e.questionId === 'family-reliance')).size;
    
    return {
      completionRate: starts > 0 ? completions / starts : 0,
      averageTimePerQuestion: this.calculateAverageTimePerQuestion(),
      mostCommonPaths: this.identifyCommonPaths(),
      dropOffPoints: this.identifyDropOffPoints(),
      userArchetypes: this.identifyUserArchetypes()
    };
  }
  
  private calculateAverageTimePerQuestion(): number {
    const questionTimes = this.events
      .filter(e => e.eventType === 'answer_selected' && e.timeSpent)
      .map(e => e.timeSpent!);
    
    if (questionTimes.length === 0) return 0;
    return questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length;
  }
  
  private identifyCommonPaths(): string[][] {
    const completedFlows = this.events
      .filter(e => e.eventType === 'flow_completed')
      .map(e => e.flowPath!);
    
    // Group by path similarity and count occurrences
    const pathCounts = new Map<string, number>();
    completedFlows.forEach(path => {
      const pathKey = path.join('->');
      pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
    });
    
    // Sort by frequency and return top 5
    return Array.from(pathCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0].split('->'));
  }
  
  private identifyDropOffPoints(): { questionId: string; rate: number }[] {
    const questionViews = new Map<string, number>();
    const questionCompletions = new Map<string, number>();
    
    this.events.forEach(event => {
      if (event.eventType === 'question_viewed') {
        questionViews.set(event.questionId, (questionViews.get(event.questionId) || 0) + 1);
      }
      if (event.eventType === 'answer_selected') {
        questionCompletions.set(event.questionId, (questionCompletions.get(event.questionId) || 0) + 1);
      }
    });
    
    const dropOffRates: { questionId: string; rate: number }[] = [];
    questionViews.forEach((views, questionId) => {
      const completions = questionCompletions.get(questionId) || 0;
      const dropOffRate = 1 - (completions / views);
      if (dropOffRate > 0.1) { // Only include significant drop-offs
        dropOffRates.push({ questionId, rate: dropOffRate });
      }
    });
    
    return dropOffRates.sort((a, b) => b.rate - a.rate);
  }
  
  private identifyUserArchetypes(): UserArchetype[] {
    // Define archetypes based on context patterns
    const archetypes: UserArchetype[] = [
      {
        name: 'Prepared Family Man',
        description: 'Organized individual focused on family protection',
        typicalContext: {
          preparednessLevel: 'high',
          familyFocus: 'spouse',
          urgencyLevel: 'planning',
          complexityLevel: 'intermediate'
        },
        commonPaths: [['family-reliance', 'spouse-challenge', 'organization-status', 'optimization-focus']],
        percentage: 0
      },
      {
        name: 'Business Owner Seeking Structure',
        description: 'Business-focused individual needing better organization',
        typicalContext: {
          preparednessLevel: 'low',
          familyFocus: 'business',
          urgencyLevel: 'immediate',
          complexityLevel: 'advanced'
        },
        commonPaths: [['family-reliance', 'business-structure', 'organization-status', 'first-step']],
        percentage: 0
      },
      {
        name: 'Overwhelmed Provider',
        description: 'Family provider who knows they need help getting organized',
        typicalContext: {
          preparednessLevel: 'low',
          familyFocus: 'spouse',
          urgencyLevel: 'immediate',
          complexityLevel: 'basic'
        },
        commonPaths: [['family-reliance', 'spouse-challenge', 'organization-status', 'first-step']],
        percentage: 0
      },
      {
        name: 'Solo Planner',
        description: 'Individual focused on personal preparation',
        typicalContext: {
          preparednessLevel: 'medium',
          familyFocus: 'spouse',
          urgencyLevel: 'planning',
          complexityLevel: 'basic'
        },
        commonPaths: [['family-reliance', 'organization-status', 'organization-priority', 'document-timeline']],
        percentage: 0
      }
    ];
    
    // Calculate percentages based on completed flows
    const completedContexts = this.events
      .filter(e => e.eventType === 'flow_completed')
      .map(e => e.context!);
    
    if (completedContexts.length > 0) {
      archetypes.forEach(archetype => {
        const matches = completedContexts.filter(context => 
          this.contextMatchesArchetype(context, archetype.typicalContext)
        ).length;
        archetype.percentage = (matches / completedContexts.length) * 100;
      });
    }
    
    return archetypes.filter(a => a.percentage > 0).sort((a, b) => b.percentage - a.percentage);
  }
  
  private contextMatchesArchetype(context: UserContext, archetypeContext: Partial<UserContext>): boolean {
    let matches = 0;
    let total = 0;
    
    Object.entries(archetypeContext).forEach(([key, value]) => {
      total++;
      if (context[key as keyof UserContext] === value) {
        matches++;
      }
    });
    
    return matches / total >= 0.75; // 75% match threshold
  }
}

// Question flow optimizer
export class QuestionFlowOptimizer {
  private analytics: ProgressiveFlowAnalytics;
  
  constructor(analytics: ProgressiveFlowAnalytics) {
    this.analytics = analytics;
  }
  
  // Suggest optimizations based on metrics
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const metrics = this.analytics.getMetrics();
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check for high drop-off points
    metrics.dropOffPoints.forEach(dropOff => {
      if (dropOff.rate > 0.3) {
        suggestions.push({
          type: 'high_dropoff',
          severity: 'high',
          questionId: dropOff.questionId,
          message: `Question "${dropOff.questionId}" has a ${Math.round(dropOff.rate * 100)}% drop-off rate`,
          recommendation: 'Consider simplifying the question or providing more context'
        });
      }
    });
    
    // Check for low completion rate
    if (metrics.completionRate < 0.7) {
      suggestions.push({
        type: 'low_completion',
        severity: 'medium',
        message: `Overall completion rate is only ${Math.round(metrics.completionRate * 100)}%`,
        recommendation: 'Consider reducing the number of questions or improving engagement'
      });
    }
    
    // Check for long question times
    if (metrics.averageTimePerQuestion > 30000) { // 30 seconds
      suggestions.push({
        type: 'slow_responses',
        severity: 'low',
        message: `Users take an average of ${Math.round(metrics.averageTimePerQuestion / 1000)}s per question`,
        recommendation: 'Consider simplifying answer options or providing clearer guidance'
      });
    }
    
    return suggestions;
  }
  
  // Get personalized question flow based on early answers
  getOptimalNextQuestion(currentContext: UserContext, answeredQuestions: string[]): string | null {
    const metrics = this.analytics.getMetrics();
    
    // Find the most successful archetype matching current context
    const matchingArchetype = metrics.userArchetypes.find(archetype =>
      this.contextMatchesArchetype(currentContext, archetype.typicalContext)
    );
    
    if (matchingArchetype && matchingArchetype.commonPaths.length > 0) {
      // Find where we are in the typical path and suggest next question
      const typicalPath = matchingArchetype.commonPaths[0];
      const lastAnswered = answeredQuestions[answeredQuestions.length - 1];
      const currentIndex = typicalPath.indexOf(lastAnswered);
      
      if (currentIndex >= 0 && currentIndex < typicalPath.length - 1) {
        return typicalPath[currentIndex + 1];
      }
    }
    
    return null; // Fall back to default flow
  }
  
  private contextMatchesArchetype(context: UserContext, archetypeContext: Partial<UserContext>): boolean {
    let matches = 0;
    let total = 0;
    
    Object.entries(archetypeContext).forEach(([key, value]) => {
      total++;
      if (context[key as keyof UserContext] === value) {
        matches++;
      }
    });
    
    return matches / total >= 0.6; // 60% match threshold for optimization
  }
}

export interface OptimizationSuggestion {
  type: 'high_dropoff' | 'low_completion' | 'slow_responses';
  severity: 'high' | 'medium' | 'low';
  questionId?: string;
  message: string;
  recommendation: string;
}

// Export singleton instance
export const flowAnalytics = new ProgressiveFlowAnalytics();
export const flowOptimizer = new QuestionFlowOptimizer(flowAnalytics);
