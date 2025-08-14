import { describe, it, expect } from 'vitest';
import { isWithinQuietHours } from '@/utils/quietHours';

describe('isWithinQuietHours', () => {
  it('handles normal interval in same day', () => {
    const start = '09:00';
    const end = '17:00';
    expect(isWithinQuietHours(start, end, new Date('2025-01-01T08:59:00'))).toBe(false);
    expect(isWithinQuietHours(start, end, new Date('2025-01-01T09:00:00'))).toBe(true);
    expect(isWithinQuietHours(start, end, new Date('2025-01-01T16:59:00'))).toBe(true);
    expect(isWithinQuietHours(start, end, new Date('2025-01-01T17:00:00'))).toBe(false);
  });

  it('handles overnight intervals (cross midnight)', () => {
    const start = '22:00';
    const end = '07:00';
    expect(isWithinQuietHours(start, end, new Date('2025-01-01T21:59:00'))).toBe(false);
    expect(isWithinQuietHours(start, end, new Date('2025-01-01T22:00:00'))).toBe(true);
    expect(isWithinQuietHours(start, end, new Date('2025-01-02T06:59:00'))).toBe(true);
    expect(isWithinQuietHours(start, end, new Date('2025-01-02T07:00:00'))).toBe(false);
  });
});


