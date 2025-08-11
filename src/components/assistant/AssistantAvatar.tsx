import React from "react";
import { cn } from "@/lib/utils";
import type { EmotionalState } from "@/contexts/AssistantContext";

interface AssistantAvatarProps {
  emotion: EmotionalState;
  icon: React.ElementType;
  compact?: boolean;
  className?: string;
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({
  emotion,
  icon: Icon,
  compact = false,
  className,
}) => {
  const getEmotionColors = () => {
    switch (emotion) {
      case "overwhelmed":
        return "bg-gradient-to-br from-warm-accent/20 to-warm-accent/30 text-warm-accent";
      case "accomplished":
        return "bg-gradient-to-br from-earth-primary/20 to-earth-primary/30 text-earth-primary";
      case "progressing":
        return "bg-gradient-to-br from-warm-primary/20 to-warm-primary/30 text-warm-primary";
      default:
        return "bg-gradient-to-br from-warm-primary/10 to-warm-primary/20 text-warm-primary";
    }
  };

  const getPresenceAnimation = () => {
    switch (emotion) {
      case "overwhelmed":
        return "animate-pulse";
      case "accomplished":
        return "animate-bounce";
      default:
        return "animate-none";
    }
  };

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "avatar-circle rounded-full flex items-center justify-center transition-all duration-300",
          getEmotionColors(),
          compact ? "w-10 h-10" : "w-12 h-12",
          className,
        )}
      >
        <Icon
          className={cn("transition-all", compact ? "h-5 w-5" : "h-6 w-6")}
        />
      </div>

      {/* Presence indicator */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 rounded-full bg-warm-primary",
          compact ? "w-3 h-3" : "w-4 h-4",
          getPresenceAnimation(),
        )}
      >
        <div className="absolute inset-0 rounded-full bg-warm-primary animate-ping opacity-75" />
      </div>
    </div>
  );
};
