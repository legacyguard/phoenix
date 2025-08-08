import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGenderContext, getGenderedTranslation, GENDER_OPTIONS } from '../i18n/gender-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

export const GenderAwareExample: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { gender, setGender, getGenderedKey } = useGenderContext();

  // Example of using gendered translations
  const welcomeTitle = getGenderedTranslation(t, 'welcome.title');
  const welcomeSubtitle = getGenderedTranslation(t, 'welcome.subtitle');
  
  const assetAddedMessage = getGenderedTranslation(t, 'notifications.success.assetAdded');
  const profileUpdatedMessage = getGenderedTranslation(t, 'notifications.success.profileUpdated');
  const reviewDueMessage = getGenderedTranslation(t, 'notifications.info.reviewDue');

  const handleGenderChange = (newGender: string) => {
    setGender(newGender as 'masculine' | 'feminine' | 'neutral');
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gender-Aware Translation Example</CardTitle>
          <CardDescription>
            This component demonstrates how to use gender-aware translations in the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gender Preference Selector */}
          <div className="space-y-2">
            <Label htmlFor="gender-select">Select Gender Preference:</Label>
            <Select value={gender} onValueChange={handleGenderChange}>
              <SelectTrigger id="gender-select">
                <SelectValue placeholder="Select gender preference" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Gender Display */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Current Gender Setting: {gender}</p>
            <p className="text-xs text-muted-foreground">
              Translation keys will be suffixed with: _{gender}
            </p>
          </div>

          {/* Example Translations */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Welcome Messages:</h3>
              <p className="text-lg font-medium">{welcomeTitle}</p>
              <p className="text-sm text-muted-foreground">{welcomeSubtitle}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Key used: {getGenderedKey('welcome.title')}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Success Notifications:</h3>
              <div className="space-y-2">
                <p className="text-sm">• {assetAddedMessage}</p>
                <p className="text-sm">• {profileUpdatedMessage}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keys used: {getGenderedKey('notifications.success.assetAdded')}, {getGenderedKey('notifications.success.profileUpdated')}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Info Notifications:</h3>
              <p className="text-sm">• {reviewDueMessage}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Key used: {getGenderedKey('notifications.info.reviewDue')}
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How It Works:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Gender preference is stored in localStorage</li>
              <li>• Translation keys are automatically suffixed with gender</li>
              <li>• Falls back to base key if gendered key doesn't exist</li>
              <li>• Works with all translation namespaces</li>
              <li>• Supports English and Czech languages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default GenderAwareExample; 