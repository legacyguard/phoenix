import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Users, Home } from "lucide-react";
import {
  UserProgress,
  ProtectionFeature,
  getNextLogicalStep,
  PROTECTION_FEATURES,
} from "@/services/familyProtectionDisclosure";
import { ProtectionProgressDashboard } from "@/components/progressive/ProtectionProgressDashboard";
import { ContextualFeatureIntroduction } from "@/components/progressive/ContextualFeatureIntroduction";

/**
 * Example implementation of the progressive disclosure system
 * Demonstrates how to integrate the family protection journey
 */
export const ProtectionProgressExample: React.FC = () => {
  // Initialize user progress
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedSteps: [],
    documentedAssets: 0,
    protectionLevel: "foundation",
    familyStructure: {
      hasSpouse: true,
      hasChildren: true,
      hasDependents: false,
      hasBusinessInterests: false,
    },
    completedProtectionAreas: [],
    lastActivityDate: new Date().toISOString(),
  });

  const [activeFeature, setActiveFeature] = useState<ProtectionFeature | null>(
    null,
  );
  const [lastCompletedStep, setLastCompletedStep] = useState<
    string | undefined
  >();

  // Handle feature access
  const handleFeatureAccess = useCallback((featureId: string) => {
    const feature = PROTECTION_FEATURES.find((f) => f.id === featureId);
    if (feature) {
      setActiveFeature(feature);
    }
  }, []);

  // Handle step completion
  const handleStepComplete = useCallback((stepId: string) => {
    setUserProgress((prev) => {
      const newCompletedSteps = [...prev.completedSteps, stepId];
      const newCompletedAreas = [...prev.completedProtectionAreas];

      // Update completed protection areas
      if (stepId === "basic-asset-documentation") {
        newCompletedAreas.push("basic-assets");
      } else if (stepId === "primary-family-info") {
        newCompletedAreas.push("family-info");
      } else if (stepId === "basic-will") {
        newCompletedAreas.push("basic-will");
      } else if (stepId === "trusted-circle") {
        newCompletedAreas.push("trusted-circle");
      }

      // Update protection level
      let newProtectionLevel = prev.protectionLevel;
      if (
        newCompletedSteps.length >= 4 &&
        newCompletedSteps.includes("basic-will")
      ) {
        newProtectionLevel = "comprehensive";
      }
      if (newCompletedSteps.length >= 7) {
        newProtectionLevel = "advanced";
      }

      // Update documented assets count
      const newAssetCount =
        stepId === "basic-asset-documentation"
          ? prev.documentedAssets + 3
          : prev.documentedAssets;

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        completedProtectionAreas: newCompletedAreas,
        protectionLevel: newProtectionLevel,
        documentedAssets: newAssetCount,
        lastActivityDate: new Date().toISOString(),
      };
    });

    setLastCompletedStep(stepId);
    setActiveFeature(null);
  }, []);

  // Simulate completing a feature
  const simulateFeatureCompletion = () => {
    if (activeFeature) {
      handleStepComplete(activeFeature.id);
    }
  };

  // Demo controls
  const addDocumentedAsset = () => {
    setUserProgress((prev) => ({
      ...prev,
      documentedAssets: prev.documentedAssets + 1,
    }));
  };

  const toggleBusinessInterests = () => {
    setUserProgress((prev) => ({
      ...prev,
      familyStructure: {
        ...prev.familyStructure,
        hasBusinessInterests: !prev.familyStructure.hasBusinessInterests,
      },
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Demo controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Simulate user actions to see how the protection system guides users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Family Structure:</span>
              <Badge variant="outline">
                {userProgress.familyStructure.hasSpouse && "Spouse"}
              </Badge>
              <Badge variant="outline">
                {userProgress.familyStructure.hasChildren && "Children"}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleBusinessInterests}
            >
              {userProgress.familyStructure.hasBusinessInterests
                ? "Remove Business"
                : "Add Business"}
            </Button>

            <Button variant="outline" size="sm" onClick={addDocumentedAsset}>
              <Plus className="h-4 w-4 mr-1" />
              Add Asset
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Completed Steps: {userProgress.completedSteps.length}</p>
            <p>Documented Assets: {userProgress.documentedAssets}</p>
            <p>Protection Level: {userProgress.protectionLevel}</p>
          </div>
        </CardContent>
      </Card>

      {/* Active feature introduction */}
      {activeFeature && (
        <ContextualFeatureIntroduction
          feature={activeFeature}
          context={{
            previousStep: lastCompletedStep,
            familyStructure: userProgress.familyStructure,
            currentProtectionLevel: userProgress.protectionLevel,
          }}
          onBegin={simulateFeatureCompletion}
          onDismiss={() => setActiveFeature(null)}
        />
      )}

      {/* Protection Progress Dashboard */}
      <ProtectionProgressDashboard
        userProgress={userProgress}
        onFeatureAccess={handleFeatureAccess}
        onStepComplete={handleStepComplete}
      />

      {/* Current State Display */}
      <Card>
        <CardHeader>
          <CardTitle>System State</CardTitle>
          <CardDescription>
            Shows how the system tracks user progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Completed Steps:</h4>
              <div className="flex flex-wrap gap-2">
                {userProgress.completedSteps.length > 0 ? (
                  userProgress.completedSteps.map((step) => (
                    <Badge key={step} variant="secondary">
                      {step.replace(/-/g, " ")}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No steps completed yet
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">
                Next Recommended Step:
              </h4>
              {(() => {
                const nextStep = getNextLogicalStep(userProgress);
                return nextStep ? (
                  <div className="bg-warm-sage/5 rounded-lg p-3">
                    <p className="text-sm font-medium">{nextStep.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {nextStep.familyBenefit}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    All available steps completed
                  </span>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
