import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { EncryptionService, type SecurePayload, type EncryptedPayload } from '@/services/EncryptionService';

// Mock KeyService to provide a stable in-memory DEK
vi.mock('@/services/KeyService', () => {
  let dek: CryptoKey | null = null;
  return {
    KeyService: {
      hasPassphrase: () => true,
      async setPassphrase(_: string) { /* noop */ },
      async changePassphrase() { /* noop */ },
      async unlock() { /* noop */ },
      getDEK: () => dek,
      lock: () => { dek = null; },
      __setDEK: async (bytes: Uint8Array) => {
        dek = await crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
      },
    },
  };
});

describe('EncryptionService round-trip', () => {
  beforeAll(async () => {
    const { KeyService } = await import('@/services/KeyService');
    const seeded = new Uint8Array(32);
    for (let i = 0; i < seeded.length; i++) seeded[i] = i;
    await (KeyService as any).__setDEK(seeded);
  });

  it('encrypts and decrypts payload', async () => {
    const payload: SecurePayload<{ a: number; b: string }> = {
      version: 1,
      category: 'preferences',
      data: { a: 1, b: 'x' },
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tzOffset: 0,
        deviceId: 'test-device',
        appVersion: 'test',
      },
    };
    const enc: EncryptedPayload = await EncryptionService.encryptObject(payload);
    const dec = await EncryptionService.decryptObject<typeof payload.data>(enc);
    expect(dec.data).toEqual(payload.data);
    expect(dec.category).toBe('preferences');
  });
});


