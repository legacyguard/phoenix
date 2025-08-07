import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, FileText, Users, Heart, Home, 
  ChevronRight, Check, Circle, AlertCircle
} from 'lucide-react';
import { 
  UserProgress,
  ProtectionFeature,
  getDisclosureLevel,
  shouldShowFeature,
  getNextLogicalStep,
  getProtectionStatus,
  getConfidenceMessage,
  PROTECTION_FEATURES
} from '@/services/familyProtectionDisclosure';
import { 
  ProtectionMilestone, 
  PROTECTION_MILESTONES,
  getConfidenceAcknowledgment 
} from '@/components/milestones/ProtectionMilestone';
import { cn } from '@/lib/utils';

interface ProtectionProgressDashboardProps {
  userProgress: UserProgress;
  onFeatureAccess?: (featureId: string) => void;
  onStepComplete?: (stepId: string) => void;
  className?: string;
}

export const ProtectionProgressDashboard: React.FC<ProtectionProgressDashboardProps> = ({
  userProgress,
  onFeatureAccess,
  onStepComplete,
  className
}) => {
  const [activeMilestone, setActiveMilestone] = useState<typeof PROTECTION_MILESTONES[0] | null>(null);
  const [acknowledgedMilestones, setAcknowledgedMilestones] = useState<Set<string>>(new Set());

  const disclosureLevel = getDisclosureLevel(userProgress);
  const protectionStatus = getProtectionStatus(userProgress);
  const nextStep = getNextLogicalStep(userProgress);
  const confidenceMessage = getConfidenceMessage(userProgress);

  // Check for new milestones
  useEffect(() => {
    const checkMilestones = () => {
      for (const milestone of PROTECTION_MILESTONES) {
        const shouldShow = checkMilestoneCompletion(milestone.id, userProgress);
        if (shouldShow && !acknowledgedMilestones.has(milestone.id)) {
          setActiveMilestone(milestone);
          break;
        }
      }
    };

    checkMilestones();
  }, [userProgress, acknowledgedMilestones]);

  const checkMilestoneCompletion = (milestoneId: string, progress: UserProgress): boolean => {
    switch (milestoneId) {
      case 'first-asset-documented':
        return progress.documentedAssets === 1;
      case 'foundation-complete':
        return progress.completedSteps.includes('basic-asset-documentation') &&
               progress.completedSteps.includes('primary-family-info');
      case 'will-created':
        return progress.completedSteps.includes('basic-will');
      case 'trusted-circle-established':
        return progress.completedSteps.includes('trusted-circle');
      case 'comprehensive-protection':
        return progress.protectionLevel === 'comprehensive' &&
               progress.completedSteps.length >= 6;
      default:
        return false;
    }
  };

  const handleMilestoneAcknowledge = () => {
    if (activeMilestone) {
      setAcknowledgedMilestones(prev => new Set(prev).add(activeMilestone.id));
      setActiveMilestone(null);
    }
  };

  const handleViewNext = () => {
    handleMilestoneAcknowledge();
    if (nextStep) {
      onFeatureAccess?.(nextStep.id);
    }
  };

  const getFeatureStatus = (feature: ProtectionFeature): 'completed' | 'available' | 'locked' => {
    if (userProgress.completedSteps.includes(feature.id)) {
      return 'completed';
    }
    if (shouldShowFeature(feature.id, userProgress)) {
      return 'available';
    }
    return 'locked';
  };

  const availableFeatures = PROTECTION_FEATURES.filter(f => 
    getFeatureStatus(f) === 'available'
  );

  const completedFeatures = PROTECTION_FEATURES.filter(f =>
    getFeatureStatus(f) === 'completed'
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Active milestone */}
      {activeMilestone && (
        <ProtectionMilestone
          milestone={activeMilestone}
          onAcknowledge={handleMilestoneAcknowledge}
          onViewNext={handleViewNext}
        />
      )}

      {/* Protection status overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Family Protection Status
              </CardTitle>
              <CardDescription className="mt-1">
                {protectionStatus.message}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {disclosureLevel.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence message */}
          <div className="bg-warm-sage/5 rounded-lg p-4 border border-warm-sage/20">
            <p className="text-sm font-medium text-gray-700">
              {confidenceMessage}
            </p>
          </div>

          {/* Protection progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protection Progress</span>
              <span className="font-medium">
                {userProgress.completedSteps.length} of {PROTECTION_FEATURES.length} steps completed
              </span>
            </div>
            <Progress 
              value={(userProgress.completedSteps.length / PROTECTION_FEATURES.length) * 100}
              className="h-2"
            />
          </div>

          {/* Family benefit */}
          <div className="flex items-start gap-2 text-sm">
            <Heart className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-gray-600">{protectionStatus.familyBenefit}</p>
          </div>
        </CardContent>
      </Card>

      {/* Next logical step */}
      {nextStep && (
        <Card className="border-warm-sage/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Next Important Step
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{nextStep.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {nextStep.description}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Family Benefit:</span> {nextStep.familyBenefit}
                </p>
              </div>
              <Button 
                onClick={() => onFeatureAccess?.(nextStep.id)}
                className="w-full bg-warm-sage hover:bg-warm-sage/90"
              >
                Begin This Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features by protection area */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Steps</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {availableFeatures.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Protection Steps</CardTitle>
                <CardDescription>
                  These steps are ready for you to complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableFeatures.map(feature => (
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
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">
                  Complete current steps to unlock additional protection features
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedFeatures.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed Protection Steps</CardTitle>
                <CardDescription>
                  {getConfidenceAcknowledgment(userProgress.protectionLevel)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedFeatures.map(feature => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      status="completed"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Circle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">
                  Begin documenting your family's essential information
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Feature card component
const FeatureCard: React.FC<{
  feature: ProtectionFeature;
  status: 'completed' | 'available' | 'locked';
  onClick?: () => void;
}> = ({ feature, status, onClick }) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'available':
        return <Circle className="h-5 w-5 text-amber-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-all",
        status === 'available' && "hover:bg-gray-50 cursor-pointer",
        status === 'completed' && "bg-green-50/50 border-green-200",
        status === 'available' && "border-amber-200",
        status === 'locked' && "opacity-60"
      )}
      onClick={status === 'available' ? onClick : undefined}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <h4 className="font-medium text-sm">{feature.name}</h4>
        <p className="text-xs text-muted-foreground">{feature.description}</p>
        {status === 'available' && (
          <p className="text-xs text-blue-600 font-medium mt-2">
            {feature.familyBenefit}
          </p>
        )}
      </div>
      {status === 'available' && (
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
      )}
    </div>
  );
};
