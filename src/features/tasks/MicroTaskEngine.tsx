import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Shield,
  Heart
} from 'lucide-react';
import { TaskSequence, MicroTask } from '@/types/tasks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTaskProgress } from '@/hooks/useTaskProgress';

interface MicroTaskEngineProps {
  taskSequence: TaskSequence;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: Record<string, any>) => void;
}

export function MicroTaskEngine({
  taskSequence,
  isOpen,
  onClose,
  onComplete
}: MicroTaskEngineProps) {
  
  // Use the custom hook for progress synchronization with Clerk
  const { progress, isLoading, updateProgress } = useTaskProgress(taskSequence.id);
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskData, setTaskData] = useState<Record<string, any>>({});
  const [currentValue, setCurrentValue] = useState<any>('');
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const currentTask = taskSequence.tasks[currentTaskIndex];
  const isLastTask = currentTaskIndex === taskSequence.tasks.length - 1;
  const progressPercentage = ((currentTaskIndex) / taskSequence.tasks.length) * 100;

  // Initialize from synced progress when available
  useEffect(() => {
    if (!isLoading && progress && !taskData[currentTask?.id]) {
      setCurrentTaskIndex(progress.currentTaskIndex || 0);
      setTaskData(progress.data || {});
    }
  }, [isLoading, progress]);

  useEffect(() => {
    // Reset current value when task changes
    setCurrentValue(taskData[currentTask?.id] || '');
    setValidationError('');
  }, [currentTaskIndex, currentTask?.id, taskData]);

  useEffect(() => {
    // Validate current input
    if (!currentTask) return;
    
    const { component, required, validation } = currentTask;
    
    if (component === 'Confirmation') {
      setIsValid(currentValue === true);
    } else if (required) {
      let valid = currentValue && currentValue.toString().trim().length > 0;
      
      if (valid && validation) {
        if (validation.minLength && currentValue.length < validation.minLength) {
          valid = false;
          setValidationError(validation.message || 'Value is too short');
        }
        if (validation.maxLength && currentValue.length > validation.maxLength) {
          valid = false;
          setValidationError(validation.message || 'Value is too long');
        }
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(currentValue)) {
            valid = false;
            setValidationError(validation.message || 'Invalid format');
          }
        }
      }
      
      setIsValid(valid);
    } else {
      setIsValid(true);
    }
  }, [currentValue, currentTask]);

  const handleNext = async () => {
    if (!isValid && currentTask.required) return;

    // Save current task data
    const newTaskData = {
      ...taskData,
      [currentTask.id]: currentValue
    };
    setTaskData(newTaskData);

    // Show reassuring message (not gamified, per WARP.md)
    if (currentTask.completionMessage) {
      toast.success(currentTask.completionMessage, {
        icon: <Heart className="w-4 h-4 text-primary" />,
        duration: 3000,
      });
    }

    if (isLastTask) {
      // Complete the sequence
      await handleComplete(newTaskData);
    } else {
      // Move to next task
      const nextIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      setCurrentValue('');
      
      // Update progress in Clerk and localStorage
      await updateProgress({
        currentTaskIndex: nextIndex,
        completedTasks: taskSequence.tasks.slice(0, nextIndex).map(t => t.id),
        data: newTaskData
      });
    }
  };

  const handleComplete = async (finalData: Record<string, any>) => {
    // Update progress with completion status (syncs to Clerk and localStorage)
    await updateProgress({
      currentTaskIndex: taskSequence.tasks.length,
      completedTasks: taskSequence.tasks.map(t => t.id),
      data: finalData,
      completedAt: new Date().toISOString()
    });
    
    if (onComplete) {
      onComplete(finalData);
    }
    
    // Show completion message (empathetic, not gamified)
    toast.success(
      <div className="space-y-1">
        <p className="font-medium">Task completed successfully</p>
        <p className="text-sm text-muted-foreground">
          {taskSequence.completionBenefit}
        </p>
      </div>,
      {
        icon: <Shield className="w-4 h-4 text-primary" />,
        duration: 5000,
      }
    );
    
    onClose();
  };

  const handlePause = async () => {
    // Save current progress (syncs to Clerk and localStorage)
    await updateProgress({
      currentTaskIndex,
      completedTasks: taskSequence.tasks.slice(0, currentTaskIndex).map(t => t.id),
      data: taskData
    });
    
    toast.info('Progress saved', {
      description: 'You can continue from where you left off anytime',
    });
    
    onClose();
  };

  const renderTaskComponent = () => {
    if (!currentTask) return null;

    switch (currentTask.component) {
      case 'Input':
        return (
          <div className="space-y-2">
            <Label htmlFor="task-input">{currentTask.title}</Label>
            <Input
              id="task-input"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder={currentTask.placeholder}
              className={cn(
                "transition-all duration-300",
                validationError && "border-red-500 focus:ring-red-500"
              )}
              autoFocus
            />
            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}
          </div>
        );

      case 'Textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor="task-textarea">{currentTask.title}</Label>
            <Textarea
              id="task-textarea"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder={currentTask.placeholder}
              className="min-h-[100px] transition-all duration-300"
              autoFocus
            />
          </div>
        );

      case 'Confirmation':
        return (
          <div className="space-y-4">
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                {currentTask.description}
              </AlertDescription>
            </Alert>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="task-confirmation"
                checked={currentValue === true}
                onCheckedChange={(checked) => setCurrentValue(checked)}
              />
              <Label 
                htmlFor="task-confirmation" 
                className="text-sm leading-relaxed cursor-pointer"
              >
                {currentTask.title}
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while fetching progress from Clerk
  if (isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading your progress...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!currentTask) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:max-w-lg overflow-y-auto"
        style={{
          backgroundColor: 'var(--background)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <SheetHeader className="space-y-4">
          {/* Progress indicator (not percentage-based, per WARP.md) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentTaskIndex + 1} of {taskSequence.tasks.length}
              </span>
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {currentTask.estimatedTime} min
              </Badge>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              style={{
                '--progress-background': 'var(--primary)',
              } as React.CSSProperties}
            />
          </div>

          <div>
            <SheetTitle className="text-xl font-semibold">
              {taskSequence.title}
            </SheetTitle>
            {taskSequence.scenario && (
              <SheetDescription className="mt-2 text-sm italic text-muted-foreground">
                {taskSequence.scenario}
              </SheetDescription>
            )}
          </div>
        </SheetHeader>

        <div className="my-6 space-y-6">
          {/* Task description */}
          <div className="space-y-3">
            <p className="text-base leading-relaxed">
              {currentTask.description}
            </p>
            
            {currentTask.whyImportant && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <Heart className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  {currentTask.whyImportant}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Task input component */}
          {renderTaskComponent()}
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handlePause}
            size="default"
          >
            Save & Continue Later
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isValid && currentTask.required}
            size="default"
            className={cn(
              isLastTask && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isLastTask ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
