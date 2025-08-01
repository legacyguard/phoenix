import { z } from 'zod';
import { getValidationMessage } from '@/utils/validationMessages';

export const contactSchema = z.object({
  name: z.string()
    .min(1, getValidationMessage('required'))
    .max(100, getValidationMessage('maxLength', { max: 100 })),
  role: z.string()
    .min(1, getValidationMessage('required'))
    .max(50, getValidationMessage('maxLength', { max: 50 })),
  phone_number: z.string().optional(),
  email: z.string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: getValidationMessage('invalidEmail'),
    }),
  notes: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
