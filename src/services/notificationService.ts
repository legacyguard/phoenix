import { useTranslation } from 'react-i18next';

interface NotificationData {
  userName?: string;
  documentName?: string;
  date?: string;
  count?: number;
  memberName?: string;
  location?: string;
  time?: string;
  days?: number;
  familyName?: string;
  code?: string;
  secureUrl?: string;
  loginUrl?: string;
  dashboardUrl?: string;
}

interface PushNotification {
  title: string;
  body: string;
  action: string;
  url?: string;
}

interface SMSNotification {
  message: string;
}

interface InAppNotification {
  title: string;
  message: string;
  action: string;
  url?: string;
}

export class NotificationService {
  private pushEndpoint = process.env.NEXT_PUBLIC_PUSH_SERVICE_ENDPOINT || '';
  private smsEndpoint = process.env.NEXT_PUBLIC_SMS_SERVICE_ENDPOINT || '';
  private pushApiKey = process.env.PUSH_SERVICE_API_KEY || '';
  private smsApiKey = process.env.SMS_SERVICE_API_KEY || '';

  // Send push notification
  async sendPushNotification(userId: string, type: string, data: NotificationData): Promise<boolean> {
    const notification = this.getPushNotificationContent(type, data);
    
    try {
      const response = await fetch(this.pushEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pushApiKey}`
        },
        body: JSON.stringify({
          userId,
          title: notification.title,
          body: notification.body,
          action: notification.action,
          url: notification.url,
          tags: ['push', type]
        })
      });

      if (!response.ok) {
        console.error('Failed to send push notification:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send SMS notification
  async sendSMSNotification(phoneNumber: string, type: string, data: NotificationData): Promise<boolean> {
    const notification = this.getSMSNotificationContent(type, data);
    
    try {
      const response = await fetch(this.smsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.smsApiKey}`
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: notification.message,
          tags: ['sms', type]
        })
      });

      if (!response.ok) {
        console.error('Failed to send SMS notification:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }

  // Send in-app notification
  async sendInAppNotification(userId: string, type: string, data: NotificationData): Promise<boolean> {
    const notification = this.getInAppNotificationContent(type, data);
    
    try {
      // Store notification in database for in-app display
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          title: notification.title,
          message: notification.message,
          action: notification.action,
          url: notification.url,
          type,
          tags: ['in-app', type]
        })
      });

      if (!response.ok) {
        console.error('Failed to send in-app notification:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  // Get push notification content using translations
  private getPushNotificationContent(type: string, data: NotificationData): PushNotification {
    // This would use the translation system
    // For now, returning hardcoded content that matches the translation structure
    switch(type) {
      case 'taskReminder':
        return {
          title: "Family Protection Reminder",
          body: `You have ${data.count} pending tasks to strengthen your family's protection plan.`,
          action: "Review Tasks",
          url: "/dashboard/tasks"
        };

      case 'documentExpiry':
        return {
          title: "Document Renewal Needed",
          body: `${data.documentName} expires on ${data.date}. Please review and update.`,
          action: "Update Document",
          url: "/documents"
        };

      case 'familyAccess':
        return {
          title: "Family Access Update",
          body: `${data.memberName} has been granted access to your family protection information.`,
          action: "Manage Access",
          url: "/family/access"
        };

      case 'securityAlert':
        return {
          title: "Security Alert",
          body: `New login detected from ${data.location}. If this wasn't you, secure your account immediately.`,
          action: "Review Activity",
          url: "/settings/security"
        };

      case 'willGenerated':
        return {
          title: "Will Document Ready",
          body: "Your will has been generated. Review execution requirements to make it legally binding.",
          action: "View Will",
          url: "/wills"
        };

      case 'paymentIssue':
        return {
          title: "Payment Issue",
          body: "We couldn't process your payment. Please update your payment method.",
          action: "Update Payment",
          url: "/subscription"
        };

      case 'trialExpiring':
        return {
          title: "Trial Ending Soon",
          body: `Your LegacyGuard trial expires in ${data.days} days. Choose a plan to continue protection.`,
          action: "View Plans",
          url: "/subscription"
        };

      default:
        return {
          title: "LegacyGuard Notification",
          body: "You have a new notification from LegacyGuard.",
          action: "View",
          url: "/dashboard"
        };
    }
  }

  // Get SMS notification content using translations
  private getSMSNotificationContent(type: string, data: NotificationData): SMSNotification {
    switch(type) {
      case 'securityCode':
        return {
          message: `Your LegacyGuard security code is: ${data.code}. This code expires in 10 minutes. Never share this code with anyone.`
        };

      case 'loginAlert':
        return {
          message: `LegacyGuard: New login detected from ${data.location} at ${data.time}. If this wasn't you, secure your account immediately: ${data.secureUrl}`
        };

      case 'emergencyAccess':
        return {
          message: `LegacyGuard: Emergency access has been activated for ${data.familyName}'s account. Login to view important information: ${data.loginUrl}`
        };

      case 'criticalReminder':
        return {
          message: `LegacyGuard: Important family protection tasks need your attention. Complete them when convenient: ${data.dashboardUrl}`
        };

      default:
        return {
          message: "LegacyGuard: You have a new notification. Please check your account."
        };
    }
  }

  // Get in-app notification content using translations
  private getInAppNotificationContent(type: string, data: NotificationData): InAppNotification {
    switch(type) {
      case 'welcome':
        return {
          title: "Welcome to LegacyGuard",
          message: "Let's start building your family protection plan. Begin with our 5-minute assessment.",
          action: "Start Assessment",
          url: "/onboarding/assessment"
        };

      case 'firstAsset':
        return {
          title: "Add Your First Asset",
          message: "Protect your family by documenting your most important asset.",
          action: "Add Asset",
          url: "/assets/add"
        };

      case 'inviteTrusted':
        return {
          title: "Invite Trusted Person",
          message: "Designate someone who can help your family during emergencies.",
          action: "Add Person",
          url: "/family/invite"
        };

      case 'createWill':
        return {
          title: "Create Your Will",
          message: "Generate a legally valid will based on your assets and wishes.",
          action: "Start Will",
          url: "/wills/create"
        };

      case 'reviewProgress':
        return {
          title: "Review Your Progress",
          message: "See how your family protection plan is developing.",
          action: "View Progress",
          url: "/dashboard/progress"
        };

      default:
        return {
          title: "LegacyGuard Notification",
          message: "You have a new notification from LegacyGuard.",
          action: "View",
          url: "/dashboard"
        };
    }
  }

  // Send multiple notification types
  async sendMultiChannelNotification(
    userId: string,
    phoneNumber: string,
    type: string,
    data: NotificationData,
    channels: ('push' | 'sms' | 'inApp')[] = ['push', 'inApp']
  ): Promise<{
    push: boolean;
    sms: boolean;
    inApp: boolean;
  }> {
    const results = {
      push: false,
      sms: false,
      inApp: false
    };

    const promises = [];

    if (channels.includes('push')) {
      promises.push(
        this.sendPushNotification(userId, type, data)
          .then(result => { results.push = result; })
      );
    }

    if (channels.includes('sms') && phoneNumber) {
      promises.push(
        this.sendSMSNotification(phoneNumber, type, data)
          .then(result => { results.sms = result; })
      );
    }

    if (channels.includes('inApp')) {
      promises.push(
        this.sendInAppNotification(userId, type, data)
          .then(result => { results.inApp = result; })
      );
    }

    await Promise.all(promises);
    return results;
  }

  // Send security code via SMS
  async sendSecurityCode(phoneNumber: string, code: string): Promise<boolean> {
    return this.sendSMSNotification(phoneNumber, 'securityCode', { code });
  }

  // Send login alert
  async sendLoginAlert(userId: string, phoneNumber: string, location: string, time: string): Promise<boolean> {
    const data = { location, time, secureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/security` };
    return this.sendSMSNotification(phoneNumber, 'loginAlert', data);
  }

  // Send emergency access notification
  async sendEmergencyAccessNotification(phoneNumber: string, familyName: string): Promise<boolean> {
    const data = { 
      familyName, 
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/emergency-access` 
    };
    return this.sendSMSNotification(phoneNumber, 'emergencyAccess', data);
  }

  // Send critical reminder
  async sendCriticalReminder(userId: string, phoneNumber: string): Promise<boolean> {
    const data = { dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` };
    return this.sendSMSNotification(phoneNumber, 'criticalReminder', data);
  }
}

// Export singleton instance
export const notificationService = new NotificationService(); 