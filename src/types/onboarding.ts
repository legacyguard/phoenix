/**
 * Onboarding Data Structures
 * Backward-compatible types for both legacy and respectful onboarding flows
 */

// Existing TaskItem interface (keep for backward compatibility)
export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  pillar: string;
  completed: boolean;
  link: string;
  // New optional fields for respectful onboarding
  isSuggestion?: boolean;
  respectfulDescription?: string;
  practicalRationale?: string;
  estimatedTime?: string;
  category?: 'essential' | 'recommended' | 'optional';
}

// Legacy onboarding answers (existing structure)
export interface LegacyOnboardingAnswers {
  documentAccess: 'yes' | 'no' | 'partially';
  caretaker: 'designated' | 'family_figure_out' | 'not_thought';
  familyClarity: 'clear' | 'somewhat' | 'never_discussed';
  biggestWorry: 'financial' | 'legal' | 'memories' | 'conflicts';
  lifeAnswers?: {
    familyStructure?: string;
    financialComplexity?: string;
    emotionalConcern?: string;
    timelineUrgency?: string;
  };
}

// New respectful onboarding answers
export interface RespectfulOnboardingAnswers {
  // Question 1: Who would need access?
  accessNeeds: {
    type: 'family' | 'partner' | 'parents' | 'business' | 'solo';
    customResponse?: string;
  };
  // Question 2: What brought you here?
  currentTrigger: {
    type: 'baby' | 'property' | 'travel' | 'health' | 'organizing' | 'planning';
    customResponse?: string;
  };
  // Optional first document info
  firstDocument?: {
    type: string;
    uploadedAt: string;
    secured: boolean;
  };
}

// Unified onboarding data structure
export interface OnboardingData {
  version: 'legacy' | 'respectful';
  completedAt?: string;
  skippedAt?: string;
  resumedAt?: string;
  tasks: TaskItem[];
  answers: LegacyOnboardingAnswers | RespectfulOnboardingAnswers;
  progressCheckpoints?: {
    landingViewed?: boolean;
    questionsCompleted?: boolean;
    firstDocumentUploaded?: boolean;
    accountCreated?: boolean;
    dashboardReached?: boolean;
  };
  analytics?: {
    timeSpent?: number;
    stepsCompleted?: number;
    documentsUploaded?: number;
  };
}

// Storage keys configuration
export const ONBOARDING_STORAGE_KEYS = {
  // Existing keys (keep for backward compatibility)
  COMPLETED: 'onboardingCompleted',
  SKIPPED: 'onboardingSkipped',
  PROGRESS: 'onboardingProgress',
  FIRST_TIME_GUIDE: 'firstTimeGuideCompleted',
  
  // New keys for respectful onboarding
  VERSION: 'onboardingVersion',
  DATA: 'onboardingData',
  PROFESSIONAL_DATA: 'professionalOnboardingData',
  
  // User-specific keys (with userId appended)
  USER_COMPLETED: (userId: string) => `legacyguard-onboarding-completed-${userId}`,
  USER_GUIDE: (userId: string) => `legacyguard-dashboard-guide-completed-${userId}`,
  USER_DATA: (userId: string) => `legacyguard-onboarding-data-${userId}`,
} as const;

// Helper class for managing onboarding data
export class OnboardingDataManager {
  /**
   * Get onboarding data from localStorage
   */
  static getData(userId?: string): OnboardingData | null {
    try {
      // Try user-specific data first
      if (userId) {
        const userDataStr = localStorage.getItem(ONBOARDING_STORAGE_KEYS.USER_DATA(userId));
        if (userDataStr) {
          return JSON.parse(userDataStr);
        }
      }

      // Fall back to general data
      const dataStr = localStorage.getItem(ONBOARDING_STORAGE_KEYS.DATA);
      if (dataStr) {
        return JSON.parse(dataStr);
      }

      // Check for legacy data
      const legacyProgress = localStorage.getItem(ONBOARDING_STORAGE_KEYS.PROGRESS);
      if (legacyProgress) {
        const legacyData = JSON.parse(legacyProgress);
        // Convert legacy format to new format
        return {
          version: 'legacy',
          tasks: [],
          answers: legacyData.answers || {},
          completedAt: localStorage.getItem(ONBOARDING_STORAGE_KEYS.COMPLETED) === 'true' 
            ? new Date().toISOString() : undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return null;
    }
  }

  /**
   * Save onboarding data to localStorage
   */
  static saveData(data: OnboardingData, userId?: string): void {
    try {
      const dataStr = JSON.stringify(data);
      
      // Save to user-specific key if userId provided
      if (userId) {
        localStorage.setItem(ONBOARDING_STORAGE_KEYS.USER_DATA(userId), dataStr);
        
        // Also update user-specific completion flags
        if (data.completedAt) {
          localStorage.setItem(ONBOARDING_STORAGE_KEYS.USER_COMPLETED(userId), 'true');
        }
      }
      
      // Save to general key
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.DATA, dataStr);
      
      // Update legacy keys for backward compatibility
      if (data.completedAt) {
        localStorage.setItem(ONBOARDING_STORAGE_KEYS.COMPLETED, 'true');
      }
      if (data.skippedAt) {
        localStorage.setItem(ONBOARDING_STORAGE_KEYS.SKIPPED, 'true');
      }
      
      // Store version
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.VERSION, data.version);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  }

  /**
   * Clear onboarding data
   */
  static clearData(userId?: string): void {
    // Clear user-specific data
    if (userId) {
      localStorage.removeItem(ONBOARDING_STORAGE_KEYS.USER_DATA(userId));
      localStorage.removeItem(ONBOARDING_STORAGE_KEYS.USER_COMPLETED(userId));
      localStorage.removeItem(ONBOARDING_STORAGE_KEYS.USER_GUIDE(userId));
    }
    
    // Clear general data
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.DATA);
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.PROFESSIONAL_DATA);
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.VERSION);
    
    // Clear legacy keys
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.SKIPPED);
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(ONBOARDING_STORAGE_KEYS.FIRST_TIME_GUIDE);
  }

  /**
   * Check if user has completed onboarding
   */
  static isCompleted(userId?: string): boolean {
    // Check user-specific completion
    if (userId) {
      const userCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEYS.USER_COMPLETED(userId));
      if (userCompleted === 'true') return true;
    }
    
    // Check general completion
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEYS.COMPLETED);
    return completed === 'true';
  }

  /**
   * Get onboarding version
   */
  static getVersion(): 'legacy' | 'respectful' | null {
    const version = localStorage.getItem(ONBOARDING_STORAGE_KEYS.VERSION);
    return version as 'legacy' | 'respectful' | null;
  }

  /**
   * Migrate legacy data to new format
   */
  static migrateLegacyData(userId?: string): void {
    const version = this.getVersion();
    if (version) return; // Already migrated

    const data = this.getData(userId);
    if (data && !data.version) {
      // Add version to existing data
      data.version = 'legacy';
      this.saveData(data, userId);
    }
  }
}

// Export convenience functions - Type guards for onboarding answer types
export function isRespectfulOnboarding(
  answers: unknown
): answers is RespectfulOnboardingAnswers {
  return (
    typeof answers === 'object' &&
    answers !== null &&
    'accessNeeds' in answers &&
    'currentTrigger' in answers
  );
}

export function isLegacyOnboarding(
  answers: unknown
): answers is LegacyOnboardingAnswers {
  return (
    typeof answers === 'object' &&
    answers !== null &&
    'documentAccess' in answers &&
    'caretaker' in answers
  );
}
