import { supabase } from '@/lib/supabase';
import type { WillSyncLog, WillChanges } from '@/types/willSync';

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

class WillNotificationService {
  private emailEndpoint = process.env.NEXT_PUBLIC_EMAIL_SERVICE_ENDPOINT || '';
  private emailApiKey = process.env.EMAIL_SERVICE_API_KEY || '';

  // Send email notification for will sync events
  async sendWillSyncNotification(
    userId: string,
    syncLog: WillSyncLog,
    recipientEmail: string
  ): Promise<boolean> {
    const template = this.getWillSyncEmailTemplate(syncLog);
    
    try {
      const response = await fetch(this.emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.emailApiKey}`
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          tags: ['will-sync', syncLog.trigger_event]
        })
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
        return false;
      }

      // Log email sent
      await this.logEmailSent(userId, syncLog.id, 'will_sync_notification');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send approval required notification
  async sendApprovalRequiredNotification(
    userId: string,
    syncLog: WillSyncLog,
    recipientEmail: string,
    approvalUrl: string
  ): Promise<boolean> {
    const template = this.getApprovalRequiredTemplate(syncLog, approvalUrl);
    
    try {
      const response = await fetch(this.emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.emailApiKey}`
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          tags: ['will-sync', 'approval-required']
        })
      });

      if (!response.ok) {
        console.error('Failed to send approval email:', await response.text());
        return false;
      }

      await this.logEmailSent(userId, syncLog.id, 'approval_required');
      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  }

  // Generate email template for will sync notification
  private getWillSyncEmailTemplate(syncLog: WillSyncLog): EmailTemplate {
    const changesSummary = this.formatChangesSummary(syncLog.changes_made);
    
    return {
      subject: `Your Will Has Been Updated - ${this.getTriggerEventTitle(syncLog.trigger_event)}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .changes { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Your Will Has Been Automatically Updated</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your will has been automatically updated based on recent changes to your estate planning information.</p>
              
              <div class="changes">
                <h3>What Changed:</h3>
                ${changesSummary}
              </div>
              
              <p>This update was triggered by: <strong>${this.getTriggerEventTitle(syncLog.trigger_event)}</strong></p>
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/wills/history" class="button">
                  View Will History
                </a>
              </p>
              
              <p>If you have any questions about these changes, please contact our support team.</p>
              
              <p>Best regards,<br>The LegacyGuard Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Your Will Has Been Automatically Updated
        
        Your will has been automatically updated based on recent changes to your estate planning information.
        
        What Changed:
        ${this.formatChangesSummaryText(syncLog.changes_made)}
        
        This update was triggered by: ${this.getTriggerEventTitle(syncLog.trigger_event)}
        
        View your will history at: ${process.env.NEXT_PUBLIC_APP_URL}/wills/history
        
        If you have any questions about these changes, please contact our support team.
        
        Best regards,
        The LegacyGuard Team
      `
    };
  }

  // Generate email template for approval required
  private getApprovalRequiredTemplate(syncLog: WillSyncLog, approvalUrl: string): EmailTemplate {
    const changesSummary = this.formatChangesSummary(syncLog.changes_made);
    
    return {
      subject: 'Will Update Requires Your Approval',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .changes { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .buttons { margin: 20px 0; }
            .button { display: inline-block; padding: 10px 20px; margin-right: 10px; text-decoration: none; border-radius: 4px; }
            .approve { background-color: #10b981; color: white; }
            .review { background-color: #6b7280; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Your Approval is Required</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A will update has been triggered that requires your approval before it can be applied.</p>
              
              <div class="changes">
                <h3>Proposed Changes:</h3>
                ${changesSummary}
              </div>
              
              <p>This update was triggered by: <strong>${this.getTriggerEventTitle(syncLog.trigger_event)}</strong></p>
              
              <div class="buttons">
                <a href="${approvalUrl}?action=approve" class="button approve">
                  Approve Changes
                </a>
                <a href="${approvalUrl}?action=review" class="button review">
                  Review in Detail
                </a>
              </div>
              
              <p>If you don't take action, these changes will remain pending and will not be applied to your will.</p>
              
              <p>Best regards,<br>The LegacyGuard Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Your Approval is Required
        
        A will update has been triggered that requires your approval before it can be applied.
        
        Proposed Changes:
        ${this.formatChangesSummaryText(syncLog.changes_made)}
        
        This update was triggered by: ${this.getTriggerEventTitle(syncLog.trigger_event)}
        
        Review and approve changes at: ${approvalUrl}
        
        If you don't take action, these changes will remain pending and will not be applied to your will.
        
        Best regards,
        The LegacyGuard Team
      `
    };
  }

  // Format changes summary for HTML
  private formatChangesSummary(changes: WillChanges): string {
    const items: string[] = [];

    if (changes.added?.assets?.length) {
      items.push(`<li><strong>Assets Added:</strong> ${changes.added.assets.map(a => a.name).join(', ')}</li>`);
    }
    if (changes.removed?.beneficiaries?.length) {
      items.push(`<li><strong>Beneficiaries Removed:</strong> ${changes.removed.beneficiaries.map(b => b.name).join(', ')}</li>`);
    }
    if (changes.modified?.allocations?.length) {
      changes.modified.allocations.forEach(alloc => {
        items.push(`<li><strong>Allocation Changed:</strong> ${alloc.beneficiary_name} from ${alloc.old_percentage}% to ${alloc.new_percentage}%</li>`);
      });
    }

    return items.length > 0 ? `<ul>${items.join('')}</ul>` : '<p>No specific changes recorded.</p>';
  }

  // Format changes summary for text
  private formatChangesSummaryText(changes: WillChanges): string {
    const items: string[] = [];

    if (changes.added?.assets?.length) {
      items.push(`- Assets Added: ${changes.added.assets.map(a => a.name).join(', ')}`);
    }
    if (changes.removed?.beneficiaries?.length) {
      items.push(`- Beneficiaries Removed: ${changes.removed.beneficiaries.map(b => b.name).join(', ')}`);
    }
    if (changes.modified?.allocations?.length) {
      changes.modified.allocations.forEach(alloc => {
        items.push(`- Allocation Changed: ${alloc.beneficiary_name} from ${alloc.old_percentage}% to ${alloc.new_percentage}%`);
      });
    }

    return items.length > 0 ? items.join('\n') : 'No specific changes recorded.';
  }

  // Get human-readable trigger event title
  private getTriggerEventTitle(event: string): string {
    const eventTitles: Record<string, string> = {
      asset_added: 'New Asset Added',
      asset_removed: 'Asset Removed',
      asset_value_changed: 'Asset Value Changed',
      beneficiary_added: 'New Beneficiary Added',
      beneficiary_removed: 'Beneficiary Removed',
      guardian_changed: 'Guardian Information Changed',
      executor_changed: 'Executor Information Changed'
    };

    return eventTitles[event] || event;
  }

  // Log email sent
  private async logEmailSent(userId: string, syncLogId: string, emailType: string): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          related_id: syncLogId,
          related_type: 'will_sync',
          email_type: emailType,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }
}

export const willNotificationService = new WillNotificationService();
