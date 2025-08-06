import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { toast } from 'sonner';



type AssetFormData = {
  name: string;
  type: string;
};

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    type: string;
  };
  isEditing?: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { t } = useTranslation('errors');
  
  // Create a simplified asset form schema for Dashboard
  const assetFormSchema = z.object({
    name: z.string()
      .min(1, { message: t("validation.errors.assetNameRequired") })
      .max(200, { message: t("validation.errors.maxCharacters", { field: "Name", max: 200 }) })
      .trim(),
    type: z.string()
      .min(1, { message: t("validation.errors.assetTypeRequired") })
      .trim()
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || ''
    }
  });

  const onFormSubmit = async (data: AssetFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting asset form:', error);
      toast.error(t('dashboard.errors.failedToSaveAsset'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <FormField
        label={t('dashboard.assetName')}
        error={errors.name?.message}
        required
      >
        <Input
          id="assetName"
          placeholder={t('dashboard.placeholders.assetName')}
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        label={t('dashboard.assetType')}
        error={errors.type?.message}
        required
      >
        <Input
          id="assetType"
          placeholder={t('dashboard.placeholders.assetType')}
          {...register('type')}
          className={errors.type ? 'border-red-500' : ''}
        />
      </FormField>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting 
            ? t('ui.saving') 
            : (isEditing ? t('dashboard.updateAsset') : t('dashboard.saveAsset'))
          }
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('ui.cancel')}
        </Button>
      </div>
    </form>
  );
};
