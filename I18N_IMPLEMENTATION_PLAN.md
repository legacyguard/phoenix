# LegacyGuard i18n Implementation Plan

## Current Status
- ✅ i18n infrastructure is set up with modular structure
- ✅ Namespaces are defined: auth, subscription, dashboard, documents, assets, family, guardians, wills, settings, onboarding, help, ui, errors, emails
- ✅ Translation files exist but are mostly empty
- ❌ Most components still have hardcoded strings
- ❌ No systematic extraction of translation keys

## Implementation Strategy

### Phase 1: Foundation & Tools Setup
- [ ] Create translation key extraction script
- [ ] Set up automated key generation
- [ ] Create translation key naming conventions
- [ ] Set up CI checks for missing translations

### Phase 2: Component-wise Refactor (Priority Order)
#### 2.1 Common UI Components (High Priority)
- [ ] `/src/components/ui/` - All UI components
- [ ] `/src/components/common/` - Common components
- [ ] `/src/components/layout/` - Layout components

#### 2.2 Core Feature Components
- [ ] `/src/components/auth/` - Authentication components
- [ ] `/src/components/dashboard/` - Dashboard components
- [ ] `/src/components/assets/` - Asset management
- [ ] `/src/components/documents/` - Document handling
- [ ] `/src/components/guardians/` - Guardian management
- [ ] `/src/components/wills/` - Will management

#### 2.3 Feature-specific Components
- [ ] `/src/components/onboarding/` - Onboarding flow
- [ ] `/src/components/settings/` - Settings components
- [ ] `/src/components/subscriptions/` - Subscription management
- [ ] `/src/components/emergency/` - Emergency features
- [ ] `/src/components/analytics/` - Analytics components
- [ ] `/src/components/ai/` - AI features
- [ ] `/src/components/ocr/` - OCR functionality

#### 2.4 Landing & Marketing Components
- [ ] `/src/components/landing/` - Landing page components
- [ ] `/src/components/privacy/` - Privacy components
- [ ] `/src/components/sharing/` - Sharing features

### Phase 3: Page-wise Implementation
- [ ] `/src/pages/Landing.tsx`
- [ ] `/src/pages/Login.tsx`
- [ ] `/src/pages/Register.tsx`
- [ ] `/src/pages/Dashboard.tsx`
- [ ] `/src/pages/GuardianView.tsx`
- [ ] `/src/pages/Manual.tsx`
- [ ] `/src/pages/Help.tsx`
- [ ] `/src/pages/Subscription.tsx`
- [ ] `/src/pages/Pricing.tsx`
- [ ] `/src/pages/Analytics.tsx`
- [ ] `/src/pages/AIDemo.tsx`
- [ ] `/src/pages/OCRDemo.tsx`
- [ ] `/src/pages/UploadDemo.tsx`
- [ ] `/src/pages/CookiePolicy.tsx`
- [ ] `/src/pages/PrivacyPolicy.tsx`
- [ ] `/src/pages/TermsOfService.tsx`
- [ ] `/src/pages/RefundPolicy.tsx`
- [ ] `/src/pages/NotFound.tsx`

### Phase 4: Feature Integration
- [ ] `/src/features/` - All feature modules
- [ ] `/src/contexts/` - Context providers
- [ ] `/src/hooks/` - Custom hooks
- [ ] `/src/services/` - Service files

### Phase 5: Testing & Validation
- [ ] Test all translations across languages
- [ ] Validate dynamic content
- [ ] Check for missing translations
- [ ] Performance testing

### Phase 6: Documentation & Maintenance
- [ ] Create translation guidelines
- [ ] Set up automated translation key extraction
- [ ] Create developer documentation

## Translation Key Naming Conventions

### Structure: `namespace.section.subsection.key`
- `ui.button.save` - Common UI elements
- `auth.login.title` - Authentication
- `dashboard.stats.totalAssets` - Dashboard
- `assets.form.name` - Asset management
- `errors.validation.required` - Error messages

### Guidelines:
1. Use lowercase with dots for separation
2. Be descriptive but concise
3. Group related keys together
4. Use consistent naming patterns
5. Include context in the key name

## Progress Tracking

### Completed ✅
- i18n infrastructure setup
- Namespace definition
- Basic translation file structure
- Clean UI translation file with common elements
- Footer component internationalization
- ThemeToggle component internationalization
- LanguageSwitcher component internationalization
- UpgradeCard component internationalization
- PWAInstallBanner component internationalization
- LocalPrivacyProtection component internationalization
- LocalProcessingIndicator component internationalization
- SecurityStatus component internationalization
- **Authentication & Onboarding Flow (Phase 2.2) - COMPLETED**
  - Login.tsx - Fully internationalized
  - Register.tsx - Fully internationalized
  - OnboardingWizard.tsx - Fully internationalized
  - BasicLifeQuestions.tsx - Fully internationalized
  - UserFlowManager.tsx - Fully internationalized

### In Progress 🔄
- Core feature components (Phase 2.3)

### Pending ⏳
- Dashboard components
- Asset management components
- Document handling components
- Guardian management components
- Will management components
- Page refactoring
- Feature integration
- Testing and validation

## Current Status Summary

### Phase 1: Foundation & Tools Setup ✅
- ✅ Created translation key extraction script
- ✅ Set up automated key generation
- ✅ Created translation key naming conventions
- ✅ Clean UI translation file with structured keys

### Phase 2: Component-wise Refactor (In Progress)
#### 2.1 Common UI Components (High Priority) - 8/20+ completed
- ✅ Footer.tsx - Fully internationalized
- ✅ ThemeToggle.tsx - Fully internationalized
- ✅ LanguageSwitcher.tsx - Fully internationalized
- ✅ UpgradeCard.tsx - Fully internationalized
- ✅ PWAInstallBanner.tsx - Fully internationalized
- ✅ LocalPrivacyProtection.tsx - Fully internationalized
- ✅ LocalProcessingIndicator.tsx - Fully internationalized
- ✅ SecurityStatus.tsx - Fully internationalized
- ⏳ Remaining UI components (12+ more to go)

#### 2.2 Authentication & Onboarding Flow - ✅ COMPLETED
- ✅ Login.tsx - Fully internationalized
- ✅ Register.tsx - Fully internationalized
- ✅ OnboardingWizard.tsx - Fully internationalized
- ✅ BasicLifeQuestions.tsx - Fully internationalized
- ✅ UserFlowManager.tsx - Fully internationalized

### Translation Keys Added:

#### ui.json:
- app.name, app.tagline
- common.* (50+ common UI elements)
- actions.* (100+ action verbs)
- footer.* (complete footer structure)
- testimonials.* (social proof elements)
- themeToggle.* (theme switching)
- languages.* (language selection)
- upgradeCard.* (upgrade prompts)
- pwaInstallBanner.* (PWA installation)
- localPrivacyProtection.* (privacy features)
- privacy.* (privacy controls)
- securityStatus.* (comprehensive security explanations)

#### auth.json:
- login.* (login form, validation, errors)
- register.* (registration form, validation, errors)
- verification.* (email verification flow)
- resetPassword.* (password reset flow)

#### onboarding.json:
- welcome.* (welcome screen and setup)
- progress.* (progress indicators)
- questions.* (4 comprehensive life questions with options)
- analysis.* (plan generation screens)
- completion.* (setup completion)
- skip.* (skip confirmation)
- errors.* (onboarding error handling)

### Next Steps:
1. Continue with remaining UI components
2. Move to core feature components (auth, dashboard, assets, etc.)
3. Implement page-level internationalization
4. Set up automated testing for translations

## Next Steps
1. Create automated key extraction script
2. Start with UI components
3. Implement systematic component-by-component refactoring
4. Set up automated testing for translations 