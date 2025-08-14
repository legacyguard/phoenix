import React, { useMemo, useState } from 'react';
import { PreferencesService, type AppPreferences } from '@/services/PreferencesService';
import { AuditLogService, type AuditEvent } from '@/services/AuditLogService';
import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { EncryptionService, type EncryptedPayload, type TSecurePayload } from '@/services/EncryptionService';
import { DeviceService } from '@/services/DeviceService';
import { APP_VERSION } from '@/utils/appVersion';
import { DebugService } from '@/services/DebugService';

const MAX_LOGS = 50;

const SettingsPrivacy: React.FC = () => {
  const [prefs, setPrefs] = useState<AppPreferences>(PreferencesService.get());
  const [logs, setLogs] = useState<AuditEvent[]>(AuditLogService.list().slice(0, MAX_LOGS));

  const canSync = prefs.cloudSyncEnabled;

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
          <label style={{ display: 'block', opacity: canSync ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync}
              checked={prefs.syncTasks}
              onChange={(e) => handleCategoryToggle('syncTasks', e.target.checked)}
            />{' '}
            Sync tasks
          </label>
          <label style={{ display: 'block', opacity: canSync ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync}
              checked={prefs.syncDocuments}
              onChange={(e) => handleCategoryToggle('syncDocuments', e.target.checked)}
            />{' '}
            Sync documents
          </label>
          <label style={{ display: 'block', opacity: canSync ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync}
              checked={prefs.syncReminders}
              onChange={(e) => handleCategoryToggle('syncReminders', e.target.checked)}
            />{' '}
            Sync reminders
          </label>
          <label style={{ display: 'block', opacity: canSync ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!canSync}
              checked={prefs.syncPreferences}
              onChange={(e) => handleCategoryToggle('syncPreferences', e.target.checked)}
            />{' '}
            Sync preferences
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

      <div style={{ marginTop: 16, color: '#777' }}>
        <small>
          Device: {DeviceService.getOrCreateDeviceId()} · App: {APP_VERSION}
        </small>
      </div>
    </div>
  );
};

export default SettingsPrivacy;


