# Email & Notifications System Documentation

## Overview

The LegacyGuard application now includes a comprehensive internationalized email and notification system designed specifically for estate planning communications. This system provides formal, respectful language appropriate for middle-aged and older users dealing with serious family protection matters.

## Features

### 📧 Email Templates

- **Welcome emails** - Introduction to family protection planning
- **Verification emails** - Account security and email verification
- **Password reset emails** - Secure account recovery
- **Task reminders** - Gentle nudges for family protection tasks
- **Document expiry notifications** - Important renewal reminders
- **Security alerts** - Account access notifications
- **Subscription communications** - Trial expiry, payment issues, cancellations
- **Family invitations** - Trusted person access invitations

### 📱 Push Notifications

- **Task reminders** - Family protection task notifications
- **Document expiry** - Document renewal alerts
- **Family access updates** - Access permission changes
- **Security alerts** - Account security notifications
- **Will generation** - Document ready notifications
- **Payment issues** - Subscription payment alerts
- **Trial expiry** - Trial period ending reminders

### 📲 SMS Notifications

- **Security codes** - Two-factor authentication codes
- **Login alerts** - New device/location login notifications
- **Emergency access** - Critical family information access
- **Critical reminders** - Important family protection tasks

### ⚖️ Legal Communications

- **Legal disclaimers** - Comprehensive legal notices
- **Terms and conditions** - Service agreements and policies
- **Compliance information** - Data protection and privacy details
- **Execution requirements** - Legal document execution guidelines

## Translation Files

### Email Templates (`/src/i18n/locales/{lang}/emails.json`)

```json
{
  "common": {
    "greeting": "Dear {{name}}",
    "closing": "Sincerely,",
    "signature": "The LegacyGuard Team"
  },
  "welcome": {
    "subject": "Welcome to LegacyGuard - Your Family Protection Journey Begins",
    "headline": "Welcome to Your Family Protection Plan"
  }
}
```

### Notifications (`/src/i18n/locales/{lang}/notifications.json`)

```json
{
  "push": {
    "taskReminder": {
      "title": "Family Protection Reminder",
      "body": "You have {{count}} pending tasks to strengthen your family's protection plan."
    }
  },
  "sms": {
    "securityCode": {
      "message": "Your LegacyGuard security code is: {{code}}. This code expires in 10 minutes."
    }
  }
}
```

### Legal Communications (`/src/i18n/locales/{lang}/legal.json`)

```json
{
  "disclaimers": {
    "general": "LegacyGuard provides tools and guidance for estate planning but does not provide legal advice."
  },
  "compliance": {
    "dataProtection": "Your data is protected in compliance with applicable data protection laws."
  }
}
```

## Usage Examples

### 1. Using the Email Service

```typescript
import { emailService } from "@/services/emailService";

// Send welcome email
const user = {
  id: "user123",
  name: "John Smith",
  email: "john@example.com",
};

await emailService.sendWelcomeEmail(user);
```

### 2. Using the Notification Service

```typescript
import { notificationService } from "@/services/notificationService";

// Send push notification
await notificationService.sendPushNotification("user123", "taskReminder", {
  count: 3,
});

// Send SMS notification
await notificationService.sendSMSNotification("+1234567890", "securityCode", {
  code: "123456",
});
```

### 3. Using the Legal Document Service

```typescript
import { legalDocumentService } from "@/services/legalDocumentService";

// Get legal disclaimers
const disclaimers = legalDocumentService.getLegalDisclaimers("willGenerator");

// Get compliance information
const compliance = legalDocumentService.getComplianceInformation();
```

### 4. Using the Unified Hook

```typescript
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

const MyComponent = () => {
  const {
    sendWelcomeEmail,
    sendTaskReminder,
    sendSecurityCode,
    getLegalDisclaimers
  } = useEmailNotifications();

  const handleNewUser = async (user) => {
    await sendWelcomeEmail(user);
  };

  const handleTaskReminder = async (user, data) => {
    await sendTaskReminder(user, data, ['email', 'push', 'sms']);
  };

  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

## Email Template Component

The `EmailTemplate` component provides a reusable way to render email content:

```typescript
import EmailTemplate from '@/components/emails/EmailTemplate';

const emailContent = (
  <EmailTemplate
    type="welcome"
    data={{
      userName: "John Smith",
      count: 5
    }}
    buttons={[
      {
        text: "Complete Your Setup",
        url: "https://app.legacyguard.com/setup"
      }
    ]}
  />
);
```

## Supported Email Types

| Type               | Description               | Use Case                   |
| ------------------ | ------------------------- | -------------------------- |
| `welcome`          | Welcome to LegacyGuard    | New user onboarding        |
| `verification`     | Email verification        | Account security           |
| `passwordReset`    | Password reset            | Account recovery           |
| `taskReminder`     | Task completion reminder  | Family protection tasks    |
| `documentExpiry`   | Document renewal reminder | Important document updates |
| `securityAlert`    | Security notification     | Account access alerts      |
| `subscription`     | Subscription updates      | Trial expiry, payments     |
| `familyInvitation` | Family member invitation  | Trusted person access      |

## Supported Notification Types

### Push Notifications

- `taskReminder` - Family protection tasks
- `documentExpiry` - Document renewal needed
- `familyAccess` - Family access updates
- `securityAlert` - Security notifications
- `willGenerated` - Will document ready
- `paymentIssue` - Payment problems
- `trialExpiring` - Trial ending soon

### SMS Notifications

- `securityCode` - Authentication codes
- `loginAlert` - New login detection
- `emergencyAccess` - Emergency access activation
- `criticalReminder` - Important reminders

### In-App Notifications

- `welcome` - Welcome message
- `firstAsset` - Add first asset
- `inviteTrusted` - Invite trusted person
- `createWill` - Create will document
- `reviewProgress` - Review progress

## Configuration

### Environment Variables

```bash
# Email Service
NEXT_PUBLIC_EMAIL_SERVICE_ENDPOINT=https://api.emailservice.com
EMAIL_SERVICE_API_KEY=your_email_api_key

# Push Notifications
NEXT_PUBLIC_PUSH_SERVICE_ENDPOINT=https://api.pushservice.com
PUSH_SERVICE_API_KEY=your_push_api_key

# SMS Service
NEXT_PUBLIC_SMS_SERVICE_ENDPOINT=https://api.smsservice.com
SMS_SERVICE_API_KEY=your_sms_api_key

# Legal Service
NEXT_PUBLIC_LEGAL_SERVICE_ENDPOINT=https://api.legalservice.com
LEGAL_SERVICE_API_KEY=your_legal_api_key
```

### i18n Configuration

The system automatically loads the required translation namespaces:

- `emails` - Email templates
- `notifications` - Push, SMS, and in-app notifications
- `legal` - Legal disclaimers and compliance information

## Best Practices

### 1. Language and Tone

- Use formal, respectful language appropriate for estate planning
- Maintain cultural sensitivity across all communications
- Ensure professional tone for serious family protection matters
- Use clear, actionable language for security communications

### 2. Personalization

- Always include the user's name when available
- Use dynamic content for dates, counts, and specific information
- Provide relevant action buttons and links
- Include appropriate contact information

### 3. Security

- Never include sensitive information in SMS messages
- Use secure links for password resets and verifications
- Include security reminders in appropriate communications
- Log all notification activities for audit purposes

### 4. Legal Compliance

- Include appropriate disclaimers for legal documents
- Ensure compliance with data protection regulations
- Provide clear terms and conditions
- Include jurisdiction-specific requirements

## Testing

### Email Testing

```typescript
// Test email template rendering
const testEmail = (
  <EmailTemplate
    type="welcome"
    data={{ userName: "Test User" }}
  />
);

// Test email service
const testUser = {
  id: 'test123',
  name: 'Test User',
  email: 'test@example.com'
};

await emailService.sendWelcomeEmail(testUser);
```

### Notification Testing

```typescript
// Test push notification
await notificationService.sendPushNotification("test123", "taskReminder", {
  count: 1,
});

// Test SMS notification
await notificationService.sendSMSNotification("+1234567890", "securityCode", {
  code: "123456",
});
```

## Troubleshooting

### Common Issues

1. **Translation not found**
   - Ensure the namespace is loaded: `useTranslation(['emails', 'notifications', 'legal'])`
   - Check that the translation key exists in the JSON file
   - Verify the language is supported

2. **Email not sending**
   - Check environment variables are set correctly
   - Verify API endpoints are accessible
   - Check API keys are valid
   - Review email service logs

3. **Notifications not appearing**
   - Verify user has opted in to notifications
   - Check device permissions for push notifications
   - Ensure phone number is valid for SMS
   - Review notification service logs

### Debug Mode

Enable debug logging by setting:

```typescript
// In i18n configuration
debug: true;
```

## Maintenance

### Adding New Email Types

1. Add translation keys to `/src/i18n/locales/en/emails.json`
2. Update the `EmailTemplate` component to handle the new type
3. Add the email sending method to `EmailService`
4. Update the `useEmailNotifications` hook
5. Copy translations to all language directories

### Adding New Notification Types

1. Add translation keys to `/src/i18n/locales/en/notifications.json`
2. Update the notification service methods
3. Add the notification type to the hook
4. Copy translations to all language directories

### Updating Legal Content

1. Update `/src/i18n/locales/en/legal.json`
2. Review jurisdiction-specific requirements
3. Update legal service methods if needed
4. Copy translations to all language directories

## Support

For questions or issues with the email and notification system:

1. Check the troubleshooting section above
2. Review the service logs for error messages
3. Verify environment variables are configured correctly
4. Test with the provided examples
5. Contact the development team for assistance

## Future Enhancements

- **A/B Testing** - Test different email templates and messaging
- **Analytics** - Track email open rates and click-through rates
- **Templates** - Visual email template builder
- **Scheduling** - Schedule notifications for optimal timing
- **Preferences** - User notification preference management
- **Localization** - Jurisdiction-specific legal requirements
