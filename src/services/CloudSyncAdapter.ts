import type { EncryptedPayload } from './EncryptionService';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { KeyService } from '@/services/KeyService';

type Category = 'tasks' | 'documents' | 'reminders' | 'preferences';

export const CloudSyncAdapter = {
  async upsertEncrypted(userId: string, category: Category, key: string, enc: EncryptedPayload): Promise<void> {
    // Gate by passphrase presence
    if (!KeyService.hasPassphrase()) {
      return; // cloud sync disabled if passphrase not set
    }
    const { error } = await supabaseWithRetry
      .from('encrypted_items')
      .upsert({
        user_id: userId,
        category,
        item_key: key,
        payload: enc,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    if (error) throw error;
  },

  async fetchEncrypted(userId: string, category: Category): Promise<Record<string, EncryptedPayload>> {
    const { data, error } = await supabaseWithRetry
      .from('encrypted_items')
      .select('item_key, payload')
      .eq('user_id', userId)
      .eq('category', category)
      .returns<Array<{ item_key: string; payload: EncryptedPayload }>>()
      .then((r: any) => r); // wrapper returns proxied result

    if (error) throw error;
    const result: Record<string, EncryptedPayload> = {};
    for (const row of (data || [])) {
      result[row.item_key] = row.payload;
    }
    return result;
  },
};


