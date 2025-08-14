import React, { useMemo, useState } from 'react';
import { PreferencesService, type AppPreferences } from '@/services/PreferencesService';
import { AuditLogService, type AuditEvent } from '@/services/AuditLogService';
import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { EncryptionService, type EncryptedPayload, type TSecurePayload } from '@/services/EncryptionService';
import { DeviceService } from '@/services/DeviceService';
import { APP_VERSION } from '@/utils/appVersion';
import { DebugService } from '@/services/DebugService';
import { CloudSyncService } from '@/services/CloudSyncService';
import { KeyService } from '@/services/KeyService';
import { LockGuard } from '@/services/LockGuard';

const MAX_LOGS = 50;

const SettingsPrivacy: React.FC = () => {
  const [prefs, setPrefs] = useState<AppPreferences>(PreferencesService.get());
  const [logs, setLogs] = useState<AuditEvent[]>(AuditLogService.list().slice(0, MAX_LOGS));

  const canSync = prefs.cloudSyncEnabled;
  const locked = KeyService.getDEK() == null;
  const passRequired = locked || !KeyService.hasPassphrase();

  const handleMasterToggle = (checked: boolean) => {
    const updated = PreferencesService.setSyncFlags({ cloudSyncEnabled: checked });
    setPrefs(updated);
  };

  const handleCategoryToggle = (key: keyof Pick<AppPreferences, 'syncTasks' | 'syncDocuments' | 'syncReminders' | 'syncPreferences'>, checked: boolean) => {
    const updated = PreferencesService.setSyncFlags({ [key]: checked } as any);
    setPrefs(updated);
  };

  const previewLogs = useMemo(() => logs.slice(0, MAX_LOGS), [logs]);

  async function exportAllLocalData() {
    // Gate: require unlocked DEK
    if (KeyService.getDEK() == null) {
      try { LockGuard.emitLockRequired(); } catch {}
      // wait until unlocked (best-effort, short polling)
      for (let i = 0; i < 60; i++) { // up to ~6s
        await new Promise((r) => setTimeout(r, 100));
        if (KeyService.getDEK() != null) break;
      }
      if (KeyService.getDEK() == null) return; // still locked; abort export politely
    }
    const categories: Array<TSecurePayload<unknown>['category']> = ['tasks', 'documents', 'reminders', 'preferences'];
    const result: Record<string, any> = {};
    for (const category of categories) {
      const keys = LocalDataAdapter.listKeys(category);
      const items: Record<string, unknown> = {};
      for (const k of keys) {
        const enc = LocalDataAdapter.loadEncrypted(category, k);
        if (!enc) continue;
        try {
          const dec = await EncryptionService.decryptObject(enc as EncryptedPayload);
          items[k] = dec.data;
        } catch {
          // skip corrupted entries
        }
      }
      result[category] = items;
    }

    // Filter out sensitive keys from localStorage (not included in export payload, but ensure cleanup visibility)
    try {
      const deny = new Set([
        'wrappedDEK_v1', 'kekSalt_v1', 'iterCount_v1', 'deviceId_v1', 'auditLog_v1', 'appPreferences', 'secure_migration_v1_done',
      ]);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith('heartbeat_')) continue;
        if (k.startsWith('nudgeBannerClosed_')) continue;
        if (deny.has(k)) continue;
        // nothing to do; export is strictly from encrypted indexes above
      }
    } catch {}

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legacyguard_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function wipeAllLocalData() {
    if (!confirm('Naozaj chcete vymazať všetky lokálne dáta?')) return;
    if (DebugService && typeof DebugService.resetAllLocalData === 'function') {
      DebugService.resetAllLocalData();
    } else {
      // Fallback: remove known keys used by LocalDataAdapter and audit log
      const cats: Array<TSecurePayload<unknown>['category']> = ['tasks', 'documents', 'reminders', 'preferences'];
      for (const c of cats) {
        const idxKey = `${c}_v1:index`;
        try {
          const raw = localStorage.getItem(idxKey);
          const arr = raw ? (JSON.parse(raw) as string[]) : [];
          for (const k of arr) localStorage.removeItem(`${c}_v1:${k}`);
          localStorage.removeItem(idxKey);
        } catch {}
      }
      try { localStorage.removeItem('auditLog_v1'); } catch {}
    }
    window.location.reload();
  }

  return (
    <div>
      <h1>Privacy & Data Control</h1>
      <div style={{ padding: 12, background: '#eef6ff', color: '#0353a4', border: '1px solid #cce0ff', marginBottom: 16 }}>
        Citlivé dáta spracúvame lokálne. Cloud sync je voliteľný a šifrovaný.
      </div>
      <p style={{ marginTop: -8, marginBottom: 12 }}>
        Cloud sync vyžaduje nastavenú passphrase. <a href="/settings/privacy/passphrase">Nastaviť/změniť passphrase</a>
      </p>

      <section style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={prefs.cloudSyncEnabled}
            onChange={(e) => handleMasterToggle(e.target.checked)}
          />{' '}
          Cloud sync
        </label>
        <div style={{ marginTop: 8, paddingLeft: 16 }}>
          <label style={{ display: 'block', opacity: canSync && !passRequired ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync || passRequired}
              checked={prefs.syncTasks}
              onChange={(e) => handleCategoryToggle('syncTasks', e.target.checked)}
            />{' '}
            Sync tasks
            {passRequired && <small style={{ marginLeft: 8, color: '#666' }}>Vyžaduje odomknutie (passphrase).</small>}
          </label>
          <label style={{ display: 'block', opacity: canSync && !passRequired ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync || passRequired}
              checked={prefs.syncDocuments}
              onChange={(e) => handleCategoryToggle('syncDocuments', e.target.checked)}
            />{' '}
            Sync documents
            {passRequired && <small style={{ marginLeft: 8, color: '#666' }}>Vyžaduje odomknutie (passphrase).</small>}
          </label>
          <label style={{ display: 'block', opacity: canSync && !passRequired ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync || passRequired}
              checked={prefs.syncReminders}
              onChange={(e) => handleCategoryToggle('syncReminders', e.target.checked)}
            />{' '}
            Sync reminders
            {passRequired && <small style={{ marginLeft: 8, color: '#666' }}>Vyžaduje odomknutie (passphrase).</small>}
          </label>
          <label style={{ display: 'block', opacity: canSync && !passRequired ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync || passRequired}
              checked={prefs.syncPreferences}
              onChange={(e) => handleCategoryToggle('syncPreferences', e.target.checked)}
            />{' '}
            Sync preferences
            {passRequired && <small style={{ marginLeft: 8, color: '#666' }}>Vyžaduje odomknutie (passphrase).</small>}
          </label>
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2>Audit log</h2>
        <button onClick={() => setLogs(AuditLogService.list().slice(0, MAX_LOGS))} style={{ marginRight: 8 }}>Zobraziť audit log</button>
        <button onClick={() => { AuditLogService.clear(); setLogs([]); }}>Vymazať audit log</button>
        {previewLogs.length > 0 ? (
          <ul style={{ marginTop: 12 }}>
            {previewLogs.map((evt) => (
              <li key={evt.id}>
                <code>{evt.id}</code> – {evt.ts} – {evt.type} – {evt.category}{evt.key ? ` – ${evt.key}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: 12 }}>Žiadne záznamy</p>
        )}
      </section>

      <section>
        <h2>Data management</h2>
        <button onClick={exportAllLocalData} style={{ marginRight: 8 }}>Export všetkých lokálnych dát</button>
        <button onClick={wipeAllLocalData}>Vymazať všetky lokálne dáta</button>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Auto-lock</h2>
        <label style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={prefs.autoLockEnabled}
            onChange={(e) => setPrefs(PreferencesService.set({ autoLockEnabled: e.target.checked }))}
          />{' '}
          Auto-lock enabled
        </label>
        <div style={{ marginTop: 8 }}>
          <label>Minúty neaktivity:</label>{' '}
          <input
            type="number"
            min={5}
            max={120}
            value={prefs.autoLockMinutes}
            onChange={(e) => {
              const v = Math.min(Math.max(Number(e.target.value) || 15, 5), 120);
              setPrefs(PreferencesService.set({ autoLockMinutes: v }));
            }}
          />
        </div>
      </section>

      {import.meta.env.DEV && (
        <section style={{ marginTop: 16, borderTop: '1px dashed #ddd', paddingTop: 12 }}>
          <h2>Debug (dev only)</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const updated = PreferencesService.set({ quietHoursEnabled: true });
                setPrefs(updated);
              }}
            >
              Simuluj quiet hours ON
            </button>
            <button
              onClick={() => {
                const updated = PreferencesService.set({ quietHoursEnabled: false });
                setPrefs(updated);
              }}
            >
              Simuluj quiet hours OFF
            </button>
            <button
              onClick={async () => {
                try {
                  await Promise.all([
                    CloudSyncService.syncCategory('reminders'),
                    CloudSyncService.syncCategory('documents'),
                    CloudSyncService.syncCategory('preferences'),
                  ]);
                  setLogs(AuditLogService.list().slice(0, MAX_LOGS));
                } catch {}
              }}
            >
              Simuluj sync teraz
            </button>
            <button
              onClick={() => {
                const keysRem = LocalDataAdapter.listKeys('reminders');
                const keysDoc = LocalDataAdapter.listKeys('documents');
                const keysPref = LocalDataAdapter.listKeys('preferences');
                alert(`Encrypted indexy:\nreminders: ${keysRem.join(', ') || '-'}\ndocuments: ${keysDoc.join(', ') || '-'}\npreferences: ${keysPref.join(', ') || '-'}`);
              }}
            >
              Zobraziť lokálne encrypted indexy
            </button>
          </div>
        </section>
      )}

      <div style={{ marginTop: 16, color: '#777' }}>
        <small>
          Device: {DeviceService.getOrCreateDeviceId()} · App: {APP_VERSION}
        </small>
      </div>
    </div>
  );
};

export default SettingsPrivacy;


