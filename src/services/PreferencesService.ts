export type AppPreferences = {
  nudgesEnabled: boolean;
  expirationBannerEnabled: boolean;
  completionToastEnabled: boolean;
  metadataToastsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // 'HH:MM'
  quietHoursEnd: string;   // 'HH:MM'
  remindersEnabled: boolean;      // in-app task reminders
  dailyDigestEnabled: boolean;    // future use
  dailyDigestTime: string;        // 'HH:MM'
  deadManSwitchEnabled: boolean;
  inactivityDays: number;
  inactivityGraceHours: number;
  heartbeatAdapterType: 'local' | 'supabase';
  // sync flags
  cloudSyncEnabled: boolean;
  syncTasks: boolean;
  syncDocuments: boolean;
  syncReminders: boolean;
  syncPreferences: boolean;
};

const STORAGE_KEY = "appPreferences";

const DEFAULT_PREFERENCES: AppPreferences = {
  nudgesEnabled: true,
  expirationBannerEnabled: true,
  completionToastEnabled: true,
  metadataToastsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  remindersEnabled: true,
  dailyDigestEnabled: false,
  dailyDigestTime: '09:00',
  deadManSwitchEnabled: false,
  inactivityDays: 30,
  inactivityGraceHours: 12,
  heartbeatAdapterType: 'local',
  cloudSyncEnabled: false,
  syncTasks: false,
  syncDocuments: false,
  syncReminders: false,
  syncPreferences: false,
};

function readStored(): Partial<AppPreferences> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppPreferences>;
  } catch {
    return null;
  }
}

function persist(prefs: AppPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export const PreferencesService = {
  get(): AppPreferences {
    // Try encrypted first
    try {
      const readSecure = (window as any).___readPrefsSecureFirst as undefined | (() => Promise<Partial<AppPreferences> | null>);
      if (readSecure) {
        // no-op, legacy hook placeholder
      }
    } catch {}

    // Async secure read without breaking existing sync API:
    // We'll perform a one-time async merge in background to keep UI responsive, then persist.
    (async () => {
      try {
        const { readDecrypted } = await import('@/services/SecureReadHelper');
        const dec = await readDecrypted<AppPreferences>('preferences', 'app');
        if (dec) {
          const merged: AppPreferences = { ...DEFAULT_PREFERENCES, ...dec };
          persist(merged);
        }
      } catch {}
    })();

    // Return legacy merged immediately
    const stored = readStored() || {};
    const merged: AppPreferences = {
      ...DEFAULT_PREFERENCES,
      ...stored,
    };
    persist(merged);
    return merged;
  },

  set(p: Partial<AppPreferences>): AppPreferences {
    const current = this.get();
    const updated: AppPreferences = { ...current, ...p };
    persist(updated);
    // Optional encrypted sync of preferences themselves
    (async () => {
      try {
        const nowIso = new Date().toISOString();
        const { DeviceService } = await import('@/services/DeviceService');
        const { APP_VERSION } = await import('@/utils/appVersion');
        const { EncryptionService } = await import('@/services/EncryptionService');
        const { LocalDataAdapter } = await import('@/services/LocalDataAdapter');
        const { CloudSyncAdapter } = await import('@/services/CloudSyncAdapter');
        const { supabaseHelpers } = await import('@/utils/supabaseWithRetry');
        const { AuditLogService } = await import('@/services/AuditLogService');

        const deviceId = DeviceService.getOrCreateDeviceId();
        const tzOffset = new Date().getTimezoneOffset() * -1;
        const payload = {
          version: 1,
          category: 'preferences' as const,
          data: updated,
          meta: {
            createdAt: nowIso,
            updatedAt: nowIso,
            tzOffset,
            deviceId,
            appVersion: APP_VERSION,
          },
        };
        AuditLogService.logEvent({ id: String(Date.now()), type: 'update', category: 'preferences', key: 'app', ts: nowIso });
        const enc = await EncryptionService.encryptObject(payload);
        LocalDataAdapter.saveEncrypted('preferences', 'app', enc);

        const currentPrefs = updated;
        if (currentPrefs.cloudSyncEnabled && currentPrefs.syncPreferences) {
          const user = await supabaseHelpers.getCurrentUser();
          const userId = (user && (user as any).id) || null;
          if (userId) {
            await CloudSyncAdapter.upsertEncrypted(userId, 'preferences', 'app', enc);
            AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category: 'preferences', key: 'app', ts: new Date().toISOString() });
            const { CloudSyncService } = await import('@/services/CloudSyncService');
            CloudSyncService.schedule('preferences', 5000);
          }
        }
      } catch {/* ignore */}
    })();
    return updated;
  },

  setSyncFlags(patch: Partial<Pick<AppPreferences, 'cloudSyncEnabled' | 'syncTasks' | 'syncDocuments' | 'syncReminders' | 'syncPreferences'>>): AppPreferences {
    const current = this.get();
    const updatedAttempt: AppPreferences = { ...current, ...patch } as AppPreferences;
    // Gate cloud sync by passphrase presence
    try {
      const { KeyService } = require('@/services/KeyService');
      if (!KeyService.hasPassphrase()) {
        updatedAttempt.cloudSyncEnabled = false;
        updatedAttempt.syncTasks = false;
        updatedAttempt.syncDocuments = false;
        updatedAttempt.syncReminders = false;
        updatedAttempt.syncPreferences = false;
      }
    } catch {}
    const updated = updatedAttempt;
    persist(updated);
    // Persist/sync preferences as well
    this.set({});
    return updated;
  },
};


