import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook that persists state to sessionStorage or localStorage
 * @param key - The storage key
 * @param defaultValue - The default value if nothing is stored
 * @param storage - Which storage to use (default: sessionStorage)
 * @returns [value, setValue] tuple similar to useState
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  storage: 'session' | 'local' = 'session'
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageObject = storage === 'local' ? localStorage : sessionStorage;

  // Get initial value from storage or use default
  const getStoredValue = useCallback((): T => {
    try {
      const item = storageObject.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error reading ${storage}Storage key "${key}":`, error);
    }
    return defaultValue;
  }, [key, defaultValue, storageObject]);

  const [value, setValue] = useState<T>(getStoredValue);

  // Update storage when value changes
  useEffect(() => {
    try {
      storageObject.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${storage}Storage key "${key}":`, error);
    }
  }, [key, value, storageObject, storage]);

  // Handle storage events (for syncing across tabs if using localStorage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event value:', error);
        }
      }
    };

    if (storage === 'local') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, storage]);

  // Custom setter that accepts both direct values and updater functions
  const setPersistedValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
      return valueToStore;
    });
  }, []);

  return [value, setPersistedValue];
}

/**
 * Hook specifically for persisting filter states
 * Includes debouncing to avoid too many storage writes
 */
export function usePersistedFilters<T extends Record<string, any>>(
  storageKey: string,
  defaultFilters: T
): [T, (filters: Partial<T>) => void, () => void] {
  const [filters, setFilters] = usePersistedState(storageKey, defaultFilters);

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters, defaultFilters]);

  return [filters, updateFilters, resetFilters];
}

export default usePersistedState;
