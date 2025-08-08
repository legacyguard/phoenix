/**
 * Feature Flags Configuration
 * Controls feature rollout and A/B testing capabilities
 *
 * Usage documentation: see docs/feature-flags.md
 * Rollback procedures: see docs/rollback-procedures.md
 */

export interface FeatureFlags {
  respectfulOnboarding: boolean;
  legacyGamification: boolean;
  professionalDashboard: boolean;
  enableSuggestions: boolean;
  showProgressPercentage: boolean;
}

export interface FeatureFlagConfig {
  key: string;
  defaultValue: boolean;
  description: string;
  rolloutPercentage?: number;
  enabledForUsers?: string[];
  disabledForUsers?: string[];
}

export const FEATURE_FLAGS: Record<keyof FeatureFlags, FeatureFlagConfig> = {
  respectfulOnboarding: {
    key: 'feature_respectfulOnboarding',
    defaultValue: false,
    description: 'Enable the new respectful onboarding flow without gamification',
    rolloutPercentage: 0, // Start with 0% rollout
    enabledForUsers: [], // Can add specific user IDs for testing
  },
  legacyGamification: {
    key: 'feature_legacyGamification',
    defaultValue: true,
    description: 'Show legacy gamification elements (will be deprecated)',
  },
  professionalDashboard: {
    key: 'feature_professionalDashboard',
    defaultValue: false,
    description: 'Show professional dashboard without achievement elements',
  },
  enableSuggestions: {
    key: 'feature_enableSuggestions',
    defaultValue: false,
    description: 'Show tasks as suggestions rather than requirements',
  },
  showProgressPercentage: {
    key: 'feature_showProgressPercentage',
    defaultValue: true,
    description: 'Display completion percentage (will be replaced with status)',
  },
};

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Partial<FeatureFlags> = {};
  private userId: string | null = null;

  private constructor() {
    this.loadFlags();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Initialize feature flags with user context
   */
  public initialize(userId: string | null): void {
    this.userId = userId;
    this.loadFlags();
  }

  /**
   * Load flags from multiple sources
   */
  private loadFlags(): void {
    // 1. Start with defaults
    Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
      this.flags[key as keyof FeatureFlags] = config.defaultValue;
    });

    // 2. Override with environment variables
    if (import.meta.env.VITE_RESPECTFUL_ONBOARDING === 'true') {
      this.flags.respectfulOnboarding = true;
      this.flags.legacyGamification = false;
      this.flags.professionalDashboard = true;
      this.flags.enableSuggestions = true;
      this.flags.showProgressPercentage = false;
    }

    // 3. Override with localStorage (for testing and user preferences)
    Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
      const storedValue = localStorage.getItem(config.key);
      if (storedValue !== null) {
        this.flags[key as keyof FeatureFlags] = storedValue === 'true';
      }
    });

    // 4. Apply user-specific overrides
    if (this.userId) {
      Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
        if (config.enabledForUsers?.includes(this.userId!)) {
          this.flags[key as keyof FeatureFlags] = true;
        }
        if (config.disabledForUsers?.includes(this.userId!)) {
          this.flags[key as keyof FeatureFlags] = false;
        }
      });
    }

    // 5. Apply rollout percentages (simple hash-based)
    if (this.userId) {
      Object.entries(FEATURE_FLAGS).forEach(([key, config]) => {
        if (config.rolloutPercentage !== undefined) {
          const userHash = this.hashUserId(this.userId!);
          const threshold = config.rolloutPercentage / 100;
          if (userHash < threshold) {
            this.flags[key as keyof FeatureFlags] = true;
          }
        }
      });
    }
  }

  /**
   * Get a feature flag value
   */
  public isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? FEATURE_FLAGS[flag].defaultValue;
  }

  /**
   * Set a feature flag value (for testing)
   */
  public setFlag(flag: keyof FeatureFlags, value: boolean): void {
    this.flags[flag] = value;
    const config = FEATURE_FLAGS[flag];
    localStorage.setItem(config.key, value.toString());
  }

  /**
   * Toggle a feature flag
   */
  public toggleFlag(flag: keyof FeatureFlags): boolean {
    const newValue = !this.isEnabled(flag);
    this.setFlag(flag, newValue);
    return newValue;
  }

  /**
   * Reset all flags to defaults
   */
  public resetFlags(): void {
    Object.values(FEATURE_FLAGS).forEach(config => {
      localStorage.removeItem(config.key);
    });
    this.loadFlags();
  }

  /**
   * Get all current flag values
   */
  public getAllFlags(): FeatureFlags {
    return Object.keys(FEATURE_FLAGS).reduce((acc, key) => {
      acc[key as keyof FeatureFlags] = this.isEnabled(key as keyof FeatureFlags);
      return acc;
    }, {} as FeatureFlags);
  }

  /**
   * Simple hash function for user ID to determine rollout
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagService.getInstance();

// Hook for React components
import { useState, useEffect } from 'react';

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const [isEnabled, setIsEnabled] = useState(() => featureFlags.isEnabled(flag));

  useEffect(() => {
    // Re-check flag value when component mounts
    setIsEnabled(featureFlags.isEnabled(flag));

    // Listen for storage changes (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      const config = FEATURE_FLAGS[flag];
      if (e.key === config.key) {
        setIsEnabled(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [flag]);

  return isEnabled;
}

// Feature flag context for React
import React, { createContext, useContext, ReactNode } from 'react';

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
  toggleFlag: (flag: keyof FeatureFlags) => void;
  resetFlags: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export function FeatureFlagProvider({ children, userId }: { children: ReactNode; userId?: string | null }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    featureFlags.initialize(userId || null);
    return featureFlags.getAllFlags();
  });

  useEffect(() => {
    featureFlags.initialize(userId || null);
    setFlags(featureFlags.getAllFlags());
  }, [userId]);

  const contextValue: FeatureFlagContextValue = {
    flags,
    isEnabled: (flag) => flags[flag],
    setFlag: (flag, value) => {
      featureFlags.setFlag(flag, value);
      setFlags(featureFlags.getAllFlags());
    },
    toggleFlag: (flag) => {
      featureFlags.toggleFlag(flag);
      setFlags(featureFlags.getAllFlags());
    },
    resetFlags: () => {
      featureFlags.resetFlags();
      setFlags(featureFlags.getAllFlags());
    },
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}
