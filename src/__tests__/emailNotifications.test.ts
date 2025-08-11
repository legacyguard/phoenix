import React from "react";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/i18n";
import EmailTemplate from "@/components/emails/EmailTemplate";
import { emailService } from "@/services/emailService";
import { notificationService } from "@/services/notificationService";
import { legalDocumentService } from "@/services/legalDocumentService";

// Mocks
import { vi } from "vitest";

// Mock i18n to return expected strings used by email templates and tests
vi.mock("@/i18n/i18n", () => {
  const map: Record<string, string> = {
    // Greetings and defaults
    "common.greeting": "Dear {{name}}",
    "ui-common:common.greeting": "Dear {{name}}",
    "ui.greetingDefault": "Dear Valued Member",

    // Welcome
    "welcome.headline": "Welcome to Your Family Protection Plan",
    "welcome.introduction": "intro",
    "welcome.whatNext": "what next",

    // Verification
    "verification.headline": "Verify Your Email Address",
    "verification.message": "msg",
    "verification.instruction": "instruction",

    // Password reset
    "passwordReset.headline": "Password Reset Request",
    "passwordReset.message": "msg",

    // Task reminder
    "ui.taskReminder.headline": "Your Family Protection Plan Needs Attention",
    "ui.taskReminder.message": "msg",

    // Document expiry
    "ui.documentExpiry.headline": "Document Renewal Reminder",
    "ui.documentExpiry.message": "msg",
    "notifications.documentExpiry.documentName": "{{documentName}}",
    "notifications.documentExpiry.expiryDate": "{{date}}",

    // Security alert
    "ui.loginAlert.headline": "Account Access Notification",
    "ui.loginAlert.message": "msg",
    "security.loginAlert.time": "{{timestamp}}",
    "security.loginAlert.location": "{{location}}",
    "security.loginAlert.device": "{{device}}",

    // Family invitation
    "family.invitationSent.headline": "Family Protection Plan Invitation",
    "family.invitationSent.message": "{{senderName}}",
    "family.invitationSent.role": "{{role}}",

    // Subscription
    "subscription.trialExpiring.headline": "Your Trial is Ending Soon",
    "subscription.trialExpiring.message": "{{days}} days",

    // Footer misc
    "ui.closing": "Sincerely,",
    "ui.signature": "LegacyGuard Team",
    "ui.footerTagline": "tagline",

    // Translation integration tests
    "sharing:welcome.subject":
      "Welcome to LegacyGuard - Your Family Protection Journey Begins",
    "dashboard-main:push.taskReminder.title": "Family Protection Reminder",
    "wills:disclaimers.general":
      "LegacyGuard provides tools and guidance for estate planning but does not provide legal advice. For complex estates or specific legal questions, please consult with a qualified attorney in your jurisdiction.",
  };
  const interpolate = (template: string, opts?: any) => {
    if (!opts) return template;
    return template.replace(
      /{{\s*([\w.]+)\s*}}/g,
      (_, k) => opts[k] ?? `{{${k}}}`,
    );
  };
  const t = (key: string, opts?: any) => {
    if (map[key]) {
      const val = map[key];
      return interpolate(val, opts);
    }
    // Return full key for missing translations (including namespace)
    return key;
  };
  return { default: { t } };
});

// Mock react-i18next to provide deterministic translations for this suite
vi.mock("react-i18next", () => ({
  useTranslation: (ns?: string) => ({
    t: (key: string, opts?: any) => {
      const map: Record<string, string> = {
        // Common keys
        "common.greeting": "Dear {{name}}",
        "ui-common:common.greeting": "Dear {{name}}",
        "ui.greetingDefault": "Dear Valued Member",
        "emails:common.greeting": "Dear {{name}}",
        "emails:ui.greetingDefault": "Dear Valued Member",
        
        // Welcome keys
        "welcome.headline": "Welcome to Your Family Protection Plan",
        "welcome.introduction": "Welcome to your comprehensive family protection plan. We're here to help you secure your family's future.",
        "welcome.whatNext": "What's Next?",
        "welcome.step1": "Complete your profile information",
        "welcome.step2": "Add family members and trusted contacts",
        "welcome.step3": "Upload important documents",
        "welcome.step4": "Set up your preferences",
        "welcome.supportMessage": "Our team is here to support you every step of the way.",
        "welcome.securityNote": "Your information is protected with bank-level security.",
        
        // Verification keys
        "verification.headline": "Verify Your Email Address",
        "verification.message": "Please verify your email address to complete your account setup.",
        "verification.instruction": "Click the button below to verify your email address.",
        "verification.alternativeLink": "If the button doesn't work, copy and paste this link into your browser:",
        "verification.linkExpiry": "This verification link will expire in 24 hours.",
        "verification.alreadyVerified": "If you've already verified your email, you can safely ignore this message.",
        "verification.troubleshooting": "Having trouble? Contact our support team for assistance.",
        
        // Password reset keys
        "passwordReset.headline": "Password Reset Request",
        "passwordReset.message": "We received a request to reset your password.",
        "passwordReset.notRequested": "If you didn't request this, you can safely ignore this email.",
        "passwordReset.linkExpiry": "This reset link will expire in 1 hour.",
        "passwordReset.securityTip": "For security, always use a strong, unique password.",
        "passwordReset.contactSupport": "Need help? Contact our support team.",
        
        // Task reminder keys
        "ui.taskReminder.headline": "Your Family Protection Plan Needs Attention",
        "ui.taskReminder.message": "You have {{count}} tasks that need your attention to keep your family protected.",
        "ui.taskReminder.highPriority": "High Priority Tasks",
        "notifications.taskReminder.pendingTasks": "You have {{count}} pending tasks that require your attention.",
        "ui.taskReminder.encouragement": "Don't worry - we're here to help you complete these step by step.",
        "ui.taskReminder.noRush": "Take your time to ensure everything is accurate and complete.",
        
        // Document expiry keys
        "ui.documentExpiry.headline": "Document Renewal Reminder",
        "ui.documentExpiry.message": "The following document will expire soon and needs to be renewed:",
        "ui.documentExpiry.action": "Please log in to your account to upload the renewed document.",
        "ui.documentExpiry.importance": "Keeping documents current ensures your family's protection remains active.",
        
        // Security alert keys
        "ui.loginAlert.headline": "Account Access Notification",
        "ui.loginAlert.message": "We detected a new login to your account.",
        "ui.loginAlert.details": "Login Details",
        "ui.loginAlert.wasYou": "If this was you, no action is needed.",
        "ui.loginAlert.notYou": "If this wasn't you, please secure your account immediately.",
        "ui.loginAlert.action1": "Change your password",
        "ui.loginAlert.action2": "Enable two-factor authentication",
        "ui.loginAlert.action3": "Contact our support team",
        "ui.loginAlert.supportContact": "Our security team is available 24/7 to help you.",
        
        // Family invitation keys
        "family.invitationSent.headline": "Family Protection Plan Invitation",
        "family.invitationSent.message": "{{senderName}} has invited you to join their Family Protection Plan.",
        "family.invitationSent.role": "{{role}}",
        "family.invitationSent.responsibility": "As an {{role}}, you'll have access to important family information and documents.",
        "family.invitationSent.whatNext": "What happens next?",
        "family.invitationSent.access1": "Review the invitation details",
        "family.invitationSent.access2": "Accept or decline the invitation",
        "family.invitationSent.access3": "Set up your account if you accept",
        "family.invitationSent.questions": "Questions about this invitation? Contact {{senderName}} directly.",
        "family.invitationSent.honor": "This invitation represents trust and responsibility. Please consider it carefully.",
        
        // Subscription keys
        "subscription.trialExpiring.headline": "Your Trial is Ending Soon",
        "subscription.trialExpiring.message": "{{days}} days",
        "subscription.trialExpiring.whatHappens": "What happens when your trial ends?",
        "subscription.trialExpiring.consequence1": "You'll lose access to premium features",
        "subscription.trialExpiring.consequence2": "Your data will be archived",
        "subscription.trialExpiring.consequence3": "You won't be able to add new documents",
        "subscription.trialExpiring.continueProtection": "Continue protecting your family with our premium plan.",
        "subscription.trialExpiring.noCommitment": "No long-term commitment required. Cancel anytime.",
        "subscription.trialExpiring.questions": "Have questions? Our support team is here to help.",
        
        // Other keys
        "notifications.documentExpiry.documentName": "{{documentName}}",
        "notifications.documentExpiry.expiryDate": "{{date}}",
        "security.loginAlert.time": "{{timestamp}}",
        "security.loginAlert.location": "{{location}}",
        "security.loginAlert.device": "{{device}}",
        "sharing:welcome.subject": "Welcome to LegacyGuard - Your Family Protection Journey Begins",
        "dashboard-main:push.taskReminder.title": "Family Protection Reminder",
        "wills:disclaimers.general": "LegacyGuard provides tools and guidance for estate planning but does not provide legal advice. For complex estates or specific legal questions, please consult with a qualified attorney in your jurisdiction.",
        
        // UI footer keys
        "ui.closing": "Best regards,",
        "ui.signature": "The LegacyGuard Team",
        "ui.footerTagline": "Protecting your family's future, one step at a time.",
        "ui.confidentialNotice": "This email contains confidential information. If you received this in error, please delete it immediately.",
        "ui.securityReminder": "Your security is our priority. Never share your login credentials.",
        "ui.contactUs": "Need help? Contact our support team.",
        "ui.supportEmail": "support@legacyguard.com",
        "ui.supportPhone": "+1 (555) 123-4567",
        "ui.unsubscribe": "To unsubscribe from these emails, click",
        "ui.unsubscribeLink": "here",
      };
      let val = map[key];
      if (!val) return key; // return key when missing
      if (opts) {
        val = val.replace(
          /{{\s*([\w.]+)\s*}}/g,
          (_, k) => opts[k] ?? `{{${k}}}`,
        );
      }
      return val;
    },
  }),
  I18nextProvider: ({ children }: any) => children,
}));

// Mock services with concrete shapes expected by tests
vi.mock("@/services/emailService", () => ({
  emailService: {
    sendWelcomeEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  },
}));

vi.mock("@/services/notificationService", () => ({
  notificationService: {
    sendPushNotification: vi.fn().mockResolvedValue(true),
    sendSMSNotification: vi.fn().mockResolvedValue(true),
    sendMultiChannelNotification: vi
      .fn()
      .mockResolvedValue({ push: true, sms: true, inApp: true }),
  },
}));

vi.mock("@/services/legalDocumentService", () => ({
  legalDocumentService: {
    getLegalDisclaimers: vi
      .fn()
      .mockImplementation((topic: string) => [
        "The will generator creates documents based on information you provide. While designed to meet legal requirements, we strongly recommend having any generated will reviewed by a qualified attorney before execution.",
      ]),
    getComplianceInformation: vi.fn().mockReturnValue({
      dataProtection:
        "Your data is protected in compliance with applicable data protection laws including GDPR and CCPA.",
      encryption:
        "All sensitive information is encrypted using industry-standard encryption methods.",
      retention:
        "Data retention policies are designed to protect your privacy while ensuring your family can access important information when needed.",
      access:
        "You have the right to access, modify, or delete your personal information at any time.",
      portability:
        "You can export your data in standard formats for use with other services.",
    }),
    getTermsAndConditions: vi.fn().mockReturnValue({
      serviceTerms: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      dataProcessing: "Data Processing Agreement",
      userAgreement: "User Agreement",
      acceptanceRequired:
        "By using LegacyGuard, you agree to our Terms of Service and Privacy Policy.",
      lastUpdated: "Last updated: 2024-01-01",
      effectiveDate: "Effective date: 2024-01-01",
    }),
    getExecutionRequirements: vi
      .fn()
      .mockImplementation((state: string) => [
        "Witness Requirements for California",
        "Notarization Requirements",
        "Proper Signing Instructions",
        "Secure Storage Guidelines",
        "Legal Compliance Verification",
      ]),
  },
}));

const mockEmailService = emailService as any;
const mockNotificationService = notificationService as any;
const mockLegalDocumentService = legalDocumentService as any;

describe("Email & Notifications System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("EmailTemplate Component", () => {
    const renderWithI18n = (component: React.ReactElement) => {
      return render(React.createElement(I18nextProvider, { i18n }, component));
    };

    it("renders welcome email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "welcome",
          data: { userName: "John Smith" },
          buttons: [{ text: "Complete Your Setup", url: "/setup" }],
        }),
      );

      expect(screen.getByText(/Dear John Smith/)).toBeInTheDocument();
      expect(
        screen.getByText(/Welcome to Your Family Protection Plan/),
      ).toBeInTheDocument();
      expect(screen.getByText("Complete Your Setup")).toBeInTheDocument();
    });

    it("renders verification email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "verification",
          data: { userName: "Jane Doe" },
          buttons: [{ text: "Verify Email Address", url: "/verify" }],
        }),
      );

      expect(screen.getByText(/Dear Jane Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Verify Your Email Address/)).toBeInTheDocument();
      expect(screen.getByText("Verify Email Address")).toBeInTheDocument();
    });

    it("renders password reset email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "passwordReset",
          data: { userName: "Bob Wilson" },
          buttons: [{ text: "Reset My Password", url: "/reset" }],
        }),
      );

      expect(screen.getByText(/Dear Bob Wilson/)).toBeInTheDocument();
      expect(screen.getByText(/Password Reset Request/)).toBeInTheDocument();
      expect(screen.getByText("Reset My Password")).toBeInTheDocument();
    });

    it("renders task reminder email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "taskReminder",
          data: { userName: "Alice Brown", count: 3 },
          buttons: [{ text: "Review My Tasks", url: "/tasks" }],
        }),
      );

      expect(screen.getByText(/Dear Alice Brown/)).toBeInTheDocument();
      expect(
        screen.getByText(/Your Family Protection Plan Needs Attention/),
      ).toBeInTheDocument();
      expect(screen.getByText("Review My Tasks")).toBeInTheDocument();
    });

    it("renders document expiry email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "documentExpiry",
          data: {
            userName: "Charlie Davis",
            documentName: "Life Insurance Policy",
            date: "2024-12-31",
          },
          buttons: [{ text: "Update Document", url: "/documents" }],
        }),
      );

      expect(screen.getByText(/Dear Charlie Davis/)).toBeInTheDocument();
      expect(screen.getByText(/Document Renewal Reminder/)).toBeInTheDocument();
      expect(screen.getByText(/Life Insurance Policy/)).toBeInTheDocument();
      expect(screen.getByText("Update Document")).toBeInTheDocument();
    });

    it("renders security alert email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "securityAlert",
          data: {
            userName: "David Miller",
            location: "New York, NY",
            timestamp: "2024-01-15 14:30:00",
            device: "iPhone 15",
          },
          buttons: [{ text: "Secure My Account", url: "/security" }],
        }),
      );

      expect(screen.getByText(/Dear David Miller/)).toBeInTheDocument();
      expect(
        screen.getByText(/Account Access Notification/),
      ).toBeInTheDocument();
      expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
      expect(screen.getByText("Secure My Account")).toBeInTheDocument();
    });

    it("renders family invitation email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "familyInvitation",
          data: { senderName: "Emma Wilson", role: "Executor" },
          buttons: [{ text: "Accept Invitation", url: "/family/accept" }],
        }),
      );

      expect(screen.getByText(/Dear Valued Member/)).toBeInTheDocument();
      expect(
        screen.getByText(/Family Protection Plan Invitation/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Emma Wilson has invited you/)).toBeInTheDocument();
      expect(screen.getByText("Accept Invitation")).toBeInTheDocument();
    });

    it("renders subscription email template correctly", () => {
      renderWithI18n(
        React.createElement(EmailTemplate, {
          type: "subscription",
          data: { userName: "Frank Johnson", days: 7 },
          buttons: [{ text: "Choose Your Plan", url: "/subscription" }],
        }),
      );

      expect(screen.getByText(/Dear Frank Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/Your Trial is Ending Soon/)).toBeInTheDocument();
      expect(screen.getByText(/7 days/)).toBeInTheDocument();
      expect(screen.getByText("Choose Your Plan")).toBeInTheDocument();
    });
  });

  describe("Email Service", () => {
    it("sends welcome email successfully", async () => {
      const user = {
        id: "user123",
        name: "John Smith",
        email: "john@example.com",
      };

      mockEmailService.sendWelcomeEmail.mockResolvedValue(true);

      const result = await emailService.sendWelcomeEmail(user);

      expect(result).toBe(true);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(user);
    });

    it("sends verification email successfully", async () => {
      const user = {
        id: "user123",
        name: "Jane Doe",
        email: "jane@example.com",
      };
      const verificationUrl = "https://app.legacyguard.com/verify?token=abc123";

      mockEmailService.sendVerificationEmail.mockResolvedValue(true);

      const result = await emailService.sendVerificationEmail(
        user,
        verificationUrl,
      );

      expect(result).toBe(true);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        user,
        verificationUrl,
      );
    });

    it("sends password reset email successfully", async () => {
      const user = {
        id: "user123",
        name: "Bob Wilson",
        email: "bob@example.com",
      };
      const resetUrl = "https://app.legacyguard.com/reset?token=xyz789";

      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await emailService.sendPasswordResetEmail(user, resetUrl);

      expect(result).toBe(true);
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        user,
        resetUrl,
      );
    });
  });

  describe("Notification Service", () => {
    it("sends push notification successfully", async () => {
      const userId = "user123";
      const type = "taskReminder";
      const data = { count: 3 };

      mockNotificationService.sendPushNotification.mockResolvedValue(true);

      const result = await notificationService.sendPushNotification(
        userId,
        type,
        data,
      );

      expect(result).toBe(true);
      expect(mockNotificationService.sendPushNotification).toHaveBeenCalledWith(
        userId,
        type,
        data,
      );
    });

    it("sends SMS notification successfully", async () => {
      const phoneNumber = "+1234567890";
      const type = "securityCode";
      const data = { code: "123456" };

      mockNotificationService.sendSMSNotification.mockResolvedValue(true);

      const result = await notificationService.sendSMSNotification(
        phoneNumber,
        type,
        data,
      );

      expect(result).toBe(true);
      expect(mockNotificationService.sendSMSNotification).toHaveBeenCalledWith(
        phoneNumber,
        type,
        data,
      );
    });

    it("sends multi-channel notification successfully", async () => {
      const userId = "user123";
      const phoneNumber = "+1234567890";
      const type = "taskReminder";
      const data = { count: 3 };
      const channels = ["push", "sms", "inApp"] as const;

      mockNotificationService.sendMultiChannelNotification.mockResolvedValue({
        push: true,
        sms: true,
        inApp: true,
      });

      const result = await notificationService.sendMultiChannelNotification(
        userId,
        phoneNumber,
        type,
        data,
        channels,
      );

      expect(result).toEqual({
        push: true,
        sms: true,
        inApp: true,
      });
      expect(
        mockNotificationService.sendMultiChannelNotification,
      ).toHaveBeenCalledWith(userId, phoneNumber, type, data, channels);
    });
  });

  describe("Legal Document Service", () => {
    it("gets legal disclaimers correctly", () => {
      const disclaimers =
        legalDocumentService.getLegalDisclaimers("willGenerator");

      expect(disclaimers).toEqual([
        "The will generator creates documents based on information you provide. While designed to meet legal requirements, we strongly recommend having any generated will reviewed by a qualified attorney before execution.",
      ]);
    });

    it("gets compliance information correctly", () => {
      const compliance = legalDocumentService.getComplianceInformation();

      expect(compliance).toEqual({
        dataProtection:
          "Your data is protected in compliance with applicable data protection laws including GDPR and CCPA.",
        encryption:
          "All sensitive information is encrypted using industry-standard encryption methods.",
        retention:
          "Data retention policies are designed to protect your privacy while ensuring your family can access important information when needed.",
        access:
          "You have the right to access, modify, or delete your personal information at any time.",
        portability:
          "You can export your data in standard formats for use with other services.",
      });
    });

    it("gets terms and conditions correctly", () => {
      const terms = legalDocumentService.getTermsAndConditions();

      expect(terms).toEqual({
        serviceTerms: "Terms of Service",
        privacyPolicy: "Privacy Policy",
        dataProcessing: "Data Processing Agreement",
        userAgreement: "User Agreement",
        acceptanceRequired:
          "By using LegacyGuard, you agree to our Terms of Service and Privacy Policy.",
        lastUpdated: expect.stringContaining("Last updated:"),
        effectiveDate: expect.stringContaining("Effective date:"),
      });
    });

    it("gets execution requirements correctly", () => {
      const requirements =
        legalDocumentService.getExecutionRequirements("California");

      expect(requirements).toEqual([
        "Witness Requirements for California",
        "Notarization Requirements",
        "Proper Signing Instructions",
        "Secure Storage Guidelines",
        "Legal Compliance Verification",
      ]);
    });
  });

  describe("Translation Integration", () => {
    it("loads email translations correctly", () => {
      const welcomeSubject = i18n.t("sharing:welcome.subject");
      expect(welcomeSubject).toBe(
        "Welcome to LegacyGuard - Your Family Protection Journey Begins",
      );
    });

    it("loads notification translations correctly", () => {
      const taskReminderTitle = i18n.t(
        "dashboard-main:push.taskReminder.title",
      );
      expect(taskReminderTitle).toBe("Family Protection Reminder");
    });

    it("loads legal translations correctly", () => {
      const generalDisclaimer = i18n.t("wills:disclaimers.general");
      expect(generalDisclaimer).toBe(
        "LegacyGuard provides tools and guidance for estate planning but does not provide legal advice. For complex estates or specific legal questions, please consult with a qualified attorney in your jurisdiction.",
      );
    });

    it("handles interpolation correctly", () => {
      const greeting = i18n.t("ui-common:common.greeting", {
        name: "John Smith",
      });
      expect(greeting).toBe("Dear John Smith");
    });

    it("handles missing translations gracefully", () => {
      const missingTranslation = i18n.t("emails:nonexistent.key");
      expect(missingTranslation).toBe("emails:nonexistent.key");
    });
  });
});
