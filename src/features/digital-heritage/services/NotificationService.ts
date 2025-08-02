import { supabase } from '@/lib/supabase';

export interface NotificationPayload {
  recipient: string;
  subject: string;
  message: string;
  type: 'email' | 'sms' | 'push';
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface EmailNotification {
  to: string[];
  subject: string;
  body: string;
  template?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SMSNotification {
  to: string[];
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PushNotification {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export class NotificationService {
  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      // Queue email for sending
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'email',
          recipient: notification.to.join(','),
          subject: notification.subject,
          message: notification.body,
          priority: notification.priority,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to queue email: ${error.message}`);
      }

      console.log(`Email queued for ${notification.to.join(', ')}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendSMS(notification: SMSNotification): Promise<void> {
    try {
      // Queue SMS for sending
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'sms',
          recipient: notification.to.join(','),
          message: notification.message,
          priority: notification.priority,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to queue SMS: ${error.message}`);
      }

      console.log(`SMS queued for ${notification.to.join(', ')}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendPush(notification: PushNotification): Promise<void> {
    try {
      // Queue push notification for sending
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'push',
          recipient: notification.tokens.join(','),
          subject: notification.title,
          message: notification.body,
          metadata: notification.data,
          priority: notification.priority,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to queue push notification: ${error.message}`);
      }

      console.log(`Push notification queued for ${notification.tokens.length} tokens`);
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    switch (payload.type) {
      case 'email':
        await this.sendEmail({
          to: [payload.recipient],
          subject: payload.subject,
          body: payload.message,
          priority: payload.priority
        });
        break;
      case 'sms':
        await this.sendSMS({
          to: [payload.recipient],
          message: payload.message,
          priority: payload.priority
        });
        break;
      case 'push':
        await this.sendPush({
          tokens: [payload.recipient],
          title: payload.subject,
          body: payload.message,
          data: payload.metadata,
          priority: payload.priority
        });
        break;
      default:
        throw new Error(`Unsupported notification type: ${payload.type}`);
    }
  }

  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    const promises = notifications.map(notification => this.sendNotification(notification));
    await Promise.all(promises);
  }

  async getNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get notification history: ${error.message}`);
    }

    return data || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async sendDeadManSwitchAlert(
    userId: string,
    switchName: string,
    alertType: 'triggered' | 'expired' | 'warning'
  ): Promise<void> {
    const message = `Your dead man switch "${switchName}" has been ${alertType}. Please check your digital heritage settings.`;
    
    await this.sendNotification({
      recipient: userId,
      subject: `Digital Heritage Alert: ${switchName}`,
      message,
      type: 'email',
      priority: 'high'
    });
  }

  async sendEscalationAlert(
    recipients: string[],
    switchName: string,
    step: any
  ): Promise<void> {
    const message = `Escalation step triggered for dead man switch "${switchName}": ${step.message}`;
    
    await this.sendBulkNotifications(
      recipients.map(recipient => ({
        recipient,
        subject: `Digital Heritage Escalation: ${switchName}`,
        message,
        type: 'email',
        priority: 'high'
      }))
    );
  }

  async sendVerificationCode(
    recipient: string,
    code: string,
    type: 'email' | 'sms'
  ): Promise<void> {
    const message = `Your verification code is: ${code}. This code will expire in 15 minutes.`;
    
    await this.sendNotification({
      recipient,
      subject: 'Digital Heritage Verification',
      message,
      type,
      priority: 'high'
    });
  }
}

export const notificationService = new NotificationService();