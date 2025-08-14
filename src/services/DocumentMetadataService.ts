type Metadata = Record<string, string>;
import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { EncryptionService, type SecurePayload, type EncryptedPayload } from '@/services/EncryptionService';
import { DeviceService } from '@/services/DeviceService';
import { APP_VERSION } from '@/utils/appVersion';
import { PreferencesService } from '@/services/PreferencesService';
import { CloudSyncAdapter } from '@/services/CloudSyncAdapter';
import { supabaseHelpers } from '@/utils/supabaseWithRetry';
import { AuditLogService } from '@/services/AuditLogService';
import { CloudSyncService } from '@/services/CloudSyncService';

function saveMetadata(docId: string, metadata: Metadata): void {
  const key = `documentMetadata_${docId}`;
  localStorage.setItem(key, JSON.stringify(metadata));
  // Encrypted write + optional cloud sync
  (async () => {
    try {
      const deviceId = DeviceService.getOrCreateDeviceId();
      const tzOffset = new Date().getTimezoneOffset() * -1;
      const nowIso = new Date().toISOString();
      const payload: SecurePayload<Metadata> = {
        version: 1,
        category: 'documents',
        data: metadata,
        meta: {
          createdAt: nowIso,
          updatedAt: nowIso,
          tzOffset,
          deviceId,
          appVersion: APP_VERSION,
        },
      };
      AuditLogService.logEvent({ id: String(Date.now()), type: 'update', category: 'documents', key: docId, ts: nowIso });
      const enc: EncryptedPayload = await EncryptionService.encryptObject(payload);
      LocalDataAdapter.saveEncrypted('documents', docId, enc);

      const prefs = PreferencesService.get();
      if (prefs.cloudSyncEnabled && prefs.syncDocuments) {
        const user = await supabaseHelpers.getCurrentUser();
        const userId = (user && (user as any).id) || null;
        if (userId) {
          await CloudSyncAdapter.upsertEncrypted(userId, 'documents', docId, enc);
          AuditLogService.logEvent({ id: String(Date.now()), type: 'sync', category: 'documents', key: docId, ts: new Date().toISOString() });
          CloudSyncService.schedule('documents', 5000);
        }
      }
    } catch {}
  })();
}

async function getMetadata(docId: string): Promise<Metadata | null> {
  try {
    const { readDecrypted } = await import('@/services/SecureReadHelper');
    const dec = await readDecrypted<Metadata>('documents', docId);
    if (dec) return dec;
  } catch {}
  const key = `documentMetadata_${docId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Metadata;
  } catch {
    return null;
  }
}

function deleteMetadata(docId: string): void {
  const key = `documentMetadata_${docId}`;
  localStorage.removeItem(key);
}

export const DocumentMetadataService = {
  saveMetadata,
  getMetadata,
  deleteMetadata,
  listLegacyDocumentKeys(): string[] {
    const prefix = 'documentMetadata_';
    const ids: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith(prefix)) {
          ids.push(k.substring(prefix.length));
        }
      }
    } catch {}
    return ids;
  },
  loadLegacyDocument(docId: string): Metadata | null {
    const key = `documentMetadata_${docId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as Metadata;
    } catch {
      return null;
    }
  },
};


