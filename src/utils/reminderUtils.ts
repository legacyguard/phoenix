import type { Reminder } from '@/types/reminder';

interface ReminderNotificationProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onSnooze: (id: string, duration: 'week' | 'month' | '3months') => void;
  onDismiss: (id: string) => void;
}

export function showReminderNotification({
  reminder,
  onComplete,
  onSnooze,
  onDismiss,
}: ReminderNotificationProps) {
  // This function would show the reminder notification
  // Implementation depends on your notification system
  console.log('Show reminder notification:', reminder);
}

// Utility function to show multiple reminders
export function showReminderNotifications(
  reminders: Reminder[],
  handlers: {
    onComplete: (id: string) => void;
    onSnooze: (id: string, duration: 'week' | 'month' | '3months') => void;
    onDismiss: (id: string) => void;
  }
) {
  // Show reminders with a slight delay between each
  reminders.forEach((reminder, index) => {
    setTimeout(() => {
      showReminderNotification({
        reminder,
        ...handlers,
      });
    }, index * 500); // 500ms delay between notifications
  });
} 