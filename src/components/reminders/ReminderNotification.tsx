import React from 'react';
import type { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ReminderToast } from './ReminderToast';

interface Reminder {
  id: string;
  title: string;
  description: string;
}

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
  const toastId = `reminder-${reminder.id}`;
  
  toast.custom(
    (t) => (
      <ReminderToast
        reminder={reminder}
        toastId={toastId}
        onComplete={onComplete}
        onSnooze={onSnooze}
        onDismiss={onDismiss}
      />
    ),
    {
      id: toastId,
      duration: 10000, // 10 seconds
      position: 'top-right',
    }
  );
}
