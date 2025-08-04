import { supabase } from '@/integrations/supabase/client';

interface LogActivityParams {
  userId: string;
  actor: 'USER' | 'AI_SYSTEM' | 'TRUSTED_PERSON';
  action: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  userId,
  actor,
  action,
  targetId,
  ipAddress,
  userAgent,
  metadata = {}
}: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from('access_logs').insert([
      {
        user_id: userId,
        actor,
        action,
        target_id: targetId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata
      }
    ]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
