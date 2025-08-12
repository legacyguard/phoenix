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
      toast.success(t("willSyncSettings.saved"));
    } catch (error) {
      toast.error(t("willSyncSettings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card data-testid="willsyncsettings-card">
        <CardHeader data-testid="willsyncsettings-t-willsyncsettings-generalsettings">
          <CardTitle data-testid="willsyncsettings-t-willsyncsettings-generalsettings">{t("willSyncSettings.generalSettings")}</CardTitle>
          <CardDescription data-testid="willsyncsettings-t-willsyncsettings-generaldescription">
            {t("willSyncSettings.generalDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" data-testid="willsyncsettings-cardcontent">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSyncEnabled" data-testid="willsyncsettings-t-willsyncsettings-autosync">
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
              } data-testid="willsyncsettings-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireApproval" data-testid="willsyncsettings-t-willsyncsettings-requireapproval">
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
              } data-testid="willsyncsettings-switch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncFrequency" data-testid="willsyncsettings-t-willsyncsettings-syncfrequency">
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
              } data-testid="willsyncsettings-select"
            >
              <SelectTrigger id="syncFrequency" data-testid="willsyncsettings-selecttrigger">
                <SelectValue data-testid="willsyncsettings-selectvalue" />
              </SelectTrigger>
              <SelectContent data-testid="willsyncsettings-selectcontent">
                <SelectItem value="immediate" data-testid="willsyncsettings-t-willsyncsettings-frequencyimmediate">
                  {t("willSyncSettings.frequencyImmediate")}
                </SelectItem>
                <SelectItem value="daily" data-testid="willsyncsettings-t-willsyncsettings-frequencydaily">
                  {t("willSyncSettings.frequencyDaily")}
                </SelectItem>
                <SelectItem value="weekly" data-testid="willsyncsettings-t-willsyncsettings-frequencyweekly">
                  {t("willSyncSettings.frequencyWeekly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="willsyncsettings-card">
        <CardHeader data-testid="willsyncsettings-t-willsyncsettings-triggersettings">
          <CardTitle data-testid="willsyncsettings-t-willsyncsettings-triggersettings">{t("willSyncSettings.triggerSettings")}</CardTitle>
          <CardDescription data-testid="willsyncsettings-t-willsyncsettings-triggerdescription">
            {t("willSyncSettings.triggerDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="willsyncsettings-control">
          {Object.entries(preferences.sync_triggers).map(([key, value]) => (
            <div className="flex items-center justify-between" key={key}>
              <Label data-testid="willsyncsettings-t-willsyncsettings-triggers-key">{t(`willSyncSettings.triggers.${key}`)}</Label>
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
                } data-testid="willsyncsettings-switch"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} data-testid="willsyncsettings-button">
          {t(saving ? "common.saving" : "common.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
