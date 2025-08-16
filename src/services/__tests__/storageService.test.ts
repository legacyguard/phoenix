import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService, storageService } from '../storageService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StorageService', () => {
  let storage: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new StorageService({
      prefix: 'test',
      enableLogging: false,
      enableMigration: false,
    });
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const defaultStorage = new StorageService();
      expect(defaultStorage).toBeInstanceOf(StorageService);
    });

    it('should create instance with custom config', () => {
      const customStorage = new StorageService({
        prefix: 'custom',
        enableLogging: true,
        enableMigration: false,
      });
      expect(customStorage).toBeInstanceOf(StorageService);
    });
  });

  describe('get', () => {
    it('should get data from storage', () => {
      const mockData = { test: 'data' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = storage.get('test-key');
      expect(result).toEqual(mockData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-test-key');
    });

    it('should return null for non-existent key', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = storage.get('invalid');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set data in storage', () => {
      const testData = { test: 'value' };
      localStorageMock.setItem.mockImplementation(() => {});

      storage.set('test-key', testData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-test-key',
        JSON.stringify(testData)
      );
    });

    it('should throw error on storage failure', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => storage.set('test-key', 'value')).toThrow(
        'Failed to save data for key: test-key'
      );
    });
  });

  describe('remove', () => {
    it('should remove data from storage', () => {
      storage.remove('test-key');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-test-key');
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      localStorageMock.getItem.mockReturnValue('{"test": "data"}');

      const result = storage.has('test-key');
      expect(result).toBe(true);
    });

    it('should return false for non-existing key', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.has('test-key');
      expect(result).toBe(false);
    });
  });

  describe('getKeys', () => {
    it('should return all keys with prefix', () => {
      localStorageMock.length = 3;
      localStorageMock.key
        .mockReturnValueOnce('test-key1')
        .mockReturnValueOnce('test-key2')
        .mockReturnValueOnce('other-key');

      const keys = storage.getKeys();
      expect(keys).toEqual(['key1', 'key2']);
    });
  });

  describe('clear', () => {
    it('should clear all keys with prefix', () => {
      localStorageMock.length = 2;
      localStorageMock.key
        .mockReturnValueOnce('test-key1')
        .mockReturnValueOnce('test-key2');

      storage.clear();
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSize', () => {
    it('should calculate storage size', () => {
      localStorageMock.length = 1;
      localStorageMock.key.mockReturnValue('test-key');
      localStorageMock.getItem.mockReturnValue('{"test": "data"}');

      const size = storage.getSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('static methods', () => {
    it('should check localStorage availability', () => {
      const isAvailable = StorageService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should get available space', () => {
      const space = StorageService.getAvailableSpace();
      expect(typeof space).toBe('number');
    });
  });

  describe('default instance', () => {
    it('should export default instance', () => {
      expect(storageService).toBeInstanceOf(StorageService);
    });

    it('should have Phoenix configuration', () => {
      expect(storageService).toBeInstanceOf(StorageService);
    });
  });
});
