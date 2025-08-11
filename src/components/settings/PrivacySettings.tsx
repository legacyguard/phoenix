import React from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Cloud, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrivacySettings: React.FC = () => {
  const { defaultProcessingMode, setDefaultProcessingMode } = useUserSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("settings.privacySettings.privacy_settings_1")}
        </CardTitle>
        <CardDescription>
          {t("settings.privacySettings.control_how_your_documents_are_2")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-medium leading-none">
                {t("settings.privacySettings.default_processing_mode_3")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.privacySettings.choose_how_documents_are_proce_4")}
              </p>
            </div>
            <Switch
              checked={defaultProcessingMode === "local"}
              onCheckedChange={(checked) =>
                setDefaultProcessingMode(checked ? "local" : "hybrid")
              }
            />
          </div>

          <div className="grid gap-4 mt-4">
            <div
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                defaultProcessingMode === "hybrid"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setDefaultProcessingMode("hybrid")}
            >
              <div className="flex items-start gap-3">
                <Cloud className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {t("settings.privacySettings.hybrid_mode_recommended_5")}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(
                      "settings.privacySettings.combines_local_and_cloud_ai_fo_6",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                defaultProcessingMode === "local"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setDefaultProcessingMode("local")}
            >
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">
                    {t("settings.privacySettings.local_only_privacy_mode_7")}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(
                      "settings.privacySettings.processes_documents_entirely_i_8",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>{t("settings.privacySettings.note_9")}</strong>
              {t("settings.privacySettings.you_can_always_override_this_s_10")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
