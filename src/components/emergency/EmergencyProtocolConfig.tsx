import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, AlertTriangle, CheckCircle2, Settings, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';

interface EmergencyApprover {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

interface EmergencyProtocolSettings {
  enabled: boolean;
  requireApproval: boolean;
  approverIds: string[];
  autoNotifyContacts: boolean;
  accessDuration: number; // hours
  notificationDelay: number; // minutes
}

export const EmergencyProtocolConfig: React.FC = () => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmergencyProtocolSettings>({
    enabled: false,
    requireApproval: true,
    approverIds: [],
    autoNotifyContacts: true,
    accessDuration: 48,
    notificationDelay: 30
  });
  const [availableApprovers, setAvailableApprovers] = useState<EmergencyApprover[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Load user profile settings
      const { data: profile, error: profileError } = await supabaseWithRetry
        .from('user_profiles')
        .select('emergency_protocol_enabled, emergency_protocol_settings')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load trusted people who can be approvers
      const { data: trustedPeople, error: trustedError } = await supabaseWithRetry
        .from('trusted_people')
        .select('id, name, email, relationship')
        .eq('user_id', user.id)
        .in('access_level', ['limited_info', 'full_access'])
        .order('name');

      if (trustedError) throw trustedError;

      setAvailableApprovers(trustedPeople || []);
      
      if (profile) {
        setSettings({
          enabled: profile.emergency_protocol_enabled || false,
          requireApproval: profile.emergency_protocol_settings?.requireApproval ?? true,
          approverIds: profile.emergency_protocol_settings?.approverIds || [],
          autoNotifyContacts: profile.emergency_protocol_settings?.autoNotifyContacts ?? true,
          accessDuration: profile.emergency_protocol_settings?.accessDuration || 48,
          notificationDelay: profile.emergency_protocol_settings?.notificationDelay || 30
        });
      }
    } catch (error) {
      console.error('Error loading emergency protocol settings:', error);
      toast.error('Failed to load emergency protocol settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabaseWithRetry.auth.getUser();
      if (!user) return;

      // Validate settings
      if (settings.enabled && settings.requireApproval && settings.approverIds.length === 0) {
        toast.error('Please select at least one approver when approval is required');
        return;
      }

      const { error } = await supabaseWithRetry
        .from('user_profiles')
        .update({
          emergency_protocol_enabled: settings.enabled,
          emergency_protocol_settings: {
            requireApproval: settings.requireApproval,
            approverIds: settings.approverIds,
            autoNotifyContacts: settings.autoNotifyContacts,
            accessDuration: settings.accessDuration,
            notificationDelay: settings.notificationDelay
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Emergency protocol settings updated successfully');
    } catch (error) {
      console.error('Error saving emergency protocol settings:', error);
      toast.error('Failed to save emergency protocol settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emergency Protocol Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Emergency Protocol Configuration
            </CardTitle>
            <CardDescription>
              Configure how trusted people can access information during emergencies
            </CardDescription>
          </div>
          <Badge variant={settings.enabled ? "default" : "outline"}>
            {settings.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Protocol */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="protocol-enabled" className="text-base">
              Enable Emergency Protocol
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Allow trusted people with "Emergency Only" access to request information during critical situations
            </p>
          </div>
          <Switch
            id="protocol-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Require Approval */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <Label htmlFor="require-approval" className="text-base">
                  Require Approval
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Emergency access must be approved by another trusted person
                </p>
              </div>
              <Switch
                id="require-approval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, requireApproval: checked })}
              />
            </div>

            {/* Approvers Selection */}
            {settings.requireApproval && (
              <div className="space-y-2">
                <Label htmlFor="approvers">Emergency Access Approvers</Label>
                <Select
                  value={settings.approverIds[0] || ''}
                  onValueChange={(value) => setSettings({ ...settings, approverIds: [value] })}
                >
                  <SelectTrigger id="approvers">
                    <SelectValue placeholder="Select an approver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableApprovers.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{person.name}</span>
                          <span className="text-muted-foreground">({person.relationship})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selected approvers can confirm emergency access requests
                </p>
              </div>
            )}

            {/* Auto-notify Contacts */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <Label htmlFor="auto-notify" className="text-base">
                  Auto-notify Emergency Contacts
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically send notifications to all emergency contacts when access is granted
                </p>
              </div>
              <Switch
                id="auto-notify"
                checked={settings.autoNotifyContacts}
                onCheckedChange={(checked) => setSettings({ ...settings, autoNotifyContacts: checked })}
              />
            </div>

            {/* Access Duration */}
            <div className="space-y-2">
              <Label htmlFor="access-duration">Emergency Access Duration</Label>
              <Select
                value={settings.accessDuration.toString()}
                onValueChange={(value) => setSettings({ ...settings, accessDuration: parseInt(value) })}
              >
                <SelectTrigger id="access-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="72">72 hours</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How long emergency access remains active after approval
              </p>
            </div>

            {/* Notification Delay */}
            <div className="space-y-2">
              <Label htmlFor="notification-delay">Notification Delay</Label>
              <Select
                value={settings.notificationDelay.toString()}
                onValueChange={(value) => setSettings({ ...settings, notificationDelay: parseInt(value) })}
              >
                <SelectTrigger id="notification-delay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Immediate</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Delay before sending notifications after emergency access is granted
              </p>
            </div>

            {/* Information Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Emergency protocol provides a secure way for trusted helpers to access critical information 
                during emergencies while maintaining your privacy and control. All access is logged and 
                monitored.
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
