/**
 * Generic Storage Service - abstracts localStorage operations
 * Provides a unified API for data persistence with error handling
 */

import { storageKeys, StorageKey } from '@/config/storageKeys';

export interface StorageServiceConfig {
  prefix?: string;
  enableLogging?: boolean;
  enableMigration?: boolean;
}

export class StorageService {
  private prefix: string;
  private enableLogging: boolean;
  private enableMigration: boolean;

  constructor(config: StorageServiceConfig = {}) {
    this.prefix = config.prefix || 'phoenix';
    this.enableLogging = config.enableLogging ?? false;
    this.enableMigration = config.enableMigration ?? true;
  }

  /**
   * Get data from storage with type safety
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.getFullKey(key);
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        this.log('get', key, 'not found');
        return null;
      }

      const parsed = JSON.parse(item);
      this.log('get', key, 'success', parsed);
      return parsed;
    } catch (error) {
      this.log('get', key, 'error', error);
      console.error(`StorageService: Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in storage
   */
  set<T>(key: string, value: T): void {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
      this.log('set', key, 'success', value);
    } catch (error) {
      this.log('set', key, 'error', error);
      console.error(`StorageService: Failed to set ${key}:`, error);
      throw new Error(`Failed to save data for key: ${key}`);
    }
  }

  /**
   * Remove data from storage
   */
  remove(key: string): void {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      this.log('remove', key, 'success');
    } catch (error) {
      this.log('remove', key, 'error', error);
      console.error(`StorageService: Failed to remove ${key}:`, error);
    }
  }

  /**
   * Check if key exists in storage
   */
  has(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key);
      const exists = localStorage.getItem(fullKey) !== null;
      this.log('has', key, exists);
      return exists;
    } catch (error) {
      this.log('has', key, 'error', error);
      console.error(`StorageService: Failed to check ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys that match a pattern
   */
  getKeys(pattern?: string): string[] {
    try {
      const keys: string[] = [];
      const fullPattern = pattern ? this.getFullKey(pattern) : this.prefix;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPattern)) {
          // Remove prefix for return
          const cleanKey = key.replace(`${this.prefix}-`, '');
          keys.push(cleanKey);
        }
      }
      
      this.log('getKeys', pattern, keys);
      return keys;
    } catch (error) {
      this.log('getKeys', pattern, 'error', error);
      console.error(`StorageService: Failed to get keys for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Clear all data with the service prefix
   */
  clear(): void {
    try {
      const keys = this.getKeys();
      keys.forEach(key => this.remove(key));
      this.log('clear', 'success', `Removed ${keys.length} items`);
    } catch (error) {
      this.log('clear', 'error', error);
      console.error('StorageService: Failed to clear storage:', error);
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    try {
      let totalSize = 0;
      const keys = this.getKeys();
      
      keys.forEach(key => {
        const fullKey = this.getFullKey(key);
        const item = localStorage.getItem(fullKey);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });
      
      this.log('getSize', totalSize);
      return totalSize;
    } catch (error) {
      this.log('getSize', 'error', error);
      console.error('StorageService: Failed to get storage size:', error);
      return 0;
    }
  }

  /**
   * Migrate data from legacy keys to new keys
   */
  migrateLegacyData(): void {
    if (!this.enableMigration) return;

    try {
      const legacyMappings = [
        { from: 'legacyguard_assets', to: storageKeys.assets },
        { from: 'legacyguard_people', to: storageKeys.people },
        { from: 'legacyguard_documents', to: storageKeys.documents },
        { from: 'legacyguard_wills', to: storageKeys.wills },
        { from: 'legacyguard_will_draft', to: storageKeys.willDraft },
        { from: 'legacyguard_preferences', to: storageKeys.preferences },
        { from: 'legacyguard_reminders', to: storageKeys.legacyReminders },
      ];

      legacyMappings.forEach(({ from, to }) => {
        const legacyData = localStorage.getItem(from);
        if (legacyData) {
          this.set(to.replace(`${this.prefix}-`, ''), JSON.parse(legacyData));
          localStorage.removeItem(from);
          this.log('migrate', `Migrated ${from} to ${to}`);
        }
      });
    } catch (error) {
      this.log('migrate', 'error', error);
      console.error('StorageService: Failed to migrate legacy data:', error);
    }
  }

  /**
   * Get full storage key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}-${key}`;
  }

  /**
   * Log operations if logging is enabled
   */
  private log(operation: string, key: string, result: any, data?: any): void {
    if (!this.enableLogging) return;
    
    const logData = {
      operation,
      key,
      result,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };
    
    console.log(`[StorageService]`, logData);
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available storage space (approximate)
   */
  static getAvailableSpace(): number {
    try {
      let data = '';
      const testKey = '__storage_test__';
      
      // Try to fill localStorage to estimate available space
      for (let i = 0; i < 1000; i++) {
        data += '0123456789';
        try {
          localStorage.setItem(testKey, data);
        } catch {
          break;
        }
      }
      
      localStorage.removeItem(testKey);
      return data.length * 2; // Approximate size in bytes
    } catch {
      return 0;
    }
  }
}

// Default instance with Phoenix configuration
export const storageService = new StorageService({
  prefix: 'phoenix',
  enableLogging: process.env.NODE_ENV === 'development',
  enableMigration: true
});

// Export default instance for convenience
export default storageService;
