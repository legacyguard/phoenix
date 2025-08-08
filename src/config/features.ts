/**
 * Feature Flags - Re-export module
 * This file re-exports from the separated modules to maintain existing imports
 */

// Export types, constants, and service
export type { FeatureFlags, FeatureFlagConfig } from './featureFlagsService';
export { FEATURE_FLAGS, FeatureFlagService, featureFlags } from './featureFlagsService';

// Export hooks
export { useFeatureFlag } from '../hooks/useFeatureFlag';
export { useFeatureFlags } from '../hooks/useFeatureFlags';

// Export React component
export { FeatureFlagProvider } from '../components/FeatureFlagProvider';
