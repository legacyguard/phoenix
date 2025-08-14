import { PreferencesService } from '@/services/PreferencesService';
import { CloudSyncAdapter } from '@/services/CloudSyncAdapter';
import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { EncryptionService, type EncryptedPayload } from '@/services/EncryptionService';
import { AuditLogService } from '@/services/AuditLogService';
import { supabaseHelpers } from '@/utils/supabaseWithRetry';
import { KeyService } from '@/services/KeyService';

type Category = 'reminders' | 'documents' | 'preferences';

const perCategoryTimers: Partial<Record<Category, number>> = {};

function isCategoryEnabled(prefs: ReturnType<typeof PreferencesService.get>, category: Category): boolean {
  if (!prefs.cloudSyncEnabled) return false;
  if (category === 'reminders') return !!prefs.syncReminders;
  if (category === 'documents') return !!prefs.syncDocuments;
  if (category === 'preferences') return !!prefs.syncPreferences;
  return false;
}

export const CloudSyncService = {
  schedule(category: Category, delayMs = 5000): void {
    if (perCategoryTimers[category]) window.clearTimeout(perCategoryTimers[category]);
    perCategoryTimers[category] = window.setTimeout(() => { this.syncCategory(category).catch(() => {}); }, delayMs);
  },

  async syncCategory(category: Category): Promise<void> {
    // Require passphrase set and unlocked (DEK available)
    if (!KeyService.hasPassphrase() || !KeyService.getDEK()) return;
    const prefs = PreferencesService.get();
    if (!isCategoryEnabled(prefs, category)) return;

    const user = await supabaseHelpers.getCurrentUser();
    const userId = (user && (user as any).id) || null;
    if (!userId) return;

    const remoteMap = await CloudSyncAdapter.fetchEncrypted(userId, category);
    const remoteKeys = Object.keys(remoteMap || {});

    for (const key of remoteKeys) {
      const remoteEnc = remoteMap[key] as EncryptedPayload;
      let remoteUpdatedAt = '';
      try {
        const remotePayload = await EncryptionService.decryptObject<any>(remoteEnc);
        remoteUpdatedAt = remotePayload?.meta?.updatedAt || '';
      } catch (e) {
        if ((e as Error)?.message === 'LOCKED') return; // cannot proceed locked
        continue; // skip corrupted remote item
      }

      const localEnc = LocalDataAdapter.loadEncrypted(category, key);
      if (!localEnc) {
        // bring remote to local
        LocalDataAdapter.saveEncrypted(category, key, remoteEnc);
        AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category, key, ts: new Date().toISOString(), details: { direction: 'remote->local' } });
        continue;
      }

      // both exist → compare updatedAt
      let localUpdatedAt = '';
      try {
        const localPayload = await EncryptionService.decryptObject<any>(localEnc);
        localUpdatedAt = localPayload?.meta?.updatedAt || '';
      } catch {
        // if local decrypt fails, prefer remote
        LocalDataAdapter.saveEncrypted(category, key, remoteEnc);
        AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category, key, ts: new Date().toISOString(), details: { direction: 'remote->local', reason: 'local_decrypt_failed' } });
        continue;
      }

      const r = Date.parse(remoteUpdatedAt || '');
      const l = Date.parse(localUpdatedAt || '');
      if (Number.isFinite(r) && Number.isFinite(l)) {
        if (r > l) {
          // remote newer → overwrite local
          LocalDataAdapter.saveEncrypted(category, key, remoteEnc);
          AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category, key, ts: new Date().toISOString(), details: { direction: 'remote->local' } });
        } else if (l > r) {
          // local newer → push to cloud
          await CloudSyncAdapter.upsertEncrypted(userId, category, key, localEnc);
          AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category, key, ts: new Date().toISOString(), details: { direction: 'local->remote' } });
        } else {
          // tie → prefer local, log tie
          AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category, key, ts: new Date().toISOString(), details: { tie: true } });
        }
      }
    }

    // Do not delete locally missing on remote for now
  },
};


