import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WillStepProps } from '@/types/will';
import { User, MapPin, Calendar, Info, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export function Step1_PersonalInfo({ data, onUpdate, onNext }: WillStepProps) {
  const { user } = useUser();

  // Pre-populate from Clerk profile if available
  useEffect(() => {
    if (user && !data.personalInfo.fullName) {
      onUpdate({
        personalInfo: {
          ...data.personalInfo,
          fullName: user.fullName || '',
        }
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    onUpdate({
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const isValid = () => {
    const { fullName, address, city, state, zipCode } = data.personalInfo;
    return fullName && address && city && state && zipCode;
  };

  const handleNext = () => {
    if (isValid()) {
      const newCompletedSteps = new Set(data.completedSteps);
      newCompletedSteps.add(1);
      onUpdate({ completedSteps: newCompletedSteps });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
        <p className="text-muted-foreground">
          Let's start by confirming your personal details. This information will be used 
          to identify you as the testator (the person making the will).
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          This information is required for legal identification purposes. Make sure it 
          matches your legal documents.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            <User className="inline h-4 w-4 mr-1" />
            Full Legal Name *
          </Label>
          <Input
            id="fullName"
            placeholder="e.g., John Michael Doe"
            value={data.personalInfo.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter your full name as it appears on your legal documents
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.personalInfo.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            <MapPin className="inline h-4 w-4 mr-1" />
            Street Address *
          </Label>
          <Input
            id="address"
            placeholder="e.g., 123 Main Street, Apt 4B"
            value={data.personalInfo.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Springfield"
              value={data.personalInfo.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              placeholder="e.g., IL"
              value={data.personalInfo.state}
              onChange={(e) => handleChange('state', e.target.value)}
              maxLength={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            placeholder="e.g., 62701"
            value={data.personalInfo.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            maxLength={10}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!isValid()}
          size="lg"
          className="gap-2"
        >
          Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
