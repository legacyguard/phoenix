export interface HeartbeatAdapter {
  touch(source: 'web' | 'mobile'): Promise<void>;
  getLast(): Promise<{ ts: number; source: 'web' | 'mobile'; tzOffset?: number } | null>;
}

class LocalStorageHeartbeatAdapter implements HeartbeatAdapter {
  private KEY = 'lastActiveAt_v1';
  async touch(source: 'web' | 'mobile'): Promise<void> {
    localStorage.setItem(this.KEY, JSON.stringify({ ts: Date.now(), source, tzOffset: new Date().getTimezoneOffset() }));
  }
  async getLast(): Promise<{ ts: number; source: 'web' | 'mobile'; tzOffset?: number } | null> {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
}

// TODO: SupabaseHeartbeatAdapter for cross-device presence
// class SupabaseHeartbeatAdapter implements HeartbeatAdapter { /* ... */ }

let adapter: HeartbeatAdapter = new LocalStorageHeartbeatAdapter();

let lastPersistMs = 0;
let pendingTimer: number | null = null;
const DEBOUNCE_MS = 5000; // 5s

export const HeartbeatService = {
  setAdapter(newAdapter: HeartbeatAdapter) {
    adapter = newAdapter;
  },
  touch(source: 'web' | 'mobile' = 'web') {
    const now = Date.now();
    const elapsed = now - lastPersistMs;
    const exec = async () => {
      lastPersistMs = Date.now();
      if (pendingTimer) { window.clearTimeout(pendingTimer); pendingTimer = null; }
      await adapter.touch(source);
    };
    if (elapsed >= DEBOUNCE_MS) {
      exec();
    } else {
      const remaining = DEBOUNCE_MS - elapsed;
      if (pendingTimer) window.clearTimeout(pendingTimer);
      pendingTimer = window.setTimeout(exec, remaining);
    }
  },
  getLast: () => adapter.getLast(),
};


