# Final Integration & Verification Checklist

Use this checklist to verify the Respectful Onboarding and Professional Dashboard integration.

## 1) Enable feature flag for testing

- Option A: Run dev server with env bundle:
  - npm run dev:respectful
- Option B: Set localStorage keys (per browser):
  - feature_respectfulOnboarding=true
  - feature_legacyGamification=false
  - feature_professionalDashboard=true
  - feature_enableSuggestions=true
  - feature_showProgressPercentage=false
- Option C: Use the Feature Flag Panel (dev only) and toggle flags, then Reset to defaults if needed

## 2) Verify complete flow from landing to dashboard

- Landing → Register → Onboarding (Respectful)
- RespectfulOnboarding steps:
  - Welcome → Questions → Upload → Recommendations
  - Confirm progress saved message appears if you provide input/uploads
  - Complete → FirstTimeUserGuide → Dashboard
- Dashboard reflects professional status view (no gamification, suggestion tone)

## 3) Test different user states (Clerk mocked as needed)

- New user (created within last 5 minutes):
  - Should enter onboarding directly
  - onboardingVersion set to respectful
- Existing user with completed onboarding but not first-time guide:
  - Should see first-time guide
- Returning user (onboarding completed and guide complete):
  - Straight to dashboard

Tips:
- For unit/integration tests, wrap with MockClerkProvider or your Clerk mocks and FeatureFlagProvider
- For E2E, use tests/e2e/setup/test-setup.ts helpers to inject mock Clerk state

## 4) Validate translations

- Run translation audit: npm run audit-translations
- Manually verify onboarding copy appears from onboarding translation namespace
- Confirm UI labels on dashboard and status messages are present in the locales

## 5) Confirm no breaking changes

- Toggle flags off (legacy path):
  - Feature Flag Panel → Reset or remove the VITE_RESPECTFUL_ONBOARDING env
  - Ensure legacy onboarding and legacy dashboard still function
- Smoke test critical flows:
  - Sign in/out, create asset, upload document, navigate major pages
- Check console for errors/warnings

## References

- Feature Flags: docs/feature-flags.md
- Migration Guide: docs/migration-guide-respectful-onboarding.md
- Rollback Procedures: docs/rollback-procedures.md

