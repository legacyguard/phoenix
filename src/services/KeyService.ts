import { toBase64, fromBase64 } from '@/services/EncryptionService';

const WRAPPED_DEK_KEY = 'wrappedDEK_v1';
const KEK_SALT_KEY = 'kekSalt_v1';
const ITER_COUNT_KEY = 'iterCount_v1';

let inMemoryDEK: CryptoKey | null = null;

function getIterations(): number {
  try {
    const envVal = (import.meta as any)?.env?.VITE_PBKDF2_ITER;
    const parsed = Number(envVal);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  } catch {}
  return 310_000;
}

function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  // @ts-expect-error
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) return (globalThis as any).crypto as Crypto;
  throw new Error('WebCrypto not available');
}

function zeroizeBytes(bytes: Uint8Array): void {
  try {
    for (let i = 0; i < bytes.length; i++) bytes[i] = 0;
  } catch {}
}

async function deriveKEK(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const subtle = getCrypto().subtle;
  const passBytes = new TextEncoder().encode(passphrase);
  const baseKey = await subtle.importKey('raw', passBytes, 'PBKDF2', false, ['deriveKey']);
  const kek = await subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  zeroizeBytes(passBytes);
  return kek;
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  getCrypto().getRandomValues(arr);
  return arr;
}

export const KeyService = {
  hasPassphrase(): boolean {
    try {
      return !!localStorage.getItem(WRAPPED_DEK_KEY);
    } catch {
      return false;
    }
  },

  async setPassphrase(pass: string): Promise<void> {
    const subtle = getCrypto().subtle;
    // Generate new DEK
    const dekRaw = randomBytes(32);
    const dekKey = await subtle.importKey('raw', dekRaw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);

    // Derive KEK
    const kekSalt = randomBytes(16);
    const iterations = getIterations();
    const kek = await deriveKEK(pass, kekSalt, iterations);

    // Wrap (encrypt) DEK
    const iv = randomBytes(12);
    const cipher = await subtle.encrypt({ name: 'AES-GCM', iv }, kek, dekRaw);

    const wrapped = {
      iv: toBase64(iv),
      salt: toBase64(kekSalt),
      cipherText: toBase64(cipher),
      alg: 'AES-256-GCM',
      ver: 1,
    };

    // Persist
    try {
      localStorage.setItem(WRAPPED_DEK_KEY, btoa(JSON.stringify(wrapped)));
      localStorage.setItem(KEK_SALT_KEY, toBase64(kekSalt));
      localStorage.setItem(ITER_COUNT_KEY, String(iterations));
    } catch {}

    // Hold DEK in memory
    inMemoryDEK = dekKey;
    // best-effort zeroize temporary bytes
    zeroizeBytes(dekRaw);
  },

  async changePassphrase(oldPass: string, newPass: string): Promise<void> {
    // Unlock with old pass
    await this.unlock(oldPass);
    if (!inMemoryDEK) throw new Error('LOCKED');

    // Re-wrap with new pass
    const subtle = getCrypto().subtle;
    const dekRaw = new Uint8Array(await subtle.exportKey('raw', inMemoryDEK));
    const kekSalt = randomBytes(16);
    const iterations = getIterations();
    const kek = await deriveKEK(newPass, kekSalt, iterations);
    const iv = randomBytes(12);
    const cipher = await subtle.encrypt({ name: 'AES-GCM', iv }, kek, dekRaw);
    const wrapped = {
      iv: toBase64(iv),
      salt: toBase64(kekSalt),
      cipherText: toBase64(cipher),
      alg: 'AES-256-GCM',
      ver: 1,
    };
    try {
      localStorage.setItem(WRAPPED_DEK_KEY, btoa(JSON.stringify(wrapped)));
      localStorage.setItem(KEK_SALT_KEY, toBase64(kekSalt));
      localStorage.setItem(ITER_COUNT_KEY, String(iterations));
    } catch {}
    // zeroize temp
    zeroizeBytes(dekRaw);
  },

  async unlock(pass: string): Promise<void> {
    const subtle = getCrypto().subtle;
    let wrappedB64Json: string | null = null;
    let kekSaltB64: string | null = null;
    let iterStr: string | null = null;
    try {
      wrappedB64Json = localStorage.getItem(WRAPPED_DEK_KEY);
      kekSaltB64 = localStorage.getItem(KEK_SALT_KEY);
      iterStr = localStorage.getItem(ITER_COUNT_KEY);
    } catch {}
    if (!wrappedB64Json || !kekSaltB64) throw new Error('LOCKED');
    const wrapped = JSON.parse(atob(wrappedB64Json));
    const kekSalt = fromBase64(kekSaltB64);
    const iterations = Number(iterStr) || getIterations();
    const kek = await deriveKEK(pass, kekSalt, iterations);
    const iv = fromBase64(wrapped.iv);
    const cipher = fromBase64(wrapped.cipherText);
    const dekRaw = await subtle.decrypt({ name: 'AES-GCM', iv }, kek, cipher);
    const dekKey = await subtle.importKey('raw', dekRaw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    inMemoryDEK = dekKey;
    // zeroize temp
    zeroizeBytes(new Uint8Array(dekRaw));
  },

  getDEK(): CryptoKey | null {
    return inMemoryDEK;
  },

  lock(): void {
    inMemoryDEK = null;
  },
};


