import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, X } from 'lucide-react';
import type { TaskItem } from '@/components/onboarding/OnboardingWizard';

interface ProgressNudgeProps {
  tasks: TaskItem[];
  onDismiss?: () => void;
  onContinue?: () => void;
}

export const ProgressNudge: React.FC<ProgressNudgeProps> = ({
  tasks,
  onDismiss,
  onContinue,
}) => {
  const { t } = useTranslation('dashboard-main');
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const remainingTasks = totalTasks - completedTasks;

  // Check if user should see the nudge
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('legacyguard-nudge-dismissed-until');
    const lastVisitTime = localStorage.getItem('legacyguard-last-visit');
    
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (new Date() < dismissedDate) {
        setIsDismissed(true);
      }
    }

    if (lastVisitTime) {
      setLastVisit(new Date(lastVisitTime));
    }

    // Update last visit time
    localStorage.setItem('legacyguard-last-visit', new Date().toISOString());
  }, []);

  // Don't show if all tasks are completed or if dismissed
  if (totalTasks === 0 || completedTasks === totalTasks || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 24 hours
    const dismissUntil = new Date();
    dismissUntil.setHours(dismissUntil.getHours() + 24);
    localStorage.setItem('legacyguard-nudge-dismissed-until', dismissUntil.toISOString());
    onDismiss?.();
  };

  const handleContinue = () => {
    onContinue?.();
  };

  // Check if it's been more than 24 hours since last visit
  const showWelcomeBack = lastVisit && (new Date().getTime() - lastVisit.getTime()) > 24 * 60 * 60 * 1000;

  return (
    <Card className="relative bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-background/20 transition-colors"
        aria-label={t('dashboard.nudge.dismiss')}
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {showWelcomeBack 
                ? t('dashboard.nudge.welcomeBack') 
                : t('dashboard.nudge.progressTitle', { percentage: Math.round(progressPercentage) })
              }
            </h3>
            
            <div className="mb-3">
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <p className="text-sm text-muted-foreground">
              {remainingTasks === 1
                ? t('dashboard.nudge.oneTaskLeft')
                : t('dashboard.nudge.tasksRemaining', { count: remainingTasks })
              }
              {' '}
              {showWelcomeBack 
                ? t('dashboard.nudge.continueSecuring')
                : t('dashboard.nudge.finishToday')
              }
            </p>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="whitespace-nowrap"
            size="sm"
          >
            {t('dashboard.nudge.completeNow')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
