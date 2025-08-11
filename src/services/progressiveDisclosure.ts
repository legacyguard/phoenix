export interface UserProgress {
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
  currentStage: string;
  emotionalState?:
    | "anxious"
    | "procrastinating"
    | "motivated"
    | "overwhelmed"
    | "confident";
  accountAge: number; // days since account creation
  lastActivityDate: Date;
  completedCategories: string[];
  unlockedFeatures: string[];
}

export interface DisclosureLevel {
  level: number;
  name: string;
  description: string;
  unlockedFeatures: string[];
  nextMilestone: string;
  completionRequirements: string[];
  encouragementMessage: string;
  familyImpact: string;
}

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  requiredItems?: number;
  requiredCategories?: string[];
  icon?: string;
  introductionMessage?: string;
}

export interface Milestone {
  id: string;
  name: string;
  message: string;
  improvementDescription: string;
  newFeatures: string[];
  icon: string;
  celebrationType: "minor" | "major" | "mega";
  familyBenefit: string;
}

// Feature definitions with progressive requirements
const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Level 1 - Foundation Features (Available from start)
  {
    id: "basic-assets",
    name: "Basic Asset Entry",
    description: "Add your home and primary accounts",
    requiredLevel: 1,
    requiredItems: 0,
    icon: "Home",
    introductionMessage:
      "Start by adding your most important assets - your home and main bank accounts.",
  },
  {
    id: "family-members",
    name: "Family Members",
    description: "Add immediate family members",
    requiredLevel: 1,
    requiredItems: 0,
    icon: "Users",
    introductionMessage:
      "Tell us about your immediate family so we can help protect them.",
  },
  {
    id: "document-upload",
    name: "Essential Documents",
    description: "Upload critical documents",
    requiredLevel: 1,
    requiredItems: 0,
    icon: "FileCheck",
    introductionMessage:
      "Keep your most important documents safe and accessible.",
  },
  {
    id: "basic-will",
    name: "Simple Will Creation",
    description: "Create a basic will",
    requiredLevel: 1,
    requiredItems: 2,
    icon: "FileText",
    introductionMessage: "Let's create a simple will to protect your family.",
  },

  // Level 2 - Building Confidence Features
  {
    id: "advanced-assets",
    name: "Additional Asset Categories",
    description: "Investments, collectibles, business interests",
    requiredLevel: 2,
    requiredItems: 5,
    icon: "TrendingUp",
    introductionMessage:
      "Great progress! Now you can add more complex assets like investments and business interests.",
  },
  {
    id: "trusted-circle",
    name: "Trusted Circle",
    description: "Assign roles and permissions to trusted people",
    requiredLevel: 2,
    requiredItems: 3,
    requiredCategories: ["family-members"],
    icon: "Shield",
    introductionMessage:
      "You're ready to build your trusted circle - people who can help your family when needed.",
  },
  {
    id: "document-organization",
    name: "Document Categories",
    description: "Organize documents by type and importance",
    requiredLevel: 2,
    requiredItems: 5,
    icon: "Folder",
    introductionMessage:
      "Let's organize your documents so your family can find everything easily.",
  },
  {
    id: "legacy-letters",
    name: "Legacy Letters",
    description: "Write personal messages to loved ones",
    requiredLevel: 2,
    requiredItems: 7,
    requiredCategories: ["basic-will"],
    icon: "Heart",
    introductionMessage:
      "Leave meaningful messages that your family will treasure forever.",
  },

  // Level 3 - Advanced Planning Features
  {
    id: "complex-assets",
    name: "Complex Asset Management",
    description: "Trusts, international assets, complex structures",
    requiredLevel: 3,
    requiredItems: 10,
    requiredCategories: ["advanced-assets"],
    icon: "Briefcase",
    introductionMessage:
      "You're ready for advanced asset planning including trusts and complex structures.",
  },
  {
    id: "advanced-will",
    name: "Advanced Will Features",
    description: "Conditional bequests, trust provisions",
    requiredLevel: 3,
    requiredItems: 12,
    requiredCategories: ["basic-will", "trusted-circle"],
    icon: "FileCheck",
    introductionMessage:
      "Enhance your will with advanced features like conditional gifts and trust provisions.",
  },
  {
    id: "business-planning",
    name: "Business Succession Planning",
    description: "Ensure business continuity",
    requiredLevel: 3,
    requiredItems: 10,
    requiredCategories: ["advanced-assets"],
    icon: "Building",
    introductionMessage:
      "Protect your business and ensure it continues to support your family.",
  },
  {
    id: "tax-planning",
    name: "Tax & Legal Optimization",
    description: "Advanced tax and legal strategies",
    requiredLevel: 3,
    requiredItems: 15,
    icon: "Calculator",
    introductionMessage:
      "Optimize your estate plan with advanced tax and legal strategies.",
  },

  // Special Features - Unlocked by specific actions
  {
    id: "emergency-access",
    name: "Emergency Access",
    description: "Quick access for urgent situations",
    requiredLevel: 2,
    requiredCategories: ["trusted-circle", "document-upload"],
    icon: "AlertCircle",
    introductionMessage:
      "Set up emergency access so your trusted people can help in urgent situations.",
  },
  {
    id: "annual-review",
    name: "Annual Review",
    description: "Keep everything up to date",
    requiredLevel: 2,
    requiredItems: 8,
    icon: "Calendar",
    introductionMessage:
      "Great job! You can now schedule annual reviews to keep everything current.",
  },
];

// Disclosure levels with progression milestones
const DISCLOSURE_LEVELS: DisclosureLevel[] = [
  {
    level: 1,
    name: "Foundation",
    description: "Getting started with the basics",
    unlockedFeatures: [
      "basic-assets",
      "family-members",
      "document-upload",
      "basic-will",
    ],
    nextMilestone: "Complete 5 items to unlock more features",
    completionRequirements: [
      "Add at least one asset",
      "Add one family member",
      "Upload one document",
    ],
    encouragementMessage:
      "You're taking the first important steps to protect your family!",
    familyImpact:
      "Your family now has basic information they'll need in an emergency.",
  },
  {
    level: 2,
    name: "Building Confidence",
    description: "Expanding your family protection",
    unlockedFeatures: [
      "advanced-assets",
      "trusted-circle",
      "document-organization",
      "legacy-letters",
      "emergency-access",
      "annual-review",
    ],
    nextMilestone: "Complete 10 items and organize your assets",
    completionRequirements: [
      "Complete basic will",
      "Add 3 trusted people",
      "Organize documents",
    ],
    encouragementMessage:
      "Great progress! You're building a solid foundation for your family's security.",
    familyImpact:
      "Your family has clear guidance and trusted people to turn to for help.",
  },
  {
    level: 3,
    name: "Advanced Planning",
    description: "Comprehensive family protection",
    unlockedFeatures: [
      "complex-assets",
      "advanced-will",
      "business-planning",
      "tax-planning",
    ],
    nextMilestone: "You've unlocked all features!",
    completionRequirements: [
      "Complete trusted circle setup",
      "Achieve 60% completion",
    ],
    encouragementMessage: "You're now ready for advanced planning strategies!",
    familyImpact:
      "Your family has comprehensive protection with sophisticated planning in place.",
  },
];

// Milestone definitions
const MILESTONES: Milestone[] = [
  {
    id: "first-asset",
    name: "First Asset Added",
    message:
      "You've taken the first step! Your family now knows about an important asset.",
    improvementDescription: "better informed about your assets",
    newFeatures: ["Add more assets"],
    icon: "🏠",
    celebrationType: "minor",
    familyBenefit:
      "Your family won't have to search for this important information.",
  },
  {
    id: "foundation-complete",
    name: "Foundation Complete",
    message:
      "Amazing! You've built a solid foundation for your family's protection.",
    improvementDescription: "significantly more prepared for unexpected events",
    newFeatures: ["Advanced assets", "Trusted circle", "Document organization"],
    icon: "🎯",
    celebrationType: "major",
    familyBenefit:
      "Your family has essential information and clear first steps to follow.",
  },
  {
    id: "trusted-circle-created",
    name: "Trusted Circle Established",
    message:
      "Your support network is in place! Your family knows who to turn to.",
    improvementDescription: "supported by a network of trusted helpers",
    newFeatures: ["Role assignments", "Emergency access"],
    icon: "🛡️",
    celebrationType: "major",
    familyBenefit: "Your family has trusted people ready to help when needed.",
  },
  {
    id: "will-completed",
    name: "Will Completed",
    message: "Incredible achievement! Your wishes are now clearly documented.",
    improvementDescription: "protected by your clear legal wishes",
    newFeatures: ["Legacy letters", "Advanced will features"],
    icon: "📜",
    celebrationType: "mega",
    familyBenefit:
      "Your family has legal clarity and won't face difficult decisions alone.",
  },
  {
    id: "advanced-planning",
    name: "Advanced Planner",
    message:
      "You're in the top tier of family protectors! All advanced features are now available.",
    improvementDescription:
      "comprehensively protected with sophisticated planning",
    newFeatures: [
      "Business planning",
      "Tax optimization",
      "Complex structures",
    ],
    icon: "🏆",
    celebrationType: "mega",
    familyBenefit:
      "Your family has professional-level protection and planning in place.",
  },
];

// Main disclosure level determination
export const getDisclosureLevel = (
  userProgress: UserProgress,
): DisclosureLevel => {
  const { completedItems, completionPercentage, completedCategories } =
    userProgress;

  // Level 3 - Advanced Planning
  if (completedItems >= 10 && completionPercentage >= 60) {
    return DISCLOSURE_LEVELS[2];
  }

  // Level 2 - Building Confidence
  if (completedItems >= 5 || completionPercentage >= 25) {
    return DISCLOSURE_LEVELS[1];
  }

  // Level 1 - Foundation (default)
  return DISCLOSURE_LEVELS[0];
};

// Check if a specific feature should be shown
export const shouldShowFeature = (
  featureId: string,
  userProgress: UserProgress,
): boolean => {
  const feature = FEATURE_DEFINITIONS.find((f) => f.id === featureId);
  if (!feature) return false;

  const currentLevel = getDisclosureLevel(userProgress);

  // Check level requirement
  if (feature.requiredLevel > currentLevel.level) {
    return false;
  }

  // Check item count requirement
  if (
    feature.requiredItems &&
    userProgress.completedItems < feature.requiredItems
  ) {
    return false;
  }

  // Check category requirements
  if (feature.requiredCategories) {
    const hasAllCategories = feature.requiredCategories.every((cat) =>
      userProgress.completedCategories.includes(cat),
    );
    if (!hasAllCategories) {
      return false;
    }
  }

  // Special handling for overwhelmed users - hide complex features
  if (
    userProgress.emotionalState === "overwhelmed" &&
    feature.requiredLevel >= 3
  ) {
    return false;
  }

  // Feature has already been unlocked
  if (userProgress.unlockedFeatures.includes(featureId)) {
    return true;
  }

  return true;
};

// Get next feature to unlock
export const getNextFeatureToUnlock = (
  userProgress: UserProgress,
): FeatureDefinition | null => {
  const currentLevel = getDisclosureLevel(userProgress);

  // Find features that are close to being unlocked
  const nearUnlock = FEATURE_DEFINITIONS.filter(
    (f) => !shouldShowFeature(f.id, userProgress),
  )
    .filter((f) => f.requiredLevel <= currentLevel.level + 1)
    .sort((a, b) => {
      // Prioritize by how close user is to meeting requirements
      const aItemsNeeded = (a.requiredItems || 0) - userProgress.completedItems;
      const bItemsNeeded = (b.requiredItems || 0) - userProgress.completedItems;
      return aItemsNeeded - bItemsNeeded;
    });

  return nearUnlock[0] || null;
};

// Check for milestone achievements
export const checkForMilestones = (
  userProgress: UserProgress,
  previousProgress: UserProgress,
): Milestone[] => {
  const achieved: Milestone[] = [];

  // First asset milestone
  if (
    previousProgress.completedItems === 0 &&
    userProgress.completedItems >= 1
  ) {
    achieved.push(MILESTONES.find((m) => m.id === "first-asset")!);
  }

  // Foundation complete milestone
  if (previousProgress.completedItems < 5 && userProgress.completedItems >= 5) {
    achieved.push(MILESTONES.find((m) => m.id === "foundation-complete")!);
  }

  // Trusted circle milestone
  if (
    !previousProgress.completedCategories.includes("trusted-circle") &&
    userProgress.completedCategories.includes("trusted-circle")
  ) {
    achieved.push(MILESTONES.find((m) => m.id === "trusted-circle-created")!);
  }

  // Will completed milestone
  if (
    !previousProgress.completedCategories.includes("basic-will") &&
    userProgress.completedCategories.includes("basic-will")
  ) {
    achieved.push(MILESTONES.find((m) => m.id === "will-completed")!);
  }

  // Advanced planning milestone
  if (
    previousProgress.completedItems < 15 &&
    userProgress.completedItems >= 15
  ) {
    achieved.push(MILESTONES.find((m) => m.id === "advanced-planning")!);
  }

  return achieved;
};

// Get features that are about to unlock
export const getUpcomingFeatures = (
  userProgress: UserProgress,
): FeatureDefinition[] => {
  const currentLevel = getDisclosureLevel(userProgress);

  return FEATURE_DEFINITIONS.filter(
    (f) => !shouldShowFeature(f.id, userProgress),
  )
    .filter((f) => {
      // Show features that are 1-2 items away from unlocking
      if (f.requiredItems) {
        const itemsNeeded = f.requiredItems - userProgress.completedItems;
        return itemsNeeded > 0 && itemsNeeded <= 2;
      }
      // Or features in the next level
      return f.requiredLevel === currentLevel.level + 1;
    })
    .slice(0, 3); // Show max 3 upcoming features
};

// Get motivational message based on progress
export const getMotivationalMessage = (userProgress: UserProgress): string => {
  const { completedItems, emotionalState, completionPercentage } = userProgress;
  const nextFeature = getNextFeatureToUnlock(userProgress);

  if (emotionalState === "overwhelmed") {
    return "You're doing great! Focus on one small task at a time.";
  }

  if (completedItems === 0) {
    return "Welcome! Let's start with something simple to protect your family.";
  }

  if (completionPercentage >= 75) {
    return "Amazing progress! You're providing exceptional protection for your family.";
  }

  if (nextFeature && nextFeature.requiredItems) {
    const itemsNeeded = nextFeature.requiredItems - completedItems;
    if (itemsNeeded === 1) {
      return `Just one more task to unlock ${nextFeature.name}!`;
    }
    return `Complete ${itemsNeeded} more tasks to unlock ${nextFeature.name}.`;
  }

  return "Keep going! Every step makes your family more secure.";
};

// Export all feature definitions for UI components
export const getAllFeatures = (): FeatureDefinition[] => FEATURE_DEFINITIONS;
export const getAllMilestones = (): Milestone[] => MILESTONES;
export const getAllLevels = (): DisclosureLevel[] => DISCLOSURE_LEVELS;
