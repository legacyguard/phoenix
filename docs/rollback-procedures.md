# Rollback Procedures for Respectful Onboarding

If issues arise after enabling the Respectful Onboarding/Professional Dashboard, use the steps below to roll back safely.

## Immediate Rollback (No Deploy Needed)

1) Disable the env bundle
- Remove or set `VITE_RESPECTFUL_ONBOARDING=false` in your environment

2) Reset local flags (per browser)
- Open the Feature Flag Debug Panel and click Reset, or
- Manually clear localStorage keys:
  - feature_respectfulOnboarding
  - feature_legacyGamification
  - feature_professionalDashboard
  - feature_enableSuggestions
  - feature_showProgressPercentage

The app will fallback to the legacy onboarding and dashboard automatically.

## Controlled Rollback During Gradual Rollout

If using rolloutPercentage or user allow-list testing:
- Set `rolloutPercentage` back to 0 in FEATURE_FLAGS for affected flags
- Remove any IDs from `enabledForUsers`
- Keep `disabledForUsers` if you need to force-disable for specific users

## Verification

- Confirm `UserFlowManager` routes users to legacy flow
- Ensure `onboardingVersion` in localStorage is `legacy` for newly onboarded users
- Check dashboards no longer render professional-only components

## Post-Rollback Clean-up

- File an incident summary in your project tracking tool
- Add test cases for the discovered issue
- Prepare a fix and re-enable flags either via allow-list or small rolloutPercentage

## Reference

- Feature flags config: `src/config/features.tsx`
- User routing: `src/components/auth/UserFlowManager.tsx`
- Debug panel: `src/components/debug/FeatureFlagPanel.tsx`

