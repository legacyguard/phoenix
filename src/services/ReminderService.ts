export type Reminder = {
  id: string;
  title: string;
  dueAt: string; // ISO
  repeat?: 'none' | 'weekly' | 'monthly';
  snoozedUntil?: string; // ISO
  createdAt: string; // ISO
};

const KEY = 'taskReminders_v1';

export const ReminderService = {
  list(): Reminder[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveAll(r: Reminder[]) {
    localStorage.setItem(KEY, JSON.stringify(r));
  },

  add(r: Omit<Reminder, 'id' | 'createdAt'>) {
    const all = ReminderService.list();
    const id = String(Date.now());
    const rec: Reminder = { id, createdAt: new Date().toISOString(), ...r };
    ReminderService.saveAll([...all, rec]);
    return rec;
  },

  update(id: string, patch: Partial<Reminder>) {
    const all = ReminderService.list().map((x) => (x.id === id ? { ...x, ...patch } : x));
    ReminderService.saveAll(all);
  },

  remove(id: string) {
    ReminderService.saveAll(ReminderService.list().filter((x) => x.id !== id));
  },
};


