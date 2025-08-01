// src/components/NotificationSettings.tsx

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Shield, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { pushNotifications } from '@/services/pushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

interface NotificationPreferences {
  documentExpiry: boolean;
  inactivityReminders: boolean;
  emergencyAccess: boolean;
  systemUpdates: boolean;
}

export function NotificationSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    documentExpiry: true,
    inactivityReminders: true,
    emergencyAccess: true,
    systemUpdates: false
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
      toast.error(t('notificationSettings.errors.pleaseSignIn'));
      return;
    }

    setIsLoading(true);
    try {
      // Request permission first
      const permission = await pushNotifications.requestPermission();

      if (permission === 'granted') {
        // Subscribe to push notifications
        const subscription = await pushNotifications.subscribe(user.id);
        if (subscription) {
          setIsEnabled(true);

          // Test notification
          await pushNotifications.showLocalNotification(
            t('notificationSettings.testNotification.title'),
            {
              body: t('notificationSettings.testNotification.body'),
              icon: '/icons/icon-192x192.png'
            }
          );
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(t('notificationSettings.errors.failedToEnable'));
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
      console.error('Error disabling notifications:', error);
      toast.error(t('notificationSettings.errors.failedToDisable'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));

    // TODO: Save preferences to backend
    toast.success(t('notificationSettings.messages.preferencesUpdated'));
  };

  if (!pushNotifications.isSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />{t("notificationSettings.notifications_not_supported_1")}

          </CardTitle>
          <CardDescription>{t("notificationSettings.your_browser_doesn_t_support_p_2")}

          </CardDescription>
        </CardHeader>
      </Card>);

  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />{t("notificationSettings.push_notifications_3")}

          </CardTitle>
          <CardDescription>{t("notificationSettings.get_notified_about_important_u_4")}

          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isEnabled ?
            <>
                <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{t("notificationSettings.enable_notifications_to_receiv_5")}</p>
                </div>
                <Button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="w-full sm:w-auto">

                  {isLoading ? t('notificationSettings.buttons.enabling') : t('notificationSettings.buttons.enableNotifications')}
                </Button>
              </> :

            <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">{t("notificationSettings.notifications_are_enabled_6")}</span>
                  </div>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableNotifications}
                  disabled={isLoading}>

                    {t('notificationSettings.buttons.disable')}
                  </Button>
                </div>

                <div className="flex items-start space-x-3 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{t("notificationSettings.you_ll_receive_notifications_o_7")}</p>
                </div>
              </>
            }
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {isEnabled &&
      <Card>
          <CardHeader>
            <CardTitle>{t("notificationSettings.notification_preferences_8")}</CardTitle>
            <CardDescription>{t("notificationSettings.choose_which_types_of_notifica_9")}

          </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="doc-expiry" className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />{t("notificationSettings.document_expiration_10")}

                </Label>
                  <p className="text-sm text-muted-foreground">{t("notificationSettings.get_alerts_when_important_docu_11")}

                </p>
                </div>
                <Switch
                id="doc-expiry"
                checked={preferences.documentExpiry}
                onCheckedChange={() => handlePreferenceChange('documentExpiry')} />

              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inactivity" className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />{t("notificationSettings.inactivity_reminders_12")}

                </Label>
                  <p className="text-sm text-muted-foreground">{t("notificationSettings.periodic_reminders_to_review_a_13")}

                </p>
                </div>
                <Switch
                id="inactivity"
                checked={preferences.inactivityReminders}
                onCheckedChange={() => handlePreferenceChange('inactivityReminders')} />

              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emergency" className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />{t("notificationSettings.emergency_access_alerts_14")}

                </Label>
                  <p className="text-sm text-muted-foreground">{t("notificationSettings.notify_me_when_someone_accesse_15")}

                </p>
                </div>
                <Switch
                id="emergency"
                checked={preferences.emergencyAccess}
                onCheckedChange={() => handlePreferenceChange('emergencyAccess')} />

              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="updates" className="text-base">{t("notificationSettings.system_updates_16")}

                </Label>
                  <p className="text-sm text-muted-foreground">{t("notificationSettings.new_features_and_important_sys_17")}

                </p>
                </div>
                <Switch
                id="updates"
                checked={preferences.systemUpdates}
                onCheckedChange={() => handlePreferenceChange('systemUpdates')} />

              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Test Notification */}
      {isEnabled &&
      <Card>
          <CardHeader>
            <CardTitle>{t("notificationSettings.test_notifications_18")}</CardTitle>
            <CardDescription>{t("notificationSettings.send_a_test_notification_to_ve_19")}

          </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
            variant="outline"
            onClick={async () => {
              try {
                await pushNotifications.showLocalNotification(
                  t('notificationSettings.testNotification.testTitle'),
                  {
                    body: t('notificationSettings.testNotification.testBody'),
                    icon: '/icons/icon-192x192.png',
                    tag: 'test-notification'
                  }
                );
                toast.success(t('notificationSettings.messages.testNotificationSent'));
              } catch (error) {
                toast.error(t('notificationSettings.errors.testNotificationFailed'));
              }
            }}>{t("notificationSettings.send_test_notification_20")}


          </Button>
          </CardContent>
        </Card>
      }
    </div>);

}