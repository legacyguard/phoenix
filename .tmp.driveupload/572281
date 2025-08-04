import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactSchema, ContactFormData } from '@/schemas/contactSchema';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ContactFormData>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  isEditing = false,
}) => {
  const { t } = useTranslation('common');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name || '',
      role: initialData?.role || '',
      phone_number: initialData?.phone_number || '',
      email: initialData?.email || '',
      notes: initialData?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contactName">{t('manual.contacts.form.nameLabel')}</Label>
        <Input
          id="contactName"
          placeholder={t('manual.contacts.form.namePlaceholder')}
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">{t('manual.contacts.form.roleLabel')}</Label>
        <Input
          id="role"
          placeholder={t('manual.contacts.form.rolePlaceholder')}
          {...register('role')}
          className={errors.role ? 'border-destructive' : ''}
        />
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('manual.contacts.form.phoneLabel')}</Label>
        <Input
          id="phone"
          placeholder={t('manual.contacts.form.phonePlaceholder')}
          {...register('phone_number')}
          className={errors.phone_number ? 'border-destructive' : ''}
        />
        {errors.phone_number && (
          <p className="text-sm text-destructive">{errors.phone_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('manual.contacts.form.emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('manual.contacts.form.emailPlaceholder')}
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('manual.contacts.form.notesLabel')}</Label>
        <Textarea
          id="notes"
          placeholder={t('manual.contacts.form.notesPlaceholder')}
          {...register('notes')}
          rows={3}
          className={errors.notes ? 'border-destructive' : ''}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          {t('manual.contacts.form.cancel')}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('manual.contacts.form.saving')}
            </>
          ) : (
            isEditing ? t('manual.contacts.form.updateButton') : t('manual.contacts.form.addButton')
          )}
        </Button>
      </div>
    </form>
  );
};
