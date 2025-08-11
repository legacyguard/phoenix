import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { WillSyncPreferences } from "@/types/willSync";

interface WillSyncSettingsProps {
  preferences: WillSyncPreferences;
  onSave: (preferences: WillSyncPreferences) => Promise<void>;
}

export function WillSyncSettings({
  preferences: initialPreferences,
  onSave,
}: WillSyncSettingsProps) {
  const { t } = useTranslation("wills");
  const [preferences, setPreferences] =
    useState<WillSyncPreferences>(initialPreferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(preferences);
      toast.success(t("common:willSyncSettings.saved"));
    } catch (error) {
      toast.error(t("common:willSyncSettings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("willSyncSettings.generalSettings")}</CardTitle>
          <CardDescription>
            {t("willSyncSettings.generalDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSyncEnabled">
                {t("willSyncSettings.autoSync")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("willSyncSettings.autoSyncDescription")}
              </p>
            </div>
            <Switch
              id="autoSyncEnabled"
              checked={preferences.auto_sync_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, auto_sync_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireApproval">
                {t("willSyncSettings.requireApproval")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("willSyncSettings.requireApprovalDescription")}
              </p>
            </div>
            <Switch
              id="requireApproval"
              checked={preferences.require_approval}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, require_approval: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncFrequency">
              {t("willSyncSettings.syncFrequency")}
            </Label>
            <Select
              value={preferences.sync_frequency}
              onValueChange={(value) =>
                setPreferences({
                  ...preferences,
                  sync_frequency:
                    value as WillSyncPreferences["sync_frequency"],
                })
              }
            >
              <SelectTrigger id="syncFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  {t("willSyncSettings.frequencyImmediate")}
                </SelectItem>
                <SelectItem value="daily">
                  {t("willSyncSettings.frequencyDaily")}
                </SelectItem>
                <SelectItem value="weekly">
                  {t("willSyncSettings.frequencyWeekly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("willSyncSettings.triggerSettings")}</CardTitle>
          <CardDescription>
            {t("willSyncSettings.triggerDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.sync_triggers).map(([key, value]) => (
            <div className="flex items-center justify-between" key={key}>
              <Label>{t(`willSyncSettings.triggers.${key}`)}</Label>
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    sync_triggers: {
                      ...preferences.sync_triggers,
                      [key]: checked,
                    },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {t(saving ? "common.saving" : "common.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
