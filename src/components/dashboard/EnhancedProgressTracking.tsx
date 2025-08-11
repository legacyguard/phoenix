import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Target,
  Lock,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  Info,
  AlertCircle,
  ArrowRight,
  FileText,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ProgressStatus {
  completionScore: number;
  currentStage:
    | "Foundation"
    | "Buildout"
    | "Reinforcement"
    | "Advanced Planning"
    | "Legacy";
  completedItems: string[];
  pendingItems: string[];
  criticalGaps: string[];
}

interface StageDetails {
  name: string;
  key: string;
  description: string;
  range: [number, number];
  icon: React.ReactNode;
  color: string;
  keyTasks: {
    id: string;
    name: string;
    completed: boolean;
    priority: "critical" | "important" | "recommended";
    link: string;
  }[];
}

interface EnhancedProgressTrackingProps {
  progressStatus: ProgressStatus;
  className?: string;
}

export const EnhancedProgressTracking: React.FC<
  EnhancedProgressTrackingProps
> = ({ progressStatus, className }) => {
  const { t } = useTranslation("dashboard-main");

  const stages: StageDetails[] = [
    {
      name: t("progressTracking.stages.foundation.name"),
      key: "Foundation",
      description: t("progressTracking.stages.foundation.description"),
      range: [0, 25],
      icon: <Shield className="h-5 w-5" />,
      color: "text-blue-600",
      keyTasks: [
        {
          id: "basic-info",
          name: t("progressTracking.tasks.basicInfo"),
          completed: progressStatus.completedItems.includes("basic-info"),
          priority: "critical",
          link: "/profile",
        },
        {
          id: "emergency-contacts",
          name: t("progressTracking.tasks.emergencyContacts"),
          completed:
            progressStatus.completedItems.includes("emergency-contacts"),
          priority: "critical",
          link: "/manual",
        },
        {
          id: "key-documents",
          name: t("progressTracking.tasks.keyDocuments"),
          completed: progressStatus.completedItems.includes("key-documents"),
          priority: "important",
          link: "/vault",
        },
      ],
    },
    {
      name: t("progressTracking.stages.buildout.name"),
      key: "Buildout",
      description: t("progressTracking.stages.buildout.description"),
      range: [25, 60],
      icon: <Target className="h-5 w-5" />,
      color: "text-orange-600",
      keyTasks: [
        {
          id: "asset-inventory",
          name: t("progressTracking.tasks.assetInventory"),
          completed: progressStatus.completedItems.includes("asset-inventory"),
          priority: "important",
          link: "/assets",
        },
        {
          id: "beneficiaries",
          name: t("progressTracking.tasks.beneficiaries"),
          completed: progressStatus.completedItems.includes("beneficiaries"),
          priority: "critical",
          link: "/beneficiaries",
        },
        {
          id: "guardian-network",
          name: t("progressTracking.tasks.guardianNetwork"),
          completed: progressStatus.completedItems.includes("guardian-network"),
          priority: "important",
          link: "/guardians",
        },
      ],
    },
    {
      name: t("progressTracking.stages.reinforcement.name"),
      key: "Reinforcement",
      description: t("progressTracking.stages.reinforcement.description"),
      range: [60, 75],
      icon: <Lock className="h-5 w-5" />,
      color: "text-purple-600",
      keyTasks: [
        {
          id: "will-creation",
          name: t("progressTracking.tasks.willCreation"),
          completed: progressStatus.completedItems.includes("will-creation"),
          priority: "critical",
          link: "/will",
        },
        {
          id: "instructions",
          name: t("progressTracking.tasks.instructions"),
          completed: progressStatus.completedItems.includes("instructions"),
          priority: "important",
          link: "/manual#instructions",
        },
        {
          id: "access-verification",
          name: t("progressTracking.tasks.accessVerification"),
          completed: progressStatus.completedItems.includes(
            "access-verification",
          ),
          priority: "recommended",
          link: "/settings/security",
        },
      ],
    },
  ];

  const currentStageData =
    stages.find((s) => s.key === progressStatus.currentStage) || stages[0];
  const completedStages = stages.filter(
    (s) => progressStatus.completionScore > s.range[1],
  );
  const upcomingStages = stages.filter(
    (s) => progressStatus.completionScore < s.range[0],
  );

  const getTaskIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "important":
        return <Info className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className={cn("space-y-6 progress-tracking-section", className)}>
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {currentStageData.icon}
            {t("progressTracking.title")}
          </CardTitle>
          <CardDescription>{t("progressTracking.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("progressTracking.currentStage", {
                  stage: currentStageData.name,
                })}
              </span>
              <span className="text-2xl font-bold text-primary">
                {progressStatus.completionScore}%
              </span>
            </div>
            <Progress value={progressStatus.completionScore} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {t("progressTracking.progressDescription", {
                completed: progressStatus.completedItems.length,
                total:
                  progressStatus.completedItems.length +
                  progressStatus.pendingItems.length,
              })}
            </p>
          </div>

          {/* Critical Gaps Alert */}
          {progressStatus.criticalGaps.length > 0 && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="space-y-2">
                <p className="font-medium text-red-900 dark:text-red-100">
                  {t("progressTracking.criticalGaps.title")}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {progressStatus.criticalGaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Stage Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stages.slice(0, 3).map((stage) => {
              const isComplete =
                progressStatus.completionScore > stage.range[1];
              const isCurrent = stage.key === progressStatus.currentStage;
              const isLocked = progressStatus.completionScore < stage.range[0];

              return (
                <Card
                  key={stage.key}
                  className={cn(
                    "relative overflow-hidden transition-all",
                    isComplete &&
                      "bg-green-50 dark:bg-green-950/20 border-green-200",
                    isCurrent && "bg-primary/5 border-primary",
                    isLocked && "opacity-60",
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isComplete ? "bg-green-100" : "bg-gray-100",
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className={stage.color}>{stage.icon}</div>
                        )}
                      </div>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          {t("progressTracking.current")}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3">{stage.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {stage.description}
                    </p>
                    <div className="text-xs font-medium text-muted-foreground">
                      {t("progressTracking.completionRange", {
                        min: stage.range[0],
                        max: stage.range[1],
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Current Stage Tasks */}
          {currentStageData && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                {currentStageData.icon}
                {t("progressTracking.currentTasks", {
                  stage: currentStageData.name,
                })}
              </h4>
              <div className="space-y-2">
                {currentStageData.keyTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      task.completed
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200"
                        : "bg-white dark:bg-gray-950",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        getTaskIcon(task.priority)
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          task.completed && "line-through opacity-60",
                        )}
                      >
                        {task.name}
                      </span>
                      {!task.completed && task.priority === "critical" && (
                        <Badge variant="destructive" className="text-xs">
                          {t("progressTracking.critical")}
                        </Badge>
                      )}
                    </div>
                    {!task.completed && (
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to={task.link}
                          className="flex items-center gap-1"
                        >
                          {t("progressTracking.complete")}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
