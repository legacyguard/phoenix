import { z } from 'zod';
import { PersonRelationship, PersonRole } from '@/types/people';

/**
 * Validation schema for person form data
 */
export const PersonSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  relationship: z.enum([
    'spouse',
    'child',
    'parent',
    'sibling',
    'grandchild',
    'friend',
    'professional',
    'other'
  ] as const),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  
  phone: z
    .string()
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  
  address: z
    .string()
    .max(200, 'Address must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  
  dateOfBirth: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth cannot be in the future')
    .optional()
    .or(z.literal('')),
  
  roles: z.array(
    z.enum([
      'guardian',
      'executor',
      'beneficiary',
      'power-of-attorney',
      'healthcare-proxy',
      'trustee',
      'emergency-contact'
    ] as const)
  ).default([]),
  
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// Type inference for the schema
export type PersonFormData = z.infer<typeof PersonSchema>;

/**
 * Validation schema for editing a person (with ID)
 */
export const EditPersonSchema = PersonSchema.extend({
  id: z.string().uuid()
});

/**
 * Validation messages for better UX
 */
export const personValidationMessages = {
  fullName: {
    required: 'Name is required',
    tooShort: 'Name must be at least 2 characters',
    tooLong: 'Name is too long',
    invalid: 'Name contains invalid characters'
  },
  email: {
    invalid: 'Please enter a valid email address'
  },
  phone: {
    invalid: 'Please enter a valid phone number (10 digits)'
  },
  dateOfBirth: {
    future: 'Date of birth cannot be in the future'
  }
};

/**
 * Helper function to validate a single field
 */
export function validateField<T extends keyof PersonFormData>(
  field: T,
  value: PersonFormData[T]
): string | null {
  try {
    const partialSchema = PersonSchema.pick({ [field]: true } as any);
    partialSchema.parse({ [field]: value });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
}

export default PersonSchema;
