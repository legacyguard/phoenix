import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Home, FileText, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Milestone {
  id: string;
  title: string;
  accomplishment: string;
  protectionImprovement: string;
  nextResponsibility: string;
  familyImpact: string;
  icon?: React.ReactNode;
}

interface ProtectionMilestoneProps {
  milestone: Milestone;
  onAcknowledge?: () => void;
  onViewNext?: () => void;
}

export const ProtectionMilestone: React.FC<ProtectionMilestoneProps> = ({
  milestone,
  onAcknowledge,
  onViewNext
}) => {
  const getIconForMilestone = (milestoneId: string) => {
    const icons: Record<string, React.ReactNode> = {
      'foundation-complete': <Home className="h-6 w-6" />,
      'will-created': <FileText className="h-6 w-6" />,
      'trusted-circle-established': <Users className="h-6 w-6" />,
      'comprehensive-protection': <Shield className="h-6 w-6" />,
      'family-legacy': <Heart className="h-6 w-6" />
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
          <h4 className="font-medium text-blue-900 mb-2">Family Protection Impact</h4>
          <p className="text-sm text-blue-700">
            Your family is now {milestone.protectionImprovement}
          </p>
        </div>

        {/* Specific family benefits */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">What This Means</h4>
          <p className="text-sm text-gray-600">
            {milestone.familyImpact}
          </p>
        </div>

        {/* Next responsibility */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Next Important Step</h4>
          <p className="text-sm text-gray-600">
            {milestone.nextResponsibility}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onAcknowledge}
            className="flex-1"
          >
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

// Predefined milestones for family protection journey
export const PROTECTION_MILESTONES: Milestone[] = [
  {
    id: 'first-asset-documented',
    title: 'Essential Information Documented',
    accomplishment: 'You have documented your first important asset',
    protectionImprovement: 'better informed about your primary financial resources',
    nextResponsibility: 'Continue documenting other essential assets and accounts',
    familyImpact: 'In an emergency, your family will know about this critical asset and how to access it'
  },
  {
    id: 'foundation-complete',
    title: 'Foundation Protection Established',
    accomplishment: 'You have completed the essential steps for basic family protection',
    protectionImprovement: 'protected with fundamental information and documentation',
    nextResponsibility: 'Consider establishing a trusted circle to support your family',
    familyImpact: 'Your family has access to critical information about assets, important contacts, and your basic wishes'
  },
  {
    id: 'will-created',
    title: 'Will Completed',
    accomplishment: 'You have created a will to protect your family\'s future',
    protectionImprovement: 'legally protected with clear instructions for asset distribution',
    nextResponsibility: 'Document your healthcare preferences and directives',
    familyImpact: 'Your wishes are now legally documented, reducing potential confusion and conflict during difficult times'
  },
  {
    id: 'trusted-circle-established',
    title: 'Support System Created',
    accomplishment: 'You have designated trusted individuals to help your family',
    protectionImprovement: 'supported by a network of trusted people who can provide guidance',
    nextResponsibility: 'Plan how your trusted circle will access necessary information',
    familyImpact: 'Your family will have designated support from people you trust during challenging times'
  },
  {
    id: 'comprehensive-protection',
    title: 'Comprehensive Protection Achieved',
    accomplishment: 'You have created a comprehensive protection plan for your family',
    protectionImprovement: 'thoroughly prepared with detailed guidance for most situations',
    nextResponsibility: 'Schedule annual reviews to keep your plan current',
    familyImpact: 'Your family has clear, comprehensive guidance covering financial, legal, and personal matters'
  }
];

// Confidence acknowledgment messages based on protection level
export const getConfidenceAcknowledgment = (protectionLevel: string): string => {
  const acknowledgments: Record<string, string> = {
    foundation: "You have taken important first steps. Your family now has essential information they would need.",
    comprehensive: "You have built a strong foundation of protection. Your family has comprehensive guidance for most situations.",
    complete: "You have fulfilled your responsibility comprehensively. Your family is well-prepared for the future."
  };
  
  return acknowledgments[protectionLevel] || "You are making important progress in protecting your family.";
};
