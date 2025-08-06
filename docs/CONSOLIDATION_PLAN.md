# i18n Consolidation Plan

## Current Situation
- **55 small files** (too fragmented)
- **Average file size**: ~50 lines
- **Problem**: Over-engineering, too many files to manage

## Target: 10-15 Reasonable Files

### Proposed Consolidation Strategy

#### 1. **Core UI & Actions** (`ui.json`)
**Merge from**:
- `ui.json` (existing)
- `accessibility.json`
- `forms.json`
- `general.json`
- `pwa.json`
- `steps.json`

#### 2. **Authentication & Security** (`auth.json`)
**Merge from**:
- `auth.json` (existing)
- `security.json`
- `consent.json`
- `passwordWall.json` (if exists)

#### 3. **Dashboard & Navigation** (`dashboard.json`)
**Merge from**:
- `dashboard.json` (existing)
- `annual-review.json`
- `progress.json`
- `notifications.json`
- `alerts.json`

#### 4. **Assets & Documents** (`assets.json`)
**Merge from**:
- `assets.json` (existing)
- `asset-management.json`
- `documents.json` (existing)
- `upload.json` (existing)
- `vault.json`

#### 5. **Family & Guardians** (`family.json`)
**Merge from**:
- `family.json` (existing)
- `guardians.json` (existing)
- `guardian.json`
- `executor.json`
- `beneficiary.json`
- `invitations.json`

#### 6. **Will & Legal** (`wills.json`)
**Merge from**:
- `wills.json` (existing)
- `will.json`
- `legal.json` (existing)
- `legal-pages.json` (existing)

#### 7. **Features & Landing** (`landing.json`)
**Merge from**:
- `landing.json` (existing)
- `features.json`
- `hero.json` (if exists)
- `testimonials.json` (if exists)
- `faq.json` (if exists)

#### 8. **Settings & Preferences** (`settings.json`)
**Merge from**:
- `settings.json` (existing)
- `privacy.json` (if exists)
- `preferences.json` (if exists)
- `country.json`
- `languages.json` (if exists)

#### 9. **Subscriptions & Plans** (`subscription.json`)
**Merge from**:
- `subscription.json` (existing)
- `plans.json`
- `pricing.json` (existing)
- `billing.json` (if exists)

#### 10. **Time Capsule & Legacy** (`time-capsule.json`)
**Merge from**:
- `time-capsule.json` (existing)
- `legacy.json` (if exists)
- `life-events.json`
- `scenarios.json` (if exists)

#### 11. **Sharing & Communication** (`sharing.json`)
**Merge from**:
- `sharing.json` (existing)
- `emails.json` (existing)
- `communication.json` (if exists)

#### 12. **Help & Support** (`help.json`)
**Merge from**:
- `help.json` (existing)
- `support.json` (if exists)
- `manual.json`
- `onboarding.json` (existing)
- `tutorials.json` (if exists)

#### 13. **AI & Smart Features** (`ai.json`)
**Merge from**:
- `ai.json`
- `smart-features.json` (if exists)
- `automation.json` (if exists)

#### 14. **Errors & Debug** (`errors.json`)
**Merge from**:
- `errors.json` (existing)
- `debug.json`
- `validation.json` (if exists)

#### 15. **Micro-copy & Tooltips** (`micro-copy.json`)
**Keep as is**:
- `micro-copy.json` (existing) - This is already well-organized

## Consolidation Benefits

### 1. **Reasonable File Count**
- **Before**: 55 files (too many)
- **After**: 15 files (manageable)

### 2. **Logical Grouping**
- Related functionality grouped together
- Clear separation of concerns
- Easy to find specific translations

### 3. **Maintainability**
- Fewer files to manage
- Better organization
- Reduced complexity

### 4. **Performance**
- Still modular enough for selective loading
- Reasonable file sizes
- Good balance between granularity and manageability

## Implementation Steps

### Phase 1: Create Consolidation Script
1. Create script to merge related files
2. Update i18n configuration
3. Update component imports

### Phase 2: Test and Validate
1. Test all features work correctly
2. Verify translations load properly
3. Check for any missing keys

### Phase 3: Clean Up
1. Remove old fragmented files
2. Update documentation
3. Verify no breaking changes

## Expected Outcome

### File Structure (15 files)
```
src/i18n/locales/en/
├── ui.json              # Core UI, accessibility, forms, general
├── auth.json            # Authentication, security, consent
├── dashboard.json       # Dashboard, progress, notifications
├── assets.json          # Assets, documents, vault
├── family.json          # Family, guardians, executors
├── wills.json           # Wills, legal content
├── landing.json         # Landing, features, marketing
├── settings.json        # Settings, preferences, localization
├── subscription.json    # Subscriptions, plans, pricing
├── time-capsule.json    # Time capsule, legacy, life events
├── sharing.json         # Sharing, emails, communication
├── help.json            # Help, support, onboarding
├── ai.json              # AI and smart features
├── errors.json          # Errors, debug, validation
└── micro-copy.json      # Tooltips, placeholders, helper text
```

This structure provides a good balance between modularity and manageability, with 15 focused files that are neither too small nor too large. 