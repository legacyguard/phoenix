export const DebugService = {
  resetAllLocalData() {
    try {
      localStorage.removeItem('appPreferences');
      localStorage.removeItem('taskReminders_v1');
      localStorage.removeItem('expirationSnooze_v1');
      localStorage.removeItem('lastActiveAt_v1');
    } catch {}
  },
};


