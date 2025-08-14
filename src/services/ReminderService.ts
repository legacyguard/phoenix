export type Reminder = {
  id: string;
  title: string;
  dueAt: string; // ISO
  repeat?: 'none' | 'weekly' | 'monthly';
  snoozedUntil?: string; // ISO
  createdAt: string; // ISO
};

const KEY = 'taskReminders_v1';

// Privacy-first: encrypted local storage + optional cloud sync (writes only; reads remain legacy for UX)
import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { EncryptionService, type SecurePayload, type EncryptedPayload } from '@/services/EncryptionService';
import { DeviceService } from '@/services/DeviceService';
import { APP_VERSION } from '@/utils/appVersion';
import { PreferencesService } from '@/services/PreferencesService';
import { CloudSyncAdapter } from '@/services/CloudSyncAdapter';
import { supabaseHelpers } from '@/utils/supabaseWithRetry';
import { AuditLogService } from '@/services/AuditLogService';
import { CloudSyncService } from '@/services/CloudSyncService';

export const ReminderService = {
  async listSecureFirst(): Promise<Reminder[]> {
    try {
      const keys = LocalDataAdapter.listKeys('reminders');
      if (Array.isArray(keys) && keys.length > 0) {
        const out: Reminder[] = [];
        for (const id of keys) {
          try {
            const item = await (await import('@/services/SecureReadHelper')).readDecrypted<Reminder>('reminders', id);
            if (item) out.push(item);
          } catch {}
        }
        return out;
      }
    } catch {}
    // fallback legacy
    return this.list();
  },
  list(): Reminder[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveAll(r: Reminder[]) {
    localStorage.setItem(KEY, JSON.stringify(r));
  },

  add(r: Omit<Reminder, 'id' | 'createdAt'>) {
    const all = ReminderService.list();
    const id = String(Date.now());
    const rec: Reminder = { id, createdAt: new Date().toISOString(), ...r };
    ReminderService.saveAll([...all, rec]);

    // Encrypted write + optional cloud sync
    (async () => {
      try {
        const deviceId = DeviceService.getOrCreateDeviceId();
        const tzOffset = new Date().getTimezoneOffset() * -1;
        const payload: SecurePayload<Reminder> = {
          version: 1,
          category: 'reminders',
          data: rec,
          meta: {
            createdAt: rec.createdAt,
            updatedAt: rec.createdAt,
            tzOffset,
            deviceId,
            appVersion: APP_VERSION,
          },
        };
        AuditLogService.logEvent({ id: String(Date.now()), type: 'create', category: 'reminders', key: id, ts: new Date().toISOString() });
        const enc: EncryptedPayload = await EncryptionService.encryptObject(payload);
        LocalDataAdapter.saveEncrypted('reminders', id, enc);

        const prefs = PreferencesService.get();
        if (prefs.cloudSyncEnabled && prefs.syncReminders) {
          const user = await supabaseHelpers.getCurrentUser();
          const userId = (user && (user as any).id) || null;
          if (userId) {
            await CloudSyncAdapter.upsertEncrypted(userId, 'reminders', id, enc);
            AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category: 'reminders', key: id, ts: new Date().toISOString() });
            CloudSyncService.schedule('reminders', 5000);
          }
        }
      } catch {}
    })();

    return rec;
  },

  update(id: string, patch: Partial<Reminder>) {
    let previous: Reminder | null = null;
    const all = ReminderService.list().map((x) => {
      if (x.id === id) { previous = x; return { ...x, ...patch }; }
      return x;
    });
    const updated = all.find((x) => x.id === id) || null;
    ReminderService.saveAll(all);

    // Encrypted write + optional cloud sync
    if (updated) {
      (async () => {
        try {
          const deviceId = DeviceService.getOrCreateDeviceId();
          const tzOffset = new Date().getTimezoneOffset() * -1;
          const nowIso = new Date().toISOString();
          const payload: SecurePayload<Reminder> = {
            version: 1,
            category: 'reminders',
            data: updated,
            meta: {
              createdAt: previous?.createdAt || updated.createdAt || nowIso,
              updatedAt: nowIso,
              tzOffset,
              deviceId,
              appVersion: APP_VERSION,
            },
          };
          AuditLogService.logEvent({ id: String(Date.now()), type: 'update', category: 'reminders', key: id, ts: nowIso });
          const enc: EncryptedPayload = await EncryptionService.encryptObject(payload);
          LocalDataAdapter.saveEncrypted('reminders', id, enc);

          const prefs = PreferencesService.get();
          if (prefs.cloudSyncEnabled && prefs.syncReminders) {
            const user = await supabaseHelpers.getCurrentUser();
            const userId = (user && (user as any).id) || null;
            if (userId) {
              await CloudSyncAdapter.upsertEncrypted(userId, 'reminders', id, enc);
              AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category: 'reminders', key: id, ts: new Date().toISOString() });
              CloudSyncService.schedule('reminders', 5000);
            }
          }
        } catch {}
      })();
    }
  },

  remove(id: string) {
    ReminderService.saveAll(ReminderService.list().filter((x) => x.id !== id));
    try { LocalDataAdapter.remove('reminders', id); } catch {}
    try { AuditLogService.logEvent({ id: String(Date.now()), type: 'delete', category: 'reminders', key: id, ts: new Date().toISOString() }); } catch {}
  },
};


