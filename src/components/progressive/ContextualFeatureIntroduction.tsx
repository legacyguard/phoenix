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
  FileText,
  Users,
  Heart,
  Home,
  Briefcase,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { ProtectionFeature } from "@/services/familyProtectionDisclosure";

interface ContextualFeatureIntroductionProps {
  feature: ProtectionFeature;
  context: {
    previousStep?: string;
    familyStructure?: {
      hasSpouse: boolean;
      hasChildren: boolean;
      hasBusinessInterests: boolean;
    };
    currentProtectionLevel?: string;
  };
  onBegin: () => void;
  onDismiss: () => void;
}

export const ContextualFeatureIntroduction: React.FC<
  ContextualFeatureIntroductionProps
> = ({ feature, context, onBegin, onDismiss }) => {
  const getFeatureIcon = (featureId: string) => {
    const icons: Record<string, React.ReactNode> = {
      "basic-asset-documentation": <Home className="h-6 w-6" />,
      "primary-family-info": <Users className="h-6 w-6" />,
      "document-storage": <FileText className="h-6 w-6" />,
      "basic-will": <FileText className="h-6 w-6" />,
      "trusted-circle": <Shield className="h-6 w-6" />,
      "healthcare-directives": <Heart className="h-6 w-6" />,
      "business-succession": <Briefcase className="h-6 w-6" />,
      "access-planning": <AlertCircle className="h-6 w-6" />,
    };
    return icons[featureId] || <Shield className="h-6 w-6" />;
  };

  const getContextualIntroduction = () => {
    // Provide context-aware introductions based on what the user just completed
    if (
      context.previousStep === "basic-asset-documentation" &&
      feature.id === "document-storage"
    ) {
      return "Now that you've documented your primary assets, let's ensure your family can access the supporting documents they'll need.";
    }

    if (
      context.previousStep === "basic-will" &&
      feature.id === "trusted-circle"
    ) {
      return "Your will is in place. Now, let's identify trusted people who can support your family when they need guidance.";
    }

    if (
      context.familyStructure?.hasChildren &&
      feature.id === "trusted-circle"
    ) {
      return "As a parent, establishing a trusted circle ensures your children will have reliable support and guidance.";
    }

    if (
      context.familyStructure?.hasBusinessInterests &&
      feature.id === "business-succession"
    ) {
      return "Your business is an important part of your family's security. Let's ensure it continues to provide for them.";
    }

    // Default contextual message
    return `This step will help ensure ${feature.familyBenefit.toLowerCase()}`;
  };

  const getUrgencyIndicator = () => {
    // Highlight urgency for certain features based on family structure
    if (feature.id === "basic-will" && context.familyStructure?.hasChildren) {
      return (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-4">
          <p className="text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            As a parent, this step is especially important for your children's
            security.
          </p>
        </div>
      );
    }

    if (
      feature.id === "healthcare-directives" &&
      context.currentProtectionLevel === "comprehensive"
    ) {
      return (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
          <p className="text-sm text-blue-800">
            This completes an important aspect of your comprehensive protection
            plan.
          </p>
        </div>
      );
    }

    return null;
  };

  const getTimeEstimate = () => {
    const estimates: Record<string, string> = {
      "basic-asset-documentation": "10-15 minutes",
      "primary-family-info": "5-10 minutes",
      "document-storage": "15-20 minutes",
      "basic-will": "20-30 minutes",
      "trusted-circle": "10-15 minutes",
      "healthcare-directives": "15-20 minutes",
      "business-succession": "30-45 minutes",
    };
    return estimates[feature.id] || "15-20 minutes";
  };

  return (
    <Card className="border-2 border-warm-sage/20 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warm-sage/10">
              {getFeatureIcon(feature.id)}
            </div>
            <div>
              <CardTitle className="text-lg">Ready for Next Step</CardTitle>
              <CardDescription className="mt-1">{feature.name}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {getUrgencyIndicator()}

        <p className="text-sm text-gray-600">{getContextualIntroduction()}</p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              What you'll do:
            </h4>
            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900">Time needed:</h4>
            <p className="text-sm text-gray-600 mt-1">
              Approximately {getTimeEstimate()}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Why this matters:
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {feature.familyBenefit}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onDismiss} className="flex-1">
            Not Right Now
          </Button>
          <Button
            onClick={onBegin}
            className="flex-1 bg-warm-sage hover:bg-warm-sage/90"
          >
            Begin This Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for inline feature prompts
export const InlineFeaturePrompt: React.FC<{
  feature: ProtectionFeature;
  onAccept: () => void;
}> = ({ feature, onAccept }) => {
  return (
    <div className="bg-warm-sage/5 rounded-lg p-4 border border-warm-sage/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            Ready for the next step?
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {feature.name} - {feature.familyBenefit}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onAccept}
          className="ml-4 bg-warm-sage hover:bg-warm-sage/90"
        >
          Start
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
