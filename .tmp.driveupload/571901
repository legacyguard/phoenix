import { z } from 'zod';
import { getValidationMessage } from '@/utils/validationMessages';

export const willSchema = z.object({
  status: z.string().min(1, getValidationMessage('required')),
  physical_location: z.string().optional(),
  executor_contact_id: z.string().optional(),
  notes: z.string().optional(),
});

export type WillFormData = z.infer<typeof willSchema>;
