import type { EncryptedPayload } from './EncryptionService';

type Category = 'tasks' | 'documents' | 'reminders' | 'preferences';

function indexKey(category: Category): string {
  return `${category}_v1:index`;
}

function itemKey(category: Category, key: string): string {
  return `${category}_v1:${key}`;
}

function readIndex(category: Category): string[] {
  try {
    const raw = localStorage.getItem(indexKey(category));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(category: Category, keys: string[]): void {
  localStorage.setItem(indexKey(category), JSON.stringify(keys));
}

export const LocalDataAdapter = {
  saveEncrypted(category: Category, key: string, enc: EncryptedPayload): void {
    const storageKey = itemKey(category, key);
    localStorage.setItem(storageKey, JSON.stringify(enc));
    // update index
    const idx = new Set(readIndex(category));
    idx.add(key);
    writeIndex(category, Array.from(idx));
  },

  loadEncrypted(category: Category, key: string): EncryptedPayload | null {
    const storageKey = itemKey(category, key);
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as EncryptedPayload;
    } catch {
      return null;
    }
  },

  listKeys(category: Category): string[] {
    return readIndex(category);
  },

  remove(category: Category, key: string): void {
    const storageKey = itemKey(category, key);
    localStorage.removeItem(storageKey);
    const idx = new Set(readIndex(category));
    idx.delete(key);
    writeIndex(category, Array.from(idx));
  },

  repairIndex(category: Exclude<Category, 'tasks'>): void {
    try {
      const prefix = `${category}_v1:`;
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith(prefix)) {
          const id = k.substring(prefix.length);
          if (id && id !== 'index') keys.push(id);
        }
      }
      writeIndex(category, keys);
    } catch {}
  },
};


