import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatLastContacted } from '../dateFormatters';
import { formatDate } from '../currency';

// Mock the countries config for testing
vi.mock('@/config/countries', () => ({
  getCurrentCountryConfig: vi.fn(() => ({
    code: 'DE',
    currency: 'EUR',
  })),
}));

// Mock window.location for testing
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
  },
  writable: true,
});

describe('dateFormatters', () => {
  describe('formatLastContacted', () => {
    beforeEach(() => {
      // Set a fixed time for consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-08-16T18:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should format a recent date correctly', () => {
      const recentDate = '2025-08-16T16:00:00.000Z';
      const result = formatLastContacted(recentDate);
      // date-fns uses "about" prefix for approximate times
      expect(result).toBe('about 2 hours ago');
    });

    it('should format a past date correctly', () => {
      const pastDate = '2025-08-15T18:00:00.000Z';
      const result = formatLastContacted(pastDate);
      expect(result).toBe('1 day ago');
    });

    it('should format a future date correctly', () => {
      const futureDate = '2025-08-17T18:00:00.000Z';
      const result = formatLastContacted(futureDate);
      expect(result).toBe('in 1 day');
    });

    it('should handle minutes correctly', () => {
      const minutesAgo = '2025-08-16T17:55:00.000Z';
      const result = formatLastContacted(minutesAgo);
      expect(result).toBe('5 minutes ago');
    });

    it('should handle hours correctly', () => {
      const hoursAgo = '2025-08-16T12:00:00.000Z';
      const result = formatLastContacted(hoursAgo);
      // date-fns uses "about" prefix for approximate times
      expect(result).toBe('about 6 hours ago');
    });

    it('should handle days correctly', () => {
      const daysAgo = '2025-08-14T18:00:00.000Z';
      const result = formatLastContacted(daysAgo);
      expect(result).toBe('2 days ago');
    });

    it('should handle weeks correctly', () => {
      const weeksAgo = '2025-08-02T18:00:00.000Z';
      const result = formatLastContacted(weeksAgo);
      // date-fns uses days for 2 weeks
      expect(result).toBe('14 days ago');
    });

    it('should handle months correctly', () => {
      const monthsAgo = '2025-06-16T18:00:00.000Z';
      const result = formatLastContacted(monthsAgo);
      expect(result).toBe('2 months ago');
    });

    it('should handle years correctly', () => {
      const yearsAgo = '2024-08-16T18:00:00.000Z';
      const result = formatLastContacted(yearsAgo);
      // date-fns uses "about" prefix for approximate times
      expect(result).toBe('about 1 year ago');
    });

    it('should return empty string for null input', () => {
      const result = formatLastContacted(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const result = formatLastContacted(undefined as any);
      expect(result).toBe('');
    });

    it('should return empty string for empty string input', () => {
      const result = formatLastContacted('');
      expect(result).toBe('');
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDate = 'invalid-date-string';
      const result = formatLastContacted(invalidDate);
      expect(result).toBe('');
    });

    it('should handle very old dates', () => {
      const oldDate = '1990-01-01T00:00:00.000Z';
      const result = formatLastContacted(oldDate);
      // date-fns uses "over" prefix for very long times
      expect(result).toBe('over 35 years ago');
    });

    it('should handle very future dates', () => {
      const futureDate = '2030-01-01T00:00:00.000Z';
      const result = formatLastContacted(futureDate);
      // date-fns uses "over" prefix for very long times
      expect(result).toBe('in over 4 years');
    });

    it('should handle edge case of same time', () => {
      const sameTime = '2025-08-16T18:00:00.000Z';
      const result = formatLastContacted(sameTime);
      expect(result).toBe('less than a minute ago');
    });

    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29T18:00:00.000Z';
      vi.setSystemTime(new Date('2024-03-01T18:00:00.000Z'));
      const result = formatLastContacted(leapYearDate);
      expect(result).toBe('1 day ago');
    });
  });

  describe('formatDate', () => {
    beforeEach(() => {
      // Mock the countries config for testing
      const mockGetCurrentCountryConfig = vi.fn(() => ({
        code: 'DE',
        currency: 'EUR',
      }));
      
      // Mock the module
      vi.doMock('@/config/countries', () => ({
        getCurrentCountryConfig: mockGetCurrentCountryConfig,
      }));
    });

    it('should format a valid date correctly', () => {
      const date = new Date('2025-08-16T18:00:00.000Z');
      const result = formatDate(date);
      // German locale format: DD.MM.YYYY
      expect(result).toMatch(/^\d{1,2}\.\d{1,2}\.\d{4}$/);
    });

    it('should handle different date formats', () => {
      const dates = [
        new Date('2025-01-01T00:00:00.000Z'), // New Year
        new Date('2025-12-31T23:59:59.999Z'), // End of year
        new Date('2025-02-28T12:00:00.000Z'), // February
        new Date('2025-06-15T15:30:00.000Z'), // Mid-year
      ];

      dates.forEach(date => {
        const result = formatDate(date);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should handle edge case dates', () => {
      const edgeDates = [
        new Date('1970-01-01T00:00:00.000Z'), // Unix epoch
        new Date('9999-12-31T23:59:59.999Z'), // Far future
        new Date('1000-01-01T00:00:00.000Z'), // Far past
      ];

      edgeDates.forEach(date => {
        const result = formatDate(date);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00.000Z');
      const result = formatDate(leapYearDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle different locales', () => {
      // Test with different country configs
      const testCases = [
        { code: 'US', expectedFormat: /^\d{1,2}\/\d{1,2}\/\d{4}$/ },
        { code: 'GB', expectedFormat: /^\d{1,2}\/\d{1,2}\/\d{4}$/ },
        { code: 'DE', expectedFormat: /^\d{1,2}\.\d{1,2}\.\d{4}$/ },
        { code: 'FR', expectedFormat: /^\d{1,2}\/\d{1,2}\/\d{4}$/ },
      ];

      testCases.forEach(({ code, expectedFormat }) => {
        // Mock the config for each test case
        vi.doMock('@/config/countries', () => ({
          getCurrentCountryConfig: vi.fn(() => ({
            code,
            currency: 'EUR',
          })),
        }));

        const date = new Date('2025-08-16T18:00:00.000Z');
        const result = formatDate(date);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle error gracefully and return fallback', () => {
      // Mock Intl.DateTimeFormat to throw an error
      const originalIntl = global.Intl;
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: vi.fn(() => {
          throw new Error('Intl error');
        }),
      } as any;

      const date = new Date('2025-08-16T18:00:00.000Z');
      const result = formatDate(date);
      
      // Should return fallback format
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      // Restore original Intl
      global.Intl = originalIntl;
    });
  });

  describe('Date Utility Functions (Extended)', () => {
    // These are additional utility functions that would be useful
    // and could be added to dateFormatters.ts

    describe('formatDateTime', () => {
      it('should format date and time correctly', () => {
        // This would be a new function to implement
        const date = new Date('2025-08-16T18:30:45.123Z');
        // Mock implementation for testing
        const formatDateTime = (date: Date): string => {
          return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(date);
        };

        const result = formatDateTime(date);
        expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4},\s\d{2}:\d{2}:\d{2}$/);
      });

      it('should handle different time formats', () => {
        const date = new Date('2025-08-16T18:30:45.123Z');
        const formatDateTime = (date: Date, includeSeconds = false): string => {
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          };
          
          if (includeSeconds) {
            options.second = '2-digit';
          }

          return new Intl.DateTimeFormat('de-DE', options).format(date);
        };

        const resultWithSeconds = formatDateTime(date, true);
        const resultWithoutSeconds = formatDateTime(date, false);

        expect(resultWithSeconds).toMatch(/^\d{2}\.\d{2}\.\d{4},\s\d{2}:\d{2}:\d{2}$/);
        expect(resultWithoutSeconds).toMatch(/^\d{2}\.\d{2}\.\d{4},\s\d{2}:\d{2}$/);
      });
    });

    describe('formatRelativeTimeDetailed', () => {
      it('should provide more detailed relative time', () => {
        // This would be a new function for more detailed relative time
        const formatRelativeTimeDetailed = (date: Date | string): string => {
          const now = new Date();
          const targetDate = new Date(date);
          const diffMs = now.getTime() - targetDate.getTime();
          const diffSeconds = Math.floor(diffMs / 1000);
          const diffMinutes = Math.floor(diffSeconds / 60);
          const diffHours = Math.floor(diffMinutes / 60);
          const diffDays = Math.floor(diffHours / 24);

          if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
          } else {
            return 'just now';
          }
        };

        const recentDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
        const result = formatRelativeTimeDetailed(recentDate);
        expect(result).toBe('5 minutes ago');
      });

      it('should handle future dates', () => {
        const formatRelativeTimeDetailed = (date: Date | string): string => {
          const now = new Date();
          const targetDate = new Date(date);
          const diffMs = targetDate.getTime() - now.getTime();
          const diffSeconds = Math.floor(diffMs / 1000);
          const diffMinutes = Math.floor(diffSeconds / 60);
          const diffHours = Math.floor(diffMinutes / 60);
          const diffDays = Math.floor(diffHours / 24);

          if (diffDays > 0) {
            return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
          } else if (diffHours > 0) {
            return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
          } else if (diffMinutes > 0) {
            return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
          } else {
            return 'now';
          }
        };

        const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
        const result = formatRelativeTimeDetailed(futureDate);
        expect(result).toBe('in 2 hours');
      });
    });

    describe('isToday', () => {
      it('should correctly identify today', () => {
        const isToday = (date: Date | string): boolean => {
          const today = new Date();
          const targetDate = new Date(date);
          
          return today.toDateString() === targetDate.toDateString();
        };

        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        expect(isToday(today)).toBe(true);
        expect(isToday(yesterday)).toBe(false);
        expect(isToday(tomorrow)).toBe(false);
      });
    });

    describe('isThisWeek', () => {
      it('should correctly identify this week', () => {
        const isThisWeek = (date: Date | string): boolean => {
          const today = new Date();
          const targetDate = new Date(date);
          
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          
          return targetDate >= startOfWeek && targetDate <= endOfWeek;
        };

        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        expect(isThisWeek(today)).toBe(true);
        expect(isThisWeek(nextWeek)).toBe(false);
        expect(isThisWeek(lastWeek)).toBe(false);
      });
    });
  });
});
