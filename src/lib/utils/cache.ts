import type { isEqual } from "lodash";

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: "LRU" | "LFU" | "FIFO";
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  key: string;
}

export class CacheManager<T = unknown> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      strategy: "LRU",
      ...config,
    };
  }

  // Set cache item
  set(key: string, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      key,
    };

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);
  }

  // Get cache item
  get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) return undefined;

    // Check if item has expired
    if (Date.now() - item.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access count for LFU strategy
    item.accessCount++;
    return item.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Get all keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Evict items based on strategy
  private evict(): void {
    const keys = Array.from(this.cache.keys());

    switch (this.config.strategy) {
      case "LRU": {
        // Remove oldest accessed item
        let oldestKey = keys[0];
        let oldestTime = this.cache.get(keys[0])!.timestamp;

        for (const key of keys) {
          const item = this.cache.get(key)!;
          if (item.timestamp < oldestTime) {
            oldestTime = item.timestamp;
            oldestKey = key;
          }
        }
        this.cache.delete(oldestKey);
        break;
      }

      case "LFU": {
        // Remove least frequently used item
        let lfuKey = keys[0];
        let minAccess = this.cache.get(keys[0])!.accessCount;

        for (const key of keys) {
          const item = this.cache.get(key)!;
          if (item.accessCount < minAccess) {
            minAccess = item.accessCount;
            lfuKey = key;
          }
        }
        this.cache.delete(lfuKey);
        break;
      }

      case "FIFO":
        // Remove oldest item (first inserted)
        this.cache.delete(keys[0]);
        break;
    }
  }

  // Get cache statistics
  getStats() {
    const items = Array.from(this.cache.values());
    const validItems = items.filter(
      (item) => Date.now() - item.timestamp <= this.config.ttl,
    );

    return {
      totalItems: this.cache.size,
      validItems: validItems.length,
      expiredItems: this.cache.size - validItems.length,
      hitRate: 0, // Would need to track hits/misses
      averageTTL:
        validItems.reduce(
          (sum, item) =>
            sum + (this.config.ttl - (Date.now() - item.timestamp)),
          0,
        ) / validItems.length || 0,
    };
  }
}

// API response cache
export class ApiCache extends CacheManager<unknown> {
  private static instance: ApiCache;

  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache({
        ttl: 10 * 60 * 1000, // 10 minutes for API responses
        maxSize: 50,
        strategy: "LRU",
      });
    }
    return ApiCache.instance;
  }

  // Generate cache key from URL and params
  generateKey(url: string, params?: unknown): string {
    const paramsString = params ? JSON.stringify(params) : "";
    return `${url}:${this.hashCode(paramsString)}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Cache API response with automatic key generation
  cacheResponse(url: string, params: unknown, data: unknown): void {
    const key = this.generateKey(url, params);
    this.set(key, data);
  }

  // Get cached API response
  getCachedResponse(url: string, params: unknown): unknown | undefined {
    const key = this.generateKey(url, params);
    return this.get(key);
  }

  // Invalidate cache for specific URL pattern
  invalidatePattern(pattern: string): void {
    const keys = this.keys();
    const regex = new RegExp(pattern);

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.delete(key);
      }
    });
  }
}

// React hook for API caching
export function useApiCache() {
  const cache = ApiCache.getInstance();

  return {
    getCachedResponse: cache.getCachedResponse.bind(cache),
    cacheResponse: cache.cacheResponse.bind(cache),
    invalidatePattern: cache.invalidatePattern.bind(cache),
    clear: cache.clear.bind(cache),
    getStats: cache.getStats.bind(cache),
  };
}

// Local storage cache for persistent caching
export class LocalStorageCache<T = unknown> {
  private prefix: string;

  constructor(prefix: string = "app_cache_") {
    this.prefix = prefix;
  }

  set(key: string, data: T, ttl?: number): void {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000, // 24 hours default
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }

  get(key: string): T | undefined {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return undefined;

      const parsed = JSON.parse(item);

      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return undefined;
      }

      return parsed.data;
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      return undefined;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("Failed to delete from localStorage:", error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }
}
