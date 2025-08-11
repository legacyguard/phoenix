import React from "react";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ErrorRecoveryProps {
  error: Error | null;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  customMessage?: string;
  className?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  showHomeButton = true,
  showBackButton = true,
  customMessage,
  className = "",
}) => {
  const { t } = useTranslation("ui-common");
  const navigate = useNavigate();

  if (!error) return null;

  const getErrorMessage = () => {
    if (customMessage) return customMessage;

    // Check for specific error types
    if (error.message.includes("network")) {
      return t("errors.networkError");
    } else if (error.message.includes("permission")) {
      return t("errors.permissionDenied");
    } else if (error.message.includes("not found")) {
      return t("errors.dataNotFound");
    }

    return t("errors.unknown");
  };

  return (
    <div
      className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}
    >
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("ui-elements:ui.error")}</AlertTitle>
          <AlertDescription>{getErrorMessage()}</AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-2">
          {onRetry && (
            <Button variant="default" onClick={onRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("ui-elements:ui.retry")}
            </Button>
          )}

          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("ui.goBack")}
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              {t("ui.goHome")}
            </Button>
          )}
        </div>

        {/* Technical details for development */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="text-sm text-muted-foreground cursor-pointer">
              {t("ui.routeErrorBoundary.technical_details_3")}
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
