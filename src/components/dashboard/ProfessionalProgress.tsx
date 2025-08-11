import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  FileText,
  Users,
  Heart,
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Star,
  Lock,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "documents" | "family" | "legal" | "financial" | "security";
  completed: boolean;
  priority: "immediate" | "high" | "medium" | "low";
  estimatedTime?: string;
  completedDate?: Date;
  link?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasksRequired: number;
  icon: React.ReactNode;
  achieved: boolean;
  achievedDate?: Date;
}

interface ProfessionalProgressProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  userName?: string;
  lastLogin?: Date;
  showMilestones?: boolean;
  showInsights?: boolean;
  compactMode?: boolean;
}

const ProfessionalProgress: React.FC<ProfessionalProgressProps> = ({
  tasks = [],
  onTaskClick,
  userName,
  lastLogin,
  showMilestones = true,
  showInsights = true,
  compactMode = false,
}) => {
  const { t } = useTranslation(["dashboard", "ui"]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "immediate",
  ]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "all" | "week" | "month"
  >("all");
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Calculate progress metrics
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  // Group tasks by category and priority
  const tasksByCategory = tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const tasksByPriority = tasks.reduce(
    (acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = [];
      }
      acc[task.priority].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  // Calculate time saved for completed tasks
  const timeSaved = tasks
    .filter((t) => t.completed && t.estimatedTime)
    .reduce((total, task) => {
      const match = task.estimatedTime?.match(/(\d+)/);
      return total + (match ? parseInt(match[1]) : 0);
    }, 0);

  // Define milestones
  const milestones: Milestone[] = [
    {
      id: "first-document",
      title: "First Document",
      description: "Upload your first important document",
      tasksRequired: 1,
      icon: <FileText className="w-5 h-5" />,
      achieved: completedTasks >= 1,
      achievedDate: completedTasks >= 1 ? new Date() : undefined,
    },
    {
      id: "essential-protection",
      title: "Essential Protection",
      description: "Basic security measures in place",
      tasksRequired: 5,
      icon: <Shield className="w-5 h-5" />,
      achieved: completedTasks >= 5,
      achievedDate: completedTasks >= 5 ? new Date() : undefined,
    },
    {
      id: "family-prepared",
      title: "Family Prepared",
      description: "Your family is well-prepared",
      tasksRequired: 10,
      icon: <Heart className="w-5 h-5" />,
      achieved: completedTasks >= 10,
      achievedDate: completedTasks >= 10 ? new Date() : undefined,
    },
    {
      id: "comprehensive-security",
      title: "Comprehensive Security",
      description: "Full protection achieved",
      tasksRequired: 20,
      icon: <Award className="w-5 h-5" />,
      achieved: completedTasks >= 20,
      achievedDate: completedTasks >= 20 ? new Date() : undefined,
    },
  ];

  // Get current milestone
  const currentMilestone =
    milestones.find((m) => !m.achieved) || milestones[milestones.length - 1];

  // Generate insights
  const insights = [
    {
      type: "progress" as const,
      title:
        completedTasks === 0
          ? "Ready to Start"
          : completedTasks < 5
            ? "Great Start!"
            : completedTasks < 10
              ? "Making Progress"
              : "Well Protected",
      description:
        completedTasks === 0
          ? "Take your first step towards security"
          : `You've completed ${completedTasks} tasks`,
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
    },
    {
      type: "time" as const,
      title: "Time Investment",
      description:
        timeSaved > 0
          ? `${timeSaved} minutes invested in your security`
          : "Quick tasks to get started",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
    },
    {
      type: "focus" as const,
      title: "Suggested Focus",
      description:
        tasksByPriority.immediate?.filter((t) => !t.completed).length > 0
          ? "Focus on immediate priority tasks"
          : tasksByPriority.high?.filter((t) => !t.completed).length > 0
            ? "Complete high priority tasks next"
            : "Continue with steady progress",
      icon: <Target className="w-5 h-5 text-purple-600" />,
    },
  ];

  // Get greeting based on time of day and progress
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userName || "there";

    if (completedTasks === 0) {
      return `Welcome, ${name}!`;
    } else if (hour < 12) {
      return `Good morning, ${name}`;
    } else if (hour < 18) {
      return `Good afternoon, ${name}`;
    } else {
      return `Good evening, ${name}`;
    }
  };

  // Get encouragement message based on progress
  const getEncouragement = () => {
    if (completedTasks === 0) {
      return "Let's secure your future together";
    } else if (completedTasks < 3) {
      return "You're off to a great start!";
    } else if (completedTasks < 7) {
      return "You're building strong foundations";
    } else if (completedTasks < 15) {
      return "Your security is well-established";
    } else {
      return "You've achieved comprehensive protection!";

      // return t('dashboard-main:respectful.encouragement.comprehensive');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      documents: <FileText className="w-4 h-4" />,
      family: <Users className="w-4 h-4" />,
      legal: <Shield className="w-4 h-4" />,
      financial: <CreditCard className="w-4 h-4" />,
      security: <Lock className="w-4 h-4" />,
    };
    return (
      icons[category as keyof typeof icons] || <Circle className="w-4 h-4" />
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      documents: "blue",
      family: "purple",
      legal: "red",
      financial: "green",
      security: "orange",
    };
    return colors[category as keyof typeof colors] || "gray";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      immediate: "red",
      high: "orange",
      medium: "yellow",
      low: "green",
    };
    return colors[priority as keyof typeof colors] || "gray";
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  if (compactMode) {
    // Compact view for sidebar or small spaces
    return (
      <div className="professional-progress-compact p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            // {t("dashboard-main:respectful.progress.title")}
          </h3>
          <span className="text-xs text-gray-500">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-700 font-medium">
            // {completedTasks}{" "}
            {t("dashboard-main:respectful.progress.tasksSecured")}
          </p>
        </div>

        <p className="text-xs text-gray-600 mb-3">{getEncouragement()}</p>

        {tasksByPriority.immediate?.filter((t) => !t.completed).length > 0 && (
          <button
            onClick={() =>
              onTaskClick?.(
                tasksByPriority.immediate.find((t) => !t.completed)!,
              )
            }
            className="w-full text-left p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-900">
                // {t("dashboard-main:respectful.progress.immediateAction")}
              </span>
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="professional-progress">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-6 mb-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getGreeting()}
            </h2>
            <p className="text-gray-600">{getEncouragement()}</p>
          </div>
          {lastLogin && (
            <div className="text-sm text-gray-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              //{" "}
              {t("dashboard-main:respectful.lastActive", {
                date: new Intl.RelativeTimeFormat("en", {
                  numeric: "auto",
                }).format(
                  -Math.floor(
                    (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
                  ),
                  "day",
                ),
              })}
            </div>
          )}
        </div>

        {/* Main Progress Status */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">
                // {t("dashboard-main:respectful.progress.familySecurity")}
              </span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {completedTasks === 0
                  ? t("ui-components:respectful.progress.gettingStarted")
                  : completedTasks < 5
                    ? "Building Foundation"
                    : completedTasks < 10
                      ? t("ui-components:respectful.progress.wellOrganized")
                      : "Comprehensive Protection"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {completedTasks}
              </p>
              <p className="text-xs text-gray-500">
                // {t("dashboard-main:respectful.progress.tasksComplete")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {showInsights && insights.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">{insight.icon}</div>
                <div className="flex-grow">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestones Section */}
      {showMilestones && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              // {t("dashboard-main:respectful.milestones.title")}
            </h3>
            <span className="text-sm text-gray-500">
              // {milestones.filter((m) => m.achieved).length}{" "}
              {t("dashboard-main:respectful.milestones.of")} {milestones.length}{" "}
              {t("dashboard-main:respectful.milestones.achieved")}
            </span>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`
                  flex items-center gap-4 p-3 rounded-lg border transition-all
                  ${
                    milestone.achieved
                      ? "bg-green-50 border-green-200"
                      : milestone === currentMilestone
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 opacity-60"
                  }
                `}
              >
                <div
                  className={`
                  p-2 rounded-full
                  ${milestone.achieved ? "bg-green-100" : "bg-gray-100"}
                `}
                >
                  {milestone.achieved ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    milestone.icon
                  )}
                </div>
                <div className="flex-grow">
                  <h4
                    className={`text-sm font-medium ${milestone.achieved ? "text-green-900" : "text-gray-900"}`}
                  >
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {milestone.description}
                  </p>
                  {milestone === currentMilestone && !milestone.achieved && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 font-medium">
                        // {completedTasks}{" "}
                        {t("dashboard-main:respectful.milestones.of")}{" "}
                        {currentMilestone.tasksRequired}{" "}
                        {t(
                          "dashboard-main:respectful.milestones.tasksComplete",
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {milestone.achievedDate && (
                  <span className="text-xs text-green-600 font-medium">
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                    }).format(milestone.achievedDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks by Priority */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            // {t("dashboard-main:respectful.tasks.title")}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              //{" "}
              {showAllTasks
                ? t("dashboard-main:respectful.tasks.showPriority")
                : t("dashboard-main:respectful.tasks.showAll")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Immediate Priority Tasks */}
          {tasksByPriority.immediate?.filter((t) => !t.completed).length >
            0 && (
            <div className="border-l-4 border-red-500 pl-4">
              <button
                onClick={() => toggleCategory("immediate")}
                className="flex items-center justify-between w-full text-left mb-2"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    // {t("dashboard-main:respectful.tasks.immediate")}
                  </h4>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {
                      tasksByPriority.immediate.filter((t) => !t.completed)
                        .length
                    }
                  </span>
                </div>
                {expandedCategories.includes("immediate") ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandedCategories.includes("immediate") && (
                <div className="space-y-2">
                  {tasksByPriority.immediate
                    .filter((t) => !t.completed)
                    .slice(0, showAllTasks ? undefined : 3)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* High Priority Tasks */}
          {tasksByPriority.high?.filter((t) => !t.completed).length > 0 && (
            <div className="border-l-4 border-orange-500 pl-4">
              <button
                onClick={() => toggleCategory("high")}
                className="flex items-center justify-between w-full text-left mb-2"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    // {t("dashboard-main:respectful.tasks.high")}
                  </h4>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {tasksByPriority.high.filter((t) => !t.completed).length}
                  </span>
                </div>
                {expandedCategories.includes("high") ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandedCategories.includes("high") && (
                <div className="space-y-2">
                  {tasksByPriority.high
                    .filter((t) => !t.completed)
                    .slice(0, showAllTasks ? undefined : 3)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Other Tasks */}
          {(showAllTasks ||
            (!tasksByPriority.immediate?.filter((t) => !t.completed).length &&
              !tasksByPriority.high?.filter((t) => !t.completed).length)) && (
            <>
              {tasksByPriority.medium?.filter((t) => !t.completed).length >
                0 && (
                <div className="border-l-4 border-yellow-500 pl-4">
                  <button
                    onClick={() => toggleCategory("medium")}
                    className="flex items-center justify-between w-full text-left mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h4 className="text-sm font-semibold text-gray-900">
                        // {t("dashboard-main:respectful.tasks.medium")}
                      </h4>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        {
                          tasksByPriority.medium.filter((t) => !t.completed)
                            .length
                        }
                      </span>
                    </div>
                    {expandedCategories.includes("medium") ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {expandedCategories.includes("medium") && (
                    <div className="space-y-2">
                      {tasksByPriority.medium
                        .filter((t) => !t.completed)
                        .slice(0, showAllTasks ? undefined : 3)
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onTaskClick={onTaskClick}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Completed Tasks */}
          {completedTasks > 0 && (
            <div className="border-l-4 border-green-500 pl-4 opacity-75">
              <button
                onClick={() => toggleCategory("completed")}
                className="flex items-center justify-between w-full text-left mb-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    // {t("dashboard-main:respectful.tasks.completed")}
                  </h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {completedTasks}
                  </span>
                </div>
                {expandedCategories.includes("completed") ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandedCategories.includes("completed") && (
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.completed)
                    .slice(0, showAllTasks ? undefined : 5)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                        completed
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* No tasks message */}
        {totalTasks === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              // {t("dashboard-main:respectful.tasks.noTasks")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard: React.FC<{
  task: Task;
  onTaskClick?: (task: Task) => void;
  completed?: boolean;
}> = ({ task, onTaskClick, completed = false }) => {
  const { t } = useTranslation("dashboard-main");

  const getCategoryIcon = (category: string) => {
    const icons = {
      documents: <FileText className="w-4 h-4" />,
      family: <Users className="w-4 h-4" />,
      legal: <Shield className="w-4 h-4" />,
      financial: <CreditCard className="w-4 h-4" />,
      security: <Lock className="w-4 h-4" />,
    };
    return (
      icons[category as keyof typeof icons] || <Circle className="w-4 h-4" />
    );
  };

  return (
    <button
      onClick={() => onTaskClick?.(task)}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${
          completed
            ? "bg-gray-50 border-gray-200 opacity-60"
            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
        }
      `}
      disabled={completed}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-1.5 rounded-lg ${completed ? "bg-green-100" : "bg-gray-100"}`}
        >
          {completed ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            getCategoryIcon(task.category)
          )}
        </div>
        <div className="flex-grow">
          <h5
            className={`text-sm font-medium ${completed ? "text-gray-500 line-through" : "text-gray-900"}`}
          >
            {task.title}
          </h5>
          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
          {task.estimatedTime && !completed && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedTime}
              </span>
              {task.link && (
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  {t("onboarding:respectful.tasks.start")}
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          )}
          {completed && task.completedDate && (
            <span className="text-xs text-green-600 mt-2 inline-block">
              {t("respectful.tasks.completedOn", {
                date: new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                }).format(task.completedDate),
              })}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Export the TaskCard for use elsewhere
export { TaskCard };

// Also export a CreditCard icon since it's missing from the imports
const CreditCard: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

export default ProfessionalProgress;
