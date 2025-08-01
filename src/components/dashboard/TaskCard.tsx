import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { TaskItem } from '@/components/onboarding/OnboardingWizard';

interface TaskCardProps {
  task: TaskItem;
  onToggleComplete: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onStartTask }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${task.completed ? 'opacity-75 bg-muted/50' : 'hover:shadow-lg'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleComplete(task.id)}
                className="flex items-center justify-center"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                )}
              </button>
              <CardTitle className={`text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                {getPriorityIcon(task.priority)} {task.priority}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {task.pillar}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className={`mb-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.description}
        </CardDescription>
        <p className="text-sm italic text-muted-foreground mb-4">
          {t(`dashboard.tasks.pillarContext.${task.pillar}`, { 
            pillar: t(`pillars.${task.pillar}.title`).toUpperCase() 
          })}
        </p>
        {!task.completed && (
          <Button 
            onClick={() => task.link ? navigate(task.link) : onStartTask(task.id)}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {t('dashboard.tasks.startPreparation')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};