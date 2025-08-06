# Micro-Copy Internationalization Guide

## Overview

The micro-copy system provides comprehensive internationalization for all user interface micro-interactions, including tooltips, placeholders, helper text, status messages, badges, confirmations, and accessibility features.

## File Structure

```
src/i18n/locales/en/micro-copy.json
```

## Translation Categories

### 1. Tooltips (`tooltips`)

Tooltips provide contextual help and guidance for UI elements.

#### General Tooltips (`tooltips.general`)
- `help`: "Click for help and guidance"
- `info`: "Additional information available"
- `required`: "This field is required"
- `optional`: "This field is optional"
- `save`: "Save your changes"
- `cancel`: "Cancel without saving"
- `delete`: "Permanently remove this item"
- `edit`: "Modify this information"
- `view`: "View detailed information"
- `download`: "Download this file"
- `upload`: "Upload a new file"
- `share`: "Share with family members"
- `copy`: "Copy to clipboard"
- `print`: "Print this information"
- `retry`: "Try Again"

#### Security Tooltips (`tooltips.security`)
- `encryption`: "Your data is protected with bank-level encryption"
- `privacy`: "This information is private and secure"
- `access`: "Control who can see this information"
- `backup`: "Automatically backed up and secured"
- `twoFactor`: "Add an extra layer of security to your account"
- `password`: "Use a strong, unique password"
- `session`: "Your session will expire for security"
- `verification`: "Verify your identity for account security"

#### Asset-Specific Tooltips (`tooltips.assets`)
- `value`: "Enter the current estimated value of this asset"
- `location`: "Where your family can find this asset"
- `account`: "Account information will be encrypted and secure"
- `beneficiary`: "Who should inherit this asset"
- `importance`: "Mark as high priority for your family"
- `documents`: "Upload related documents like deeds or policies"
- `notes`: "Important information your family should know"
- `sharing`: "Control which family members can access this information"

#### Family Tooltips (`tooltips.family`)
- `trustedPerson`: "Someone who can help your family during emergencies"
- `role`: "What responsibilities this person will have"
- `access`: "What information they can see and when"
- `contact`: "How to reach this person in an emergency"
- `backup`: "Who should replace them if they cannot serve"
- `instructions`: "Special guidance for this person's role"
- `relationship`: "How this person is connected to your family"

#### Document Tooltips (`tooltips.documents`)
- `category`: "Organize documents by type for easy finding"
- `importance`: "Mark critical documents your family needs first"
- `expiry`: "When this document needs to be renewed"
- `location`: "Where the original document is stored"
- `copies`: "How many copies exist and where they are"
- `access`: "Who needs access to this document"
- `notes`: "Important details about this document"

#### Will Tooltips (`tooltips.will`)
- `executor`: "The person who will manage your estate"
- `guardian`: "Who will care for your minor children"
- `beneficiary`: "Who will receive your assets"
- `witness`: "Required for legal validity in your jurisdiction"
- `notary`: "May be required depending on your location"
- `storage`: "Keep your will in a secure, accessible location"
- `copies`: "Provide copies to your executor and attorney"

### 2. Placeholders (`placeholders`)

Placeholder text for form inputs and search fields.

#### Search Placeholders (`placeholders.search`)
- `general`: "Search..."
- `assets`: "Search your assets..."
- `documents`: "Search documents..."
- `family`: "Search trusted circle..."
- `help`: "Search help articles..."
- `settings`: "Search settings..."

#### Form Placeholders (`placeholders.forms`)
- `name`: "Enter name"
- `email`: "Enter email address"
- `phone`: "Enter phone number"
- `address`: "Enter address"
- `notes`: "Add notes or comments"
- `description`: "Enter description"
- `amount`: "Enter amount"
- `date`: "Select date"
- `time`: "Select time"
- `url`: "Enter website URL"
- `password`: "Enter password"
- `confirmPassword`: "Confirm password"

#### Specific Placeholders (`placeholders.specific`)
- `assetName`: "e.g., Primary Family Home"
- `accountNumber`: "e.g., ****-****-1234"
- `institutionName`: "e.g., First National Bank"
- `contactPhone`: "e.g., (555) 123-4567"
- `emergencyContact`: "e.g., Adult child or close friend"
- `executorName`: "e.g., Trusted family member or friend"
- `guardianName`: "e.g., Relative or close family friend"
- `beneficiaryName`: "e.g., Spouse, children, or charity"

### 3. Helper Text (`helperText`)

Contextual help text for form fields and features.

#### Form Helper Text (`helperText.forms`)
- `passwordStrength`: "Use at least 8 characters with uppercase, lowercase, and numbers"
- `emailFormat`: "We'll use this email for important account notifications"
- `phoneFormat`: "Include country code for international numbers"
- `dateFormat`: "Use MM/DD/YYYY format"
- `currencyFormat`: "Enter amount without currency symbols"
- `percentageFormat`: "Enter as a number (e.g., 25 for 25%)"
- `requiredFields`: "Fields marked with * are required"
- `autoSave`: "Your changes are automatically saved"
- `encryptedData`: "This information will be encrypted and secure"

#### Asset Helper Text (`helperText.assets`)
- `estimatedValue`: "Provide your best estimate - this helps your family understand importance"
- `accountNumbers`: "Only enter the last 4 digits for security - full numbers are encrypted"
- `beneficiaries`: "List primary and backup beneficiaries for this asset"
- `jointOwnership`: "Include information about any co-owners or joint accounts"
- `liabilities`: "Note any debts, mortgages, or liens against this asset"
- `location`: "Be specific enough for your family to locate this asset"
- `importance`: "High priority assets are shown first to your family"

#### Family Helper Text (`helperText.family`)
- `trustedCircle`: "Choose people who are reliable, trustworthy, and willing to help"
- `roles`: "One person can have multiple roles, or you can assign different people"
- `backups`: "Always designate backup people in case your first choice cannot serve"
- `instructions`: "Provide clear guidance about their responsibilities and your wishes"
- `access`: "Grant access based on what each person needs to know to help"
- `communication`: "Ensure your trusted circle knows how to contact each other"

#### Document Helper Text (`helperText.documents`)
- `organization`: "Group similar documents together for easy family access"
- `originals`: "Note where original documents are stored physically"
- `copies`: "Keep copies in multiple secure locations"
- `expiration`: "Set reminders for documents that need periodic renewal"
- `sharing`: "Share documents with people who need access to help your family"
- `scanning`: "High-quality scans are often acceptable for most purposes"

#### Will Helper Text (`helperText.will`)
- `jurisdiction`: "Ensure your will complies with laws in your state or country"
- `witnesses`: "Choose witnesses who are not beneficiaries in your will"
- `executor`: "Select someone who is organized, trustworthy, and willing to serve"
- `guardians`: "Consider the guardian's values, lifestyle, and ability to care for children"
- `updates`: "Review and update your will when major life events occur"
- `storage`: "Inform your executor where your will is stored"

### 4. Status Messages (`statusMessages`)

Loading, success, progress, and empty state messages.

#### Loading Messages (`statusMessages.loading`)
- `general`: "Loading..."
- `saving`: "Saving your information..."
- `uploading`: "Uploading file..."
- `processing`: "Processing..."
- `analyzing`: "Analyzing document..."
- `generating`: "Generating document..."
- `verifying`: "Verifying information..."
- `connecting`: "Connecting..."
- `syncing`: "Syncing data..."

#### Success Messages (`statusMessages.success`)
- `saved`: "Successfully saved"
- `uploaded`: "File uploaded successfully"
- `deleted`: "Successfully removed"
- `shared`: "Successfully shared"
- `updated`: "Successfully updated"
- `generated`: "Document generated successfully"
- `verified`: "Successfully verified"
- `sent`: "Successfully sent"
- `copied`: "Copied to clipboard"

#### Progress Messages (`statusMessages.progress`)
- `step`: "Step {{current}} of {{total}}"
- `percentage`: "{{percent}}% complete"
- `almostDone`: "Almost finished..."
- `finalizing`: "Finalizing..."
- `preparing`: "Preparing..."
- `uploading`: "Uploading... {{percent}}%"
- `processing`: "Processing... {{percent}}%"

#### Empty State Messages (`statusMessages.empty`)
- `noItems`: "No items to display"
- `noResults`: "No results found"
- `noData`: "No data available"
- `emptyVault`: "Your vault is empty - add your first asset to get started"
- `noDocuments`: "No documents uploaded yet"
- `noFamily`: "No trusted circle members added yet"
- `noTasks`: "All tasks completed - great job!"
- `noActivity`: "No recent activity"

### 5. Badges (`badges`)

Status and priority indicators.

#### Status Badges (`badges.status`)
- `new`: "New"
- `updated`: "Updated"
- `important`: "Important"
- `urgent`: "Urgent"
- `completed`: "Completed"
- `pending`: "Pending"
- `verified`: "Verified"
- `expired`: "Expired"
- `draft`: "Draft"
- `active`: "Active"
- `inactive`: "Inactive"
- `locked`: "Locked"
- `unlocked`: "Unlocked"
- `delivered`: "Delivered"

#### Security Badges (`badges.security`)
- `encrypted`: "Encrypted"
- `secure`: "Secure"
- `private`: "Private"
- `shared`: "Shared"
- `public`: "Public"
- `protected`: "Protected"
- `verified`: "Verified"
- `unverified`: "Unverified"

#### Priority Badges (`badges.priority`)
- `high`: "High Priority"
- `medium`: "Medium Priority"
- `low`: "Low Priority"
- `critical`: "Critical"
- `optional`: "Optional"

### 6. Confirmations (`confirmations`)

Confirmation dialogs and prompts.

#### Delete Confirmations (`confirmations.delete`)
- `asset`: "Are you sure you want to remove this asset? This action cannot be undone."
- `document`: "Are you sure you want to delete this document? This action cannot be undone."
- `person`: "Are you sure you want to remove this person from your trusted circle?"
- `account`: "Are you sure you want to delete your account? All data will be permanently removed."
- `will`: "Are you sure you want to delete this will? This action cannot be undone."

#### Share Confirmations (`confirmations.share`)
- `asset`: "Share this asset information with {{name}}?"
- `document`: "Grant {{name}} access to this document?"
- `vault`: "Give {{name}} access to your vault information?"

#### Change Confirmations (`confirmations.changes`)
- `unsaved`: "You have unsaved changes. Are you sure you want to leave this page?"
- `discard`: "Discard all changes and return to the previous page?"
- `reset`: "Reset all fields to their original values?"

### 7. Accessibility (`accessibility`)

ARIA labels, descriptions, and instructions.

#### ARIA Labels (`accessibility.labels`)
- `menu`: "Main navigation menu"
- `search`: "Search input field"
- `close`: "Close dialog"
- `expand`: "Expand section"
- `collapse`: "Collapse section"
- `sort`: "Sort options"
- `filter`: "Filter options"
- `previous`: "Previous page"
- `next`: "Next page"
- `first`: "First page"
- `last`: "Last page"

#### ARIA Descriptions (`accessibility.descriptions`)
- `required`: "Required field"
- `optional`: "Optional field"
- `error`: "Error in this field"
- `success`: "Successfully completed"
- `loading`: "Content is loading"
- `empty`: "No content available"

#### Usage Instructions (`accessibility.instructions`)
- `form`: "Use Tab to navigate between fields, Enter to submit"
- `table`: "Use arrow keys to navigate table cells"
- `menu`: "Use arrow keys to navigate menu items"
- `dialog`: "Press Escape to close this dialog"

## Usage in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t: tMicro } = useTranslation('micro-copy');
  
  return (
    <div>
      <input 
        placeholder={tMicro('placeholders.forms.name')}
        aria-label={tMicro('accessibility.labels.search')}
      />
      <button title={tMicro('tooltips.general.save')}>
        Save
      </button>
    </div>
  );
};
```

### With Tooltips

```typescript
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const AssetForm = () => {
  const { t: tMicro } = useTranslation('micro-copy');
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <input 
          placeholder={tMicro('placeholders.specific.assetName')}
          aria-label={tMicro('accessibility.descriptions.required')}
        />
      </TooltipTrigger>
      <TooltipContent>
        {tMicro('tooltips.assets.value')}
      </TooltipContent>
    </Tooltip>
  );
};
```

### Status Messages

```typescript
const LoadingComponent = () => {
  const { t: tMicro } = useTranslation('micro-copy');
  
  return (
    <div>
      <p>{tMicro('statusMessages.loading.saving')}</p>
      <p>{tMicro('statusMessages.progress.step', { current: 2, total: 5 })}</p>
    </div>
  );
};
```

### Badges

```typescript
const StatusBadge = ({ status }: { status: string }) => {
  const { t: tMicro } = useTranslation('micro-copy');
  
  return (
    <Badge variant="default">
      {tMicro(`badges.status.${status}`)}
    </Badge>
  );
};
```

## Best Practices

### 1. Consistent Naming
- Use descriptive, consistent key names
- Group related functionality together
- Use camelCase for key names

### 2. Context-Aware Translations
- Provide specific tooltips for different contexts
- Use appropriate helper text for form fields
- Ensure status messages are clear and actionable

### 3. Accessibility
- Always provide ARIA labels for interactive elements
- Use descriptive labels for screen readers
- Include usage instructions where helpful

### 4. Cultural Sensitivity
- Avoid idioms and cultural references
- Use clear, professional language
- Consider cultural differences in communication styles

### 5. Dynamic Content
- Use interpolation for dynamic values
- Provide fallbacks for missing translations
- Handle pluralization appropriately

## Maintenance

### Adding New Micro-Copy
1. Add the new key to `src/i18n/locales/en/micro-copy.json`
2. Use the key in your component
3. Add translations for other languages
4. Test the translation in context

### Updating Existing Micro-Copy
1. Update the English version first
2. Update all other language files
3. Test the changes across the application
4. Update documentation if needed

### Audit Process
1. Run the audit script: `node scripts/i18n-audit.cjs`
2. Review hardcoded strings
3. Replace with appropriate micro-copy keys
4. Test the changes

## Integration with Existing i18n System

The micro-copy system integrates seamlessly with the existing internationalization system:

1. **Namespace**: Uses the `micro-copy` namespace
2. **Loading**: Automatically loaded with other translation files
3. **Fallbacks**: Falls back to English if translation is missing
4. **Interpolation**: Supports dynamic values and interpolation
5. **Consistency**: Follows the same patterns as other translation files

## Testing

### Unit Testing
```typescript
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

test('renders micro-copy correctly', () => {
  render(<MyComponent />);
  expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
test('tooltip shows correct micro-copy', async () => {
  render(<AssetForm />);
  const input = screen.getByRole('textbox');
  fireEvent.mouseEnter(input);
  expect(await screen.findByText('Enter the current estimated value of this asset')).toBeInTheDocument();
});
```

## Conclusion

The micro-copy system ensures that all user interface micro-interactions are properly internationalized, providing a consistent and professional experience across all languages and cultures. By following this guide, developers can maintain high-quality translations and ensure accessibility for all users. 