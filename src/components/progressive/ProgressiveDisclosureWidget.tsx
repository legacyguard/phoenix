import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  Unlock,
  Star,
  Zap,
  Trophy,
  ChevronRight,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import {
  UserProgress,
  getDisclosureLevel,
  getNextFeatureToUnlock,
  getUpcomingFeatures,
  getMotivationalMessage,
  shouldShowFeature,
  FeatureDefinition,
} from "@/services/progressiveDisclosure";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProgressiveDisclosureWidgetProps {
  userProgress: UserProgress;
  onFeatureClick?: (feature: FeatureDefinition) => void;
  compact?: boolean;
}

export const ProgressiveDisclosureWidget: React.FC<
  ProgressiveDisclosureWidgetProps
> = ({ userProgress, onFeatureClick, compact = false }) => {
  const currentLevel = useMemo(
    () => getDisclosureLevel(userProgress),
    [userProgress],
  );
  const nextFeature = useMemo(
    () => getNextFeatureToUnlock(userProgress),
    [userProgress],
  );
  const upcomingFeatures = useMemo(
    () => getUpcomingFeatures(userProgress),
    [userProgress],
  );
  const motivationalMessage = useMemo(
    () => getMotivationalMessage(userProgress),
    [userProgress],
  );

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Star className="h-5 w-5" />;
      case 2:
        return <Zap className="h-5 w-5" />;
      case 3:
        return <Trophy className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "text-blue-600 bg-blue-50 border-blue-200";
      case 2:
        return "text-purple-600 bg-purple-50 border-purple-200";
      case 3:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (compact) {
    return (
      <Card className="border-warm-sage/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  getLevelColor(currentLevel.level),
                )}
              >
                {getLevelIcon(currentLevel.level)}
              </div>
              <div>
                <p className="font-medium">{currentLevel.name}</p>
                <p className="text-sm text-muted-foreground">
                  {motivationalMessage}
                </p>
              </div>
            </div>
            {nextFeature && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Lock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Next unlock: {nextFeature.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warm-sage/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warm-sage" />
              Your Progress Journey
            </CardTitle>
            <CardDescription>{currentLevel.description}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-base px-3 py-1",
              getLevelColor(currentLevel.level),
            )}
          >
            <span className="mr-2">{getLevelIcon(currentLevel.level)}</span>
            {currentLevel.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Motivational message */}
        <div className="bg-warm-sage/5 rounded-lg p-4 border border-warm-sage/20">
          <p className="text-sm font-medium text-warm-sage">
            {motivationalMessage}
          </p>
        </div>

        {/* Current level progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Level Progress</span>
            <span className="font-medium">
              {userProgress.completedItems} tasks completed
            </span>
          </div>
          <Progress
            value={Math.min((userProgress.completedItems / 15) * 100, 100)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {currentLevel.nextMilestone}
          </p>
        </div>

        {/* Family impact reminder */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Family Impact</p>
              <p className="text-xs text-blue-700 mt-1">
                {currentLevel.familyImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming features */}
        {upcomingFeatures.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Coming Soon
            </h4>
            <div className="space-y-2">
              {upcomingFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onFeatureClick?.(feature)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-background">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.requiredItems
                          ? `Complete ${feature.requiredItems - userProgress.completedItems} more tasks`
                          : "Complete prerequisites"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level benefits */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Currently Available</h4>
          <div className="grid grid-cols-2 gap-2">
            {currentLevel.unlockedFeatures.slice(0, 4).map((featureId) => (
              <Badge
                key={featureId}
                variant="secondary"
                className="justify-start text-xs py-1"
              >
                <Unlock className="h-3 w-3 mr-1" />
                {featureId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            {currentLevel.encouragementMessage}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Feature introduction component
export const FeatureIntroduction: React.FC<{
  feature: FeatureDefinition;
  onDismiss: () => void;
  onExplore: () => void;
}> = ({ feature, onDismiss, onExplore }) => {
  return (
    <Card className="border-2 border-warm-sage shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warm-sage/10">
              <Sparkles className="h-5 w-5 text-warm-sage" />
            </div>
            <div>
              <CardTitle className="text-lg">New Feature Unlocked!</CardTitle>
              <CardDescription>{feature.name}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{feature.introductionMessage}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onDismiss} className="flex-1">
            Maybe Later
          </Button>
          <Button
            onClick={onExplore}
            className="flex-1 bg-warm-sage hover:bg-warm-sage/90"
          >
            Explore Now
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Progress level indicator for navigation
export const ProgressLevelIndicator: React.FC<{
  userProgress: UserProgress;
}> = ({ userProgress }) => {
  const currentLevel = useMemo(
    () => getDisclosureLevel(userProgress),
    [userProgress],
  );

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Star className="h-4 w-4" />;
      case 2:
        return <Zap className="h-4 w-4" />;
      case 3:
        return <Trophy className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "text-blue-600 bg-blue-50";
      case 2:
        return "text-purple-600 bg-purple-50";
      case 3:
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("p-1.5 rounded", getLevelColor(currentLevel.level))}>
        {getLevelIcon(currentLevel.level)}
      </div>
      <span className="text-sm font-medium">{currentLevel.name}</span>
    </div>
  );
};
