import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current?: boolean;
}

interface ProgressStoryProps {
  steps: ProgressStep[];
  currentStep?: number;
  orientation?: "horizontal" | "vertical";
  showDescriptions?: boolean;
  className?: string;
}

const ProgressStory: React.FC<ProgressStoryProps> = ({
  steps,
  currentStep,
  orientation = "horizontal",
  showDescriptions = true,
  className,
}) => {
  const { t } = useTranslation("loading-states");

  const progress = useMemo(() => {
    const completedSteps = steps.filter((step) => step.completed).length;
    return (completedSteps / steps.length) * 100;
  }, [steps]);

  const getProgressMessage = () => {
    if (progress === 0) return t("common:progress.starting");
    if (progress < 25) return t("common:progress.quarter");
    if (progress < 50) return t("common:progress.half");
    if (progress < 75) return t("common:progress.three_quarters");
    if (progress === 100) return t("common:progress.complete");
    return t("common:progress.step_complete");
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Progress message */}
      <motion.div
        key={progress}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <p className="text-lg font-medium text-gray-900">
          {getProgressMessage()}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {Math.round(progress)}% complete
        </p>
      </motion.div>

      {/* Progress steps */}
      <div
        className={cn(
          "relative",
          orientation === "horizontal"
            ? "flex items-start justify-between"
            : "space-y-4",
        )}
      >
        {/* Progress line */}
        {orientation === "horizontal" && (
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}

        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "relative z-10",
              orientation === "horizontal"
                ? "flex-1"
                : "flex items-start space-x-4",
            )}
          >
            {orientation === "vertical" && index > 0 && (
              <div className="absolute left-5 -top-4 w-0.5 h-4 bg-gray-200" />
            )}

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: step.current ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2",
                step.completed
                  ? "bg-primary border-primary"
                  : step.current
                    ? "bg-white border-primary"
                    : "bg-white border-gray-300",
              )}
            >
              {step.completed ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Circle
                  className={cn(
                    "w-5 h-5",
                    step.current ? "text-primary" : "text-gray-400",
                  )}
                />
              )}
            </motion.div>

            <div
              className={cn(orientation === "horizontal" ? "mt-3" : "flex-1")}
            >
              <h4
                className={cn(
                  "font-medium",
                  step.completed ? "text-gray-900" : "text-gray-600",
                  orientation === "horizontal"
                    ? "text-center text-sm"
                    : "text-base",
                )}
              >
                {step.title}
              </h4>
              {showDescriptions && step.description && (
                <p
                  className={cn(
                    "text-sm text-gray-500 mt-1",
                    orientation === "horizontal" ? "text-center" : "",
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement message */}
      {progress > 0 && progress < 100 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-primary italic mt-6"
        >
          {t("encouragement.confident.great_progress")}
        </motion.p>
      )}
    </div>
  );
};

export default ProgressStory;
