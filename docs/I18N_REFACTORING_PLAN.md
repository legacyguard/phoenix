# i18n Structure Refactoring Plan

## Current Issues

### 1. **Massive common.json File (4933 lines)**
- Acts as a dumping ground for all translations
- Contains mixed concerns (UI, business logic, forms, etc.)
- Difficult to maintain and navigate

### 2. **Duplication Between Files**
- `common.json` and `ui.json` both contain similar action keys
- Inconsistent naming conventions
- Redundant translations

### 3. **Poor Logical Grouping**
- Related functionality scattered across multiple files
- No clear separation of concerns
- Difficult to find specific translations

### 4. **Inconsistent Naming**
- Some keys are generic placeholders ("Title", "Description")
- Mixed naming conventions
- Unclear key hierarchy

## Proposed New Structure

### Core Files (Essential for app startup)
```
src/i18n/locales/en/
├── ui.json              # Core UI elements (buttons, labels, etc.)
├── errors.json          # Error messages and validation
├── micro-copy.json      # Tooltips, placeholders, helper text
└── common.json          # Shared/common translations (minimal)
```

### Feature-Specific Files
```
src/i18n/locales/en/
├── auth.json            # Authentication and user management
├── dashboard.json       # Dashboard and navigation
├── assets.json          # Asset management
├── documents.json       # Document management
├── family.json          # Family and guardian management
├── wills.json           # Will generation and management
├── sharing.json         # Content sharing and permissions
├── settings.json        # User settings and preferences
├── notifications.json   # Notifications and alerts
├── emails.json          # Email templates
├── legal.json           # Legal content and disclaimers
├── legal-pages.json     # Legal page content
├── landing.json         # Landing page content
├── pricing.json         # Pricing and subscription
├── subscription.json    # Subscription management
├── onboarding.json      # Onboarding flow
├── help.json            # Help and support
├── guardians.json       # Guardian-specific content
└── upload.json          # File upload functionality
```

## Refactoring Strategy

### Phase 1: Extract Feature-Specific Content
1. **Move will-related content** from `common.json` to `wills.json`
2. **Move family-related content** from `common.json` to `family.json`
3. **Move asset-related content** from `common.json` to `assets.json`
4. **Move document-related content** from `common.json` to `documents.json`
5. **Move sharing-related content** from `common.json` to `sharing.json`

### Phase 2: Consolidate UI Elements
1. **Merge duplicate actions** between `common.json` and `ui.json`
2. **Standardize naming conventions**
3. **Remove generic placeholders**
4. **Create consistent key hierarchy**

### Phase 3: Optimize Loading
1. **Update namespace loading** in i18n configuration
2. **Ensure essential namespaces** load first
3. **Implement lazy loading** for feature-specific namespaces

## Detailed Migration Plan

### From common.json to wills.json
- `will_generator.*`
- `willSync.*`
- `willSyncSettings.*`
- `willVersion.*`
- `willGenerator.*`

### From common.json to family.json
- `family.*`
- `guardian.*`
- `trustedPeople.*`
- `emergencyProtocol.*`

### From common.json to assets.json
- `asset.*`
- `liability.*`
- `addLiabilityModal.*`
- `assetForm.*`

### From common.json to documents.json
- `document.*`
- `upload.*`
- `documentUpload.*`
- `documentProcessing.*`

### From common.json to sharing.json
- `sharing.*`
- `sharedContent.*`
- `permissions.*`

### From common.json to ui.json
- `actions.*` (consolidate with existing ui.json actions)
- `accessibility.*`
- `status.*`
- `navigation.*`

### Keep in common.json (minimal)
- `passwordWall.*`
- `countries.*`
- `languages.*`
- `timezones.*`
- `currencies.*`

## Benefits of New Structure

### 1. **Better Organization**
- Clear separation of concerns
- Easy to find specific translations
- Logical grouping by feature

### 2. **Improved Maintainability**
- Smaller, focused files
- Easier to update specific features
- Reduced merge conflicts

### 3. **Better Performance**
- Load only needed namespaces
- Faster initial load time
- Efficient memory usage

### 4. **Enhanced Developer Experience**
- Clear file structure
- Intuitive key naming
- Easy to understand organization

### 5. **Scalability**
- Easy to add new features
- Consistent patterns
- Maintainable as application grows

## Implementation Steps

### Step 1: Create New Files
1. Create new feature-specific files
2. Move related content from common.json
3. Update key references in components

### Step 2: Update i18n Configuration
1. Add new namespaces to configuration
2. Update namespace loading order
3. Test namespace loading

### Step 3: Update Components
1. Update useTranslation calls
2. Update key references
3. Test all functionality

### Step 4: Clean Up
1. Remove moved content from common.json
2. Remove duplicate keys
3. Standardize naming conventions

### Step 5: Testing
1. Test all features work correctly
2. Verify translations load properly
3. Check performance impact

## Migration Checklist

- [ ] Create new feature-specific files
- [ ] Move will-related content to wills.json
- [ ] Move family-related content to family.json
- [ ] Move asset-related content to assets.json
- [ ] Move document-related content to documents.json
- [ ] Move sharing-related content to sharing.json
- [ ] Consolidate UI elements in ui.json
- [ ] Update i18n configuration
- [ ] Update component imports
- [ ] Test all functionality
- [ ] Remove duplicate content
- [ ] Update documentation

## Risk Mitigation

### 1. **Backup Strategy**
- Create backup of current structure
- Implement changes incrementally
- Test each phase thoroughly

### 2. **Rollback Plan**
- Keep original files until migration is complete
- Document all changes for easy rollback
- Test rollback procedures

### 3. **Testing Strategy**
- Test each feature after migration
- Verify all translations work correctly
- Check for missing keys

### 4. **Performance Monitoring**
- Monitor load times before and after
- Check memory usage
- Verify namespace loading efficiency 