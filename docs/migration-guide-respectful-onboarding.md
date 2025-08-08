# Migration Guide: Respectful Onboarding and Professional Dashboard

This guide explains how to migrate from the legacy onboarding and dashboard experience to the new Respectful Onboarding flow and Professional Dashboard.

## Summary of Changes

- New feature flags in `src/config/features.tsx` control rollout
- `UserFlowManager` now branches based on flags and sets an `onboardingVersion` key
- `RespectfulOnboarding` component added for a non-gamified onboarding experience
- Professional dashboard surfaces status over gamification
- Backward compatibility is maintained; legacy flow remains available

## Prerequisites

- Ensure you are running Node 18+
- Install latest dependencies: `npm install`

## Enabling the New Experience

Option A: Environment variable bundle (recommended for quick testing)
- Set `VITE_RESPECTFUL_ONBOARDING=true` in `.env.local`

Option B: LocalStorage flags (deterministic per-browser)
- feature_respectfulOnboarding=true
- feature_legacyGamification=false
- feature_professionalDashboard=true
- feature_enableSuggestions=true
- feature_showProgressPercentage=false

Option C: Programmatic (for tests)
- Wrap with `FeatureFlagProvider` and call `featureFlags.setFlag(...)`

## Component Integrations

- `src/components/auth/UserFlowManager.tsx`
  - Uses `useFeatureFlag('respectfulOnboarding')` to choose flow
  - Writes `onboardingVersion` to localStorage: `respectful` or `legacy`

- `src/components/onboarding/RespectfulOnboarding.tsx`
  - Saves progress to `respectfulOnboardingProgress`
  - Emits `onComplete` with recommendations, if available

- `src/components/debug/FeatureFlagPanel.tsx`
  - Dev-only switchboard to toggle flags

## Data and State Migration

- Existing localStorage keys remain intact
- New keys added:
  - `onboardingVersion` → tracks the onboarding version a user saw
  - `respectfulOnboardingProgress` → transient progress snapshot (cleared on completion)

No database migrations are required for this change set.

## Testing Strategy

- Unit/Integration: Use `FeatureFlagProvider` with deterministic flags
- E2E: Use the Clerk mocks (MockClerkProvider / E2E init scripts) to simulate states:
  - Logged out → landing flow
  - Free user → upgrade points visible under legacy; suggestion-based under respectful
  - Premium user → full access

## Rollout Plan

1) Internal testing with `VITE_RESPECTFUL_ONBOARDING=true`
2) Limited rollout with `rolloutPercentage` in `FEATURE_FLAGS`
3) Expand `enabledForUsers` for targeted allow-list testing
4) Monitor analytics and error logs

## Rollback Plan (high level)

- Set `VITE_RESPECTFUL_ONBOARDING` to `false` (or remove)
- Clear localStorage feature keys (or use Debug Panel → Reset)
- The legacy flow remains fully functional and will be used automatically

## Known Compat Notes

- Make sure `FeatureFlagProvider` wraps any component using `useFeatureFlag` or `useFeatureFlags`
- Avoid server-side reliance on these client flags; they are client-only

## FAQ

Q: Does this change break existing users' progress?
A: No. Legacy progress indicators remain. Respectful flow adds separate tracking keys and does not overwrite legacy keys.

