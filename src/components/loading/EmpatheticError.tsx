import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmpatheticErrorProps {
  type?: "general" | "save_failed" | "network" | "timeout";
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showReassurance?: boolean;
}

const EmpatheticError: React.FC<EmpatheticErrorProps> = ({
  type = "general",
  onRetry,
  onDismiss,
  className,
  showReassurance = true,
}) => {
  const { t } = useTranslation("loading-states");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Alert className="border-amber-200 bg-amber-50">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1 space-y-3">
            <AlertDescription className="text-gray-800">
              {t(`errors.recovery.${type}`)}
            </AlertDescription>

            {showReassurance && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Heart className="w-4 h-4 text-primary" />
                <span>{t("errors.reassurance.data_safe")}</span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              {onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t("errors.reassurance.try_again")}</span>
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="outline" onClick={onDismiss}>
                  OK, I understand
                </Button>
              )}
            </div>
          </div>
        </div>
      </Alert>
    </motion.div>
  );
};

export default EmpatheticError;
