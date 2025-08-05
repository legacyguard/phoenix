# Assets, Documents & Will Generator Translations

This document describes the comprehensive translation structure for the assets vault, document management, and will generator features in LegacyGuard.

## Overview

The internationalization has been rebuilt with a modular structure, providing comprehensive coverage for:

- **Assets Vault**: Asset management, categories, forms, and sharing
- **Document Management**: Upload, AI analysis, categorization, and access control
- **Will Generator**: Multi-step will creation, legal forms, and execution guidance

## Translation Files

### 1. Assets (`/src/i18n/locales/en/assets.json`)

Comprehensive coverage for asset management:

```json
{
  "vault": {
    "title": "Your Vault",
    "subtitle": "Secure storage for your important assets and documents",
    "description": "Organize everything valuable so your family knows what you have and where to find it.",
    "empty": "Your vault is empty. Start by adding your most important assets.",
    "addFirst": "Add Your First Asset",
    "viewAll": "View All Assets",
    "totalValue": "Total Estimated Value",
    "lastUpdated": "Last updated {{date}}",
    "categories": "Categories",
    "recentlyAdded": "Recently Added"
  },
  "categories": {
    "all": "All Assets",
    "realEstate": "Real Estate",
    "financial": "Financial Accounts",
    "business": "Business Assets",
    "vehicles": "Vehicles",
    "investments": "Investments",
    "insurance": "Insurance Policies",
    "personal": "Personal Property",
    "digital": "Digital Assets",
    "collectibles": "Collectibles & Valuables",
    "other": "Other Assets"
  },
  "types": {
    "home": "Primary Residence",
    "property": "Investment Property",
    "land": "Land/Vacant Lot",
    "commercial": "Commercial Property",
    "checking": "Checking Account",
    "savings": "Savings Account",
    "retirement": "Retirement Account",
    "investment": "Investment Account",
    "crypto": "Cryptocurrency",
    "business": "Business Ownership",
    "partnership": "Partnership Interest",
    "stocks": "Stocks & Securities",
    "bonds": "Bonds",
    "mutualFunds": "Mutual Funds",
    "lifeInsurance": "Life Insurance",
    "healthInsurance": "Health Insurance",
    "autoInsurance": "Auto Insurance",
    "homeInsurance": "Home Insurance",
    "vehicle": "Vehicle",
    "boat": "Boat/Watercraft",
    "jewelry": "Jewelry",
    "art": "Art & Antiques",
    "electronics": "Electronics",
    "furniture": "Furniture",
    "tools": "Tools & Equipment"
  },
  "form": {
    "addAsset": "Add New Asset",
    "editAsset": "Edit Asset",
    "assetDetails": "Asset Details",
    "basicInfo": "Basic Information",
    "financialInfo": "Financial Information",
    "locationInfo": "Location & Access",
    "additionalInfo": "Additional Information",
    "name": "Asset Name",
    "namePlaceholder": "Enter a descriptive name for this asset",
    "type": "Asset Type",
    "selectType": "Select asset type",
    "category": "Category",
    "selectCategory": "Select category",
    "description": "Description",
    "descriptionPlaceholder": "Add any important details about this asset",
    "estimatedValue": "Estimated Value",
    "valuePlaceholder": "Enter estimated value",
    "currency": "Currency",
    "location": "Location",
    "locationPlaceholder": "Where is this asset located?",
    "accountNumber": "Account Number",
    "accountPlaceholder": "Enter account number (will be encrypted)",
    "institution": "Institution/Company",
    "institutionPlaceholder": "Bank, company, or organization name",
    "contactInfo": "Contact Information",
    "contactPlaceholder": "Phone number or email for this institution",
    "policyNumber": "Policy Number",
    "policyPlaceholder": "Insurance policy number",
    "beneficiaries": "Beneficiaries",
    "beneficiariesPlaceholder": "Who should inherit this asset?",
    "notes": "Notes",
    "notesPlaceholder": "Any additional information your family should know",
    "attachments": "Related Documents",
    "attachmentsDescription": "Upload documents related to this asset (deeds, policies, statements)",
    "tags": "Tags",
    "tagsPlaceholder": "Add tags to help organize this asset"
  },
  "actions": {
    "addAsset": "Add Asset",
    "saveAsset": "Save Asset",
    "editAsset": "Edit Asset",
    "deleteAsset": "Delete Asset",
    "duplicateAsset": "Duplicate Asset",
    "viewDetails": "View Details",
    "uploadDocument": "Upload Document",
    "addNote": "Add Note",
    "shareAccess": "Share Access",
    "exportData": "Export Data",
    "printSummary": "Print Summary",
    "markImportant": "Mark as Important",
    "addToWill": "Add to Will",
    "setReminder": "Set Reminder",
    "viewHistory": "View History"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "sold": "Sold",
    "transferred": "Transferred",
    "expired": "Expired",
    "pending": "Pending",
    "verified": "Verified",
    "needsUpdate": "Needs Update"
  },
  "details": {
    "overview": "Overview",
    "documents": "Documents",
    "access": "Access & Sharing",
    "history": "History",
    "relatedAssets": "Related Assets",
    "familyNotes": "Family Notes",
    "legalInfo": "Legal Information",
    "taxInfo": "Tax Information",
    "lastValuation": "Last Valuation",
    "acquisitionDate": "Acquisition Date",
    "currentOwner": "Current Owner",
    "jointOwners": "Joint Owners",
    "liens": "Liens & Encumbrances",
    "insurance": "Insurance Coverage"
  },
  "sharing": {
    "title": "Asset Access",
    "description": "Control who can see and manage this asset",
    "noAccess": "No one has access to this asset yet",
    "addPerson": "Add Person",
    "permissions": {
      "view": "Can View",
      "edit": "Can Edit", 
      "manage": "Can Manage",
      "inherit": "Will Inherit"
    },
    "accessLevels": {
      "viewOnly": "View Only - Can see asset details",
      "limited": "Limited - Can view and add notes",
      "full": "Full Access - Can view and edit all details",
      "inherit": "Inheritance - Will receive this asset"
    }
  },
  "notifications": {
    "assetAdded": "Asset added successfully",
    "assetUpdated": "Asset updated successfully", 
    "assetDeleted": "Asset deleted successfully",
    "documentUploaded": "Document uploaded successfully",
    "accessGranted": "Access granted to {{name}}",
    "accessRevoked": "Access revoked from {{name}}",
    "reminderSet": "Reminder set for {{date}}",
    "valuationUpdated": "Asset valuation updated"
  },
  "errors": {
    "loadingAssets": "Failed to load assets. Please refresh the page.",
    "savingAsset": "Failed to save asset. Please try again.",
    "deletingAsset": "Failed to delete asset. Please try again.",
    "uploadingDocument": "Failed to upload document. Please try again.",
    "invalidValue": "Please enter a valid monetary value",
    "requiredField": "This field is required",
    "assetNotFound": "Asset not found",
    "accessDenied": "You don't have permission to access this asset",
    "duplicateName": "An asset with this name already exists"
  }
}
```

### 2. Documents (`/src/i18n/locales/en/documents.json`)

Complete document management translations:

```json
{
  "management": {
    "title": "Document Management",
    "subtitle": "Organize and secure your important documents",
    "description": "Keep all your critical paperwork in one secure, organized place.",
    "totalDocuments": "{{count}} Documents",
    "recentUploads": "Recent Uploads",
    "categories": "Categories",
    "searchPlaceholder": "Search documents...",
    "filterBy": "Filter by",
    "sortBy": "Sort by",
    "viewMode": "View Mode",
    "gridView": "Grid View",
    "listView": "List View"
  },
  "categories": {
    "all": "All Documents",
    "legal": "Legal Documents",
    "financial": "Financial Records",
    "insurance": "Insurance Policies",
    "medical": "Medical Records",
    "property": "Property Documents",
    "business": "Business Documents",
    "personal": "Personal Documents",
    "tax": "Tax Records",
    "estate": "Estate Planning",
    "other": "Other Documents"
  },
  "types": {
    "will": "Will & Testament",
    "deed": "Property Deed",
    "title": "Vehicle Title",
    "policy": "Insurance Policy",
    "statement": "Financial Statement",
    "contract": "Contract/Agreement",
    "certificate": "Certificate",
    "license": "License/Permit",
    "record": "Medical Record",
    "receipt": "Receipt/Invoice",
    "report": "Report",
    "correspondence": "Correspondence",
    "identification": "Identification",
    "passport": "Passport",
    "birthCertificate": "Birth Certificate",
    "marriageCertificate": "Marriage Certificate",
    "taxReturn": "Tax Return"
  },
  "upload": {
    "title": "Upload Documents",
    "dragDrop": "Drag and drop files here, or click to browse",
    "selectFiles": "Select Files",
    "supportedFormats": "Supported formats: PDF, JPG, PNG, DOC, DOCX",
    "maxSize": "Maximum file size: {{size}}MB",
    "processing": "Processing document...",
    "analyzing": "Analyzing content...",
    "extracting": "Extracting information...",
    "completed": "Upload completed",
    "failed": "Upload failed",
    "retry": "Retry Upload"
  },
  "details": {
    "fileName": "File Name",
    "fileSize": "File Size",
    "uploadDate": "Upload Date",
    "lastModified": "Last Modified",
    "documentType": "Document Type",
    "category": "Category",
    "tags": "Tags",
    "description": "Description",
    "relatedAssets": "Related Assets",
    "sharedWith": "Shared With",
    "extractedInfo": "Extracted Information",
    "ocrText": "Document Text",
    "metadata": "Metadata"
  },
  "actions": {
    "upload": "Upload Document",
    "download": "Download",
    "view": "View Document",
    "edit": "Edit Details",
    "delete": "Delete Document",
    "share": "Share Access",
    "move": "Move to Category",
    "copy": "Copy Link",
    "print": "Print",
    "addNote": "Add Note",
    "linkAsset": "Link to Asset",
    "setReminder": "Set Reminder",
    "markImportant": "Mark Important",
    "archive": "Archive",
    "restore": "Restore"
  },
  "ai": {
    "analyzing": "AI is analyzing your document...",
    "extractedData": "Extracted Information",
    "suggestions": "Suggestions",
    "confidence": "Confidence: {{percentage}}%",
    "reviewRequired": "Please review the extracted information",
    "autoFilled": "Auto-filled from document",
    "needsReview": "Needs Review",
    "verified": "Verified",
    "documentType": "Document Type: {{type}}",
    "keyInfo": "Key Information Found",
    "noDataFound": "No structured data found in this document"
  },
  "sharing": {
    "title": "Document Access",
    "description": "Control who can access this document",
    "noAccess": "This document is private",
    "addPerson": "Grant Access",
    "permissions": {
      "view": "Can View",
      "download": "Can Download",
      "edit": "Can Edit Details"
    },
    "expiresOn": "Access expires on {{date}}",
    "permanent": "Permanent Access",
    "temporary": "Temporary Access"
  },
  "notifications": {
    "uploaded": "Document uploaded successfully",
    "deleted": "Document deleted successfully",
    "shared": "Document shared with {{name}}",
    "accessRevoked": "Access revoked from {{name}}",
    "moved": "Document moved to {{category}}",
    "analyzed": "Document analysis completed",
    "reminderSet": "Reminder set for {{date}}"
  },
  "errors": {
    "uploadFailed": "Failed to upload document. Please try again.",
    "fileTooLarge": "File is too large. Maximum size is {{size}}MB.",
    "unsupportedFormat": "Unsupported file format. Please use PDF, JPG, PNG, DOC, or DOCX.",
    "processingFailed": "Failed to process document. Please try again.",
    "deleteFailed": "Failed to delete document. Please try again.",
    "accessDenied": "You don't have permission to access this document",
    "documentNotFound": "Document not found",
    "analysisTimeout": "Document analysis timed out. Please try again."
  }
}
```

### 3. Wills (`/src/i18n/locales/en/wills.json`)

Comprehensive will generator translations:

```json
{
  "generator": {
    "title": "Will Generator",
    "subtitle": "Create a legally valid will in minutes",
    "description": "Generate a comprehensive will based on your assets and wishes, tailored to your jurisdiction's laws.",
    "getStarted": "Start Creating Will",
    "continueWill": "Continue Will",
    "viewExisting": "View Existing Will",
    "newWill": "Create New Will"
  },
  "steps": {
    "personal": {
      "title": "Personal Information",
      "subtitle": "Tell us about yourself",
      "description": "We need your basic information to create a legally valid will."
    },
    "assets": {
      "title": "Your Assets",
      "subtitle": "What you want to distribute",
      "description": "Select the assets you want to include in your will."
    },
    "beneficiaries": {
      "title": "Beneficiaries",
      "subtitle": "Who gets what",
      "description": "Decide how your assets will be distributed among your loved ones."
    },
    "guardians": {
      "title": "Guardianship",
      "subtitle": "Care for dependents",
      "description": "Choose guardians for minor children or dependents."
    },
    "executor": {
      "title": "Executor",
      "subtitle": "Who will manage your estate",
      "description": "Select someone to carry out your wishes and manage the legal process."
    },
    "preferences": {
      "title": "Special Instructions",
      "subtitle": "Additional wishes",
      "description": "Add any special instructions or preferences for your estate."
    },
    "review": {
      "title": "Review & Generate",
      "subtitle": "Final review",
      "description": "Review all information before generating your will."
    }
  },
  "form": {
    "personalInfo": {
      "fullName": "Full Legal Name",
      "dateOfBirth": "Date of Birth",
      "placeOfBirth": "Place of Birth",
      "address": "Current Address",
      "maritalStatus": "Marital Status",
      "spouseName": "Spouse's Name",
      "children": "Children",
      "addChild": "Add Child",
      "childName": "Child's Name",
      "childAge": "Child's Age",
      "childRelation": "Relationship"
    },
    "assetSelection": {
      "selectAssets": "Select Assets to Include",
      "allAssets": "Include All Assets",
      "specificAssets": "Select Specific Assets",
      "residualEstate": "Residual Estate",
      "residualDescription": "Everything not specifically mentioned in this will"
    },
    "distribution": {
      "beneficiary": "Beneficiary",
      "relationship": "Relationship",
      "allocation": "Allocation",
      "percentage": "Percentage",
      "specificAmount": "Specific Amount",
      "specificAsset": "Specific Asset",
      "addBeneficiary": "Add Beneficiary",
      "contingentBeneficiary": "Contingent Beneficiary",
      "primaryBeneficiary": "Primary Beneficiary"
    },
    "guardianship": {
      "minorChildren": "Minor Children",
      "guardianFor": "Guardian for {{childName}}",
      "primaryGuardian": "Primary Guardian",
      "backupGuardian": "Backup Guardian",
      "guardianInstructions": "Instructions for Guardian"
    },
    "executor": {
      "primaryExecutor": "Primary Executor",
      "backupExecutor": "Backup Executor",
      "executorDuties": "Executor Duties",
      "compensation": "Executor Compensation",
      "bond": "Require Bond",
      "powers": "Special Powers"
    },
    "instructions": {
      "funeralWishes": "Funeral Wishes",
      "burialCremation": "Burial or Cremation",
      "organDonation": "Organ Donation",
      "charitableBequests": "Charitable Bequests",
      "specialInstructions": "Special Instructions",
      "personalMessages": "Personal Messages"
    }
  },
  "validation": {
    "nameRequired": "Full legal name is required",
    "dobRequired": "Date of birth is required",
    "addressRequired": "Current address is required",
    "executorRequired": "At least one executor must be selected",
    "beneficiaryRequired": "At least one beneficiary must be specified",
    "allocationError": "Total allocation must equal 100%",
    "guardianRequired": "Guardian required for minor children",
    "invalidDate": "Please enter a valid date",
    "invalidPercentage": "Percentage must be between 0 and 100"
  },
  "preview": {
    "title": "Will Preview",
    "subtitle": "Review your will before finalizing",
    "lastWillTestament": "Last Will and Testament",
    "of": "of",
    "article": "Article {{number}}",
    "section": "Section {{number}}",
    "witnessClause": "Witness Clause",
    "signatureSection": "Signature Section",
    "executionInstructions": "Execution Instructions"
  },
  "execution": {
    "title": "Will Execution",
    "subtitle": "How to make your will legally valid",
    "requirements": "Legal Requirements",
    "witnesses": "Witnesses Required",
    "witnessCount": "{{count}} witnesses required in {{jurisdiction}}",
    "notarization": "Notarization",
    "notaryRequired": "Notary required in {{jurisdiction}}",
    "notaryOptional": "Notary optional but recommended",
    "signing": "Signing Instructions",
    "signingOrder": "Signing Order",
    "storage": "Storage Recommendations",
    "copies": "Number of Copies",
    "distribution": "Distribution of Copies"
  },
  "legal": {
    "jurisdiction": "Jurisdiction",
    "selectJurisdiction": "Select your jurisdiction",
    "lawsApply": "Laws of {{jurisdiction}} apply",
    "legalAdvice": "Legal Advice",
    "consultLawyer": "Consult a Lawyer",
    "lawyerRecommended": "We recommend consulting with a lawyer for complex estates",
    "disclaimer": "Legal Disclaimer",
    "notLegalAdvice": "This tool does not provide legal advice",
    "professionalReview": "Professional Review Available"
  },
  "actions": {
    "saveProgress": "Save Progress",
    "generateWill": "Generate Will",
    "downloadPdf": "Download PDF",
    "printWill": "Print Will",
    "shareWill": "Share Will",
    "updateWill": "Update Will",
    "deleteWill": "Delete Will",
    "consultLawyer": "Consult Lawyer",
    "scheduleReview": "Schedule Review"
  },
  "status": {
    "draft": "Draft",
    "generated": "Generated",
    "executed": "Executed",
    "outdated": "Needs Update",
    "underReview": "Under Review"
  },
  "notifications": {
    "willGenerated": "Will generated successfully",
    "progressSaved": "Progress saved",
    "willUpdated": "Will updated successfully",
    "willDeleted": "Will deleted successfully",
    "consultationScheduled": "Legal consultation scheduled",
    "reminderSet": "Will review reminder set"
  },
  "errors": {
    "generationFailed": "Failed to generate will. Please try again.",
    "saveFailed": "Failed to save progress. Please try again.",
    "loadFailed": "Failed to load will data. Please refresh.",
    "validationFailed": "Please correct the errors before proceeding",
    "jurisdictionRequired": "Please select your jurisdiction",
    "assetLoadFailed": "Failed to load assets. Please refresh."
  }
}
```

## Usage Patterns

### 1. Import and Usage

```typescript
import { useTranslation } from 'react-i18next';

const AssetComponent = () => {
  const { t } = useTranslation('assets');
  const { t: tCommon } = useTranslation('ui');
  
  return (
    <div>
      <h1>{t('vault.title')}</h1>
      <p>{t('vault.description')}</p>
      <button>{tCommon('common.buttons.save')}</button>
    </div>
  );
};
```

### 2. Multiple Namespaces

```typescript
const DocumentComponent = () => {
  const { t: tDocuments } = useTranslation('documents');
  const { t: tAssets } = useTranslation('assets');
  const { t: tCommon } = useTranslation('ui');
  
  return (
    <div>
      <h1>{tDocuments('management.title')}</h1>
      <p>{tAssets('vault.description')}</p>
      <button>{tCommon('common.buttons.upload')}</button>
    </div>
  );
};
```

### 3. Interpolation

```typescript
const WillComponent = () => {
  const { t } = useTranslation('wills');
  
  return (
    <div>
      <p>{t('execution.witnessCount', { count: 2, jurisdiction: 'California' })}</p>
      <p>{t('vault.lastUpdated', { date: new Date().toLocaleDateString() })}</p>
    </div>
  );
};
```

## Updated Components

The following components have been updated to use the new translation structure:

### Assets Vault
- `AssetOverview.tsx` - Updated to use new vault and categories keys
- `VaultDashboard.tsx` - Updated to use new vault and actions keys
- `AssetDetail.tsx` - Updated to use new form and details keys

### Document Management
- `DocumentUpload.tsx` - Updated to use documents namespace instead of ui

### Will Generator
- `WillGenerator.tsx` - Updated to use wills namespace and new step structure

## Verification Checklist

After implementation, verify that:

- [ ] Asset management displays all translated content
- [ ] Document upload and management work with translations
- [ ] Will generator shows proper translations for all steps
- [ ] Form validation messages appear in translated form
- [ ] AI analysis results display translated content
- [ ] All error messages and notifications are translated
- [ ] Interpolation works correctly with dynamic values
- [ ] Multiple namespaces can be used together
- [ ] Common UI elements are properly translated

## Example Component

See `/src/components/examples/TranslationExample.tsx` for a comprehensive example of how to use all the new translation keys.

## Next Steps

1. **Add Slovak translations** - Create corresponding `.json` files in `/src/i18n/locales/sk/`
2. **Add other languages** - Extend to support additional languages as needed
3. **Test thoroughly** - Ensure all components work correctly with the new translations
4. **Update remaining components** - Apply the same pattern to any remaining untranslated components 