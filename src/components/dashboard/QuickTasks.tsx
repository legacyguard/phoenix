import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  AlertTriangle,
  FileText,
  Users,
  Heart,
  Building,
  Car,
  Wallet,
  Shield,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  category: 'documents' | 'guardians' | 'assets' | 'beneficiaries' | 'legal';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  action: () => void;
  icon: React.ReactNode;
}

interface QuickTasksProps {
  onTaskComplete: (taskId: string) => void;
  onTaskStart: (taskId: string) => void;
}

export const QuickTasks: React.FC<QuickTasksProps> = ({
  onTaskComplete,
  onTaskStart
}) => {
  const { t } = useTranslation('dashboard');
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
     
    generateTasks();
  }, [generateTasks]);

  const generateTasks = useCallback(() => {
    const allTasks: QuickTask[] = [
      // Document tasks
      {
        id: 'upload-birth-certificate',
        title: t('dashboard.quickTasks.tasks.birthCertificate.title'),
        description: t('dashboard.quickTasks.tasks.birthCertificate.description'),
        estimatedTime: 3,
        category: 'documents',
        priority: 'high',
        completed: false,
        action: () => console.log('Upload birth certificate'),
        icon: <FileText className="h-4 w-4" />,

      },
      {
        id: 'upload-insurance-policy',
        title: t('dashboard.quickTasks.tasks.insurancePolicy.title'),
        description: t('dashboard.quickTasks.tasks.insurancePolicy.description'),
        estimatedTime: 5,
        category: 'documents',
        priority: 'high',
        completed: false,
        action: () => console.log('Upload insurance policy'),
        icon: <Shield className="h-4 w-4" />
      },
      {
        id: 'upload-will',
        title: t('dashboard.quickTasks.tasks.will.title'),
        description: t('dashboard.quickTasks.tasks.will.description'),
        estimatedTime: 4,
        category: 'documents',
        priority: 'medium',
        completed: false,
        action: () => console.log('Upload will'),
        icon: <FileText className="h-4 w-4" />
      },

      // Guardian tasks
      {
        id: 'add-spouse-guardian',
        title: t('dashboard.quickTasks.tasks.spouseGuardian.title'),
        description: t('dashboard.quickTasks.tasks.spouseGuardian.description'),
        estimatedTime: 2,
        category: 'guardians',
        priority: 'high',
        completed: false,
        action: () => console.log('Add spouse guardian'),
        icon: <Users className="h-4 w-4" />
      },
      {
        id: 'add-trusted-friend',
        title: t('dashboard.quickTasks.tasks.backupGuardian.title'),
        description: t('dashboard.quickTasks.tasks.backupGuardian.description'),
        estimatedTime: 3,
        category: 'guardians',
        priority: 'medium',
        completed: false,
        action: () => console.log('Add trusted friend'),
        icon: <Users className="h-4 w-4" />
      },

      // Asset tasks
      {
        id: 'add-bank-account',
        title: t('dashboard.quickTasks.tasks.bankAccount.title'),
        description: t('dashboard.quickTasks.tasks.bankAccount.description'),
        estimatedTime: 2,
        category: 'assets',
        priority: 'high',
        completed: false,
        action: () => console.log('Add bank account'),
        icon: <Wallet className="h-4 w-4" />
      },
      {
        id: 'add-home-property',
        title: t('dashboard.quickTasks.tasks.homeProperty.title'),
        description: t('dashboard.quickTasks.tasks.homeProperty.description'),
        estimatedTime: 3,
        category: 'assets',
        priority: 'high',
        completed: false,
        action: () => console.log('Add home property'),
        icon: <Building className="h-4 w-4" />
      },
      {
        id: 'add-vehicle',
        title: t('dashboard.quickTasks.tasks.vehicle.title'),
        description: t('dashboard.quickTasks.tasks.vehicle.description'),
        estimatedTime: 2,
        category: 'assets',
        priority: 'medium',
        completed: false,
        action: () => console.log('Add vehicle'),
        icon: <Car className="h-4 w-4" />
      },

      // Beneficiary tasks
      {
        id: 'add-spouse-beneficiary',
        title: t('dashboard.quickTasks.tasks.spouseBeneficiary.title'),
        description: t('dashboard.quickTasks.tasks.spouseBeneficiary.description'),
        estimatedTime: 2,
        category: 'beneficiaries',
        priority: 'high',
        completed: false,
        action: () => console.log('Add spouse beneficiary'),
        icon: <Heart className="h-4 w-4" />
      },
      {
        id: 'add-children-beneficiaries',
        title: t('dashboard.quickTasks.tasks.childrenBeneficiaries.title'),
        description: t('dashboard.quickTasks.tasks.childrenBeneficiaries.description'),
        estimatedTime: 3,
        category: 'beneficiaries',
        priority: 'high',
        completed: false,
        action: () => console.log('Add children beneficiaries'),
        icon: <Heart className="h-4 w-4" />
      }
    ];

    setTasks(allTasks);
  }, [t]);

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents':
        return <FileText className="h-4 w-4" />;
      case 'guardians':
        return <Users className="h-4 w-4" />;
      case 'assets':
        return <Building className="h-4 w-4" />;
      case 'beneficiaries':
        return <Heart className="h-4 w-4" />;
      case 'legal':
        return <Shield className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getWhyImportant = (taskId: string) => {
    switch (taskId) {
      case 'upload-birth-certificate':
        return t('dashboard.quickTasks.whyImportant.birthCertificate');
      case 'upload-insurance-policy':
        return t('dashboard.quickTasks.whyImportant.insurancePolicy');
      case 'upload-will':
        return t('dashboard.quickTasks.whyImportant.will');
      case 'add-spouse-guardian':
        return t('dashboard.quickTasks.whyImportant.spouseGuardian');
      case 'add-trusted-friend':
        return t('dashboard.quickTasks.whyImportant.trustedFriend');
      case 'add-bank-account':
        return t('dashboard.quickTasks.whyImportant.bankAccount');
      case 'add-home-property':
        return t('dashboard.quickTasks.whyImportant.homeProperty');
      case 'add-vehicle':
        return t('dashboard.quickTasks.whyImportant.vehicle');
      case 'add-spouse-beneficiary':
        return t('dashboard.quickTasks.whyImportant.spouseBeneficiary');
      case 'add-children-beneficiaries':
        return t('dashboard.quickTasks.whyImportant.childrenBeneficiaries');
      default:
        return t('dashboard.quickTasks.whyImportant.default');
    }
  };

  const getWhatHappensIfNot = (taskId: string) => {
    switch (taskId) {
      case 'upload-birth-certificate':
        return t('dashboard.quickTasks.ifNotDone.birthCertificate');
      case 'upload-insurance-policy':
        return t('dashboard.quickTasks.ifNotDone.insurancePolicy');
      case 'upload-will':
        return t('dashboard.quickTasks.ifNotDone.will');
      case 'add-spouse-guardian':
        return t('dashboard.quickTasks.ifNotDone.spouseGuardian');
      case 'add-trusted-friend':
        return t('dashboard.quickTasks.ifNotDone.trustedFriend');
      case 'add-bank-account':
        return t('dashboard.quickTasks.ifNotDone.bankAccount');
      case 'add-home-property':
        return t('dashboard.quickTasks.ifNotDone.homeProperty');
      case 'add-vehicle':
        return t('dashboard.quickTasks.ifNotDone.vehicle');
      case 'add-spouse-beneficiary':
        return t('dashboard.quickTasks.ifNotDone.spouseBeneficiary');
      case 'add-children-beneficiaries':
        return t('dashboard.quickTasks.ifNotDone.childrenBeneficiaries');
      default:
        return t('dashboard.quickTasks.ifNotDone.default');
    }
  };

  const handleTaskStart = (taskId: string) => {
    onTaskStart(taskId);
    // Mark task as in progress (could add a "in progress" state)
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    onTaskComplete(taskId);
  };

  const categories = [
    { id: 'all', name: t('dashboard.quickTasks.allTasks'), icon: <Circle className="h-4 w-4" /> },
    { id: 'documents', name: t('dashboard.quickTasks.documents'), icon: <FileText className="h-4 w-4" /> },
    { id: 'guardians', name: t('dashboard.quickTasks.guardians'), icon: <Users className="h-4 w-4" /> },
    { id: 'assets', name: t('dashboard.quickTasks.assets'), icon: <Building className="h-4 w-4" /> },
    { id: 'beneficiaries', name: t('dashboard.quickTasks.beneficiaries'), icon: <Heart className="h-4 w-4" /> }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('dashboard.quickTasks.title')}
          </CardTitle>
          <Badge variant="outline">
            {completedTasks}/{totalTasks} {t('dashboard.quickTasks.completed')}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t('dashboard.quickTasks.progress')}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.icon}
              <span className="ml-1">{category.name}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <p className="text-sm">{t('dashboard.quickTasks.allCompleted')}</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg transition-colors ${
                  task.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      task.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {task.icon}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                <Info className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-2">
                                <div className="font-medium">{t('dashboard.quickTasks.whyImportant')}</div>
                                <p className="text-sm">{getWhyImportant(task.id)}</p>
                                <div className="font-medium text-orange-600">{t('dashboard.quickTasks.ifNotDone')}</div>
                                <p className="text-sm">{getWhatHappensIfNot(task.id)}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {t(`ui:common.priority.${task.priority}`)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t('dashboard.quickTasks.minutes', { count: task.estimatedTime })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleTaskStart(task.id)}
                        className="h-8 px-3"
                      >
                        {t('dashboard.quickTasks.start')}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {!task.completed && (
                  <div className="mt-3 pt-3 border-t border-dashed">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskComplete(task.id)}
                      className="text-xs"
                    >
                      {t('dashboard.quickTasks.markAsComplete')}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {completedTasks > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.quickTasks.greatProgress', { count: completedTasks })}
              </p>
              {completedTasks >= 5 && (
                <p className="text-xs text-green-600 mt-1">
                  {t('dashboard.quickTasks.wellOnWay')}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 