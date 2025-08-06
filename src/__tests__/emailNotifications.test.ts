import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import EmailTemplate from '@/components/emails/EmailTemplate';
import { emailService } from '@/services/emailService';
import { notificationService } from '@/services/notificationService';
import { legalDocumentService } from '@/services/legalDocumentService';

// Mock the services
jest.mock('@/services/emailService');
jest.mock('@/services/notificationService');
jest.mock('@/services/legalDocumentService');

const mockEmailService = emailService as jest.Mocked<typeof emailService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockLegalDocumentService = legalDocumentService as jest.Mocked<typeof legalDocumentService>;

describe('Email & Notifications System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EmailTemplate Component', () => {
    const renderWithI18n = (component: React.ReactElement) => {
      return render(
        <I18nextProvider i18n={i18n}>
          {component}
        </I18nextProvider>
      );
    };

    it('renders welcome email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="welcome"
          data={{ userName: "John Smith" }}
          buttons={[
            { text: "Complete Your Setup", url: "/setup" }
          ]}
        />
      );

      expect(screen.getByText(/Dear John Smith/)).toBeInTheDocument();
      expect(screen.getByText(/Welcome to Your Family Protection Plan/)).toBeInTheDocument();
      expect(screen.getByText("Complete Your Setup")).toBeInTheDocument();
    });

    it('renders verification email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="verification"
          data={{ userName: "Jane Doe" }}
          buttons={[
            { text: "Verify Email Address", url: "/verify" }
          ]}
        />
      );

      expect(screen.getByText(/Dear Jane Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Verify Your Email Address/)).toBeInTheDocument();
      expect(screen.getByText("Verify Email Address")).toBeInTheDocument();
    });

    it('renders password reset email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="passwordReset"
          data={{ userName: "Bob Wilson" }}
          buttons={[
            { text: "Reset My Password", url: "/reset" }
          ]}
        />
      );

      expect(screen.getByText(/Dear Bob Wilson/)).toBeInTheDocument();
      expect(screen.getByText(/Password Reset Request/)).toBeInTheDocument();
      expect(screen.getByText("Reset My Password")).toBeInTheDocument();
    });

    it('renders task reminder email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="taskReminder"
          data={{ userName: "Alice Brown", count: 3 }}
          buttons={[
            { text: "Review My Tasks", url: "/tasks" }
          ]}
        />
      );

      expect(screen.getByText(/Dear Alice Brown/)).toBeInTheDocument();
      expect(screen.getByText(/Your Family Protection Plan Needs Attention/)).toBeInTheDocument();
      expect(screen.getByText("Review My Tasks")).toBeInTheDocument();
    });

    it('renders document expiry email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="documentExpiry"
          data={{ 
            userName: "Charlie Davis", 
            documentName: "Life Insurance Policy",
            date: "2024-12-31"
          }}
          buttons={[
            { text: "Update Document", url: "/documents" }
          ]}
        />
      );

      expect(screen.getByText(/Dear Charlie Davis/)).toBeInTheDocument();
      expect(screen.getByText(/Document Renewal Reminder/)).toBeInTheDocument();
      expect(screen.getByText(/Life Insurance Policy/)).toBeInTheDocument();
      expect(screen.getByText("Update Document")).toBeInTheDocument();
    });

    it('renders security alert email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="securityAlert"
          data={{ 
            userName: "David Miller",
            location: "New York, NY",
            timestamp: "2024-01-15 14:30:00",
            device: "iPhone 15"
          }}
          buttons={[
            { text: "Secure My Account", url: "/security" }
          ]}
        />
      );

      expect(screen.getByText(/Dear David Miller/)).toBeInTheDocument();
      expect(screen.getByText(/Account Access Notification/)).toBeInTheDocument();
      expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
      expect(screen.getByText("Secure My Account")).toBeInTheDocument();
    });

    it('renders family invitation email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="familyInvitation"
          data={{ 
            senderName: "Emma Wilson",
            role: "Executor"
          }}
          buttons={[
            { text: "Accept Invitation", url: "/family/accept" }
          ]}
        />
      );

      expect(screen.getByText(/Dear Valued Member/)).toBeInTheDocument();
      expect(screen.getByText(/Family Protection Plan Invitation/)).toBeInTheDocument();
      expect(screen.getByText(/Emma Wilson/)).toBeInTheDocument();
      expect(screen.getByText("Accept Invitation")).toBeInTheDocument();
    });

    it('renders subscription email template correctly', () => {
      renderWithI18n(
        <EmailTemplate
          type="subscription"
          data={{ 
            userName: "Frank Johnson",
            days: 7
          }}
          buttons={[
            { text: "Choose Your Plan", url: "/subscription" }
          ]}
        />
      );

      expect(screen.getByText(/Dear Frank Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/Your Trial is Ending Soon/)).toBeInTheDocument();
      expect(screen.getByText(/7 days/)).toBeInTheDocument();
      expect(screen.getByText("Choose Your Plan")).toBeInTheDocument();
    });
  });

  describe('Email Service', () => {
    it('sends welcome email successfully', async () => {
      const user = {
        id: 'user123',
        name: 'John Smith',
        email: 'john@example.com'
      };

      mockEmailService.sendWelcomeEmail.mockResolvedValue(true);

      const result = await emailService.sendWelcomeEmail(user);

      expect(result).toBe(true);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(user);
    });

    it('sends verification email successfully', async () => {
      const user = {
        id: 'user123',
        name: 'Jane Doe',
        email: 'jane@example.com'
      };
      const verificationUrl = 'https://app.legacyguard.com/verify?token=abc123';

      mockEmailService.sendVerificationEmail.mockResolvedValue(true);

      const result = await emailService.sendVerificationEmail(user, verificationUrl);

      expect(result).toBe(true);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(user, verificationUrl);
    });

    it('sends password reset email successfully', async () => {
      const user = {
        id: 'user123',
        name: 'Bob Wilson',
        email: 'bob@example.com'
      };
      const resetUrl = 'https://app.legacyguard.com/reset?token=xyz789';

      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await emailService.sendPasswordResetEmail(user, resetUrl);

      expect(result).toBe(true);
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(user, resetUrl);
    });
  });

  describe('Notification Service', () => {
    it('sends push notification successfully', async () => {
      const userId = 'user123';
      const type = 'taskReminder';
      const data = { count: 3 };

      mockNotificationService.sendPushNotification.mockResolvedValue(true);

      const result = await notificationService.sendPushNotification(userId, type, data);

      expect(result).toBe(true);
      expect(mockNotificationService.sendPushNotification).toHaveBeenCalledWith(userId, type, data);
    });

    it('sends SMS notification successfully', async () => {
      const phoneNumber = '+1234567890';
      const type = 'securityCode';
      const data = { code: '123456' };

      mockNotificationService.sendSMSNotification.mockResolvedValue(true);

      const result = await notificationService.sendSMSNotification(phoneNumber, type, data);

      expect(result).toBe(true);
      expect(mockNotificationService.sendSMSNotification).toHaveBeenCalledWith(phoneNumber, type, data);
    });

    it('sends multi-channel notification successfully', async () => {
      const userId = 'user123';
      const phoneNumber = '+1234567890';
      const type = 'taskReminder';
      const data = { count: 3 };
      const channels = ['push', 'sms', 'inApp'] as const;

      mockNotificationService.sendMultiChannelNotification.mockResolvedValue({
        push: true,
        sms: true,
        inApp: true
      });

      const result = await notificationService.sendMultiChannelNotification(
        userId,
        phoneNumber,
        type,
        data,
        channels
      );

      expect(result).toEqual({
        push: true,
        sms: true,
        inApp: true
      });
      expect(mockNotificationService.sendMultiChannelNotification).toHaveBeenCalledWith(
        userId,
        phoneNumber,
        type,
        data,
        channels
      );
    });
  });

  describe('Legal Document Service', () => {
    it('gets legal disclaimers correctly', () => {
      const disclaimers = legalDocumentService.getLegalDisclaimers('willGenerator');

      expect(disclaimers).toEqual([
        "The will generator creates documents based on information you provide. While designed to meet legal requirements, we strongly recommend having any generated will reviewed by a qualified attorney before execution."
      ]);
    });

    it('gets compliance information correctly', () => {
      const compliance = legalDocumentService.getComplianceInformation();

      expect(compliance).toEqual({
        dataProtection: "Your data is protected in compliance with applicable data protection laws including GDPR and CCPA.",
        encryption: "All sensitive information is encrypted using industry-standard encryption methods.",
        retention: "Data retention policies are designed to protect your privacy while ensuring your family can access important information when needed.",
        access: "You have the right to access, modify, or delete your personal information at any time.",
        portability: "You can export your data in standard formats for use with other services."
      });
    });

    it('gets terms and conditions correctly', () => {
      const terms = legalDocumentService.getTermsAndConditions();

      expect(terms).toEqual({
        serviceTerms: "Terms of Service",
        privacyPolicy: "Privacy Policy",
        dataProcessing: "Data Processing Agreement",
        userAgreement: "User Agreement",
        acceptanceRequired: "By using LegacyGuard, you agree to our Terms of Service and Privacy Policy.",
        lastUpdated: expect.stringContaining("Last updated:"),
        effectiveDate: expect.stringContaining("Effective date:")
      });
    });

    it('gets execution requirements correctly', () => {
      const requirements = legalDocumentService.getExecutionRequirements('California');

      expect(requirements).toEqual([
        "Witness Requirements for California",
        "Notarization Requirements",
        "Proper Signing Instructions",
        "Secure Storage Guidelines",
        "Legal Compliance Verification"
      ]);
    });
  });

  describe('Translation Integration', () => {
    it('loads email translations correctly', () => {
      const welcomeSubject = i18n.t('emails:welcome.subject');
      expect(welcomeSubject).toBe('Welcome to LegacyGuard - Your Family Protection Journey Begins');
    });

    it('loads notification translations correctly', () => {
      const taskReminderTitle = i18n.t('notifications:push.taskReminder.title');
      expect(taskReminderTitle).toBe('Family Protection Reminder');
    });

    it('loads legal translations correctly', () => {
      const generalDisclaimer = i18n.t('legal:disclaimers.general');
      expect(generalDisclaimer).toBe('LegacyGuard provides tools and guidance for estate planning but does not provide legal advice. For complex estates or specific legal questions, please consult with a qualified attorney in your jurisdiction.');
    });

    it('handles interpolation correctly', () => {
      const greeting = i18n.t('emails:common.greeting', { name: 'John Smith' });
      expect(greeting).toBe('Dear John Smith');
    });

    it('handles missing translations gracefully', () => {
      const missingTranslation = i18n.t('emails:nonexistent.key');
      expect(missingTranslation).toBe('emails:nonexistent.key');
    });
  });
}); 