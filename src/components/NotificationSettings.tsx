// src/components/NotificationSettings.tsx

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Smartphone,
  Shield,
  Clock,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { pushNotifications } from "@/services/pushNotifications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface NotificationPreferences {
  documentExpiry: boolean;
  inactivityReminders: boolean;
  emergencyAccess: boolean;
  systemUpdates: boolean;
}

export function NotificationSettings() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    documentExpiry: true,
    inactivityReminders: true,
    emergencyAccess: true,
    systemUpdates: false,
  });

  // Check current notification status
  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (pushNotifications.isSupported()) {
      const subscribed = await pushNotifications.isSubscribed();
      setIsEnabled(subscribed);
    }
  };

  const handleEnableNotifications = async () => {
    if (!user?.id) {
      toast.error(t("errors:errors.savingSettings"));
      return;
    }

    setIsLoading(true);
    try {
      // Request permission first
      const permission = await pushNotifications.requestPermission();

      if (permission === "granted") {
        // Subscribe to push notifications
        const subscription = await pushNotifications.subscribe(user.id);
        if (subscription) {
          setIsEnabled(true);

          // Test notification
          await pushNotifications.showLocalNotification(
            t("ui.testNotification"),
            {
              body: t("ui.testNotification"),
              icon: "/icons/icon-192x192.png",
            },
          );
        }
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error(t("errors:errors.savingSettings"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await pushNotifications.unsubscribe(user.id);
      setIsEnabled(false);
    } catch (error) {
      console.error("Error disabling notifications:", error);
      toast.error(t("errors:errors.savingSettings"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // TODO: Save preferences to backend
    toast.success(t("notifications_system.notificationsSaved"));
  };

  if (!pushNotifications.isSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            {t("ui.pushNotifications")}
          </CardTitle>
          <CardDescription>{t("ui.pushNotifications")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("ui.pushNotifications")}
          </CardTitle>
          <CardDescription>{t("ui.pushNotifications")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isEnabled ? (
              <>
                <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{t("ui.pushNotifications")}</p>
                </div>
                <Button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? t("actions.enable") : t("actions.enable")}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">
                      {t("ui.pushNotifications")}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisableNotifications}
                    disabled={isLoading}
                  >
                    {t("actions.disable")}
                  </Button>
                </div>

                <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{t("ui.pushNotifications")}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>{t("ui.emailNotifications")}</CardTitle>
            <CardDescription>{t("ui.emailNotifications")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="doc-expiry"
                    className="text-base flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {t("ui.notificationTypes.documents")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("ui.notificationTypes.documents")}
                  </p>
                </div>
                <Switch
                  id="doc-expiry"
                  checked={preferences.documentExpiry}
                  onCheckedChange={() =>
                    handlePreferenceChange("documentExpiry")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="inactivity"
                    className="text-base flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    {t("ui.notificationTypes.reminders")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("ui.notificationTypes.reminders")}
                  </p>
                </div>
                <Switch
                  id="inactivity"
                  checked={preferences.inactivityReminders}
                  onCheckedChange={() =>
                    handlePreferenceChange("inactivityReminders")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="emergency"
                    className="text-base flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {t("ui.notificationTypes.security")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("ui.notificationTypes.security")}
                  </p>
                </div>
                <Switch
                  id="emergency"
                  checked={preferences.emergencyAccess}
                  onCheckedChange={() =>
                    handlePreferenceChange("emergencyAccess")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="updates" className="text-base">
                    {t("ui.notificationTypes.system")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("ui.notificationTypes.system")}
                  </p>
                </div>
                <Switch
                  id="updates"
                  checked={preferences.systemUpdates}
                  onCheckedChange={() =>
                    handlePreferenceChange("systemUpdates")
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Notification */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>{t("ui.testNotification")}</CardTitle>
            <CardDescription>{t("ui.testNotification")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await pushNotifications.showLocalNotification(
                    t("ui.testNotification"),
                    {
                      body: t("ui.testNotification"),
                      icon: "/icons/icon-192x192.png",
                      tag: "test-notification",
                    },
                  );
                  toast.success(t("notifications_system.notificationsSaved"));
                } catch (error) {
                  toast.error(t("errors:errors.savingSettings"));
                }
              }}
            >
              {t("ui.testNotification")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
