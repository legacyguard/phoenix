/**
 * Expiration Intelligence Service
 * 
 * This service provides proactive monitoring and notification capabilities for document
 * expiration dates. It helps users stay ahead of critical deadlines by:
 * 
 * 1. Scanning all documents with expiration dates
 * 2. Calculating time remaining until expiration
 * 3. Generating contextual notifications based on urgency
 * 4. Providing actionable recommendations for renewal
 * 
 * The service uses a tiered notification system:
 * - 90+ days: Informational reminders
 * - 30-90 days: Warning notifications with renewal suggestions
 * - 7-30 days: Urgent notifications with specific actions
 * - <7 days or expired: Critical alerts requiring immediate attention
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

export interface ExpirationNotification {
  userId: string;
  documentId: string;
  documentTitle: string;
  documentCategory: string;
  expirationDate: Date;
  daysUntilExpiration: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  actionRequired: string;
}

export class ExpirationIntelligenceService {
  private readonly NINETY_DAYS = 90;
  private readonly THIRTY_DAYS = 30;
  private readonly SEVEN_DAYS = 7;

  async checkExpiringDocuments(): Promise<ExpirationNotification[]> {
    try {
      // Get all documents with expiration dates
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          category,
          metadata,
          user_id,
          created_at,
          user_profiles (ai_feature_toggles)
        `)
        .not('metadata->expirationDate', 'is', null)
        .eq('user_profiles->ai_feature_toggles->expirationIntelligence', true);

      if (error) throw error;

      const notifications: ExpirationNotification[] = [];
      const today = new Date();

      for (const doc of documents || []) {
        const expirationDate = new Date(doc.metadata?.expirationDate);
        const daysUntilExpiration = this.calculateDaysUntilExpiration(expirationDate, today);
        
        const notification = this.createNotificationForDocument(
          doc,
          expirationDate,
          daysUntilExpiration
        );

        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking expiring documents:', error);
      throw error;
    }
  }

  private calculateDaysUntilExpiration(expirationDate: Date, today: Date): number {
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private createNotificationForDocument(
    doc: Record<string, unknown>,
    expirationDate: Date,
    daysUntilExpiration: number
  ): ExpirationNotification | null {
    // Skip if expiration is more than 90 days away
    if (daysUntilExpiration > this.NINETY_DAYS) {
      return null;
    }

    const baseNotification = {
      userId: doc.user_id,
      documentId: doc.id,
      documentTitle: doc.title,
      documentCategory: doc.category,
      expirationDate,
      daysUntilExpiration,
    };

    // Document has expired
    if (daysUntilExpiration < 0) {
      return {
        ...baseNotification,
        severity: 'critical',
        message: this.getCriticalMessage(doc.category, doc.title),
        actionRequired: 'Immediate renewal required',
      };
    }

    // Expires within 7 days
    if (daysUntilExpiration <= this.SEVEN_DAYS) {
      return {
        ...baseNotification,
        severity: 'critical',
        message: this.getUrgentMessage(doc.category, doc.title, daysUntilExpiration),
        actionRequired: 'Urgent renewal needed',
      };
    }

    // Expires within 30 days
    if (daysUntilExpiration <= this.THIRTY_DAYS) {
      return {
        ...baseNotification,
        severity: 'warning',
        message: this.getWarningMessage(doc.category, doc.title, daysUntilExpiration),
        actionRequired: 'Schedule renewal soon',
      };
    }

    // Expires within 90 days
    return {
      ...baseNotification,
      severity: 'info',
      message: this.getInfoMessage(doc.category, doc.title, daysUntilExpiration),
      actionRequired: 'Plan for renewal',
    };
  }

  private getCriticalMessage(category: string, title: string): string {
    const messages: Record<string, string> = {
      insurance: `CRITICAL: Your ${title} has expired. Your family is no longer covered by this policy. Take action immediately.`,
      identification: `CRITICAL: Your ${title} has expired. This may affect your legal status and ability to travel.`,
      financial: `CRITICAL: Your ${title} has expired. This may impact your financial security and access to funds.`,
      medical: `CRITICAL: Your ${title} has expired. Update immediately to ensure continued medical care.`,
      legal: `CRITICAL: Your ${title} has expired. This document may no longer be legally valid.`,
      default: `CRITICAL: Your ${title} has expired. Immediate action required to maintain your family's protection.`,
    };

    return messages[category] || messages.default;
  }

  private getUrgentMessage(category: string, title: string, days: number): string {
    const daysText = days === 1 ? 'tomorrow' : `in ${days} days`;
    
    const messages: Record<string, string> = {
      insurance: `URGENT: Your ${title} expires ${daysText}. Renew now to avoid coverage gaps.`,
      identification: `URGENT: Your ${title} expires ${daysText}. Start renewal immediately to avoid complications.`,
      financial: `URGENT: Your ${title} expires ${daysText}. Act now to prevent financial disruption.`,
      medical: `URGENT: Your ${title} expires ${daysText}. Renew to maintain healthcare coverage.`,
      legal: `URGENT: Your ${title} expires ${daysText}. Update to keep this document legally valid.`,
      default: `URGENT: Your ${title} expires ${daysText}. Take action now to protect your family.`,
    };

    return messages[category] || messages.default;
  }

  private getWarningMessage(category: string, title: string, days: number): string {
    const messages: Record<string, string> = {
      insurance: `Warning: Your ${title} expires in ${days} days. Renew soon to ensure continuous coverage for your family.`,
      identification: `Warning: Your ${title} expires in ${days} days. Schedule renewal to avoid travel or legal issues.`,
      financial: `Warning: Your ${title} expires in ${days} days. Update to maintain financial security.`,
      medical: `Warning: Your ${title} expires in ${days} days. Renew to keep healthcare benefits active.`,
      legal: `Warning: Your ${title} expires in ${days} days. Review and update as needed.`,
      default: `Warning: Your ${title} expires in ${days} days. Plan renewal to keep your family protected.`,
    };

    return messages[category] || messages.default;
  }

  private getInfoMessage(category: string, title: string, days: number): string {
    const monthsText = days > 60 ? '3 months' : `${days} days`;
    
    const messages: Record<string, string> = {
      insurance: `Info: Your ${title} expires in ${monthsText}. It's a good time to review your coverage and start the renewal process.`,
      identification: `Info: Your ${title} expires in ${monthsText}. Consider starting the renewal process early to avoid rush fees.`,
      financial: `Info: Your ${title} expires in ${monthsText}. Review terms and prepare for renewal.`,
      medical: `Info: Your ${title} expires in ${monthsText}. Check if any updates to coverage are needed.`,
      legal: `Info: Your ${title} expires in ${monthsText}. Review document validity and prepare updates.`,
      default: `Info: Your ${title} expires in ${monthsText}. Planning ahead keeps your family secure.`,
    };

    return messages[category] || messages.default;
  }

  async saveNotifications(notifications: ExpirationNotification[]): Promise<void> {
    try {
      for (const notification of notifications) {
        // Check if notification already exists for this document and severity
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', notification.userId)
          .eq('document_id', notification.documentId)
          .eq('severity', notification.severity)
          .eq('is_read', false)
          .single();

        // Only create new notification if one doesn't already exist
        if (!existing) {
          const { error } = await supabase
            .from('notifications')
            .insert({
              user_id: notification.userId,
              document_id: notification.documentId,
              type: 'document_expiration',
              severity: notification.severity,
              title: `Document Expiring: ${notification.documentTitle}`,
              message: notification.message,
              action_required: notification.actionRequired,
              metadata: {
                expirationDate: notification.expirationDate.toISOString(),
                daysUntilExpiration: notification.daysUntilExpiration,
                documentCategory: notification.documentCategory,
              },
              is_read: false,
              created_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Error saving notification:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in saveNotifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .in('severity', ['warning', 'critical']);

    if (error) {
      console.error('Error getting unread notifications count:', error);
      return 0;
    }

    return count || 0;
  }

  async getUserNotifications(userId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        documents (
          id,
          title,
          category,
          metadata
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('severity', { ascending: false });

    if (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }

    return data || [];
  }
}

export const expirationIntelligence = new ExpirationIntelligenceService();
