import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmpatheticLoaderProps {
  context?: "assets" | "documents" | "will" | "family" | "guardian" | "general";
  action?:
    | "saving"
    | "loading"
    | "processing"
    | "uploading"
    | "analyzing"
    | "generating"
    | "updating";
  emotionalState?:
    | "first_time"
    | "returning"
    | "complex_task"
    | "sensitive_area"
    | "overwhelmed"
    | "confident";
  progress?: number;
  className?: string;
  size?: "small" | "medium" | "large";
}

interface LoadingMessage {
  primary: string;
  secondary?: string;
  encouragement?: string;
}

const EmpatheticLoader: React.FC<EmpatheticLoaderProps> = ({
  context = "general",
  action = "loading",
  emotionalState,
  progress,
  className,
  size = "medium",
}) => {
  const { t } = useTranslation("loading-states");

  const getContextualMessage = useCallback((): LoadingMessage => {
    const message: LoadingMessage = {
      primary: "",
    };

    // Get primary message based on context and action
    if (context === "general") {
      message.primary = t(`general.${action}`);
    } else {
      const contextualKey = `contextual.${context}.${action}`;
      message.primary = t(contextualKey, {
        defaultValue: t(`general.${action}`),
      });
    }

    // Add emotional state message if provided
    if (emotionalState) {
      if (emotionalState === "overwhelmed" || emotionalState === "confident") {
        const encouragementKey = `encouragement.${emotionalState}`;
        const encouragementMessages = [
          t(`${encouragementKey}.take_time`),
          t(`${encouragementKey}.here_to_help`),
          t(`${encouragementKey}.one_step`),
          t(`${encouragementKey}.doing_great`),
        ];
        message.encouragement =
          encouragementMessages[
            Math.floor(Math.random() * encouragementMessages.length)
          ];
      } else {
        message.secondary = t(`emotional.${emotionalState}`);
      }
    }

    // Add progress-based message
    if (progress !== undefined) {
      if (progress < 25) {
        message.secondary = t("common:progress.starting");
      } else if (progress < 50) {
        message.secondary = t("common:progress.quarter");
      } else if (progress < 75) {
        message.secondary = t("common:progress.half");
      } else if (progress < 100) {
        message.secondary = t("common:progress.three_quarters");
      } else {
        message.secondary = t("common:progress.complete");
      }
    }

    return message;
  }, [context, action, emotionalState, progress, t]);

  const message = useMemo(() => getContextualMessage(), [getContextualMessage]);

  const sizeClasses = {
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };

  const iconSizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        sizeClasses[size],
        className,
      )}
    >
      {/* Animated loader with heart */}
      <div className="relative">
        <Loader2
          className={cn("animate-spin text-primary/30", iconSizeClasses[size])}
        />
        <Heart
          className={cn(
            "absolute inset-0 animate-pulse text-primary",
            iconSizeClasses[size],
          )}
        />
      </div>

      {/* Messages */}
      <div className="text-center space-y-2">
        <p className={cn("font-medium text-gray-900", textSizeClasses[size])}>
          {message.primary}
        </p>

        {message.secondary && (
          <p
            className={cn(
              "text-gray-600",
              size === "small" ? "text-xs" : "text-sm",
            )}
          >
            {message.secondary}
          </p>
        )}

        {message.encouragement && (
          <p
            className={cn(
              "text-primary italic",
              size === "small" ? "text-xs" : "text-sm",
            )}
          >
            {message.encouragement}
          </p>
        )}
      </div>

      {/* Progress indicator */}
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpatheticLoader;
