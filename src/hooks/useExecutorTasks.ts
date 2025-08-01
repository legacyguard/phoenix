import { useState, useEffect } from 'react';
import { ExecutorTaskService } from '@/services/executorTaskService';
import { useAuth } from '@/contexts/AuthContext';

interface ExecutorTask {
  id: string;
  title: string;
  details: string;
  status: 'pending' | 'completed';
  category: 'immediate' | 'first_week' | 'ongoing';
  priority: number;
  due_date?: string;
  completed_at?: string;
  related_document_ids?: string[];
}

interface GroupedTasks {
  immediate: ExecutorTask[];
  first_week: ExecutorTask[];
  ongoing: ExecutorTask[];
}

interface UseExecutorTasksReturn {
  tasks: GroupedTasks;
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
  refreshTasks: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'pending' | 'completed') => Promise<void>;
}

export function useExecutorTasks(): UseExecutorTasksReturn {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<GroupedTasks>({
    immediate: [],
    first_week: [],
    ongoing: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const taskList = await ExecutorTaskService.getExecutorTasks(user.id);
      
      // Group tasks by category
      const grouped: GroupedTasks = {
        immediate: taskList.filter(t => t.category === 'immediate'),
        first_week: taskList.filter(t => t.category === 'first_week'),
        ongoing: taskList.filter(t => t.category === 'ongoing')
      };
      
      setTasks(grouped);
      
      // Calculate stats
      setStats({
        total: taskList.length,
        completed: taskList.filter(t => t.status === 'completed').length,
        pending: taskList.filter(t => t.status === 'pending').length
      });
    } catch (err) {
      console.error('Failed to fetch executor tasks:', err);
      setError('Failed to load executor tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'pending' | 'completed') => {
    if (!user) return;
    
    try {
      await ExecutorTaskService.updateTaskStatus(taskId, status, user.id);
      // Refresh tasks after update
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status. Please try again.');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  return {
    tasks,
    loading,
    error,
    stats,
    refreshTasks: fetchTasks,
    updateTaskStatus
  };
}
