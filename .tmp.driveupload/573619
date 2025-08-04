import { createClient } from '@supabase/supabase-js';

// Define the database types inline since the import path might be incorrect
interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          type: string;
          estimated_value?: number;
          user_id: string;
        };
      };
      guardians: {
        Row: {
          id: string;
          full_name: string;
          invitation_status?: string;
          user_id: string;
        };
      };
      wills: {
        Row: {
          id: string;
          status: string;
          user_id: string;
        };
      };
    };
  };
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserData {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  profile?: {
    age_range?: string;
    has_children?: boolean;
    marital_status?: string;
  };
  assets?: Array<{
    id: string;
    type: string;
    name: string;
    value?: number;
    category?: string;
  }>;
  documents?: Array<{
    id: string;
    type: string;
    category?: string;
    metadata?: Record<string, unknown>;
  }>;
  guardians?: Array<{
    id: string;
    name: string;
    email?: string;
    status?: string;
    playbook_status?: string;
  }>;
  will?: {
    id: string;
    status: string;
    last_updated?: string;
  };
}

export async function generateNudgesForUser(userId: string): Promise<void> {
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid userId provided to generateNudgesForUser');
    return;
  }

  try {
    // Use the correct table names from the schema
    const [assets, guardians, wills] = await Promise.all([
      supabase.from('assets').select('type, estimated_value').eq('user_id', userId),
      supabase.from('guardians').select('full_name, invitation_status').eq('user_id', userId),
      supabase.from('wills').select('status').eq('user_id', userId)
    ]);
   
    if (!assets.data || !guardians.data || !wills.data) {
      console.warn('No data found for user:', userId);
      return;
    }

    // Nudge 1: Social Proof
    const hasLifeInsurance = assets.data.some((a: { type: string }) => a.type === 'life_insurance');
    if (!hasLifeInsurance) {
      await createNotification(userId, {
        type: 'nudge_social_proof',
        message: "Did you know? 85% of fathers in their 40s have life insurance to protect their family's financial future.",
        urgency: 'low',
      });
    }

    // Nudge 2: Loss Aversion
    const hasWill = wills.data.length > 0;
    const totalAssetValue = assets.data.reduce((sum: number, a: { estimated_value?: number }) => sum + (a.estimated_value || 0), 0);
    if (totalAssetValue > 50000 && !hasWill) {
      await createNotification(userId, {
        type: 'nudge_loss_aversion',
        message: "Without clear instructions, a significant portion of your assets could be lost to legal fees or taxes. Secure your legacy by outlining your wishes.",
        urgency: 'medium',
      });
    }

    // Nudge 3: Progress Momentum
    const preparednessScore = calculateOverallPreparedness({ assets: assets.data, guardians: guardians.data, wills: wills.data });
    if (preparednessScore > 70 && preparednessScore < 95) {
      await createNotification(userId, {
        type: 'nudge_progress_momentum',
        message: `You're ${preparednessScore}% of the way to complete peace of mind! You are just a few small steps away from being fully prepared.`,
        urgency: 'low',
      });
    }

    // Nudge 4: Commitment & Consistency
    const unpreparedGuardians = guardians.data.filter((g: { invitation_status?: string; full_name: string }) => g.invitation_status !== 'accepted');
    if (unpreparedGuardians.length > 0) {
      await createNotification(userId, {
        type: 'nudge_commitment',
        message: `You've identified ${(unpreparedGuardians[0] as { full_name: string }).full_name} as a guardian. Take the next step to ensure they are fully prepared for their responsibilities.`,
        urgency: 'medium',
      });
    }
  } catch (error) {
    console.error('Error generating nudges for user:', userId, error);
    // In production, you might want to report this to an error tracking service
  }
}

async function createNotification(
  userId: string, 
  { type, message, urgency }: { type: string; message: string; urgency: 'low' | 'medium' | 'high' }
): Promise<void> {
  try {
    // Check if a similar nudge was sent recently (within 14 days)
    const recentNotifications = await checkRecentNotifications(userId, type);
    if (recentNotifications) {
      return; // Skip if recent notification exists
    }

    // TODO: Implement proper notification system
    // For now, we'll log the notification and could extend this to:
    // 1. Store in a notifications table (if created)
    // 2. Send email notifications
    // 3. Push notifications
    // 4. In-app notifications
    
    console.log('Notification created:', { 
      userId, 
      type, 
      message, 
      urgency, 
      timestamp: new Date().toISOString() 
    });
    
    // You could also store this in localStorage for client-side notifications
    if (typeof window !== 'undefined') {
      try {
        const existingNotifications = localStorage.getItem('user_notifications');
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        notifications.push({ userId, type, message, urgency, timestamp: new Date().toISOString() });
        localStorage.setItem('user_notifications', JSON.stringify(notifications));
      } catch (storageError) {
        console.warn('Failed to store notification in localStorage:', storageError);
      }
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

async function checkRecentNotifications(userId: string, type: string): Promise<boolean> {
  try {
    // Since notifications table doesn't exist, we'll use localStorage for client-side
    if (typeof window !== 'undefined') {
      const existingNotifications = localStorage.getItem('user_notifications');
      if (!existingNotifications) return false;
      
      const notifications = JSON.parse(existingNotifications);
      const userNotifications = notifications.filter(
        (n: Record<string, unknown>) => n.userId === userId && n.type === type
      );
      
      if (userNotifications.length > 0) {
        const lastNotification = userNotifications[userNotifications.length - 1] as Record<string, unknown>;
        const lastNotificationDate = new Date(lastNotification.timestamp as string);
        const dateDiff = (new Date().getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24);
        return dateDiff < 14; // Return true if notification was sent within 14 days
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking recent notifications:', error);
    return false;
  }
}

function calculateOverallPreparedness(userData: { assets?: unknown[]; guardians?: unknown[]; wills?: unknown[] }): number {
  // Calculate based on available data
  let score = 0;
  
  if (userData.assets && Array.isArray(userData.assets) && userData.assets.length > 0) score += 30;
  if (userData.guardians && Array.isArray(userData.guardians) && userData.guardians.length > 0) score += 30;
  if (userData.wills && Array.isArray(userData.wills) && userData.wills.length > 0) score += 40;
  
  return Math.min(score, 100);
}
