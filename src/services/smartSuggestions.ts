interface SmartSuggestion {
  id: string;
  type: "next_step" | "improvement" | "completion" | "family_benefit";
  priority: "high" | "medium" | "low";
  context: string;
  suggestion: string;
  reasoning: string;
  familyBenefit: string;
  timeEstimate: string;
  action: () => void;
}

interface UserProfile {
  hasYoungChildren: boolean;
  hasAgingParents: boolean;
  isBusinessOwner: boolean;
  isHighNetWorth: boolean;
  familySize: number;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
}

interface UserProgress {
  documentsCount: number;
  hasWill: boolean;
  hasExecutor: boolean;
  hasTrustedCircle: boolean;
  hasGuardianship: boolean;
  hasLifeInsurance: boolean;
  hasHealthcareDirective: boolean;
  lastActivityDate: Date;
  averageSessionDuration: number;
  completedAreas: string[];
}

interface BehaviorPattern {
  sessionFrequency: "daily" | "weekly" | "sporadic";
  sessionLength: "short" | "medium" | "long";
  engagementLevel: "high" | "medium" | "low";
  preferredTime: "morning" | "afternoon" | "evening";
  taskCompletionRate: number;
}

export const generateSmartSuggestions = (
  userProfile: UserProfile,
  currentProgress: UserProgress,
  behaviorPatterns: BehaviorPattern[],
): SmartSuggestion[] => {
  const suggestions: SmartSuggestion[] = [];

  // Analyze user situation and generate personalized suggestions
  // High priority suggestions based on family composition
  if (userProfile.hasYoungChildren && !currentProgress.hasGuardianship) {
    suggestions.push({
      id: "guardianship-young-children",
      type: "next_step",
      priority: "high",
      context: "You have young children",
      suggestion: "Choose guardians for your children",
      reasoning:
        "This ensures your children will be cared for by people you trust",
      familyBenefit:
        "Your children will be protected by guardians you've chosen, not appointed by a court",
      timeEstimate: "15-20 minutes",
      action: () => console.log("Navigate to guardianship"),
    });
  }

  if (userProfile.hasYoungChildren && !currentProgress.hasLifeInsurance) {
    suggestions.push({
      id: "life-insurance-children",
      type: "family_benefit",
      priority: "high",
      context: "Financial protection for young children",
      suggestion: "Document your life insurance policies",
      reasoning:
        "Life insurance provides crucial financial protection for your children",
      familyBenefit:
        "Your children's education and living expenses will be covered",
      timeEstimate: "10-15 minutes",
      action: () => console.log("Navigate to insurance documentation"),
    });
  }

  if (userProfile.hasAgingParents && !currentProgress.hasHealthcareDirective) {
    suggestions.push({
      id: "healthcare-directive-parents",
      type: "next_step",
      priority: "high",
      context: "Healthcare planning with aging parents",
      suggestion: "Create healthcare directives",
      reasoning:
        "Clear medical preferences prevent difficult decisions during emergencies",
      familyBenefit:
        "Your family will know your medical wishes without guessing",
      timeEstimate: "20-30 minutes",
      action: () => console.log("Navigate to healthcare directives"),
    });
  }

  if (
    userProfile.isBusinessOwner &&
    !currentProgress.completedAreas.includes("business")
  ) {
    suggestions.push({
      id: "business-succession",
      type: "improvement",
      priority: "high",
      context: "Business ownership requires special planning",
      suggestion: "Plan your business succession",
      reasoning:
        "Your business needs continuity planning to protect employees and value",
      familyBenefit:
        "Your family will know how to handle your business interests",
      timeEstimate: "45-60 minutes",
      action: () => console.log("Navigate to business planning"),
    });
  }

  // Behavior-based suggestions
  const primaryPattern = behaviorPatterns[0];
  if (primaryPattern) {
    if (primaryPattern.sessionLength === "short") {
      // Suggest quick wins for users with short sessions
      suggestions.push(...generateQuickWinSuggestions(currentProgress));
    } else if (primaryPattern.engagementLevel === "high") {
      // Suggest advanced features for highly engaged users
      suggestions.push(...generateAdvancedSuggestions(currentProgress));
    }
  }

  // Context-aware timing suggestions
  suggestions.push(...generateTimeBasedSuggestions(currentProgress));

  // Sort suggestions by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

// Generate quick win suggestions for short sessions
const generateQuickWinSuggestions = (
  progress: UserProgress,
): SmartSuggestion[] => {
  const quickWins: SmartSuggestion[] = [];

  if (progress.documentsCount === 0) {
    quickWins.push({
      id: "first-bank-account",
      type: "next_step",
      priority: "high",
      context: "Start with something simple",
      suggestion: "Add your primary bank account",
      reasoning:
        "This is the most essential financial information your family needs",
      familyBenefit: "Your family can access funds immediately for expenses",
      timeEstimate: "5 minutes",
      action: () => console.log("Add bank account"),
    });
  }

  if (!progress.hasTrustedCircle) {
    quickWins.push({
      id: "first-trusted-person",
      type: "next_step",
      priority: "medium",
      context: "Build your support network",
      suggestion: "Add your spouse's contact information",
      reasoning: "Start building your family's support network",
      familyBenefit: "Your family has someone to coordinate with immediately",
      timeEstimate: "2 minutes",
      action: () => console.log("Add trusted person"),
    });
  }

  return quickWins;
};

// Generate advanced suggestions for engaged users
const generateAdvancedSuggestions = (
  progress: UserProgress,
): SmartSuggestion[] => {
  const advanced: SmartSuggestion[] = [];

  if (
    progress.hasWill &&
    !progress.completedAreas.includes("personal_messages")
  ) {
    advanced.push({
      id: "personal-messages",
      type: "family_benefit",
      priority: "medium",
      context: "Add personal touches to your planning",
      suggestion: "Create personal messages for your family",
      reasoning:
        "Personal messages provide comfort and guidance beyond legal documents",
      familyBenefit:
        "Your family will have your personal thoughts and love to comfort them",
      timeEstimate: "20-30 minutes",
      action: () => console.log("Create personal messages"),
    });
  }

  if (progress.documentsCount > 10) {
    advanced.push({
      id: "document-organization",
      type: "improvement",
      priority: "medium",
      context: "Optimize your documentation",
      suggestion: "Organize documents by urgency for your family",
      reasoning:
        "Well-organized documents save crucial time during emergencies",
      familyBenefit:
        "Your family can find exactly what they need when they need it",
      timeEstimate: "30-45 minutes",
      action: () => console.log("Organize documents"),
    });
  }

  return advanced;
};

// Generate time-based contextual suggestions
const generateTimeBasedSuggestions = (
  progress: UserProgress,
): SmartSuggestion[] => {
  const timeBased: SmartSuggestion[] = [];
  const currentMonth = new Date().getMonth();
  const daysSinceLastActivity = Math.floor(
    (Date.now() - progress.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Tax season suggestion (January-April)
  if (currentMonth >= 0 && currentMonth <= 3) {
    timeBased.push({
      id: "tax-season-docs",
      type: "next_step",
      priority: "medium",
      context: "Tax season is here",
      suggestion: "Organize your financial documents",
      reasoning: "You're already gathering financial information for taxes",
      familyBenefit:
        "Your family will have all financial information organized and accessible",
      timeEstimate: "30-45 minutes",
      action: () => console.log("Organize financial documents"),
    });
  }

  // Re-engagement suggestion for inactive users
  if (daysSinceLastActivity > 30 && progress.hasWill) {
    timeBased.push({
      id: "review-will",
      type: "improvement",
      priority: "low",
      context: "It's been a while since your last update",
      suggestion: "Review and update your will",
      reasoning: "Life changes may require updates to your plans",
      familyBenefit: "Your family has the most current information and wishes",
      timeEstimate: "15-20 minutes",
      action: () => console.log("Review will"),
    });
  }

  return timeBased;
};

// Learn from user responses
interface SuggestionResponse {
  suggestionId: string;
  action: "accepted" | "dismissed" | "deferred";
  timestamp: Date;
}

export const trackSuggestionResponse = (response: SuggestionResponse): void => {
  // Track which suggestions users act on
  // This data would be used to refine future suggestions
  console.log("Tracking suggestion response:", response);

  // In a real implementation, this would:
  // 1. Store response data
  // 2. Update suggestion algorithms
  // 3. Adjust future suggestion priorities
};

// Helper to categorize suggestions by time commitment
export const categorizeSuggestionsByTime = (
  suggestions: SmartSuggestion[],
): {
  quickWins: SmartSuggestion[];
  highImpact: SmartSuggestion[];
  comprehensive: SmartSuggestion[];
} => {
  const quickWins = suggestions.filter((s) => {
    const minutes = parseInt(s.timeEstimate.split("-")[0]);
    return minutes <= 10;
  });

  const highImpact = suggestions.filter((s) => {
    const minutes = parseInt(s.timeEstimate.split("-")[0]);
    return minutes > 10 && minutes <= 30;
  });

  const comprehensive = suggestions.filter((s) => {
    const minutes = parseInt(s.timeEstimate.split("-")[0]);
    return minutes > 30;
  });

  return { quickWins, highImpact, comprehensive };
};
