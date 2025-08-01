# Hardcoded Strings Report - Internationalization Needed

## Summary
This report identifies hardcoded strings in the `src/components` and `src/pages` directories that should be internationalized using the i18n system.

## Current I18n Setup
- **Supported Languages**: 33 languages (bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, is, it, lt, lv, me, mk, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, tr, uk)
- **I18n Framework**: react-i18next
- **Translation Files**: Located in `/src/i18n/locales/[lang]/common.json`

## Critical Hardcoded Strings Found

### 1. Error Messages and Toasts

#### Components with console.log/error messages:
- **FamilyHub.tsx**: 
  - Line 68: `console.error('Error fetching family hub data:', error);`
  - Toast messages: `toast.success()` and `toast.error()` calls

- **NotificationSettings.tsx**:
  - Line 45: `toast.error('Please sign in to enable notifications')`
  - Line 72: `toast.error('Failed to enable notifications')`
  - Line 87: `toast.error('Failed to disable notifications')`
  - Line 100: `toast.success('Notification preferences updated')`
  - Line 145: `'Enabling...' : 'Enable Notifications'`

- **LegacyLetters.tsx**:
  - Line 53: `throw new Error('Failed to fetch time capsules');`
  - Line 102: `throw new Error('Failed to delete time capsule');`
  - Line 105: `toast.success('Time capsule deleted successfully')`
  - Line 109: `toast.error('Failed to delete time capsule')`

- **CreateTimeCapsuleModal.tsx**: Multiple toast messages
- **ExecutorManagement.tsx**: Multiple toast messages
- **Other components**: Various error handling with hardcoded messages

### 2. UI Labels and Text

#### LegalConsultationModal.tsx (Lines 19-61):
```javascript
const consultationTypes = [
  {
    value: 'will_review',
    label: 'Will Review',
    description: 'Professional review of your will for legal compliance',
    // ...
  },
  // More hardcoded consultation types
];
```

#### NotificationSettings.tsx:
- Line 145: `'Enabling...' : 'Enable Notifications'`
- Line 161: `'Disable'`

#### LegacyLetters.tsx:
- Line 134: `'Locked'`
- Line 141: `'Unlocked'`
- Line 148: `'Delivered'`
- Line 158: `'No recipients'`
- Line 160: Template string with hardcoded text

#### Assets Components:
- **AssetTypeSelectorModal.tsx**: Hardcoded asset type labels and descriptions
- **AssetCard.tsx**: Various hardcoded labels for asset properties
- **DynamicAssetForm.tsx**: Form field labels and placeholders

### 3. Placeholder Text

Many components have hardcoded placeholder attributes:
- Form inputs throughout the application
- Textarea placeholders
- Select component placeholders

### 4. Alert and Confirmation Messages

- **LegacyLetters.tsx** (Line 89): `confirm()` with hardcoded message
- Various components using `window.confirm()` with hardcoded strings

### 5. Button Labels

Common hardcoded button labels found:
- "Save", "Cancel", "Submit", "Delete", "Edit"
- "Enable", "Disable"
- "Continue", "Back", "Next"
- Custom action buttons with specific text

### 6. Badge and Status Text

Components displaying status information:
- Badge components with hardcoded variant text
- Status indicators with hardcoded labels
- Progress indicators with hardcoded descriptions

## Recommendations

1. **Create Translation Keys**: Add all identified strings to the translation files in `/src/i18n/locales/*/common.json`

2. **Use Translation Hook**: Replace hardcoded strings with:
   ```javascript
   const { t } = useTranslation();
   // Replace hardcoded string
   toast.error(t('errors.failedToEnableNotifications'));
   ```

3. **Dynamic Content**: For dynamic content like consultation types, move to translation files:
   ```javascript
   const consultationTypes = [
     {
       value: 'will_review',
       label: t('consultations.willReview.label'),
       description: t('consultations.willReview.description'),
       // ...
     }
   ];
   ```

4. **Error Messages**: Centralize error messages in translations:
   ```javascript
   // Instead of
   throw new Error('Failed to fetch time capsules');
   // Use
   throw new Error(t('errors.fetchTimeCapsulesFailed'));
   ```

5. **Placeholder Text**: Use translation keys for all placeholders:
   ```javascript
   placeholder={t('placeholders.enterYourQuestion')}
   ```

## Priority Files to Update

1. **High Priority** (User-facing critical text):
   - NotificationSettings.tsx
   - LegalConsultationModal.tsx
   - LegacyLetters.tsx
   - CreateTimeCapsuleModal.tsx
   - All error messages and toasts

2. **Medium Priority** (Forms and interactions):
   - Asset-related components
   - Form components with labels/placeholders
   - Dashboard components

3. **Lower Priority** (Less visible text):
   - Console log messages (can remain in English for debugging)
   - Internal component names

## Next Steps

1. Review each file in the lists above
2. Extract all hardcoded strings to translation keys
3. Update the common.json files for all supported languages
4. Test the application in different languages to ensure all strings are properly translated
5. Consider using a translation management system for maintaining translations across 33 languages

## Note on Implementation

Based on the rule specified (document_id: GrSIhoHH3PF66lKJtnP39W), all implementation should be done in English, and translations should be properly managed in the `/src/i18n/locales` directory structure.
