export interface UserProgress {
  completedSteps: string[];
  documentedAssets: number;
  protectionLevel: 'foundation' | 'comprehensive' | 'advanced';
  familyStructure: {
    hasSpouse: boolean;
    hasChildren: boolean;
    hasDependents: boolean;
    hasBusinessInterests: boolean;
  };
  completedProtectionAreas: string[];
  lastActivityDate: string;
}

export interface DisclosureLevel {
  level: number;
  name: string;
  description: string;
  availableFeatures: string[];
  nextMilestone: string;
  readinessRequirements: string[];
  protectionStatus: string;
}

export interface ProtectionFeature {
  id: string;
  name: string;
  description: string;
  protectionArea: 'essential' | 'enhanced' | 'complete';
  prerequisites: string[];
  familyBenefit: string;
  readinessIndicators: string[];
}

// Protection feature definitions
export const PROTECTION_FEATURES: ProtectionFeature[] = [
  // Foundation Level - Essential Protection
  {
    id: 'basic-asset-documentation',
    name: 'Essential Asset Documentation',
    description: 'Document your primary residence and main financial accounts',
    protectionArea: 'essential',
    prerequisites: [],
    familyBenefit: 'Your family will know about your most important assets',
    readinessIndicators: ['account-created', 'family-structure-defined']
  },
  {
    id: 'primary-family-info',
    name: 'Family Member Information',
    description: 'Record essential information about your immediate family',
    protectionArea: 'essential',
    prerequisites: [],
    familyBenefit: 'Critical family information will be organized and accessible',
    readinessIndicators: ['account-created']
  },
  {
    id: 'document-storage',
    name: 'Essential Document Storage',
    description: 'Secure storage for your most important documents',
    protectionArea: 'essential',
    prerequisites: ['basic-asset-documentation'],
    familyBenefit: 'Your family can quickly access vital documents when needed',
    readinessIndicators: ['first-asset-documented']
  },
  {
    id: 'basic-will',
    name: 'Basic Will Creation',
    description: 'Create a foundational will for your family\'s protection',
    protectionArea: 'essential',
    prerequisites: ['basic-asset-documentation', 'primary-family-info'],
    familyBenefit: 'Your wishes for asset distribution will be clearly documented',
    readinessIndicators: ['assets-documented', 'beneficiaries-identified']
  },

  // Comprehensive Level - Enhanced Protection
  {
    id: 'trusted-circle',
    name: 'Trusted Circle',
    description: 'Designate trusted individuals to support your family',
    protectionArea: 'enhanced',
    prerequisites: ['basic-will'],
    familyBenefit: 'Your family will have designated support during difficult times',
    readinessIndicators: ['will-created', 'family-needs-assessed']
  },
  {
    id: 'detailed-assets',
    name: 'Comprehensive Asset Documentation',
    description: 'Document all significant assets and financial accounts',
    protectionArea: 'enhanced',
    prerequisites: ['basic-asset-documentation'],
    familyBenefit: 'Complete financial picture for your family\'s security',
    readinessIndicators: ['foundation-complete', 'ready-for-details']
  },
  {
    id: 'healthcare-directives',
    name: 'Healthcare Directives',
    description: 'Document your healthcare wishes and preferences',
    protectionArea: 'enhanced',
    prerequisites: ['basic-will', 'trusted-circle'],
    familyBenefit: 'Your healthcare preferences will guide family decisions',
    readinessIndicators: ['basic-planning-complete', 'trusted-people-identified']
  },
  {
    id: 'access-planning',
    name: 'Access Planning',
    description: 'Plan how your family will access important information',
    protectionArea: 'enhanced',
    prerequisites: ['document-storage', 'trusted-circle'],
    familyBenefit: 'Clear guidance on accessing critical information and accounts',
    readinessIndicators: ['documents-organized', 'trusted-circle-established']
  },

  // Advanced Level - Complete Protection
  {
    id: 'business-succession',
    name: 'Business Succession Planning',
    description: 'Plan for the continuation of your business interests',
    protectionArea: 'complete',
    prerequisites: ['detailed-assets'],
    familyBenefit: 'Business continuity and family financial security',
    readinessIndicators: ['business-assets-documented', 'succession-needs-identified']
  },
  {
    id: 'trust-planning',
    name: 'Trust Considerations',
    description: 'Explore trust options for complex family situations',
    protectionArea: 'complete',
    prerequisites: ['detailed-assets', 'basic-will'],
    familyBenefit: 'Advanced protection for complex family needs',
    readinessIndicators: ['complex-assets-documented', 'advanced-planning-ready']
  },
  {
    id: 'legacy-guidance',
    name: 'Family Legacy Guidance',
    description: 'Create comprehensive guidance for your family\'s future',
    protectionArea: 'complete',
    prerequisites: ['healthcare-directives', 'access-planning'],
    familyBenefit: 'Your wisdom and values preserved for future generations',
    readinessIndicators: ['comprehensive-planning-complete', 'ready-for-legacy']
  }
];

// Disclosure levels based on protection completeness
const DISCLOSURE_LEVELS: Record<string, DisclosureLevel> = {
  foundation: {
    level: 1,
    name: 'Foundation Protection',
    description: 'Building essential protection for your family',
    availableFeatures: [
      'basic-asset-documentation',
      'primary-family-info',
      'document-storage',
      'basic-will'
    ],
    nextMilestone: 'Complete basic asset documentation to unlock document storage',
    readinessRequirements: ['Account created', 'Family structure defined'],
    protectionStatus: 'Starting your family protection journey'
  },
  comprehensive: {
    level: 2,
    name: 'Comprehensive Protection',
    description: 'Enhancing your family\'s security with detailed planning',
    availableFeatures: [
      'trusted-circle',
      'detailed-assets',
      'healthcare-directives',
      'access-planning'
    ],
    nextMilestone: 'Establish your trusted circle for enhanced support',
    readinessRequirements: ['Basic will completed', 'Essential assets documented'],
    protectionStatus: 'Your family has foundational protection in place'
  },
  advanced: {
    level: 3,
    name: 'Complete Protection',
    description: 'Addressing complex needs for comprehensive family security',
    availableFeatures: [
      'business-succession',
      'trust-planning',
      'legacy-guidance'
    ],
    nextMilestone: 'Consider advanced planning for complete protection',
    readinessRequirements: ['Comprehensive assets documented', 'Healthcare directives complete'],
    protectionStatus: 'Your family has comprehensive protection established'
  }
};

export const getDisclosureLevel = (userProgress: UserProgress): DisclosureLevel => {
  // Determine protection level based on completed areas
  const completedEssentials = userProgress.completedProtectionAreas.filter(
    area => ['basic-assets', 'family-info', 'basic-will'].includes(area)
  ).length;

  const completedEnhanced = userProgress.completedProtectionAreas.filter(
    area => ['trusted-circle', 'healthcare-directives', 'detailed-assets'].includes(area)
  ).length;

  // Advanced readiness based on family complexity
  const needsAdvanced = userProgress.familyStructure.hasBusinessInterests ||
    userProgress.documentedAssets > 10 ||
    userProgress.completedProtectionAreas.length > 6;

  if (needsAdvanced && completedEnhanced >= 2) {
    return DISCLOSURE_LEVELS.advanced;
  } else if (completedEssentials >= 3 || userProgress.protectionLevel === 'comprehensive') {
    return DISCLOSURE_LEVELS.comprehensive;
  } else {
    return DISCLOSURE_LEVELS.foundation;
  }
};

export const shouldShowFeature = (
  featureId: string, 
  userProgress: UserProgress
): boolean => {
  const feature = PROTECTION_FEATURES.find(f => f.id === featureId);
  if (!feature) return false;

  // Check if prerequisites are met
  const prerequisitesMet = feature.prerequisites.every(prereq =>
    userProgress.completedSteps.includes(prereq)
  );

  // Check readiness indicators
  const readinessCheck = feature.readinessIndicators.some(indicator => {
    switch (indicator) {
      case 'account-created':
        return true; // Assuming user has account if checking
      case 'family-structure-defined':
        return userProgress.familyStructure.hasSpouse || 
               userProgress.familyStructure.hasChildren;
      case 'first-asset-documented':
        return userProgress.documentedAssets > 0;
      case 'assets-documented':
        return userProgress.documentedAssets >= 3;
      case 'foundation-complete':
        return userProgress.protectionLevel !== 'foundation';
      case 'business-assets-documented':
        return userProgress.familyStructure.hasBusinessInterests &&
               userProgress.documentedAssets > 5;
      default:
        return false;
    }
  });

  // Check if feature matches current protection level
  const currentLevel = getDisclosureLevel(userProgress);
  const featureAvailable = currentLevel.availableFeatures.includes(featureId);

  return prerequisitesMet && readinessCheck && featureAvailable;
};

export const getNextLogicalStep = (userProgress: UserProgress): ProtectionFeature | null => {
  // Find the next most important feature based on family needs
  const availableFeatures = PROTECTION_FEATURES.filter(feature =>
    !userProgress.completedSteps.includes(feature.id) &&
    shouldShowFeature(feature.id, userProgress)
  );

  // Prioritize based on family structure
  if (userProgress.familyStructure.hasChildren && 
      !userProgress.completedSteps.includes('trusted-circle')) {
    return PROTECTION_FEATURES.find(f => f.id === 'trusted-circle') || null;
  }

  if (userProgress.familyStructure.hasBusinessInterests &&
      !userProgress.completedSteps.includes('business-succession')) {
    return PROTECTION_FEATURES.find(f => f.id === 'business-succession') || null;
  }

  // Return first available feature in protection order
  return availableFeatures[0] || null;
};

export const getProtectionStatus = (userProgress: UserProgress): {
  level: string;
  message: string;
  familyBenefit: string;
  nextResponsibility: string;
} => {
  const completedCount = userProgress.completedSteps.length;
  const hasEssentials = ['basic-will', 'basic-asset-documentation'].every(
    step => userProgress.completedSteps.includes(step)
  );

  if (completedCount === 0) {
    return {
      level: 'Starting',
      message: 'Begin documenting your family\'s essential information',
      familyBenefit: 'Your family will have access to critical information',
      nextResponsibility: 'Document your primary residence and main accounts'
    };
  } else if (completedCount < 4 && !hasEssentials) {
    return {
      level: 'Foundation',
      message: 'You are building essential protection for your family',
      familyBenefit: 'Your family has access to your most important information',
      nextResponsibility: 'Complete your basic will for fundamental protection'
    };
  } else if (hasEssentials && completedCount < 7) {
    return {
      level: 'Comprehensive',
      message: 'You have established foundational protection',
      familyBenefit: 'Your family has clear guidance for most situations',
      nextResponsibility: 'Enhance protection with healthcare directives'
    };
  } else {
    return {
      level: 'Complete',
      message: 'You have created comprehensive protection for your family',
      familyBenefit: 'Your family is prepared for any situation',
      nextResponsibility: 'Review and update your protection plan annually'
    };
  }
};

export const getConfidenceMessage = (userProgress: UserProgress): string => {
  const status = getProtectionStatus(userProgress);
  
  const messages = {
    'Starting': 'Taking the first step shows your commitment to your family\'s future',
    'Foundation': 'You are fulfilling your responsibility to protect your loved ones',
    'Comprehensive': 'Your family can face the future with greater confidence',
    'Complete': 'You have provided comprehensive security for your family\'s future'
  };

  return messages[status.level] || 'Continue building your family\'s protection';
};
