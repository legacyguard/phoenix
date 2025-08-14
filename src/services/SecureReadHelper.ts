import { EncryptionService } from '@/services/EncryptionService';
import { LocalDataAdapter } from '@/services/LocalDataAdapter';
import { DeviceService } from '@/services/DeviceService';
import { APP_VERSION } from '@/utils/appVersion';
import type { SecurePayload, EncryptedPayload } from '@/services/EncryptionService';
import { AuditLogService } from '@/services/AuditLogService';

type Category = 'reminders' | 'documents' | 'preferences';

export async function readDecrypted<T>(category: Category, key: string): Promise<T | null> {
  const enc = LocalDataAdapter.loadEncrypted(category, key) as EncryptedPayload | null;
  if (!enc) return null;
  try {
    const payload = await EncryptionService.decryptObject<T>(enc);
    return payload.data;
  } catch (e) {
    console.warn('[SecureReadHelper] decrypt failed', category, key, e);
    AuditLogService.logEvent({
      id: String(Date.now()),
      type: 'update',
      category,
      key,
      ts: new Date().toISOString(),
      details: { decryptError: true },
    });
    return null;
  }
}

export async function writeEncrypted<T>(category: Category, key: string, data: T): Promise<void> {
  const deviceId = DeviceService.getOrCreateDeviceId();
  const now = new Date();
  const payload: SecurePayload<T> = {
    version: 1,
    category,
    data,
    meta: {
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      tzOffset: -now.getTimezoneOffset(),
      deviceId,
      appVersion: APP_VERSION,
    },
  };
  const enc = await EncryptionService.encryptObject(payload);
  LocalDataAdapter.saveEncrypted(category, key, enc);
  AuditLogService.logEvent({
    id: String(Date.now()),
    type: 'update',
    category,
    key,
    ts: now.toISOString(),
  });
}


