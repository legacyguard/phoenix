import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, SnoozeIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast, isWithinInterval, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'document_expiry' | 'content_update' | 'review' | 'life_event';
  due_date: Date;
  content_type?: string;
  content_id?: string;
  priority: 'low' | 'medium' | 'high';
  completed_at?: Date;
  snoozed_until?: Date;
}

interface ReminderCardProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onSnooze: (id: string, duration: 'week' | 'month' | '3months') => void;
  onDismiss: (id: string) => void;
  className?: string;
}

export function ReminderCard({ 
  reminder, 
  onComplete, 
  onSnooze, 
  onDismiss,
  className 
}: ReminderCardProps) {
  const { t } = useTranslation('dashboard-main');
  
  const getStatusColor = () => {
    if (isPast(reminder.due_date)) {
      return 'border-destructive bg-destructive/5';
    }
    if (isWithinInterval(reminder.due_date, { 
      start: new Date(), 
      end: subDays(new Date(), -7) 
    })) {
      return 'border-orange-500 bg-orange-500/5';
    }
    return 'border-primary bg-primary/5';
  };

  const getIconColor = () => {
    if (isPast(reminder.due_date)) return 'text-destructive';
    if (isWithinInterval(reminder.due_date, { 
      start: new Date(), 
      end: subDays(new Date(), -7) 
    })) {
      return 'text-orange-500';
    }
    return 'text-primary';
  };

  return (
    <Card className={cn(getStatusColor(), 'transition-colors', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Clock className={cn('h-5 w-5 mt-0.5', getIconColor())} />
            <div className="space-y-1">
              <CardTitle className="text-base">{reminder.title}</CardTitle>
              <CardDescription>{reminder.description}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-2"
            onClick={() => onDismiss(reminder.id)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('dashboard.dismiss')}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isPast(reminder.due_date) ? (
              <span className="text-destructive font-medium">
                {t('reminders.overdue', { 
                  time: formatDistanceToNow(reminder.due_date, { addSuffix: true }) 
                })}
              </span>
            ) : (
              <span>
                {t('reminders.due', { 
                  date: format(reminder.due_date, 'PPP') 
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSnooze(reminder.id, 'week')}
            >
              <SnoozeIcon className="h-4 w-4 mr-1" />
              {t('dashboard.snooze')}
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => onComplete(reminder.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {t('dashboard.complete')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
