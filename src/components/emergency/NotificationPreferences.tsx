import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, Mail, MessageSquare, Info } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreference {
  email_enabled: boolean;
  sms_enabled: boolean;
  opt_out_reason: string | null;
  last_preference_update: string | null;
}

interface EmergencyContactPreference {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_email?: string;
  notification_preferences: NotificationPreference;
}

export const NotificationPreferences: React.FC = () => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmergencyContactPreference[]>([]);

  useEffect(() => {
     
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseWithRetry
        .from('emergency_contacts')
        .select(`
          id,
          contact_id,
          notification_preferences,
          contact:contacts(
            id,
            name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('priority_order');

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        contact_id: item.contact_id,
        contact_name: item.contact.name,
        contact_email: item.contact.email,
        notification_preferences: item.notification_preferences || {
          email_enabled: true,
          sms_enabled: false,
          opt_out_reason: null,
          last_preference_update: null
        }
      })) || [];

      setPreferences(formattedData);
    } catch (error) {
      console.error('[NotificationPreferences] Error loading:', error);
      toast.error(t('notificationPreferences.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    emergencyContactId: string,
    contactId: string,
    emailEnabled: boolean
  ) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      const { error } = await supabaseWithRetry.rpc('update_notification_preferences', {
        p_contact_id: contactId,
        p_user_id: user.id,
        p_email_enabled: emailEnabled,
        p_sms_enabled: false,
        p_opt_out_reason: emailEnabled ? null : 'User opted out'
      });

      if (error) throw error;

      // Update local state
      setPreferences(prev =>
        prev.map(p =>
          p.id === emergencyContactId
            ? {
                ...p,
                notification_preferences: {
                  ...p.notification_preferences,
                  email_enabled: emailEnabled,
                  last_preference_update: new Date().toISOString()
                }
              }
            : p
        )
      );

      toast.success(t('notificationPreferences.messages.updated'));
    } catch (error) {
      console.error('[NotificationPreferences] Error updating:', error);
      toast.error(t('notificationPreferences.errors.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notificationPreferences.title')}</CardTitle>
          <CardDescription>{t('notificationPreferences.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('notificationPreferences.title')}
        </CardTitle>
        <CardDescription>{t('notificationPreferences.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {preferences.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t('notificationPreferences.noContacts')}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <Label htmlFor={`email-${pref.id}`} className="text-base font-medium">
                      {pref.contact_name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {pref.contact_email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {pref.contact_email}
                        </span>
                      ) : (
                        t('notificationPreferences.noEmail')
                      )}
                    </p>
                    {pref.notification_preferences.last_preference_update && (
                      <p className="text-xs text-muted-foreground">
                        {t('notificationPreferences.lastUpdated', {
                          date: new Date(pref.notification_preferences.last_preference_update).toLocaleDateString()
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pref.contact_email ? (
                      <Switch
                        id={`email-${pref.id}`}
                        checked={pref.notification_preferences.email_enabled}
                        disabled={saving}
                        onCheckedChange={(checked) =>
                          updatePreference(pref.id, pref.contact_id, checked)
                        }
                      />
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {t('notificationPreferences.emailRequired')}
                      </Badge>
                    )}
                    {pref.notification_preferences.email_enabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('notificationPreferences.info')}
                </AlertDescription>
              </Alert>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">{t('notificationPreferences.howItWorks.title')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t('notificationPreferences.howItWorks.point1')}</li>
                  <li>• {t('notificationPreferences.howItWorks.point2')}</li>
                  <li>• {t('notificationPreferences.howItWorks.point3')}</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Badge component import (in case it's not imported elsewhere)
import { Badge } from '@/components/ui/badge';
