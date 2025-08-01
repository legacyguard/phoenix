# Hardcoded Strings Audit Report

## Summary
This audit identified **15 hardcoded user-facing strings** across **6 components** that need to be internationalized.

## Files with Hardcoded Strings

### 1. `src/App.tsx` (2 strings)
**Lines 129, 136:**
- `"Heritage Vault - Coming Soon"`
- `"Guardian Network - Coming Soon"`

**Context:** Placeholder content for routes that are not yet implemented.

### 2. `src/components/analytics/AnalyticsDemo.tsx` (1 string)
**Line 169:**
- `"Stop Timer"` / `"Start Timer"`

**Context:** Button text for timer functionality in analytics demo.

### 3. `src/components/FamilyPreparednessTools.tsx` (4 strings)
**Lines 327, 344, 347, 370:**
- `"Choose an emergency scenario"` (placeholder)
- `"Cancel"` (button)
- `"Generate Guide"` / `"Generating..."` (button)
- `"Print Guide"` (button)

**Context:** UI elements for family preparedness tools.

### 4. `src/components/upload/SmartUploadZone.tsx` (4 strings)
**Lines 165, 172, 184, 194, 207:**
- `"Drop your important papers here"` / `"Yes! Drop them right here"`
- `"I'll organize everything for you - just drag files here or click to browse"` / `"I'm ready to organize everything for you"`
- `"Choose Files"` (button)
- `"Take Photo"` (button)
- `"Processing locally on your device"` (status indicator)

**Context:** Upload zone interface text.

### 5. `src/components/PrivacyControlPanel.tsx` (1 string)
**Line 165:**
- `"Family Access Management (Coming Soon)"`

**Context:** Feature preview text.

### 6. `src/components/upload/SmartUploadZone.tsx` (additional strings)
**Lines 218, 222:**
- `"Drop your documents here"` (drag overlay)
- `"I'll take good care of them"` (drag overlay)

**Context:** Drag and drop overlay text.

## Translation Keys to Add

### New Translation Keys Structure:

```json
{
  "app": {
    "comingSoon": {
      "heritageVault": "Heritage Vault - Coming Soon",
      "guardianNetwork": "Guardian Network - Coming Soon"
    }
  },
  "analytics": {
    "demo": {
      "startTimer": "Start Timer",
      "stopTimer": "Stop Timer"
    }
  },
  "familyPreparedness": {
    "tools": {
      "chooseScenario": "Choose an emergency scenario",
      "cancel": "Cancel",
      "generateGuide": "Generate Guide",
      "generating": "Generating...",
      "printGuide": "Print Guide"
    }
  },
  "upload": {
    "zone": {
      "dropHere": "Drop your important papers here",
      "dropHereActive": "Yes! Drop them right here",
      "description": "I'll organize everything for you - just drag files here or click to browse",
      "descriptionActive": "I'm ready to organize everything for you",
      "chooseFiles": "Choose Files",
      "takePhoto": "Take Photo",
      "processingLocally": "Processing locally on your device",
      "dragOverlay": {
        "title": "Drop your documents here",
        "subtitle": "I'll take good care of them"
      }
    }
  },
  "privacy": {
    "familyAccess": "Family Access Management (Coming Soon)"
  }
}
```

## Refactoring Plan

### Phase 1: Add Translation Keys
1. Add the new translation keys to `src/i18n/locales/en/common.json`
2. Add corresponding keys to `src/i18n/locales/sk/common.json` (Slovak)

### Phase 2: Refactor Components
1. **App.tsx**: Replace hardcoded strings with `t()` calls
2. **AnalyticsDemo.tsx**: Replace timer button text
3. **FamilyPreparednessTools.tsx**: Replace all hardcoded strings
4. **SmartUploadZone.tsx**: Replace upload zone text
5. **PrivacyControlPanel.tsx**: Replace feature preview text

### Phase 3: Testing
1. Verify all strings are properly translated
2. Test language switching functionality
3. Ensure no regression in functionality

## Priority
- **High Priority**: Upload zone strings (user-facing, frequently used)
- **Medium Priority**: Family preparedness tools (feature-specific)
- **Low Priority**: Coming soon placeholders (temporary content)

## Notes
- Most components already use the `useTranslation` hook
- The i18n system is already properly configured
- This audit focuses on user-facing strings only
- Technical strings, comments, and console logs were excluded 