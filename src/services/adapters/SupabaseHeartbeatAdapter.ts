import type { HeartbeatAdapter } from "@/services/HeartbeatService";

export class SupabaseHeartbeatAdapter implements HeartbeatAdapter {
  private client: any;
  private userId: string;
  constructor(supabaseClient: any, userId: string) {
    this.client = supabaseClient;
    this.userId = userId;
  }

  async touch(source: 'web' | 'mobile'): Promise<void> {
    const touchedAt = new Date().toISOString();
    await this.client.from('heartbeat_events').insert({ user_id: this.userId, source, touched_at: touchedAt });
  }

  async getLast(): Promise<{ ts: number; source: 'web' | 'mobile'; tzOffset?: number } | null> {
    const { data, error } = await this.client
      .from('heartbeat_events')
      .select('source, touched_at')
      .eq('user_id', this.userId)
      .order('touched_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    if (!data) return null;
    return { ts: new Date(data.touched_at).getTime(), source: data.source } as any;
  }
}


