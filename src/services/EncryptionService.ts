/*
  Security notes (MVP):
  - The per-user masterKey is stored in localStorage under 'masterKey_v1'. This is a temporary MVP 
    approach and must be replaced by secure storage on mobile/desktop in future iterations.
  - AES-GCM requires a unique IV for every encryption operation. We generate a random 12-byte IV each time.
  - PBKDF2 iterations are set to a minimum of 100k. Increase over time as needed (and consider migrating versions).
  - Never send decrypted data to the cloud. Only EncryptedPayload objects should be synced.
  - For future migrations, increment SecurePayload.version and EncryptedPayload.version accordingly.
*/

export interface SecurePayload<T> {
  version: number; // start at 1 for format migrations
  category: 'tasks' | 'documents' | 'reminders' | 'preferences';
  data: T;
  meta: {
    createdAt: string;   // ISO
    updatedAt: string;   // ISO
    tzOffset: number;    // minutes
    deviceId: string;    // device UUID
    appVersion: string;  // from appVersion util
  };
}

export interface EncryptedPayload {
  iv: string;         // base64
  salt: string;       // base64
  cipherText: string; // base64
  algorithm: 'AES-256-GCM';
  version: number;    // crypto format version, start at 1
}

function getIterations(): number {
  try {
    const raw = (import.meta as any)?.env?.VITE_PBKDF2_ITER;
    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) return num;
  } catch {}
  return 310_000; // default
}

function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  // @ts-expect-error - for environments where globalThis.crypto exists
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) return (globalThis as any).crypto as Crypto;
  throw new Error('WebCrypto not available');
}

function utf8Encode(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function utf8Decode(bytes: ArrayBuffer): string {
  return new TextDecoder().decode(bytes);
}

export function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);
}

export function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveAesGcmKey(masterKeyB64: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getCrypto().subtle;
  const masterKeyRaw = fromBase64(masterKeyB64);
  const baseKey = await subtle.importKey(
    'raw',
    masterKeyRaw,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const aesKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: getIterations(),
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return aesKey;
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  getCrypto().getRandomValues(arr);
  return arr;
}

export const EncryptionService = {
  async encryptObject<T>(payload: SecurePayload<T>): Promise<EncryptedPayload> {
    const subtle = getCrypto().subtle;
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const { KeyService } = await import('@/services/KeyService');
    const dek = KeyService.getDEK();
    if (!dek) throw new Error('LOCKED');
    // derive per-item key from DEK + salt
    const dekRaw = new Uint8Array(await subtle.exportKey('raw', dek));
    const aesKey = await deriveAesGcmKey(toBase64(dekRaw), salt);
    const plain = utf8Encode(JSON.stringify(payload));
    const cipherBuf = await subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plain);
    return {
      iv: toBase64(iv),
      salt: toBase64(salt),
      cipherText: toBase64(cipherBuf),
      algorithm: 'AES-256-GCM',
      version: 1,
    };
  },

  async decryptObject<T>(enc: EncryptedPayload): Promise<SecurePayload<T>> {
    const subtle = getCrypto().subtle;
    const iv = fromBase64(enc.iv);
    const salt = fromBase64(enc.salt);
    const cipher = fromBase64(enc.cipherText);
    const { KeyService } = await import('@/services/KeyService');
    const dek = KeyService.getDEK();
    if (!dek) throw new Error('LOCKED');
    const dekRaw = new Uint8Array(await subtle.exportKey('raw', dek));
    const aesKey = await deriveAesGcmKey(toBase64(dekRaw), salt);
    const plainBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipher);
    const json = utf8Decode(plainBuf);
    return JSON.parse(json) as SecurePayload<T>;
  },
};

export type { SecurePayload as TSecurePayload, EncryptedPayload as TEncryptedPayload };


