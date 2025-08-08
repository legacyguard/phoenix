interface SuggestionFeedback {
  suggestionId: string;
  suggestionType: string;
  userProfile: {
    familyComposition: string;
    engagementLevel: string;
  };
  response: 'accepted' | 'dismissed' | 'deferred';
  timeToResponse: number;
  contextWhenShown: string;
}

// User profile interface for suggestion matching
interface UserProfile {
  familyComposition: string;
  engagementLevel: string;
  [key: string]: unknown; // Allow for additional profile fields
}

interface SuggestionPattern {
  pattern: string;
  successRate: number;
  averageTimeToAccept: number;
  bestContexts: string[];
  userProfileMatch: UserProfile;
}

class SuggestionLearningService {
  private feedbackHistory: SuggestionFeedback[] = [];
  private patterns: Map<string, SuggestionPattern> = new Map();
  
  // Record user feedback on suggestions
  recordFeedback(feedback: SuggestionFeedback): void {
    this.feedbackHistory.push(feedback);
    this.updatePatterns(feedback);
    this.persistFeedback(feedback);
  }
  
  // Update patterns based on new feedback
  private updatePatterns(feedback: SuggestionFeedback): void {
    const patternKey = `${feedback.suggestionType}_${feedback.userProfile.familyComposition}`;
    
    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, {
        pattern: patternKey,
        successRate: 0,
        averageTimeToAccept: 0,
        bestContexts: [],
        userProfileMatch: feedback.userProfile
      });
    }
    
    const pattern = this.patterns.get(patternKey)!;
    
    // Update success rate
    const relevantFeedback = this.feedbackHistory.filter(
      f => f.suggestionType === feedback.suggestionType &&
           f.userProfile.familyComposition === feedback.userProfile.familyComposition
    );
    
    const acceptedCount = relevantFeedback.filter(f => f.response === 'accepted').length;
    pattern.successRate = acceptedCount / relevantFeedback.length;
    
    // Update average time to accept
    const acceptedFeedback = relevantFeedback.filter(f => f.response === 'accepted');
    if (acceptedFeedback.length > 0) {
      const totalTime = acceptedFeedback.reduce((sum, f) => sum + f.timeToResponse, 0);
      pattern.averageTimeToAccept = totalTime / acceptedFeedback.length;
    }
    
    // Update best contexts
    const contextSuccess = new Map<string, number>();
    relevantFeedback.forEach(f => {
      if (f.response === 'accepted') {
        const count = contextSuccess.get(f.contextWhenShown) || 0;
        contextSuccess.set(f.contextWhenShown, count + 1);
      }
    });
    
    pattern.bestContexts = Array.from(contextSuccess.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([context]) => context);
  }
  
  // Get suggestion improvements based on patterns
  getSuggestionImprovements(
    suggestionType: string,
    userProfile: UserProfile
  ): {
    shouldShow: boolean;
    optimalContext: string;
    confidenceScore: number;
  } {
    const patternKey = `${suggestionType}_${userProfile.familyComposition}`;
    const pattern = this.patterns.get(patternKey);
    
    if (!pattern) {
      // No data yet, show with default confidence
      return {
        shouldShow: true,
        optimalContext: 'general',
        confidenceScore: 0.5
      };
    }
    
    // Don't show if success rate is too low
    if (pattern.successRate < 0.2) {
      return {
        shouldShow: false,
        optimalContext: '',
        confidenceScore: pattern.successRate
      };
    }
    
    return {
      shouldShow: true,
      optimalContext: pattern.bestContexts[0] || 'general',
      confidenceScore: pattern.successRate
    };
  }
  
  // Get personalized suggestion ranking
  rankSuggestions<T extends { type: string; priority: 'high' | 'medium' | 'low' }>(
    suggestions: T[],
    userProfile: UserProfile
  ): T[] {
    return suggestions.sort((a, b) => {
      const aPattern = this.patterns.get(`${a.type}_${userProfile.familyComposition}`);
      const bPattern = this.patterns.get(`${b.type}_${userProfile.familyComposition}`);
      
      const aScore = aPattern?.successRate || 0.5;
      const bScore = bPattern?.successRate || 0.5;
      
      // Also consider priority
      const priorityWeight = { high: 1.5, medium: 1.0, low: 0.5 };
      const aFinalScore = aScore * (priorityWeight[a.priority] || 1);
      const bFinalScore = bScore * (priorityWeight[b.priority] || 1);
      
      return bFinalScore - aFinalScore;
    });
  }
  
  // Identify successful patterns for similar users
  getSimilarUserPatterns(userProfile: UserProfile): SuggestionPattern[] {
    const similarPatterns: SuggestionPattern[] = [];
    
    this.patterns.forEach(pattern => {
      // Check if user profiles are similar
      const isSimilar = this.calculateProfileSimilarity(
        userProfile,
        pattern.userProfileMatch
      ) > 0.7;
      
      if (isSimilar && pattern.successRate > 0.6) {
        similarPatterns.push(pattern);
      }
    });
    
    return similarPatterns.sort((a, b) => b.successRate - a.successRate);
  }
  
  // Calculate similarity between user profiles
  private calculateProfileSimilarity(profile1: UserProfile, profile2: UserProfile): number {
    let matchScore = 0;
    let totalFactors = 0;
    
    // Family composition match
    if (profile1.familyComposition === profile2.familyComposition) {
      matchScore += 1;
    }
    totalFactors += 1;
    
    // Engagement level match
    if (profile1.engagementLevel === profile2.engagementLevel) {
      matchScore += 0.5;
    }
    totalFactors += 0.5;
    
    // Add more factors as needed
    
    return matchScore / totalFactors;
  }
  
  // Persist feedback for long-term learning
  private persistFeedback(feedback: SuggestionFeedback): void {
    // In a real implementation, this would save to a database
    // For now, we'll just log it
    console.log('Persisting suggestion feedback:', {
      suggestion: feedback.suggestionId,
      response: feedback.response,
      successRate: this.patterns.get(
        `${feedback.suggestionType}_${feedback.userProfile.familyComposition}`
      )?.successRate
    });
  }
  
  // Get insights about suggestion performance
  getPerformanceInsights(): {
    topPerformingSuggestions: string[];
    worstPerformingSuggestions: string[];
    bestUserProfiles: string[];
    optimalTimings: {
      averageTimeToAccept: number;
    };
  } {
    const patternArray = Array.from(this.patterns.values());
    
    // Sort by success rate
    const sortedBySuccess = [...patternArray].sort(
      (a, b) => b.successRate - a.successRate
    );
    
    return {
      topPerformingSuggestions: sortedBySuccess
        .slice(0, 5)
        .map(p => p.pattern),
      worstPerformingSuggestions: sortedBySuccess
        .slice(-5)
        .map(p => p.pattern),
      bestUserProfiles: sortedBySuccess
        .filter(p => p.successRate > 0.7)
        .map(p => p.userProfileMatch.familyComposition)
        .filter((v, i, a) => a.indexOf(v) === i), // unique values
      optimalTimings: {
        averageTimeToAccept: patternArray
          .filter(p => p.averageTimeToAccept > 0)
          .reduce((sum, p) => sum + p.averageTimeToAccept, 0) / 
          patternArray.filter(p => p.averageTimeToAccept > 0).length
      }
    };
  }
}

// Export singleton instance
export const suggestionLearning = new SuggestionLearningService();
