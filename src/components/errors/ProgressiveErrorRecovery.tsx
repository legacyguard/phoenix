import React, { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import EmotionalRecoverySupport from "./EmotionalRecoverySupport";

interface ProgressiveErrorRecoveryProps {
  error: Error;
  onRetry: () => Promise<void>;
  onAlternativeApproach?: () => Promise<void>;
  onContactSupport?: () => void;
  maxRetries?: number;
}

type RecoveryLevel = "gentle" | "alternative" | "support";

const ProgressiveErrorRecovery: React.FC<ProgressiveErrorRecoveryProps> = ({
  error,
  onRetry,
  onAlternativeApproach,
  onContactSupport,
  maxRetries = 3,
}) => {
  const { t } = useTranslation("errors");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<RecoveryLevel>("gentle");
  const [progress, setProgress] = useState(0);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  // Determine recovery level based on retry count
  useEffect(() => {
    if (retryCount === 0) {
      setCurrentLevel("gentle");
      setRecoveryMessage(t("general.try_again"));
    } else if (retryCount < maxRetries) {
      setCurrentLevel("alternative");
      setRecoveryMessage(t("solutions.alternative_approach"));
    } else {
      setCurrentLevel("support");
      setRecoveryMessage(t("solutions.contact_support"));
    }
  }, [retryCount, maxRetries, t]);

  // Handle gentle retry
  const handleGentleRetry = useCallback(async () => {
    setIsRetrying(true);
    setProgress(0);

    // Simulate progressive loading
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 20, 90));
    }, 200);

    try {
      await onRetry();
      setProgress(100);
      clearInterval(progressInterval);
      // Success - component should unmount
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setRetryCount((prev) => prev + 1);
      setIsRetrying(false);
    }
  }, [onRetry]);

  // Handle alternative approach
  const handleAlternativeApproach = useCallback(async () => {
    if (!onAlternativeApproach) {
      setRetryCount(maxRetries);
      return;
    }

    setIsRetrying(true);
    setProgress(0);

    try {
      await onAlternativeApproach();
      // Success
    } catch (err) {
      setRetryCount(maxRetries);
      setIsRetrying(false);
    }
  }, [onAlternativeApproach, maxRetries]);

  // Render based on recovery level
  const renderRecoveryUI = () => {
    switch (currentLevel) {
      case "gentle":
        return (
          <Alert className="border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="ml-2">
              <p className="font-medium">{recoveryMessage}</p>
              <p className="text-sm mt-1">{t("general.temporary_issue")}</p>
              {isRetrying && <Progress value={progress} className="mt-2" />}
            </AlertDescription>
          </Alert>
        );

      case "alternative":
        return (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription>
              <p className="font-medium mb-2">{recoveryMessage}</p>
              <p className="text-sm">{t("emotional_support.time_pressure")}</p>
              {isRetrying && (
                <div className="mt-2">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  <span className="text-sm">
                    Trying a different approach...
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );

      case "support":
        return (
          <EmotionalRecoverySupport
            errorType={error.name}
            onContinue={() => setRetryCount(0)}
            onTakeBreak={onContactSupport}
          />
        );
    }
  };

  // Auto-retry for gentle level
  useEffect(() => {
    if (currentLevel === "gentle" && !isRetrying && retryCount === 0) {
      const timer = setTimeout(() => {
        handleGentleRetry();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, isRetrying, retryCount, handleGentleRetry]);

  // Handle alternative approach automatically
  useEffect(() => {
    if (currentLevel === "alternative" && !isRetrying && retryCount === 1) {
      const timer = setTimeout(() => {
        handleAlternativeApproach();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, isRetrying, retryCount, handleAlternativeApproach]);

  return (
    <div className="progressive-error-recovery">
      {renderRecoveryUI()}

      {/* Manual retry options */}
      {!isRetrying && currentLevel !== "support" && (
        <div className="mt-4 text-center">
          <button
            onClick={
              currentLevel === "gentle"
                ? handleGentleRetry
                : handleAlternativeApproach
            }
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again now
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressiveErrorRecovery;
