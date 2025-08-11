// Feature flag context hooks for React
import { useState, useContext, createContext } from "react";
import { FeatureFlags, featureFlags } from "../config/featureFlagsService";

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
  toggleFlag: (flag: keyof FeatureFlags) => void;
  resetFlags: () => void;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(
  null,
);

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagProvider");
  }
  return context;
}
