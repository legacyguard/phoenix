// src/lib/pushNotificationSender.ts

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Initialize web-push with VAPID details
const vapidDetails = {
  subject: `mailto:${process.env.VAPID_EMAIL || 'support@legacyguard.com'}`,
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

webpush.setVapidDetails(
  vapidDetails.subject,
  vapidDetails.publicKey,
  vapidDetails.privateKey
);

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
}

export class PushNotificationSender {
  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      // Get user's push subscriptions
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching push subscriptions:', error);
        return;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      // Send notification to all user's devices
      const sendPromises = subscriptions.map(sub => 
        this.sendNotification(sub, payload)
      );

      await Promise.allSettled(sendPromises);
    } catch (error) {
      console.error('Error sending push notification to user:', error);
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<void> {
    const sendPromises = userIds.map(userId => this.sendToUser(userId, payload));
    await Promise.allSettled(sendPromises);
  }

  /**
   * Send notification to a specific subscription
   */
  private async sendNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: NotificationPayload
  ): Promise<void> {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const notificationPayload = JSON.stringify({
      ...payload,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      timestamp: Date.now(),
    });

    try {
      await webpush.sendNotification(pushSubscription, notificationPayload);
      console.log(`Notification sent to ${subscription.endpoint}`);
    } catch (error: Record<string, unknown>) {
      console.error(`Failed to send notification to ${subscription.endpoint}:`, error);
      
      // If subscription is invalid, remove it
      if (error.statusCode === 410) {
        await this.removeInvalidSubscription(subscription.endpoint);
      }
    }
  }

  /**
   * Remove invalid subscription from database
   */
  private async removeInvalidSubscription(endpoint: string): Promise<void> {
    try {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);
      
      console.log(`Removed invalid subscription: ${endpoint}`);
    } catch (error) {
      console.error('Error removing invalid subscription:', error);
    }
  }

  /**
   * Send critical notification templates
   */
  async sendDocumentExpiryNotification(
    userId: string,
    documentName: string,
    daysUntilExpiry: number
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Document Expiring Soon',
      body: `Your ${documentName} expires in ${daysUntilExpiry} days. Tap to update it now.`,
      tag: `doc-expiry-${documentName}`,
      data: {
        type: 'document_expiry',
        documentName,
        daysUntilExpiry,
        url: '/documents',
      },
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Update Now',
        },
        {
          action: 'remind-later',
          title: 'Remind Later',
        },
      ],
    };

    await this.sendToUser(userId, payload);
  }

  async sendEmergencyAccessNotification(
    userId: string,
    accessorName: string
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Emergency Access Activated',
      body: `${accessorName} has activated emergency access to your information.`,
      tag: 'emergency-access',
      data: {
        type: 'emergency_access',
        accessorName,
        url: '/activity',
      },
      requireInteraction: true,
    };

    await this.sendToUser(userId, payload);
  }

  async sendInactivityReminder(
    userId: string,
    daysSinceLastLogin: number
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Check Your Family Preparedness',
      body: `It's been ${daysSinceLastLogin} days since your last check-in. Make sure your family information is up to date.`,
      tag: 'inactivity-reminder',
      data: {
        type: 'inactivity_reminder',
        daysSinceLastLogin,
        url: '/dashboard',
      },
      actions: [
        {
          action: 'check-now',
          title: 'Check Now',
        },
      ],
    };

    await this.sendToUser(userId, payload);
  }
}

export const pushNotificationSender = new PushNotificationSender();
