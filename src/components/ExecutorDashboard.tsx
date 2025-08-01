import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, Key, Scale, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExecutorTaskService } from '@/services/executorTaskService';
import { JustInTimeAccess } from './JustInTimeAccess';
import { BeneficiaryCommunicationLog } from './BeneficiaryCommunicationLog';
import { ExecutorStatusReporting } from './ExecutorStatusReporting';
import LegalConsultationModal from '@/components/LegalConsultationModal';

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
  deceased_user_id?: string;
}

interface GroupedTasks {
  immediate: ExecutorTask[];
  first_week: ExecutorTask[];
  ongoing: ExecutorTask[];
}

const ExecutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<GroupedTasks>({
    immediate: [],
    first_week: [],
    ongoing: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['immediate']));
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [hasSensitiveInfo, setHasSensitiveInfo] = useState<Record<string, boolean>>({});
  const [deceasedUserId, setDeceasedUserId] = useState<string | null>(null);
  const [showLegalConsultation, setShowLegalConsultation] = useState(false);

  useEffect(() => {
     
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const taskList = await ExecutorTaskService.getExecutorTasks(user!.id);

      // Get deceased user ID from the first task if available
      if (taskList.length > 0 && taskList[0].deceased_user_id) {
        setDeceasedUserId(taskList[0].deceased_user_id);
      }

      // Group tasks by category
      const grouped: GroupedTasks = {
        immediate: taskList.filter((t) => t.category === 'immediate'),
        first_week: taskList.filter((t) => t.category === 'first_week'),
        ongoing: taskList.filter((t) => t.category === 'ongoing')
      };

      setTasks(grouped);

      // Calculate stats
      setStats({
        total: taskList.length,
        completed: taskList.filter((t) => t.status === 'completed').length,
        pending: taskList.filter((t) => t.status === 'pending').length
      });

      // Check which tasks have associated sensitive information
      await checkSensitiveInfoAvailability(taskList);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(t('executor.errors.loadTasksFailed'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const checkSensitiveInfoAvailability = async (tasks: ExecutorTask[]) => {
    try {
      const taskIds = tasks.map((t) => t.id);
      const { data, error } = await supabase.
      from('sensitive_vault').
      select('task_associations').
      overlaps('task_associations', taskIds);

      if (!error && data) {
        const infoMap: Record<string, boolean> = {};
        tasks.forEach((task) => {
          infoMap[task.id] = data.some((item) =>
          item.task_associations?.includes(task.id)
          );
        });
        setHasSensitiveInfo(infoMap);
      }
    } catch (err) {
      console.error('Failed to check sensitive info availability:', err);
    }
  };


  const toggleTaskCompletion = async (taskId: string, currentStatus: 'pending' | 'completed') => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await ExecutorTaskService.updateTaskStatus(taskId, newStatus, user!.id);

      // Refresh tasks
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
      setError(t('executor.errors.updateTaskFailed'));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderTaskList = (taskList: ExecutorTask[], emptyMessage: string) => {
    if (taskList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
          <p>{emptyMessage}</p>
        </div>);

    }

    return (
      <div className="space-y-3">
        {taskList.map((task) =>
        <Card key={task.id} className={`transition-all ${task.status === 'completed' ? 'opacity-75' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h4>
                    {task.priority <= 3 && task.status === 'pending' &&
                  <Badge variant="destructive" className="text-xs">
                        {t('executor.highPriority')}
                      </Badge>
                  }
                  </div>
                  
                  {task.status === 'pending' &&
                <p className="text-sm text-muted-foreground mb-3">
                      {task.details}
                    </p>
                }
                  
                  {task.due_date && task.status === 'pending' &&
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{t('executor.due')}: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                }
                  
                  {task.completed_at &&
                <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t('executor.completed')}: {new Date(task.completed_at).toLocaleDateString()}</span>
                    </div>
                }
                </div>
                
                <Button
                variant={task.status === 'completed' ? 'outline' : 'default'}
                size="sm"
                onClick={() => toggleTaskCompletion(task.id, task.status)}
                className="flex-shrink-0">

                  {task.status === 'completed' ?
                <>{t('executor.undo')}</> :

                <>{t('executor.markComplete')}</>
                }
                </Button>
              </div>

              
              {/* View Sensitive Information Button - Only show if sensitive info exists */}
              {hasSensitiveInfo[task.id] &&
            <div className="mt-3 pt-3 border-t">
                  <JustInTimeAccess
                taskId={task.id}
                taskTitle={task.title}
                trigger={
                <Button variant="link" size="sm" className="text-xs p-0 h-auto flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        {t('executor.viewAccountDetails')}
                      </Button>
                } />

                </div>
            }

              {task.related_document_ids && task.related_document_ids.length > 0 &&
            <div className="mt-3 pt-3 border-t">
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                    {t('executor.viewRelatedDocuments', { count: task.related_document_ids.length })}
                  </Button>
                </div>
            }
            </CardContent>
          </Card>
        )}
      </div>);

  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>);

  }

  if (error) {
    return (
      <Alert className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>);

  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('executor.dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('executor.dashboard.subtitle')}
        </p>
      </div>

      {/* Status Reporting Section */}
      {deceasedUserId &&
      <ExecutorStatusReporting deceasedUserId={deceasedUserId} />
      }

      {/* Legal Support Section */}
      <Card className="mb-8 border-earth-primary/20 bg-earth-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-earth-primary/10 rounded-lg">
                <Scale className="h-6 w-6 text-earth-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  {t('executor.legalSupport.title', 'Legal Support for Executors')}
                  <Badge variant="secondary">{t("executorDashboard.professional_guidance_1")}</Badge>
                </h3>
                <p className="text-muted-foreground">
                  {t('executor.legalSupport.description',
                  'Facing a complex issue? As the executor, you can request guidance on specific legal matters related to the estate settlement process from our partnered experts.'
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowLegalConsultation(true)}
              className="bg-earth-primary hover:bg-earth-primary/90">

              <HelpCircle className="mr-2 h-4 w-4" />
              {t('executor.legalSupport.button', 'Get Executor Guidance')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="flex gap-4 mb-8">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">{t('executor.stats.totalTasks')}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">{t('executor.stats.completed')}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">{t('executor.stats.remaining')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Immediate Tasks Section */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('immediate')}>

            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  {t('executor.sections.immediate.title')}
                </CardTitle>
                <CardDescription>
                  {t('executor.sections.immediate.description')}
                </CardDescription>
              </div>
              {expandedSections.has('immediate') ?
              <ChevronDown className="h-5 w-5" /> :

              <ChevronRight className="h-5 w-5" />
              }
            </div>
          </CardHeader>
          {expandedSections.has('immediate') &&
          <CardContent>
              {renderTaskList(tasks.immediate, t('executor.sections.immediate.empty'))}
            </CardContent>
          }
        </Card>

        {/* First Week Tasks Section */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('first_week')}>

            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  {t('executor.sections.firstWeek.title')}
                </CardTitle>
                <CardDescription>
                  {t('executor.sections.firstWeek.description')}
                </CardDescription>
              </div>
              {expandedSections.has('first_week') ?
              <ChevronDown className="h-5 w-5" /> :

              <ChevronRight className="h-5 w-5" />
              }
            </div>
          </CardHeader>
          {expandedSections.has('first_week') &&
          <CardContent>
              {renderTaskList(tasks.first_week, t('executor.sections.firstWeek.empty'))}
            </CardContent>
          }
        </Card>

        {/* Ongoing Tasks Section */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('ongoing')}>

            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('executor.sections.ongoing.title')}</CardTitle>
                <CardDescription>
                  {t('executor.sections.ongoing.description')}
                </CardDescription>
              </div>
              {expandedSections.has('ongoing') ?
              <ChevronDown className="h-5 w-5" /> :

              <ChevronRight className="h-5 w-5" />
              }
            </div>
          </CardHeader>
          {expandedSections.has('ongoing') &&
          <CardContent>
              {renderTaskList(tasks.ongoing, t('executor.sections.ongoing.empty'))}
            </CardContent>
          }
        </Card>
      </div>

      {/* Communication and Reporting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {deceasedUserId &&
        <BeneficiaryCommunicationLog deceasedUserId={deceasedUserId} />
        }
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          {t('executor.dashboard.reminder')}
        </p>
      </div>

      {/* Legal Consultation Modal */}
      {showLegalConsultation &&
      <LegalConsultationModal
        isOpen={showLegalConsultation}
        onClose={() => setShowLegalConsultation(false)}
        preselectedType="executor_guidance"
        contextData={{
          role: 'executor',
          deceasedUserId,
          taskCount: stats.total,
          completedTasks: stats.completed
        }} />

      }
    </div>);

};

export default ExecutorDashboard;