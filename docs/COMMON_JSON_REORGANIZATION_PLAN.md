# Complete common.json Reorganization Plan

## Current Situation
- `common.json` contains 4875 lines with 100+ top-level keys
- This defeats the purpose of modular i18n setup
- Need to extract all content into proper feature-specific files

## Reorganization Strategy

### 1. **Time Capsule & Legacy Features**
**New File**: `time-capsule.json`
**Keys to Move**:
- `TimeCapsule.*`
- `legacyBriefing.*`
- `legacyLetters.*`
- `createTimeCapsuleModal.*`
- `editStoryModal.*`

### 2. **Accessibility & UI Elements**
**New File**: `accessibility.json`
**Keys to Move**:
- `accessibility.*`
- `themeToggle.*`
- `visualSettings.*`

### 3. **Actions & UI Controls**
**Merge into**: `ui.json` (existing)
**Keys to Move**:
- `actions.*`
- `modals.*`
- `component.*`

### 4. **Admin & Analytics**
**New File**: `admin.json`
**Keys to Move**:
- `admin.*`
- `analytics.*`
- `analysis.*`

### 5. **AI & Smart Features**
**New File**: `ai.json`
**Keys to Move**:
- `ai.*`
- `microTaskGenerator.*`
- `generator.*`

### 6. **Alerts & Notifications**
**Merge into**: `notifications.json` (existing)
**Keys to Move**:
- `alerts.*`
- `notificationPreferences.*`

### 7. **Annual Review**
**New File**: `annual-review.json`
**Keys to Move**:
- `annualReview.*`

### 8. **Asset Management**
**Merge into**: `assets.json` (existing)
**Keys to Move**:
- `assets.*`
- `assetType.*`
- `addLiabilityModal.*`
- `dynamicAssetForm.*`
- `myPossessions.*`

### 9. **Authentication**
**Merge into**: `auth.json` (existing)
**Keys to Move**:
- `auth.*`
- `login.*`
- `register.*`
- `passwordReset.*`
- `passwordWall.*`
- `verification.*`

### 10. **Beneficiary & Family Communications**
**Merge into**: `family.json` (existing)
**Keys to Move**:
- `beneficiaryCommunications.*`
- `family.*`
- `familyCapabilities.*`
- `familyCrisisAssessment.*`
- `familyCrisisPrevention.*`
- `familyExecutorView.*`
- `familyHub.*`
- `familyPreparednessTools.*`
- `trustedCircle.*`
- `relationships.*`

### 11. **Calculator & Financial Tools**
**New File**: `calculator.json`
**Keys to Move**:
- `calculator.*`
- `benefits.*`

### 12. **Consent & Privacy**
**New File**: `consent.json`
**Keys to Move**:
- `consent.*`
- `privacy.*`
- `privacyPolicy.*`
- `localPrivacyProtection.*`
- `dataTransparency.*`
- `dataManagement.*`

### 13. **Contact & Support**
**New File**: `contact.json`
**Keys to Move**:
- `contact.*`
- `support.*`
- `help.*`

### 14. **Cookies & Legal Pages**
**Merge into**: `legal-pages.json` (existing)
**Keys to Move**:
- `cookiePolicy.*`
- `cookies.*`
- `termsOfService.*`

### 15. **Country & Language**
**New File**: `localization.json`
**Keys to Move**:
- `countryLanguage.*`
- `languages.*`

### 16. **Crisis & Emergency**
**New File**: `crisis.json`
**Keys to Move**:
- `crisisAssessment.*`
- `crisisSituations.*`
- `emergency.*`

### 17. **Dashboard & Navigation**
**Merge into**: `dashboard.json` (existing)
**Keys to Move**:
- `dashboard.*`
- `header.*`
- `footer.*`
- `layout.*`
- `navigation.*`

### 18. **Debug & Development**
**New File**: `debug.json`
**Keys to Move**:
- `debug.*`
- `development.*`
- `errorTest.*`
- `test.*`

### 19. **Document Management**
**Merge into**: `documents.json` (existing)
**Keys to Move**:
- `documents.*`
- `documentConfirmation.*`
- `documentUploader.*`
- `documentUploadFlow.*`
- `upload.*`
- `ocr.*`
- `oCRProgress.*`

### 20. **Error Handling**
**Merge into**: `errors.json` (existing)
**Keys to Move**:
- `errors.*`
- `errorBoundary.*`
- `notfound.*`
- `validation.*`

### 21. **Executor Management**
**New File**: `executor.json`
**Keys to Move**:
- `executor.*`
- `executorDashboard.*`
- `executorManagement.*`

### 22. **Features & Benefits**
**Merge into**: `landing.json` (existing)
**Keys to Move**:
- `features.*`
- `hero.*`
- `howItWorks.*`
- `testimonials.*`
- `faq.*`

### 23. **Forms & Validation**
**New File**: `forms.json`
**Keys to Move**:
- `form.*`
- `genderPreference.*`
- `categories.*`
- `types.*`

### 24. **Guardian Management**
**Merge into**: `guardians.json` (existing)
**Keys to Move**:
- `guardian.*`
- `guardianUpload.*`
- `guardianView.*`

### 25. **Invitations & Sharing**
**New File**: `invitations.json`
**Keys to Move**:
- `invite.*`
- `inviteAcceptance.*`

### 26. **Legal & Consultation**
**Merge into**: `legal.json` (existing)
**Keys to Move**:
- `legal.*`
- `legalConsultation.*`
- `legalConsultationModal.*`

### 27. **Life Events & Logging**
**New File**: `life-events.json`
**Keys to Move**:
- `logLifeEvent.*`
- `scenarioPlanner.*`
- `scenarios.*`
- `whatIfScenarios.*`

### 28. **Manual & Instructions**
**New File**: `manual.json`
**Keys to Move**:
- `manual.*`
- `instructions.*`

### 29. **Onboarding & First Time**
**Merge into**: `onboarding.json` (existing)
**Keys to Move**:
- `firstTimeGuide.*`
- `welcome.*`
- `nextStep.*`

### 30. **Plans & Subscriptions**
**Merge into**: `subscription.json` (existing)
**Keys to Move**:
- `plans.*`
- `subscriptions.*`
- `trial.*`
- `upgradeCard.*`
- `cancellation.*`

### 31. **Playbook & Preparedness**
**New File**: `playbook.json`
**Keys to Move**:
- `playbook.*`
- `preparedness.*`
- `preservationMode.*`

### 32. **Progress & Tasks**
**New File**: `progress.json`
**Keys to Move**:
- `progress.*`
- `progressTracking.*`
- `tasks.*`
- `quickTasks.*`
- `completion.*`

### 33. **PWA & App Features**
**New File**: `pwa.json`
**Keys to Move**:
- `pwaInstallBanner.*`
- `app.*`

### 34. **Questions & Assessments**
**New File**: `questions.json`
**Keys to Move**:
- `questions.*`
- `deepDive.*`

### 35. **Recommendations & Guidance**
**New File**: `recommendations.json`
**Keys to Move**:
- `recommendations.*`
- `complexityReduction.*`
- `complexProfile.*`

### 36. **Reminders & Notifications**
**Merge into**: `reminders.json` (existing)
**Keys to Move**:
- `reminders.*`

### 37. **Security & Access**
**New File**: `security.json`
**Keys to Move**:
- `security.*`
- `securityStatus.*`
- `justInTimeAccess.*`

### 38. **Settings & Preferences**
**Merge into**: `settings.json` (existing)
**Keys to Move**:
- `settings.*`

### 39. **Steps & Workflows**
**New File**: `workflows.json`
**Keys to Move**:
- `steps.*`
- `skip.*`

### 40. **Vault & Storage**
**New File**: `vault.json`
**Keys to Move**:
- `vault.*`
- `estateStatus.*`

### 41. **Will Management**
**Merge into**: `wills.json` (existing)
**Keys to Move**:
- `will.*`
- `willGenerator.*`
- `willSync.*`
- `willSyncSettings.*`
- `willVersion.*`

### 42. **General & Common**
**New File**: `general.json`
**Keys to Move**:
- `general.*`
- `common.*`
- `details.*`
- `demo.*`
- `index.*`
- `landing.*` (remaining)
- `pricing.*` (remaining)
- `cta.*`
- `emotionalContextSystem.*`
- `solution.*`

## Implementation Steps

### Phase 1: Create New Files
1. Create all new modular files
2. Extract content from common.json
3. Improve English text where needed

### Phase 2: Update i18n Configuration
1. Add all new namespaces to i18n.ts
2. Update namespace loading order
3. Test namespace loading

### Phase 3: Update Components
1. Find all components using common.json
2. Update useTranslation calls
3. Update key references
4. Test all functionality

### Phase 4: Clean Up
1. Remove common.json entirely
2. Remove common namespace from i18n.ts
3. Update documentation

### Phase 5: Testing
1. Test all features work correctly
2. Verify translations load properly
3. Check performance impact

## Benefits

### 1. **True Modularity**
- Each feature has its own namespace
- Load only what's needed
- Better performance

### 2. **Maintainability**
- Smaller, focused files
- Easier to find and update translations
- Reduced merge conflicts

### 3. **Developer Experience**
- Clear file structure
- Intuitive key organization
- Better code readability

### 4. **Translation Quality**
- Context-specific organization
- Easier for translators to work with
- Better key naming

## Risk Mitigation

### 1. **Backup Strategy**
- Keep common.json until migration complete
- Test each phase thoroughly
- Document all changes

### 2. **Incremental Approach**
- Extract one feature at a time
- Test after each extraction
- Rollback capability

### 3. **Comprehensive Testing**
- Test all components after updates
- Verify all translations work
- Check for missing keys 