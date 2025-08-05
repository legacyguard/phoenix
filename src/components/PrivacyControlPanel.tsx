import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacySettings {
  defaultProcessingMode: 'hybrid' | 'local_only';
  autoDeleteAfter: number;
  aiFeatureToggles: {
    expirationIntelligence: boolean;
    behavioralNudges: boolean;
    relationshipDetection: boolean;
  };
}

const PrivacyControlPanel: React.FC = () => {
  const { t } = useTranslation('settings');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<PrivacySettings>({
    defaultProcessingMode: 'hybrid',
    autoDeleteAfter: 0,
    aiFeatureToggles: {
      expirationIntelligence: true,
      behavioralNudges: true,
      relationshipDetection: true
    }
  });

  // Fetch current settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/privacy-settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const settings = await response.json();
          setUserSettings(settings);
        } else {
          toast.error(t("errors.loadingSettings"));
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        toast.error(t("errors.loadingSettings"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const handleSettingChange = (key: string, value: Record<string, unknown>) => {
    if (key.includes('.')) {
      // Handle nested properties
      const [parent, child] = key.split('.');
      setUserSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PrivacySettings],
          [child]: value
        }
      }));
    } else {
      setUserSettings((prev) => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/privacy-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userSettings)
      });

      if (response.ok) {
        toast.success(t("notifications_system.settingsSaved"));
      } else {
        const error = await response.json();
        toast.error(error.error || t("errors.savingSettings"));
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error(t("errors.savingSettings"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 font-sans max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" data-testid="loading-spinner" />
      </div>);

  }

  return (
    <div className="p-6 font-sans max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">{t("general.title")}</h2>
      <p className="text-gray-600 mt-1">{t("general.subtitle")}</p>

      {/* Data Processing Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("dataManagement.exportData")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("dataManagement.exportDescription")}</Label>
            <p className="text-sm text-gray-500">{t("dataManagement.exportDescription")}</p>
            {/* Default Processing Mode Toggle Here */}
          </div>
          <div>
            <Label>{t("dataManagement.dataRetention")}</Label>
            <p className="text-sm text-gray-500">{t("dataManagement.dataRetention")}</p>
            <Select value={(userSettings.autoDeleteAfter ?? 0).toString()} onValueChange={(value) => handleSettingChange('autoDeleteAfter', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                              <SelectItem value="0">{t("dataManagement.dataRetention")}</SelectItem>
              <SelectItem value="1">{t("dataManagement.dataRetention")}</SelectItem>
              <SelectItem value="3">{t("dataManagement.dataRetention")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("accessibility.visualSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("accessibility.fontSize")}</Label>
              <p className="text-sm text-gray-500">{t("accessibility.fontSize")}</p>
            </div>
            <Switch 
              checked={userSettings.aiFeatureToggles?.expirationIntelligence ?? true} 
              onCheckedChange={(checked) => handleSettingChange('aiFeatureToggles.expirationIntelligence', checked)} 
            />
          </div>
          {/* Add other AI feature toggles here */}
        </CardContent>
      </Card>

      {/* Family Access Management (Preview) */}
      <Card className="mt-6 opacity-50">
        <CardHeader>
          <CardTitle>{t('dataManagement.privacySettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">{t("dataManagement.privacySettings")}</p>
        </CardContent>
      </Card>

      <Button 
        className="mt-8 w-full" 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("actions.save")}
          </>
        ) : (
          t("actions.save")
        )}
      </Button>
    </div>);

};

export default PrivacyControlPanel;