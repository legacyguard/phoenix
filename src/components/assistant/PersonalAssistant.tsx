import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAssistant } from "@/hooks/useAssistant";
import { AssistantAvatar } from "./AssistantAvatar";
import { AssistantMessage } from "./AssistantMessage";
import { AssistantActions } from "./AssistantActions";
import type {
  AssistantMessage as AssistantMessageType,
  Recommendation,
} from "./types";

interface PersonalAssistantProps {
  context: string;
  className?: string;
  compact?: boolean;
}

export const PersonalAssistant: React.FC<PersonalAssistantProps> = ({
  context,
  className,
  compact = false,
}) => {
  const { t } = useTranslation("ai-assistant");
  const {
    userProgress,
    emotionalState,
    getPersonalizedMessage,
    getSuggestions,
    updateContext,
  } = useAssistant();

  const [currentMessage, setCurrentMessage] = useState<AssistantMessage | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<Recommendation[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    updateContext(context);

    // Simulate typing delay for more human feel
    setIsTyping(true);
    const timer = setTimeout(() => {
      setCurrentMessage(getPersonalizedMessage());
      setSuggestions(getSuggestions());
      setIsTyping(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [context, updateContext, getPersonalizedMessage, getSuggestions]);

  // Don't render in compact mode if user is experienced
  if (compact && userProgress.totalActions > 20) {
    return null;
  }

  const getEmotionalIcon = () => {
    switch (emotionalState) {
      case "overwhelmed":
        return Coffee;
      case "accomplished":
        return CheckCircle;
      case "progressing":
        return Sparkles;
      default:
        return Heart;
    }
  };

  return (
    <Card
      className={cn(
        "personal-assistant",
        "bg-gradient-to-br from-warm-light via-background to-warm-light/50",
        "border-warm-primary/20",
        "shadow-lg",
        compact && "p-4",
        !compact && "p-6",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <AssistantAvatar
          emotion={emotionalState}
          icon={getEmotionalIcon()}
          compact={compact}
        />

        <div className="flex-1 space-y-4">
          {currentMessage && (
            <AssistantMessage
              message={currentMessage}
              isTyping={isTyping}
              compact={compact}
            />
          )}

          {!compact && suggestions.length > 0 && !isTyping && (
            <AssistantActions
              suggestions={suggestions}
              emotionalState={emotionalState}
            />
          )}

          {/* Quick emotional support actions */}
          {emotionalState === "overwhelmed" && !compact && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-warm-primary"
                onClick={() => {
                  /* Handle break */
                }}
              >
                <Coffee className="mr-2 h-4 w-4" />
                {t("actions.supportive.takeBreak")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-warm-primary"
                onClick={() => {
                  /* Handle help */
                }}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                {t("actions.supportive.getHelp")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
