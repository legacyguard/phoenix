import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import EmpatheticErrorBoundary from '@/components/errors/EmpatheticErrorBoundary';
import EmpatheticFormError from '@/components/errors/EmpatheticFormError';
import { FormFieldWithPrevention } from '@/components/errors/ProactiveErrorPrevention';
import ProgressiveErrorRecovery from '@/components/errors/ProgressiveErrorRecovery';
import { useFormError, useSaveError } from '@/hooks/useEmpatheticError';
import { Save } from 'lucide-react';

// Example form schema
const formSchema = z.object({
  fullName: z.string().min(1, 'required_field'),
  email: z.string().email('invalid_email'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'invalid_phone'),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'invalid_date')
});

type FormData = z.infer<typeof formSchema>;

const EmpatheticFormExample: React.FC = () => {
  const [saveError, setSaveError] = useState<Error | null>(null);
  const { handleError: handleFormError } = useFormError();
  const { handleError: handleSaveError, isRetrying } = useSaveError();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      const response = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('save_failed');
      }

      // Success handling
    } catch (error) {
      setSaveError(error as Error);
      await handleSaveError(error as Error, () => onSubmit(data));
    }
  };

  return (
    <EmpatheticErrorBoundary context="family-form">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add a Family Member</CardTitle>
          <p className="text-sm text-muted-foreground">
            This information helps ensure your wishes are carried out properly
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name Field */}
            <FormFieldWithPrevention fieldName="fullName">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="John Michael Doe"
                  className={errors.fullName ? 'border-amber-300' : ''}
                />
                {errors.fullName && (
                  <EmpatheticFormError
                    field="fullName"
                    error={errors.fullName.message || 'required_field'}
                  />
                )}
              </div>
            </FormFieldWithPrevention>

            {/* Email Field */}
            <FormFieldWithPrevention fieldName="email">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john.doe@email.com"
                  className={errors.email ? 'border-amber-300' : ''}
                />
                {errors.email && (
                  <EmpatheticFormError
                    field="email"
                    error={errors.email.message || 'invalid_email'}
                  />
                )}
              </div>
            </FormFieldWithPrevention>

            {/* Phone Field */}
            <FormFieldWithPrevention fieldName="phone">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? 'border-amber-300' : ''}
                />
                {errors.phone && (
                  <EmpatheticFormError
                    field="phone"
                    error={errors.phone.message || 'invalid_phone'}
                  />
                )}
              </div>
            </FormFieldWithPrevention>

            {/* Birth Date Field */}
            <FormFieldWithPrevention fieldName="birthDate">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  {...register('birthDate')}
                  placeholder="MM/DD/YYYY"
                  className={errors.birthDate ? 'border-amber-300' : ''}
                />
                {errors.birthDate && (
                  <EmpatheticFormError
                    field="birthDate"
                    error={errors.birthDate.message || 'invalid_date'}
                  />
                )}
              </div>
            </FormFieldWithPrevention>

            {/* Show progressive error recovery if save failed */}
            {saveError && (
              <ProgressiveErrorRecovery
                error={saveError}
                onRetry={() => handleSubmit(onSubmit)()}
                onContactSupport={() => window.dispatchEvent(new CustomEvent('show-support-modal'))}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                  Saving Your Information...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Family Member
                </>
              )}
            </Button>
          </form>

          {/* Reassurance message */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            Your information is automatically saved as you type, so you never lose your progress
          </p>
        </CardContent>
      </Card>
    </EmpatheticErrorBoundary>
  );
};

export default EmpatheticFormExample;
