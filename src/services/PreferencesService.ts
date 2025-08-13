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
    const stored = readStored() || {};
    // Merge with defaults to ensure all keys exist
    const merged: AppPreferences = {
      ...DEFAULT_PREFERENCES,
      ...stored,
    };
    // If stored was missing some keys, persist the merged state
    persist(merged);
    return merged;
  },

  set(p: Partial<AppPreferences>): AppPreferences {
    const current = this.get();
    const updated: AppPreferences = { ...current, ...p };
    persist(updated);
    return updated;
  },
};


