import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  FileText,
  Users,
  Shield,
  Wallet,
  Clock,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import {
  LifeEventChecklist,
  ChecklistTask,
  LifeEventService,
} from "@/services/LifeEventService";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface LifeEventUpdateWorkflowProps {
  checklist: LifeEventChecklist;
  userId: string;
  onComplete?: () => void;
  onExit?: () => void;
}

const taskIcons: Record<string, LucideIcon> = {
  update_beneficiaries: Users,
  update_will: FileText,
  review_trusts: Shield,
  update_emergency_contacts: Users,
  add_child_roster: Users,
  update_guardian: Shield,
  review_life_insurance: Shield,
  update_property_armory: Wallet,
  update_mortgage_info: FileText,
  review_homeowners_insurance: Shield,
  add_business_assets: Wallet,
  create_succession_plan: FileText,
  remove_deceased: Users,
  appoint_new_executor: Shield,
};

export const LifeEventUpdateWorkflow: React.FC<
  LifeEventUpdateWorkflowProps
> = ({ checklist, userId, onComplete, onExit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] =
    useState(false);

  const currentTask = checklist.tasks[currentTaskIndex];
  const progress = (completedTasks.size / checklist.tasks.length) * 100;
  const TaskIcon = taskIcons[currentTask?.id] || FileText;

  useEffect(() => {
    // Load saved progress
    const savedTasks = checklist.tasks.filter((task) => task.completed);
    setCompletedTasks(new Set(savedTasks.map((t) => t.id)));
  }, [checklist]);

  const handleTaskComplete = async () => {
    if (!currentTask) return;

    // Mark task as completed
    const newCompletedTasks = new Set(completedTasks);
    newCompletedTasks.add(currentTask.id);
    setCompletedTasks(newCompletedTasks);

    // Update in service
    LifeEventService.updateTaskStatus(
      userId,
      checklist.eventId,
      currentTask.id,
      true,
    );

    // Check if all tasks are completed
    if (newCompletedTasks.size === checklist.tasks.length) {
      handleAllTasksComplete();
    } else {
      // Move to next incomplete task
      moveToNextTask();
    }
  };

  const handleAllTasksComplete = () => {
    setShowCompletionCelebration(true);

    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast({
      title: t("lifeEvents.workflow.allComplete"),
      description: t("lifeEvents.workflow.allCompleteDesc"),
    });

    setTimeout(() => {
      onComplete?.();
    }, 3000);
  };

  const moveToNextTask = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      let nextIndex = currentTaskIndex + 1;
      while (
        nextIndex < checklist.tasks.length &&
        completedTasks.has(checklist.tasks[nextIndex].id)
      ) {
        nextIndex++;
      }
      if (nextIndex < checklist.tasks.length) {
        setCurrentTaskIndex(nextIndex);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const moveToPreviousTask = () => {
    if (currentTaskIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTaskIndex(currentTaskIndex - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSkipTask = () => {
    toast({
      title: t("lifeEvents.workflow.taskSkipped"),
      description: t("lifeEvents.workflow.taskSkippedDesc"),
    });
    moveToNextTask();
  };

  const handleStartTask = () => {
    navigate(currentTask.actionUrl);
  };

  const handleTaskSelection = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTaskIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (showCompletionCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[600px]"
      >
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full">
              <Trophy className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              {t("lifeEvents.workflow.congratulations")}
            </CardTitle>
            <CardDescription className="text-lg">
              {t("lifeEvents.workflow.congratulationsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {t("lifeEvents.workflow.protectionUpdated")}
                </p>
              </div>
              <Progress value={100} className="h-3" />
              <p className="text-sm text-gray-500">
                {t("lifeEvents.workflow.tasksCompleted", {
                  count: checklist.tasks.length,
                })}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onComplete} className="w-full">
              {t("lifeEvents.workflow.backToDashboard")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {checklist.eventTitle}
              </CardTitle>
              <CardDescription>
                {t("lifeEvents.workflow.progress", {
                  completed: completedTasks.size,
                  total: checklist.tasks.length,
                })}
              </CardDescription>
            </div>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {t("lifeEvents.workflow.estimatedTime", {
                minutes: (checklist.tasks.length - completedTasks.size) * 10,
              })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">
              {t("lifeEvents.workflow.taskList")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {checklist.tasks.map((task, index) => {
                  const isCompleted = completedTasks.has(task.id);
                  const isCurrent = index === currentTaskIndex;
                  const Icon = taskIcons[task.id] || FileText;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleTaskSelection(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isCurrent
                            ? "bg-blue-50 border-2 border-blue-300"
                            : isCompleted
                              ? "bg-green-50 hover:bg-green-100"
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              isCompleted
                                ? "bg-green-100 text-green-600"
                                : isCurrent
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                isCompleted ? "text-green-800 line-through" : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-gray-500 mt-1">
                                {t("lifeEvents.workflow.currentTask")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Current Task Detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <TaskIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>{currentTask?.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {t("lifeEvents.workflow.step", {
                      current: currentTaskIndex + 1,
                      total: checklist.tasks.length,
                    })}
                  </CardDescription>
                </div>
              </div>
              {completedTasks.has(currentTask?.id) && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t("lifeEvents.workflow.completed")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentTask?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Task Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t("lifeEvents.workflow.whyImportant")}
                </h4>
                <p className="text-sm text-gray-600">
                  {currentTask?.description}
                </p>
              </div>

              {/* Action Area */}
              {!completedTasks.has(currentTask?.id) ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("lifeEvents.workflow.actionRequired")}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button onClick={handleStartTask} className="flex-1">
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {t("lifeEvents.workflow.startTask")}
                    </Button>
                    <Button variant="outline" onClick={handleTaskComplete}>
                      {t("lifeEvents.workflow.markComplete")}
                    </Button>
                  </div>

                  <button
                    onClick={handleSkipTask}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    {t("lifeEvents.workflow.skipForNow")}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    {t("lifeEvents.workflow.taskCompleted")}
                  </p>
                </div>
              )}
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={moveToPreviousTask}
              disabled={currentTaskIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("lifeEvents.workflow.previous")}
            </Button>
            <Button
              onClick={moveToNextTask}
              disabled={currentTaskIndex === checklist.tasks.length - 1}
            >
              {t("lifeEvents.workflow.next")}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Exit Button */}
      <div className="text-center">
        <Button variant="ghost" onClick={onExit}>
          {t("lifeEvents.workflow.saveAndExit")}
        </Button>
      </div>
    </div>
  );
};
