import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { TaskProgress } from '@/types/tasks';
import { toast } from 'sonner';

interface UseTaskProgressReturn {
  progress: TaskProgress | null;
  isLoading: boolean;
  updateProgress: (progress: Partial<TaskProgress>) => Promise<void>;
  clearProgress: () => Promise<void>;
}

/**
 * Custom hook for managing task progress with Clerk metadata synchronization
 * Following WARP.md privacy-first architecture principles
 */
export function useTaskProgress(sequenceId: string): UseTaskProgressReturn {
  const { user, isLoaded } = useUser();
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial progress from Clerk or localStorage
  useEffect(() => {
    if (!isLoaded || !sequenceId) {
      setIsLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        // First, try to get progress from Clerk's publicMetadata
        const clerkProgress = user?.publicMetadata?.taskProgress as Record<string, TaskProgress> | undefined;
        
        if (clerkProgress?.[sequenceId]) {
          setProgress(clerkProgress[sequenceId]);
          
          // Also update localStorage as a backup
          localStorage.setItem(
            `task_progress_${sequenceId}`,
            JSON.stringify(clerkProgress[sequenceId])
          );
        } else {
          // Fallback to localStorage if not in Clerk
          const localProgressStr = localStorage.getItem(`task_progress_${sequenceId}`);
          
          if (localProgressStr) {
            const localProgress: TaskProgress = JSON.parse(localProgressStr);
            setProgress(localProgress);
            
            // Try to sync to Clerk if user is available
            if (user) {
              await syncToClerk(localProgress);
            }
          }
        }
      } catch (error) {
        console.error('Error loading task progress:', error);
        
        // Final fallback: try localStorage only
        try {
          const localProgressStr = localStorage.getItem(`task_progress_${sequenceId}`);
          if (localProgressStr) {
            setProgress(JSON.parse(localProgressStr));
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user, isLoaded, sequenceId]);

  // Helper function to sync progress to Clerk
  const syncToClerk = async (progressData: TaskProgress) => {
    if (!user) return;

    try {
      const currentTaskProgress = (user.publicMetadata?.taskProgress as Record<string, TaskProgress>) || {};
      
      const updatedTaskProgress = {
        ...currentTaskProgress,
        [sequenceId]: progressData
      };

      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          taskProgress: updatedTaskProgress
        }
      });
    } catch (error) {
      console.error('Failed to sync progress to Clerk:', error);
      // Don't throw - we still have the data in localStorage
    }
  };

  // Update progress function
  const updateProgress = useCallback(async (updates: Partial<TaskProgress>) => {
    const newProgress: TaskProgress = {
      sequenceId,
      currentTaskIndex: progress?.currentTaskIndex || 0,
      completedTasks: progress?.completedTasks || [],
      data: progress?.data || {},
      startedAt: progress?.startedAt || new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      ...updates
    };

    // Update local state immediately for responsiveness
    setProgress(newProgress);

    // Save to localStorage immediately (privacy-first, offline-first)
    try {
      localStorage.setItem(`task_progress_${sequenceId}`, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save progress to localStorage:', error);
      toast.error('Could not save your progress locally.');
    }

    // Async sync to Clerk (non-blocking)
    if (user) {
      try {
        const currentTaskProgress = (user.publicMetadata?.taskProgress as Record<string, TaskProgress>) || {};
        
        const updatedTaskProgress = {
          ...currentTaskProgress,
          [sequenceId]: newProgress
        };

        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            taskProgress: updatedTaskProgress
          }
        });
      } catch (error) {
        console.error('Failed to sync progress to Clerk:', error);
        toast.error('Could not sync your progress to the cloud.');
      }
    }
  }, [user, sequenceId, progress]);

  // Clear progress function
  const clearProgress = useCallback(async () => {
    setProgress(null);

    // Clear from localStorage
    try {
      localStorage.removeItem(`task_progress_${sequenceId}`);
    } catch (error) {
      console.error('Failed to clear progress from localStorage:', error);
    }

    // Clear from Clerk
    if (user) {
      try {
        const currentTaskProgress = (user.publicMetadata?.taskProgress as Record<string, TaskProgress>) || {};
        
        // Remove this sequence from the task progress
        const { [sequenceId]: removed, ...remainingProgress } = currentTaskProgress;

        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            taskProgress: remainingProgress
          }
        });
      } catch (error) {
        console.error('Failed to clear progress from Clerk:', error);
        // Silent fail
      }
    }
  }, [user, sequenceId]);

  return {
    progress,
    isLoading,
    updateProgress,
    clearProgress
  };
}

/**
 * Hook to get all task progress for the dashboard
 */
export function useAllTaskProgress(): {
  allProgress: Record<string, TaskProgress>;
  isLoading: boolean;
} {
  const { user, isLoaded } = useUser();
  const [allProgress, setAllProgress] = useState<Record<string, TaskProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(false);
      return;
    }

    const loadAllProgress = async () => {
      try {
        // Get all progress from Clerk's publicMetadata
        const clerkProgress = (user?.publicMetadata?.taskProgress as Record<string, TaskProgress>) || {};
        setAllProgress(clerkProgress);

        // Also check localStorage for any progress not yet synced
        const localStorageKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('task_progress_')
        );

        for (const key of localStorageKeys) {
          const sequenceId = key.replace('task_progress_', '');
          
          // If this sequence isn't in Clerk, add it from localStorage
          if (!clerkProgress[sequenceId]) {
            try {
              const localProgressStr = localStorage.getItem(key);
              if (localProgressStr) {
                const localProgress: TaskProgress = JSON.parse(localProgressStr);
                clerkProgress[sequenceId] = localProgress;
              }
            } catch (error) {
              console.error(`Error parsing localStorage progress for ${sequenceId}:`, error);
            }
          }
        }

        setAllProgress(clerkProgress);
      } catch (error) {
        console.error('Error loading all task progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllProgress();
  }, [user, isLoaded]);

  return {
    allProgress,
    isLoading
  };
}
