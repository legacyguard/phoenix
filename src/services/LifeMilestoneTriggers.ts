import { createClient } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

export class LifeMilestoneTriggers {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );
    }
  }

  async checkForAnnualReview(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('last_review_date, created_at')
        .eq('id', userId)
        .single();

      if (!profile) return false;

      const now = new Date();
      const lastReview = profile.last_review_date ? new Date(profile.last_review_date) : null;
      
      if (!lastReview) {
        // Never reviewed - check if account is older than 30 days
        const createdAt = new Date(profile.created_at);
        const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation > 30;
      }

      // Check if last review was more than 365 days ago
      const daysSinceReview = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview > 365;
    } catch (error) {
      console.error('Error checking annual review:', error);
      return false;
    }
  }

  async checkAndNotifyAnnualReview(userId: string): Promise<void> {
    const needsReview = await this.checkForAnnualReview(userId);
    if (needsReview) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (profile?.email) {
        await this.sendReviewNotification(userId, profile.email);
      }
    }
  }

  async sendReviewNotification(userId: string, email: string): Promise<void> {
    // Stub implementation for sending notification
    console.log(`Sending annual review notification to ${email} for user ${userId}`);
  }

  generateLifeEventChecklist(eventType: string): { items: Array<{ category: string; task: string }> } {
    const checklists: Record<string, Array<{ category: string; task: string }>> = {
      new_child: [
        { category: 'legal', task: 'Update will to name guardian for child' },
        { category: 'financial', task: 'Add child as beneficiary to accounts' },
        { category: 'documents', task: 'Obtain birth certificate' },
        { category: 'insurance', task: 'Update life insurance beneficiaries' },
        { category: 'healthcare', task: 'Add child to health insurance' },
      ],
      marriage: [
        { category: 'legal', task: 'Update will to include spouse' },
        { category: 'financial', task: 'Update joint account beneficiaries' },
        { category: 'insurance', task: 'Update insurance beneficiaries' },
        { category: 'documents', task: 'Update emergency contacts' },
      ],
      retirement: [
        { category: 'financial', task: 'Review pension and retirement accounts' },
        { category: 'healthcare', task: 'Enroll in Medicare' },
        { category: 'legal', task: 'Update power of attorney documents' },
        { category: 'insurance', task: 'Review life insurance needs' },
      ],
      new_job: [
        { category: 'financial', task: 'Enroll in 401k plan' },
        { category: 'insurance', task: 'Review health insurance options' },
        { category: 'benefits', task: 'Review life insurance benefits' },
        { category: 'documents', task: 'Update emergency contacts' },
      ],
      divorce: [
        { category: 'legal', task: 'Update will to remove ex-spouse' },
        { category: 'financial', task: 'Update account beneficiaries' },
        { category: 'access', task: 'Change shared passwords' },
        { category: 'insurance', task: 'Update insurance beneficiaries' },
      ],
    };

    return { items: checklists[eventType] || [] };
  }

  async saveLifeEventChecklist(userId: string, eventType: string): Promise<void> {
    const checklist = this.generateLifeEventChecklist(eventType);
    await this.supabase.from('life_event_checklists').insert({
      user_id: userId,
      event_type: eventType,
      checklist_items: checklist.items,
      created_at: new Date().toISOString(),
    });
  }

  async processLifeMilestones(userId: string) {
    const user = await this.supabase.from('users').select('id, dateOfBirth, googleOAuthToken, plaidAccessToken').eq('id', userId).single();
    if (!user.data) return;

    const userData = user.data;

    // Milestone 1: Birthday
    if (this.isBirthday(userData.dateOfBirth)) {
      await this.createNotification(userId, {
        type: 'milestone_birthday',
        message: "Happy Birthday! A new year is a great time for an annual review of your plan.",
        action: 'start_annual_review',
      });
    }

    // Milestone 2: Wedding
    const calendarEvents = await this.getCalendarEvents(userData.googleOAuthToken);
    if (this.detectWeddingOrAnniversary(calendarEvents)) {
      await this.createNotification(userId, {
        type: 'milestone_wedding',
        message: "Congratulations on your wedding! Remember to update your beneficiaries and will.",
        action: 'review_beneficiaries',
      });
    }

    // Milestone 3: Home Purchase
    const financialTransactions = await this.getFinancialData(userData.plaidAccessToken);
    if (this.detectHomePurchase(financialTransactions)) {
       await this.createNotification(userId, {
        type: 'milestone_home_purchase',
        message: "Congrats on your new home! Let's add the property to your possessions.",
        action: 'add_new_property',
      });
    }
  }

  private async createNotification(userId: string, { type, message, action }: { type: string; message: string; action: string }) {
    await this.supabase.from('notifications').insert([
      {
        user_id: userId,
        type,
        title: `Life Milestone: ${type.replace('_', ' ')}`,
        message,
        action,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  // Example utility function to check if today is the user's birthday
  private isBirthday(dateOfBirth: string): boolean {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  }

  private async getCalendarEvents(googleOAuthToken: string) {
    // Placeholder for Google Calendar API integration
    return [];
  }

  private detectWeddingOrAnniversary(events: Array<Record<string, unknown>>): boolean {
    // Placeholder for event detection logic
    return false;
  }

  private async getFinancialData(plaidAccessToken: string) {
    // Placeholder for Plaid API integration
    return [];
  }

  private detectHomePurchase(transactions: Array<Record<string, unknown>>): boolean {
    // Placeholder for home purchase detection
    return false;
  }
}
