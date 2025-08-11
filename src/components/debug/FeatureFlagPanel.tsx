/**
 * Feature Flag Debug Panel
 * Development tool for testing feature flags
 *
 * Notes:
 * - Only renders in development (import.meta.env.PROD short-circuits)
 * - Persists toggles to localStorage using keys from src/config/features.tsx
 * - For full reference and procedures see docs/feature-flags.md
 */

import React, { useState } from "react";
import { useFeatureFlags } from "@/config/features";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Eye, EyeOff } from "lucide-react";

export const FeatureFlagPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { flags, isEnabled, setFlag, toggleFlag, resetFlags } =
    useFeatureFlags();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        title="Feature Flags"
      >
        <Settings className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-auto">
      <Card className="shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Feature Flags</CardTitle>
            <CardDescription className="text-xs">
              Development only
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFlags}
              title="Reset to defaults"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              title="Close panel"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex-1">
                <p className="text-sm font-medium">Respectful Onboarding</p>
                <p className="text-xs text-muted-foreground">
                  New professional flow
                </p>
              </div>
              <Switch
                checked={isEnabled("respectfulOnboarding")}
                onCheckedChange={() => toggleFlag("respectfulOnboarding")}
              />
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Current Configuration:
            </p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(flags).map(([key, value]) => (
                <Badge
                  key={key}
                  variant={value ? "default" : "secondary"}
                  className="text-xs"
                >
                  {key}: {value ? "ON" : "OFF"}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Changes are saved to localStorage and persist across
              sessions. Use the refresh button to reset to defaults.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
