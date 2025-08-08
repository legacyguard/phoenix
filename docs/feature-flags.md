# Feature Flags in Phoenix

This document explains how feature flags are implemented and used in Phoenix, with a focus on the Respectful Onboarding project.

## Overview

Phoenix uses a lightweight, client-side feature flag service with a React context provider and hooks.

- Central config: `src/config/features.tsx`
- Provider: `FeatureFlagProvider`
- Hooks: `useFeatureFlag(flag)`, `useFeatureFlags()`
- Debug UI: `FeatureFlagPanel` (dev-only)

Flags layer and precedence (highest wins):
1) User-specific overrides (enabledForUsers/disabledForUsers)
2) LocalStorage values (set via Debug Panel or manual testing)
3) Environment variable override (VITE_RESPECTFUL_ONBOARDING shortcut)
4) Default values from the config

## Current Flags

- respectfulOnboarding: Enable the new respectful onboarding flow without gamification (default: false)
- legacyGamification: Show legacy gamification elements (default: true)
- professionalDashboard: Show professional dashboard (default: false)
- enableSuggestions: Treat tasks as suggestions (default: false)
- showProgressPercentage: Show progress percentage (default: true)

## Using Flags in Components

1) Gate behavior with a hook:

import { useFeatureFlag } from '@/config/features';

const useRespectful = useFeatureFlag('respectfulOnboarding');

if (useRespectful) {
  // render new experience
}

2) Access and mutate all flags (dev only):

import { useFeatureFlags } from '@/config/features';

const { flags, isEnabled, setFlag, toggleFlag, resetFlags } = useFeatureFlags();

3) Provider setup (already in App):

<FeatureFlagProvider userId={user?.id}>
  {/* app content */}
</FeatureFlagProvider>

## Environment Variable Override

Set VITE_RESPECTFUL_ONBOARDING to quickly flip an opinionated bundle of flags:

- respectfulOnboarding=true
- legacyGamification=false
- professionalDashboard=true
- enableSuggestions=true
- showProgressPercentage=false

Usage examples:
- Local: echo 'VITE_RESPECTFUL_ONBOARDING=true' >> .env.local
- CI/CD: set the variable in your environment or platform settings

## LocalStorage Keys

Each flag maps to a stable localStorage key, e.g.:
- feature_respectfulOnboarding
- feature_legacyGamification
- feature_professionalDashboard
- feature_enableSuggestions
- feature_showProgressPercentage

You can clear these keys to reset the state or use the Reset button in the FeatureFlagPanel.

## Adding a New Flag

1) Define it in FeatureFlags and FEATURE_FLAGS in src/config/features.tsx with a description and defaultValue.
2) Use the hook useFeatureFlag in components.
3) (Optional) Add it to FeatureFlagPanel for quick testing.
4) (Optional) Add user targeting with enabledForUsers/disabledForUsers and rolloutPercentage.

## Testing and E2E

- In unit/integration tests, you can wrap components in FeatureFlagProvider and set defaults via localStorage.
- E2E tests can rely on the FeatureFlagPanel for manual toggling during development, but prefer deterministic setup via localStorage init scripts.

## Clerk Auth Mocking (Tests)

Per our test strategy, we use MockClerkProvider and related mock hooks for useUser and useAuth to simulate user states (logged out, free, premium). Ensure tests initialize flags accordingly to match the simulated user journey.

