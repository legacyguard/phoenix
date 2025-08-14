type Listener = () => void;

const listeners = new Set<Listener>();

export const LockGuard = {
  async wrapAsync<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch (e: any) {
      const msg = e?.message || e;
      if (msg === 'LOCKED') {
        this.emitLockRequired();
        return null;
      }
      throw e;
    }
  },
  addLockListener(cb: Listener) { listeners.add(cb); },
  removeLockListener(cb: Listener) { listeners.delete(cb); },
  emitLockRequired() { for (const cb of Array.from(listeners)) { try { cb(); } catch {} } },
};


