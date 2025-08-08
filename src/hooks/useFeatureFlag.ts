// Hook for React components
import { useState, useEffect } from 'react';
import { FeatureFlags, FEATURE_FLAGS, featureFlags } from '../config/featureFlagsService';

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
