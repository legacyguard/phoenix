import { describe, it, expect } from 'vitest';
import { LockGuard } from '@/services/LockGuard';

describe('LockGuard.wrapAsync', () => {
  it('emits and returns null on LOCKED', async () => {
    let called = false;
    const cb = () => { called = true; };
    LockGuard.addLockListener(cb);
    const result = await LockGuard.wrapAsync(async () => { throw new Error('LOCKED'); });
    expect(result).toBeNull();
    expect(called).toBe(true);
    LockGuard.removeLockListener(cb);
  });
});


