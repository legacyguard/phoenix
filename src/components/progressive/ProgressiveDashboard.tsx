import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, Sparkles, Trophy, Target,
  ChevronRight, Lock, CheckCircle, Circle
} from 'lucide-react';
import { 
  UserProgress,
  FeatureDefinition,
  getMilestoneAchievements,
  shouldShowFeature,
  getFeatureById,
  checkMilestoneCompletion,
  FEATURES,
  MILESTONES
} from '@/services/progressiveDisclosure';
import { 
  ProgressiveDisclosureWidget,
  FeatureIntroduction,
  ProgressLevelIndicator
} from '@/components/progressive/ProgressiveDisclosureWidget';
import { MilestoneCelebration } from '@/components/milestones/MilestoneCelebration';
import { cn } from '@/lib/utils';

interface ProgressiveDashboardProps {
  userProgress: UserProgress;
  onFeatureAccess?: (featureId: string) => void;
  onMilestoneAcknowledged?: (milestoneId: string) => void;
  className?: string;
}

export const ProgressiveDashboard: React.FC<ProgressiveDashboardProps> = ({
  userProgress,
  onFeatureAccess,
  onMilestoneAcknowledged,
  className
}) => {
  const [activeFeatureIntro, setActiveFeatureIntro] = useState<FeatureDefinition | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [dismissedIntros, setDismissedIntros] = useState<Set<string>>(new Set());
  const [acknowledgedMilestones, setAcknowledgedMilestones] = useState<Set<string>>(
    new Set(userProgress.acknowledgedMilestones || [])
  );

  // Check for newly unlocked features
  useEffect(() => {
    const checkNewFeatures = () => {
      for (const feature of FEATURES) {
        if (
          shouldShowFeature(feature.id, userProgress) &&
          !userProgress.introducedFeatures?.includes(feature.id) &&
          !dismissedIntros.has(feature.id)
        ) {
          setActiveFeatureIntro(feature);
          break;
        }
      }
    };

    checkNewFeatures();
  }, [userProgress, dismissedIntros]);

  // Check for new milestones
  useEffect(() => {
    const checkNewMilestones = () => {
      for (const milestone of MILESTONES) {
        if (
          checkMilestoneCompletion(milestone.id, userProgress) &&
          !acknowledgedMilestones.has(milestone.id)
        ) {
          setActiveMilestone(milestone);
          break;
        }
      }
    };

    checkNewMilestones();
  }, [userProgress, acknowledgedMilestones]);

  const handleFeatureExplore = useCallback((feature: FeatureDefinition) => {
    setActiveFeatureIntro(null);
    onFeatureAccess?.(feature.id);
  }, [onFeatureAccess]);

  const handleFeatureDismiss = useCallback((feature: FeatureDefinition) => {
    setDismissedIntros(prev => new Set(prev).add(feature.id));
    setActiveFeatureIntro(null);
  }, []);

  const handleMilestoneAcknowledge = useCallback((milestoneId: string) => {
    setAcknowledgedMilestones(prev => new Set(prev).add(milestoneId));
    setActiveMilestone(null);
    onMilestoneAcknowledged?.(milestoneId);
  }, [onMilestoneAcknowledged]);

  const categorizedFeatures = React.useMemo(() => {
    const categories = {
      available: [] as FeatureDefinition[],
      upcoming: [] as FeatureDefinition[],
      locked: [] as FeatureDefinition[]
    };

    FEATURES.forEach(feature => {
      if (shouldShowFeature(feature.id, userProgress)) {
        categories.available.push(feature);
      } else if (feature.requiredItems && userProgress.completedItems >= feature.requiredItems - 3) {
        categories.upcoming.push(feature);
      } else {
        categories.locked.push(feature);
      }
    });

    return categories;
  }, [userProgress]);

  const achievements = React.useMemo(() => getMilestoneAchievements(userProgress), [userProgress]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Active milestone celebration */}
      {activeMilestone && (
        <MilestoneCelebration
          milestone={activeMilestone}
          onAcknowledge={() => handleMilestoneAcknowledge(activeMilestone.id)}
        />
      )}

      {/* Active feature introduction */}
      {activeFeatureIntro && (
        <FeatureIntroduction
          feature={activeFeatureIntro}
          onDismiss={() => handleFeatureDismiss(activeFeatureIntro)}
          onExplore={() => handleFeatureExplore(activeFeatureIntro)}
        />
      )}

      {/* Progress level indicator in header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6" />
          Your Protection Journey
        </h1>
        <ProgressLevelIndicator userProgress={userProgress} />
      </div>

      {/* Main progress widget */}
      <ProgressiveDisclosureWidget
        userProgress={userProgress}
        onFeatureClick={(feature) => console.log('Feature clicked:', feature)}
      />

      {/* Features and achievements tabs */}
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          {/* Available features */}
          {categorizedFeatures.available.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Available Features
                </CardTitle>
                <CardDescription>
                  These features are ready for you to explore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedFeatures.available.map(feature => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      status="available"
                      onClick={() => onFeatureAccess?.(feature.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming features */}
          {categorizedFeatures.upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Coming Soon
                </CardTitle>
                <CardDescription>
                  Complete a few more tasks to unlock these features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorizedFeatures.upcoming.map(feature => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      status="upcoming"
                      progress={userProgress.completedItems}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locked features preview */}
          {categorizedFeatures.locked.length > 0 && (
            <Card className="opacity-75">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-500" />
                  Future Features
                </CardTitle>
                <CardDescription>
                  Continue your journey to unlock advanced features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categorizedFeatures.locked.slice(0, 6).map(feature => (
                    <div
                      key={feature.id}
                      className="p-3 rounded-lg bg-muted/50 text-center"
                    >
                      <Lock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{feature.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                Milestones you've reached on your protection journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isAcknowledged={acknowledgedMilestones.has(achievement.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Feature card component
const FeatureCard: React.FC<{
  feature: FeatureDefinition;
  status: 'available' | 'upcoming' | 'locked';
  progress?: number;
  onClick?: () => void;
}> = ({ feature, status, progress, onClick }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'upcoming':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            {feature.requiredItems && progress
              ? `${feature.requiredItems - progress} tasks away`
              : 'Coming soon'
            }
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all",
        status === 'available' 
          ? "border-green-200 bg-green-50/50 hover:bg-green-50 cursor-pointer" 
          : "border-gray-200 bg-gray-50/30",
        onClick && "hover:shadow-sm"
      )}
      onClick={status === 'available' ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{feature.name}</h4>
        {getStatusBadge()}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {feature.description}
      </p>
      {status === 'available' && (
        <Button size="sm" variant="ghost" className="w-full justify-between">
          Explore
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  unlockedAt?: string;
}

// Achievement card component
const AchievementCard: React.FC<{
  achievement: Achievement;
  isAcknowledged: boolean;
}> = ({ achievement, isAcknowledged }) => {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg",
      isAcknowledged ? "bg-muted/50" : "bg-yellow-50 border border-yellow-200"
    )}>
      <div className={cn(
        "p-2 rounded-full",
        isAcknowledged ? "bg-muted" : "bg-yellow-100"
      )}>
        {achievement.icon || <Trophy className="h-4 w-4 text-yellow-600" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{achievement.title}</p>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
      </div>
      <div className="text-right">
        <Badge variant="outline" className="text-xs">
          {new Date(achievement.unlockedAt || Date.now()).toLocaleDateString()}
        </Badge>
      </div>
    </div>
  );
};
