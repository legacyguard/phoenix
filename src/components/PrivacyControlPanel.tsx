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
  const { t } = useTranslation('common');
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
          toast.error(t("privacyControlPanel.toast.loadFailed"));
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        toast.error(t("privacyControlPanel.toast.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getToken]);

  const handleSettingChange = (key: string, value: any) => {
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
        toast.success(t("privacyControlPanel.toast.saveSuccess"));
      } else {
        const error = await response.json();
        toast.error(error.error || t("privacyControlPanel.toast.saveFailed"));
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error(t("privacyControlPanel.toast.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 font-sans max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>);

  }

  return (
    <div className="p-6 font-sans max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">{t("privacyControlPanel.privacy_data_controls_1")}</h2>
      <p className="text-gray-600 mt-1">{t("privacyControlPanel.you_are_in_complete_control_of_2")}</p>

      {/* Data Processing Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("privacyControlPanel.data_processing_3")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("privacyControlPanel.default_document_processing_4")}</Label>
            <p className="text-sm text-gray-500">{t("privacyControlPanel.choose_how_new_documents_are_h_5")}</p>
            {/* Default Processing Mode Toggle Here */}
          </div>
          <div>
            <Label>{t("privacyControlPanel.automatic_data_deletion_6")}</Label>
            <p className="text-sm text-gray-500">{t("privacyControlPanel.for_your_peace_of_mind_you_can_7")}</p>
            <Select value={userSettings.autoDeleteAfter.toString()} onValueChange={(value) => handleSettingChange('autoDeleteAfter', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("privacyControlPanel.never_delete_8")}</SelectItem>
                <SelectItem value="1">{t("privacyControlPanel.1_year_of_inactivity_9")}</SelectItem>
                <SelectItem value="3">{t("privacyControlPanel.3_years_of_inactivity_10")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("privacyControlPanel.ai_assistant_features_11")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("privacyControlPanel.expiration_intelligence_12")}</Label>
              <p className="text-sm text-gray-500">{t("privacyControlPanel.get_alerts_for_expiring_docume_13")}</p>
            </div>
            <Switch 
              checked={userSettings.aiFeatureToggles.expirationIntelligence} 
              onCheckedChange={(checked) => handleSettingChange('aiFeatureToggles.expirationIntelligence', checked)} 
            />
          </div>
          {/* Add other AI feature toggles here */}
        </CardContent>
      </Card>

      {/* Family Access Management (Preview) */}
      <Card className="mt-6 opacity-50">
        <CardHeader>
          <CardTitle>{t('privacy.familyAccess')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">{t("privacyControlPanel.granular_access_controls_for_e_14")}</p>
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
            {t("privacyControlPanel.saving")}
          </>
        ) : (
          t("privacyControlPanel.save_privacy_settings_15")
        )}
      </Button>
    </div>);

};

export default PrivacyControlPanel;