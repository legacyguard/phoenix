import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { COUNTRY_CONFIGS } from '@/config/countries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GuardianUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingGuardian?: Record<string, unknown>;
}

export const GuardianUpload: React.FC<GuardianUploadProps> = ({
  onSuccess,
  onCancel,
  editingGuardian
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: editingGuardian?.full_name || '',
    relationship: editingGuardian?.relationship || '',
    country_code: editingGuardian?.country_code || '',
    roles: editingGuardian?.roles || []
  });

  const relationships = [
    { key: 'spouse', value: t('guardianUpload.relationships.spouse') },
    { key: 'parent', value: t('guardianUpload.relationships.parent') },
    { key: 'sibling', value: t('guardianUpload.relationships.sibling') },
    { key: 'child', value: t('guardianUpload.relationships.child') },
    { key: 'friend', value: t('guardianUpload.relationships.friend') },
    { key: 'legalProfessional', value: t('guardianUpload.relationships.legalProfessional') },
    { key: 'other', value: t('guardianUpload.relationships.other') }
  ];

  const availableRoles = [
    { key: 'guardianForChildren', value: t('guardianUpload.roles.guardianForChildren') },
    { key: 'executorOfWill', value: t('guardianUpload.roles.executorOfWill') },
    { key: 'healthcareProxy', value: t('guardianUpload.roles.healthcareProxy') },
    { key: 'financialPowerOfAttorney', value: t('guardianUpload.roles.financialPowerOfAttorney') },
    { key: 'emergencyContact', value: t('guardianUpload.roles.emergencyContact') },
    { key: 'trustee', value: t('guardianUpload.roles.trustee') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.relationship || !formData.country_code) {
      toast({
        title: t('guardianUpload.error'),
        description: t('guardianUpload.fillRequired'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('guardianUpload.error'),
          description: t('guardianUpload.loginToSave'),
          variant: "destructive"
        });
        return;
      }

      if (editingGuardian) {
        // Update existing guardian
        const { error } = await supabase
          .from('guardians')
          .update({
            full_name: formData.full_name,
            relationship: formData.relationship,
            country_code: formData.country_code,
            roles: formData.roles,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGuardian.id);

        if (error) throw error;

        toast({
          title: t('guardianUpload.success'),
          description: t('guardianUpload.updated')
        });
      } else {
        // Create new guardian
        const { error } = await supabase
          .from('guardians')
          .insert({
            user_id: user.id,
            full_name: formData.full_name,
            relationship: formData.relationship,
            country_code: formData.country_code,
            roles: formData.roles
          });

        if (error) throw error;

        toast({
          title: t('guardianUpload.success'),
          description: t('guardianUpload.added')
        });
      }

      onSuccess();
        } catch (error: any) {
      const timestamp = new Date().toISOString();
      const errorMessage = error?.message || 'Neznáma chyba';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      // Detailné logovanie pre debugging
      console.error('[Správa strážcov] Chyba pri uloženie strážcu:', {
        timestamp,
        operation: 'handleSubmit',
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack
      });
      
      // Používateľsky prívetivá správa
      let userMessage = 'Nastala chyba pri uloženie strážcu.';
      
      // Špecifické správy podľa typu chyby
      if (error?.code === 'PGRST116') {
        userMessage = 'Požadované dáta neboli nájdené.';
      } else if (error?.message?.includes('network')) {
        userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
      } else if (error?.message?.includes('permission')) {
        userMessage = 'Nemáte oprávnenie na túto akciu.';
      } else if (error?.message?.includes('duplicate')) {
        userMessage = 'Takýto záznam už existuje.';
      }
      
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {editingGuardian ? t('guardianUpload.editTitle') : t('guardianUpload.addTitle')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('guardianUpload.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Guardian's Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">{t('guardianUpload.fullNameLabel')}</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder={t('guardianUpload.fullNamePlaceholder')}
            required
          />
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor="relationship">{t('guardianUpload.relationshipLabel')}</Label>
          <Select
            value={formData.relationship}
            onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('guardianUpload.relationshipPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {relationships.map((rel) => (
                <SelectItem key={rel.key} value={rel.value}>
                  {rel.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country of Residence */}
        <div className="space-y-2">
          <Label htmlFor="country_code">{t('guardianUpload.countryLabel')}</Label>
          <Select
            value={formData.country_code}
            onValueChange={(value) => setFormData(prev => ({ ...prev, country_code: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('guardianUpload.countryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(COUNTRY_CONFIGS)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((config) => (
                  <SelectItem key={config.code} value={config.code}>
                    <div className="flex items-center space-x-2">
                      <span>{config.flag}</span>
                      <span>{config.name}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t('guardianUpload.countryDescription')}
          </p>
        </div>

        {/* Roles */}
        <div className="space-y-2">
          <Label>{t('guardianUpload.rolesTitle')}</Label>
          <div className="grid grid-cols-1 gap-3">
            {availableRoles.map((role) => (
              <div key={role.key} className="flex items-center space-x-2">
                <Checkbox
                  id={role.key}
                  checked={formData.roles.includes(role.value)}
                  onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                />
                <Label htmlFor={role.key} className="text-sm font-normal">
                  {role.value}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('guardianUpload.saving') : (editingGuardian ? t('guardianUpload.updateButton') : t('guardianUpload.addButton'))}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
};