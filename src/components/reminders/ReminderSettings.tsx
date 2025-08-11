import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Calendar, FileText, Users, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface ReminderPreferences {
  enabled: boolean;
  frequency: "monthly" | "quarterly" | "semi-annually" | "annually";
  types: {
    document_expiry: boolean;
    content_update: boolean;
    review: boolean;
    life_event: boolean;
  };
  channels: {
    email: boolean;
    in_app: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface ReminderSettingsProps {
  preferences: ReminderPreferences;
  onSave: (preferences: ReminderPreferences) => Promise<void>;
}

export function ReminderSettings({
  preferences: initialPreferences,
  onSave,
}: ReminderSettingsProps) {
  const { t } = useTranslation("dashboard-main");
  const [preferences, setPreferences] =
    useState<ReminderPreferences>(initialPreferences);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(preferences);
      toast.success(t("dashboard-main:dashboard.settings.saved"));
    } catch (error) {
      toast.error(t("dashboard-main:dashboard.settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const reminderTypes = [
    {
      id: "document_expiry",
      label: t("dashboard-main:dashboard.types.documentExpiry"),
      description: t("dashboard-main:dashboard.types.documentExpiryDesc"),
      icon: FileText,
    },
    {
      id: "content_update",
      label: t("dashboard-main:dashboard.types.contentUpdate"),
      description: t("dashboard-main:dashboard.types.contentUpdateDesc"),
      icon: Calendar,
    },
    {
      id: "review",
      label: t("dashboard-main:dashboard.types.review"),
      description: t("dashboard-main:dashboard.types.reviewDesc"),
      icon: Shield,
    },
    {
      id: "life_event",
      label: t("dashboard-main:dashboard.types.lifeEvent"),
      description: t("dashboard-main:dashboard.types.lifeEventDesc"),
      icon: Users,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.settings.general")}</CardTitle>
          <CardDescription>
            {t("dashboard.settings.generalDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">
                {t("dashboard.settings.enableReminders")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.settings.enableRemindersDesc")}
              </p>
            </div>
            <Switch
              id="enabled"
              checked={preferences.enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="frequency">
              {t("dashboard.settings.defaultFrequency")}
            </Label>
            <Select
              value={preferences.frequency}
              onValueChange={(value) =>
                setPreferences({
                  ...preferences,
                  frequency: value as ReminderPreferences["frequency"],
                })
              }
              disabled={!preferences.enabled}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  {t("dashboard.frequency.monthly")}
                </SelectItem>
                <SelectItem value="quarterly">
                  {t("dashboard.frequency.quarterly")}
                </SelectItem>
                <SelectItem value="semi-annually">
                  {t("dashboard.frequency.semiAnnually")}
                </SelectItem>
                <SelectItem value="annually">
                  {t("dashboard.frequency.annually")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.settings.reminderTypes")}</CardTitle>
          <CardDescription>
            {t("dashboard.settings.reminderTypesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reminderTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className="flex items-start justify-between gap-3"
              >
                <div className="flex gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <Label htmlFor={type.id}>{type.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={type.id}
                  checked={preferences.types[type.id]}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      types: { ...preferences.types, [type.id]: checked },
                    })
                  }
                  disabled={!preferences.enabled}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.settings.channels")}</CardTitle>
          <CardDescription>
            {t("dashboard.settings.channelsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email">{t("dashboard.channels.email")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.channels.emailDesc")}
              </p>
            </div>
            <Switch
              id="email"
              checked={preferences.channels.email}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  channels: { ...preferences.channels, email: checked },
                })
              }
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in_app">{t("dashboard.channels.inApp")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.channels.inAppDesc")}
              </p>
            </div>
            <Switch
              id="in_app"
              checked={preferences.channels.in_app}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  channels: { ...preferences.channels, in_app: checked },
                })
              }
              disabled={!preferences.enabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={
            saving ||
            (!preferences.channels.email &&
              !preferences.channels.in_app &&
              preferences.enabled)
          }
        >
          <Bell className="h-4 w-4 mr-2" />
          {saving ? t("common:ui.saving") : t("common:ui.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
