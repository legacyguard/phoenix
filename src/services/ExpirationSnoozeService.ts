export type ExpirationSnooze = { docId: string; snoozedUntil: string };

const KEY = 'expirationSnooze_v1';

export const ExpirationSnoozeService = {
  list(): ExpirationSnooze[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  set(docId: string, untilISO: string) {
    const all = ExpirationSnoozeService.list().filter(x => x.docId !== docId);
    all.push({ docId, snoozedUntil: untilISO });
    localStorage.setItem(KEY, JSON.stringify(all));
  },
  get(docId: string): string | null {
    const hit = ExpirationSnoozeService.list().find(x => x.docId === docId);
    return hit?.snoozedUntil || null;
  }
};


