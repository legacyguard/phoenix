import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    metadata?: any;
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
  const user = await supabase.from('users').select('id, possessions (type, value), trustedPeople (name, preparednessScore), user_profiles (ai_feature_toggles)').eq('id', userId).single();
 
  if (!user.data) return;

  const userData = user.data;
 
  if (!userData.user_profiles?.ai_feature_toggles?.behavioralNudges) return; // Skip if user has disabled behavioral nudges

  // Nudge 1: Social Proof
  const hasLifeInsurance = userData.possessions.some((p: any) => p.type === 'life_insurance');
  if (!hasLifeInsurance) {
    await createNotification(userId, {
      type: 'nudge_social_proof',
      message: "Did you know? 85% of fathers in their 40s have life insurance to protect their family's financial future.",
      urgency: 'low',
    });
  }

  // Nudge 2: Loss Aversion
  const hasWill = userData.possessions.some((p: any) => p.type === 'will_or_trust');
  const totalAssetValue = userData.possessions.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
  if (totalAssetValue > 50000 && !hasWill) {
    await createNotification(userId, {
      type: 'nudge_loss_aversion',
      message: "Without clear instructions, a significant portion of your assets could be lost to legal fees or taxes. Secure your legacy by outlining your wishes.",
      urgency: 'medium',
    });
  }

  // Nudge 3: Progress Momentum
  const preparednessScore = calculateOverallPreparedness(userData);
  if (preparednessScore > 70 && preparednessScore < 95) {
    await createNotification(userId, {
      type: 'nudge_progress_momentum',
      message: `You're ${preparednessScore}% of the way to complete peace of mind! You are just a few small steps away from being fully prepared.`,
      urgency: 'low',
    });
  }

  // Nudge 4: Commitment & Consistency
  const unpreparedPerson = userData.trustedPeople.find((p: any) => p.preparednessScore < 50);
  if (unpreparedPerson) {
    await createNotification(userId, {
      type: 'nudge_commitment',
      message: `You've identified ${unpreparedPerson.name} as a trusted person. Take the next step to ensure they are fully prepared for their responsibilities.`,
      urgency: 'medium',
    });
  }
}

async function createNotification(userId: string, { type, message, urgency }: { type: string; message: string; urgency: 'low' | 'medium' | 'high' }) {
  const { data: recentNotifications } = await supabase
    .from('notifications')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1);

  // Check if a similar nudge was sent recently (within 14 days)
  if (recentNotifications && recentNotifications.length > 0) {
    const lastNotificationDate = new Date(recentNotifications[0].created_at);
    const dateDiff = (new Date().getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24);
    if (dateDiff < 14) return;
  }

  // Insert the new nudge notification
  await supabase.from('notifications').insert([
    {
      user_id: userId,
      type,
      title: `Behavioral Nudge: ${type.replace('_', ' ')}`,
      message,
      urgency,
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);
}

function calculateOverallPreparedness(userData: any) {
  // Dummy implementation; you should replace this with actual logic based on your data
  return Math.floor(Math.random() * (95 - 70) + 70);
}
