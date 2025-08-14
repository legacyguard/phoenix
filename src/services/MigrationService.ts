import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { writeEncrypted } from '@/services/SecureReadHelper';
import { AuditLogService } from '@/services/AuditLogService';
import { DocumentMetadataService } from '@/services/DocumentMetadataService';

// Legacy sources – keys used in the project
const LEGACY = {
  reminders: 'taskReminders_v1',            // array<Reminder>
  preferences: 'appPreferences',            // AppPreferences object
  // document metadata: per-doc keys handled via DocumentMetadataService helpers
};

const MIGRATION_FLAG = 'secure_migration_v1_done';

export async function runSecureStorageMigration() {
  try {
    if (localStorage.getItem(MIGRATION_FLAG) === '1') return;
  } catch {
    return; // cannot access storage, skip
  }

  // 1) Reminders (bulk)
  try {
    const raw = localStorage.getItem(LEGACY.reminders);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        for (const r of arr) {
          if (!r?.id) continue;
          await writeEncrypted('reminders', r.id, r);
        }
      }
    }
  } catch {}

  // 2) Preferences (single)
  try {
    const raw = localStorage.getItem(LEGACY.preferences);
    if (raw) {
      const obj = JSON.parse(raw);
      await writeEncrypted('preferences', 'app', obj);
    }
  } catch {}

  // 3) Documents metadata (iterate legacy keys via DocumentMetadataService)
  try {
    const keys = DocumentMetadataService.listLegacyDocumentKeys?.() || [];
    for (const docId of keys) {
      const legacy = DocumentMetadataService.loadLegacyDocument?.(docId);
      if (legacy) {
        await writeEncrypted('documents', docId, legacy);
      }
    }
  } catch {}

  try { localStorage.setItem(MIGRATION_FLAG, '1'); } catch {}
  AuditLogService.logEvent({
    id: String(Date.now()),
    type: 'update',
    category: 'preferences',
    key: 'migration',
    ts: new Date().toISOString(),
    details: { message: 'secure migration v1 completed' },
  });
}


