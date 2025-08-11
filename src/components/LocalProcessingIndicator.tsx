import React from "react";
import { Shield, Lock, Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LocalProcessingIndicatorProps {
  isLocal: boolean;
  className?: string;
  showDetails?: boolean;
}

export function LocalProcessingIndicator({
  isLocal,
  className,
  showDetails = false,
}: LocalProcessingIndicatorProps) {
  const { t } = useTranslation("ui-common");

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        isLocal
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-blue-100 text-blue-800 border border-blue-200",
        className,
      )}
    >
      {isLocal ? (
        <>
          <Shield className="h-4 w-4" />
          <Lock className="h-3.5 w-3.5" />
          <span>{t("privacy.processingLocal")}</span>
          {showDetails && <CloudOff className="h-4 w-4 ml-1" />}
        </>
      ) : (
        <>
          <Cloud className="h-4 w-4" />
          <span>{t("privacy.enhancedWithAI")}</span>
        </>
      )}
    </div>
  );
}

interface PrivacyToggleProps {
  isPrivacyMode: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function PrivacyToggle({
  isPrivacyMode,
  onToggle,
  className,
}: PrivacyToggleProps) {
  const { t } = useTranslation("ui-common");

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isPrivacyMode}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {t("privacy.privacyMode")}
        </span>
      </label>

      <div className="text-xs text-gray-500">
        {isPrivacyMode ? (
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {t("privacy.allProcessingLocal")}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Cloud className="h-3 w-3" />
            {t("privacy.aiAssistanceEnabled")}
          </span>
        )}
      </div>
    </div>
  );
}
