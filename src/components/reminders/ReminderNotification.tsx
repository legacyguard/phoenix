import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, SnoozeIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Reminder } from './ReminderCard';

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

interface ReminderToastProps {
  reminder: Reminder;
  toastId: string;
  onComplete: (id: string) => void;
  onSnooze: (id: string, duration: 'week' | 'month' | '3months') => void;
  onDismiss: (id: string) => void;
}

function ReminderToast({
  reminder,
  toastId,
  onComplete,
  onSnooze,
  onDismiss,
}: ReminderToastProps) {
  const { t } = useTranslation();

  const handleComplete = () => {
    onComplete(reminder.id);
    toast.dismiss(toastId);
    toast.success(t('reminders.completedSuccess'));
  };

  const handleSnooze = () => {
    onSnooze(reminder.id, 'week');
    toast.dismiss(toastId);
    toast.info(t('reminders.snoozedSuccess', { duration: t('reminders.duration.week') }));
  };

  const handleDismiss = () => {
    onDismiss(reminder.id);
    toast.dismiss(toastId);
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg p-4 max-w-md w-full">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{reminder.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {reminder.description}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="default"
              onClick={handleComplete}
              className="h-7 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('reminders.complete')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSnooze}
              className="h-7 text-xs"
            >
              <SnoozeIcon className="h-3 w-3 mr-1" />
              {t('reminders.snoozeWeek')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-7 text-xs ml-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
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
