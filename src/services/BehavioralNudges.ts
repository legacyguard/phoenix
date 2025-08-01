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

export async function generateNudgesForUser(userId: string) {
  // Use the correct table names from the schema
  const assets = await supabase.from('assets').select('type, estimated_value').eq('user_id', userId);
  const guardians = await supabase.from('guardians').select('full_name, invitation_status').eq('user_id', userId);
  const wills = await supabase.from('wills').select('status').eq('user_id', userId);
 
  if (!assets.data || !guardians.data || !wills.data) return;

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
  const unpreparedGuardians = guardians.data.filter((g: { invitation_status?: string }) => g.invitation_status !== 'accepted');
  if (unpreparedGuardians.length > 0) {
    await createNotification(userId, {
      type: 'nudge_commitment',
      message: `You've identified ${unpreparedGuardians[0].full_name} as a guardian. Take the next step to ensure they are fully prepared for their responsibilities.`,
      urgency: 'medium',
    });
  }
}

async function createNotification(userId: string, { type, message, urgency }: { type: string; message: string; urgency: 'low' | 'medium' | 'high' }) {
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
    const notifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
    notifications.push({ userId, type, message, urgency, timestamp: new Date().toISOString() });
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  }
}

function calculateOverallPreparedness(userData: { assets?: unknown[]; guardians?: unknown[]; wills?: unknown[] }) {
  // Calculate based on available data
  let score = 0;
  
  if (userData.assets && userData.assets.length > 0) score += 30;
  if (userData.guardians && userData.guardians.length > 0) score += 30;
  if (userData.wills && userData.wills.length > 0) score += 40;
  
  return Math.min(score, 100);
}
