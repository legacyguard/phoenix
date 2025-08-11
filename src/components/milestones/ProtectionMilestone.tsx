import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Home,
  FileText,
  Users,
  Heart,
  ChevronRight,
} from "lucide-react";
import type { Milestone } from "@/constants/protectionMilestones";

interface ProtectionMilestoneProps {
  milestone: Milestone;
  onAcknowledge: () => void;
  onViewNext: () => void;
}

export const ProtectionMilestone: React.FC<ProtectionMilestoneProps> = ({
  milestone,
  onAcknowledge,
  onViewNext,
}) => {
  const getIconForMilestone = (milestoneId: string) => {
    const icons: Record<string, React.ReactNode> = {
      "foundation-complete": <Home className="h-6 w-6" />,
      "will-created": <FileText className="h-6 w-6" />,
      "trusted-circle-established": <Users className="h-6 w-6" />,
      "comprehensive-protection": <Shield className="h-6 w-6" />,
      "family-legacy": <Heart className="h-6 w-6" />,
    };
    return icons[milestoneId] || <Shield className="h-6 w-6" />;
  };

  return (
    <Card className="border-2 border-warm-sage/30 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 rounded-full bg-warm-sage/10 w-fit">
          {milestone.icon || getIconForMilestone(milestone.id)}
        </div>
        <CardTitle className="text-xl">Important Step Completed</CardTitle>
        <CardDescription className="text-base mt-2">
          {milestone.accomplishment}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Family protection impact */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Family Protection Impact
          </h4>
          <p className="text-sm text-blue-700">
            Your family is now {milestone.protectionImprovement}
          </p>
        </div>

        {/* Specific family benefits */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">What This Means</h4>
          <p className="text-sm text-gray-600">{milestone.familyImpact}</p>
        </div>

        {/* Next responsibility */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            Next Important Step
          </h4>
          <p className="text-sm text-gray-600">
            {milestone.nextResponsibility}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onAcknowledge} className="flex-1">
            I Understand
          </Button>
          <Button
            onClick={onViewNext}
            className="flex-1 bg-warm-sage hover:bg-warm-sage/90"
          >
            View Next Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
