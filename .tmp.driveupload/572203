import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GenderContext, getUserGenderContext } from '@/i18n/gender-context';
import { AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const GenderPreferenceSettings: React.FC = () => {
  const { t } = useTranslation('settings');
  const { user } = useUser();
  const [selectedGender, setSelectedGender] = useState<string>(
    getUserGenderContext(user?.publicMetadata).toString()
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update user metadata with gender preference
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          gender: selectedGender
        }
      });
      
      toast.success(t('genderPreference.saveSuccess'), {
        icon: <Check className="h-4 w-4" />
      });
    } catch (error) {
      console.error('Failed to update gender preference:', error);
      toast.error(t('genderPreference.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('genderPreference.title')}</CardTitle>
        <CardDescription>
          {t('genderPreference.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('genderPreference.privacyNote')}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>{t('genderPreference.selectLabel')}</Label>
          <RadioGroup value={selectedGender} onValueChange={setSelectedGender}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={GenderContext.MASCULINE} id="masculine" />
                <Label htmlFor="masculine" className="font-normal cursor-pointer">
                  {t('genderPreference.options.masculine')}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={GenderContext.FEMININE} id="feminine" />
                <Label htmlFor="feminine" className="font-normal cursor-pointer">
                  {t('genderPreference.options.feminine')}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={GenderContext.NEUTRAL} id="neutral" />
                <Label htmlFor="neutral" className="font-normal cursor-pointer">
                  {t('genderPreference.options.neutral')}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? t('genderPreference.saving') : t('genderPreference.save')}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>{t('genderPreference.examples.title')}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>{t('genderPreference.examples.greeting')}</li>
            <li>{t('genderPreference.examples.possessive')}</li>
            <li>{t('genderPreference.examples.agreement')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
