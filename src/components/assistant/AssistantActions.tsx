import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import type { Recommendation } from "./PersonalAssistant";
import type { EmotionalState } from "@/contexts/AssistantContext";

interface AssistantActionsProps {
  suggestions: Recommendation[];
  emotionalState: EmotionalState;
  className?: string;
}

export const AssistantActions: React.FC<AssistantActionsProps> = ({
  suggestions,
  emotionalState,
  className,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-warm-accent text-white border-warm-accent";
      case "medium":
        return "bg-warm-primary/10 text-warm-primary border-warm-primary/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Most Important";
      case "medium":
        return "Recommended";
      default:
        return "Nice to Have";
    }
  };

  // Show fewer actions when overwhelmed
  const visibleSuggestions =
    emotionalState === "overwhelmed" ? suggestions.slice(0, 1) : suggestions;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-muted-foreground">
        {emotionalState === "overwhelmed"
          ? "Let's focus on just one thing:"
          : "Here's what would help your family most:"}
      </h3>

      <div className="space-y-2">
        {visibleSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              "group relative overflow-hidden rounded-lg border p-4",
              "transition-all duration-200 hover:shadow-md",
              "bg-card hover:bg-accent/5",
            )}
          >
            <div className="flex items-start gap-3">
              {suggestion.icon && (
                <div className="flex-shrink-0 mt-0.5">
                  <suggestion.icon className="h-5 w-5 text-warm-primary" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground">
                    {suggestion.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      getPriorityColor(suggestion.priority),
                    )}
                  >
                    {getPriorityLabel(suggestion.priority)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {suggestion.timeEstimate}
                  </span>
                  <span className="text-warm-primary">
                    {suggestion.familyBenefit}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={suggestion.action}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {emotionalState === "overwhelmed" && suggestions.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          We'll show you more suggestions once you're ready
        </p>
      )}
    </div>
  );
};
