import { useTranslation } from 'react-i18next';
import { emailService } from '@/services/emailService';
import { notificationService } from '@/services/notificationService';
import type { legalDocumentService } from '@/services/legalDocumentService';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  lastName?: string;
}

interface EmailNotificationData {
  userName?: string;
  lastName?: string;
  documentName?: string;
  date?: string;
  count?: number;
  memberName?: string;
  level?: string;
  timestamp?: string;
  location?: string;
  device?: string;
  activityType?: string;
  days?: number;
  paymentError?: string;
  retryDate?: string;
  accessEndDate?: string;
  retentionDays?: number;
  senderName?: string;
  role?: string;
  ownerName?: string;
  accessLevel?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  statusUrl?: string;
}

export const useEmailNotifications = () => {
  const { t } = useTranslation(['emails', 'notifications', 'legal']);

  // Send welcome email
  const sendWelcomeEmail = async (user: User) => {
    try {
      const success = await emailService.sendWelcomeEmail(user);
      if (success) {
        console.log('Welcome email sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  };

  // Send verification email
  const sendVerificationEmail = async (user: User, verificationUrl: string) => {
    try {
      const success = await emailService.sendVerificationEmail(user, verificationUrl);
      if (success) {
        console.log('Verification email sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  };

  // Send password reset email
  const sendPasswordResetEmail = async (user: User, resetUrl: string) => {
    try {
      const success = await emailService.sendPasswordResetEmail(user, resetUrl);
      if (success) {
        console.log('Password reset email sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  };

  // Send task reminder notifications
  const sendTaskReminder = async (
    user: User,
    data: EmailNotificationData,
    channels: ('email' | 'push' | 'sms' | 'inApp')[] = ['email', 'push']
  ) => {
    try {
      const results = {
        email: false,
        push: false,
        sms: false,
        inApp: false
      };

      // Send email notification
      if (channels.includes('email')) {
        results.email = await emailService.sendTaskReminderEmail(user, data);
      }

      // Send other notifications
      if (channels.includes('push') || channels.includes('sms') || channels.includes('inApp')) {
        const notificationChannels = channels.filter(c => c !== 'email') as ('push' | 'sms' | 'inApp')[];
        const notificationResults = await notificationService.sendMultiChannelNotification(
          user.id,
          user.phoneNumber || '',
          'taskReminder',
          data,
          notificationChannels
        );
        
        results.push = notificationResults.push;
        results.sms = notificationResults.sms;
        results.inApp = notificationResults.inApp;
      }

      console.log('Task reminder notifications sent:', results);
      return results;
    } catch (error) {
      console.error('Error sending task reminder notifications:', error);
      return { email: false, push: false, sms: false, inApp: false };
    }
  };

  // Send document expiry notifications
  const sendDocumentExpiryNotification = async (
    user: User,
    data: EmailNotificationData,
    channels: ('email' | 'push' | 'sms' | 'inApp')[] = ['email', 'push']
  ) => {
    try {
      const results = {
        email: false,
        push: false,
        sms: false,
        inApp: false
      };

      // Send email notification
      if (channels.includes('email')) {
        results.email = await emailService.sendDocumentExpiryEmail(user, data);
      }

      // Send other notifications
      if (channels.includes('push') || channels.includes('sms') || channels.includes('inApp')) {
        const notificationChannels = channels.filter(c => c !== 'email') as ('push' | 'sms' | 'inApp')[];
        const notificationResults = await notificationService.sendMultiChannelNotification(
          user.id,
          user.phoneNumber || '',
          'documentExpiry',
          data,
          notificationChannels
        );
        
        results.push = notificationResults.push;
        results.sms = notificationResults.sms;
        results.inApp = notificationResults.inApp;
      }

      console.log('Document expiry notifications sent:', results);
      return results;
    } catch (error) {
      console.error('Error sending document expiry notifications:', error);
      return { email: false, push: false, sms: false, inApp: false };
    }
  };

  // Send security alert notifications
  const sendSecurityAlert = async (
    user: User,
    data: EmailNotificationData,
    channels: ('email' | 'push' | 'sms' | 'inApp')[] = ['email', 'sms']
  ) => {
    try {
      const results = {
        email: false,
        push: false,
        sms: false,
        inApp: false
      };

      // Send email notification
      if (channels.includes('email')) {
        results.email = await emailService.sendSecurityAlertEmail(user, data);
      }

      // Send other notifications
      if (channels.includes('push') || channels.includes('sms') || channels.includes('inApp')) {
        const notificationChannels = channels.filter(c => c !== 'email') as ('push' | 'sms' | 'inApp')[];
        const notificationResults = await notificationService.sendMultiChannelNotification(
          user.id,
          user.phoneNumber || '',
          'securityAlert',
          data,
          notificationChannels
        );
        
        results.push = notificationResults.push;
        results.sms = notificationResults.sms;
        results.inApp = notificationResults.inApp;
      }

      console.log('Security alert notifications sent:', results);
      return results;
    } catch (error) {
      console.error('Error sending security alert notifications:', error);
      return { email: false, push: false, sms: false, inApp: false };
    }
  };

  // Send subscription notifications
  const sendSubscriptionNotification = async (
    user: User,
    type: 'trialExpiring' | 'paymentFailed' | 'subscriptionCancelled',
    data: EmailNotificationData,
    channels: ('email' | 'push' | 'sms' | 'inApp')[] = ['email', 'push']
  ) => {
    try {
      const results = {
        email: false,
        push: false,
        sms: false,
        inApp: false
      };

      // Send email notification
      if (channels.includes('email')) {
        results.email = await emailService.sendSubscriptionEmail(user, type, data);
      }

      // Send other notifications
      if (channels.includes('push') || channels.includes('sms') || channels.includes('inApp')) {
        const notificationChannels = channels.filter(c => c !== 'email') as ('push' | 'sms' | 'inApp')[];
        const notificationResults = await notificationService.sendMultiChannelNotification(
          user.id,
          user.phoneNumber || '',
          type,
          data,
          notificationChannels
        );
        
        results.push = notificationResults.push;
        results.sms = notificationResults.sms;
        results.inApp = notificationResults.inApp;
      }

      console.log('Subscription notifications sent:', results);
      return results;
    } catch (error) {
      console.error('Error sending subscription notifications:', error);
      return { email: false, push: false, sms: false, inApp: false };
    }
  };

  // Send family invitation
  const sendFamilyInvitation = async (
    recipientEmail: string,
    senderName: string,
    data: EmailNotificationData
  ) => {
    try {
      const success = await emailService.sendFamilyInvitationEmail(recipientEmail, senderName, data);
      if (success) {
        console.log('Family invitation email sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending family invitation email:', error);
      return false;
    }
  };

  // Send SMS security code
  const sendSecurityCode = async (phoneNumber: string, code: string) => {
    try {
      const success = await notificationService.sendSecurityCode(phoneNumber, code);
      if (success) {
        console.log('Security code SMS sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending security code SMS:', error);
      return false;
    }
  };

  // Send login alert
  const sendLoginAlert = async (user: User, location: string, time: string) => {
    try {
      if (!user.phoneNumber) {
        console.warn('No phone number available for login alert');
        return false;
      }

      const success = await notificationService.sendLoginAlert(user.id, user.phoneNumber, location, time);
      if (success) {
        console.log('Login alert SMS sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending login alert SMS:', error);
      return false;
    }
  };

  // Send emergency access notification
  const sendEmergencyAccessNotification = async (phoneNumber: string, familyName: string) => {
    try {
      const success = await notificationService.sendEmergencyAccessNotification(phoneNumber, familyName);
      if (success) {
        console.log('Emergency access notification SMS sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending emergency access notification SMS:', error);
      return false;
    }
  };

  // Send critical reminder
  const sendCriticalReminder = async (user: User) => {
    try {
      if (!user.phoneNumber) {
        console.warn('No phone number available for critical reminder');
        return false;
      }

      const success = await notificationService.sendCriticalReminder(user.id, user.phoneNumber);
      if (success) {
        console.log('Critical reminder SMS sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending critical reminder SMS:', error);
      return false;
    }
  };

  // Get legal disclaimers
  const getLegalDisclaimers = (type: 'general' | 'willGenerator' | 'jurisdiction' | 'notLegalAdvice' | 'professionalReview') => {
    return t('wills.disclaimers.${type}');
  };

  // Get compliance information
  const getComplianceInfo = () => {
    return {
      dataProtection: t('wills.compliance.dataProtection'),
      encryption: t('wills.compliance.encryption'),
      retention: t('wills.compliance.retention'),
      access: t('wills.compliance.access'),
      portability: t('wills.compliance.portability')
    };
  };

  // Get terms and conditions
  const getTermsAndConditions = () => {
    return {
      serviceTerms: t('wills.terms.serviceTerms'),
      privacyPolicy: t('wills.terms.privacyPolicy'),
      dataProcessing: t('wills.terms.dataProcessing'),
      userAgreement: t('wills.terms.userAgreement'),
      acceptanceRequired: t('wills.terms.acceptanceRequired'),
      lastUpdated: t('legal.terms.lastUpdated', { date: new Date().toLocaleDateString() }),
      effectiveDate: t('legal.terms.effectiveDate', { date: new Date().toLocaleDateString() })
    };
  };

  // Get execution requirements
  const getExecutionRequirements = (jurisdiction: string) => {
    return {
      witnessRequirements: t('legal.executionRequirements.witnessRequirements', { jurisdiction }),
      notaryRequirements: t('wills.executionRequirements.notaryRequirements'),
      signingInstructions: t('wills.executionRequirements.signingInstructions'),
      storageGuidelines: t('wills.executionRequirements.storageGuidelines'),
      legalCompliance: t('wills.executionRequirements.legalCompliance')
    };
  };

  return {
    // Email functions
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendTaskReminder,
    sendDocumentExpiryNotification,
    sendSecurityAlert,
    sendSubscriptionNotification,
    sendFamilyInvitation,

    // SMS functions
    sendSecurityCode,
    sendLoginAlert,
    sendEmergencyAccessNotification,
    sendCriticalReminder,

    // Legal functions
    getLegalDisclaimers,
    getComplianceInfo,
    getTermsAndConditions,
    getExecutionRequirements,

    // Translation function
    t
  };
}; 