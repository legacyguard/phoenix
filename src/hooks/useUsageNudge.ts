import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { TaskItem } from '@/components/onboarding/OnboardingWizard';

interface UseUsageNudgeProps {
  tasks: TaskItem[];
}

interface UseUsageNudgeReturn {
  shouldShowNudge: boolean;
  shouldShowToast: boolean;
  dismissNudge: () => void;
  dismissToast: () => void;
  timeSinceLastVisit: number | null;
}

export const useUsageNudge = ({ tasks }: UseUsageNudgeProps): UseUsageNudgeReturn => {
  const { t } = useTranslation('common');
  const [shouldShowNudge, setShouldShowNudge] = useState(false);
  const [shouldShowToast, setShouldShowToast] = useState(false);
  const [timeSinceLastVisit, setTimeSinceLastVisit] = useState<number | null>(null);

  // Calculate task progress
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const hasIncompleteTasks = totalTasks > 0 && completedTasks < totalTasks;

  useEffect(() => {
    if (!hasIncompleteTasks) return;

    const now = new Date();
    const lastVisitStr = localStorage.getItem('legacyguard-last-visit');
    const nudgeDismissedUntilStr = localStorage.getItem('legacyguard-nudge-dismissed-until');
    const toastDismissedUntilStr = localStorage.getItem('legacyguard-toast-dismissed-until');
    
    // Check last visit time
    if (lastVisitStr) {
      const lastVisit = new Date(lastVisitStr);
      const hoursSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);
      setTimeSinceLastVisit(hoursSinceLastVisit);

      // Show nudge/toast if more than 24 hours since last visit
      if (hoursSinceLastVisit >= 24) {
        // Check if nudge is not dismissed
        if (!nudgeDismissedUntilStr || new Date(nudgeDismissedUntilStr) < now) {
          setShouldShowNudge(true);
        }

        // Check if toast is not dismissed
        if (!toastDismissedUntilStr || new Date(toastDismissedUntilStr) < now) {
          setShouldShowToast(true);
        }
      }
    } else {
      // First visit - don't show nudges immediately
      setShouldShowNudge(false);
      setShouldShowToast(false);
    }

    // Update last visit time
    localStorage.setItem('legacyguard-last-visit', now.toISOString());
  }, [hasIncompleteTasks]);

  // Show toast notification when appropriate
  useEffect(() => {
    if (shouldShowToast && hasIncompleteTasks) {
      const remainingTasks = totalTasks - completedTasks;
      
      setTimeout(() => {
        toast.info(
          remainingTasks === 1
            ? t('dashboard.nudge.toast.oneTaskLeft')
            : t('dashboard.nudge.toast.tasksRemaining', { count: remainingTasks }),
          {
            description: t('dashboard.nudge.toast.continueSecuring'),
            duration: 8000,
            action: {
              label: t('dashboard.nudge.toast.viewTasks'),
              onClick: () => {
                // Scroll to tasks section
                const tasksSection = document.querySelector('[data-tasks-section]');
                if (tasksSection) {
                  tasksSection.scrollIntoView({ behavior: 'smooth' });
                }
              },
            },
            onDismiss: () => {
              dismissToast();
            },
          }
        );
      }, 3000); // Show after 3 seconds
    }
  }, [shouldShowToast, hasIncompleteTasks, totalTasks, completedTasks, t]);

  const dismissNudge = useCallback(() => {
    setShouldShowNudge(false);
    // Dismiss for 24 hours
    const dismissUntil = new Date();
    dismissUntil.setHours(dismissUntil.getHours() + 24);
    localStorage.setItem('legacyguard-nudge-dismissed-until', dismissUntil.toISOString());
  }, []);

  const dismissToast = useCallback(() => {
    setShouldShowToast(false);
    // Dismiss for 48 hours (longer than nudge)
    const dismissUntil = new Date();
    dismissUntil.setHours(dismissUntil.getHours() + 48);
    localStorage.setItem('legacyguard-toast-dismissed-until', dismissUntil.toISOString());
  }, []);

  return {
    shouldShowNudge,
    shouldShowToast,
    dismissNudge,
    dismissToast,
    timeSinceLastVisit,
  };
};
