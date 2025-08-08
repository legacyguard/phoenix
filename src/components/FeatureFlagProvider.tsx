import React, { useState, useEffect, ReactNode } from 'react';
import { FeatureFlags, featureFlags } from '../config/featureFlagsService';
import { FeatureFlagContext } from '../hooks/useFeatureFlags';

export function FeatureFlagProvider({ children, userId }: { children: ReactNode; userId?: string | null }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    featureFlags.initialize(userId || null);
    return featureFlags.getAllFlags();
  });

  useEffect(() => {
    featureFlags.initialize(userId || null);
    setFlags(featureFlags.getAllFlags());
  }, [userId]);

  const contextValue = {
    flags,
    isEnabled: (flag: keyof FeatureFlags) => flags[flag],
    setFlag: (flag: keyof FeatureFlags, value: boolean) => {
      featureFlags.setFlag(flag, value);
      setFlags(featureFlags.getAllFlags());
    },
    toggleFlag: (flag: keyof FeatureFlags) => {
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
