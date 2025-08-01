import { z } from 'zod';

// Function to create beneficiary form schema with translations
export const createBeneficiaryFormSchema = (t: (key: string, params?: Record<string, unknown>) => string) => z.object({
  name: z.string()
    .min(2, { message: t("validation.errors.beneficiaryNameRequired") })
    .max(100, { message: t("validation.errors.nameMaxLength", { max: 100 }) })
    .trim(),
    
  allocation: z.string()
    .min(1, { message: t("validation.errors.allocationRequired") })
    .refine((val) => !isNaN(Number(val)), {
      message: t("validation.errors.allocationMustBeNumber")
    })
    .refine((val) => {
      const num = Number(val);
      return num >= 1 && num <= 100;
    }, {
      message: t("validation.errors.allocationRange")
    }),
    
  relationship: z.string()
    .optional(),
    
  email: z.string()
    .email({ message: t("validation.errors.invalidEmail") })
    .optional()
    .or(z.literal('')),
    
  phone: z.string()
    .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/, {
      message: t("validation.errors.invalidPhone")
    })
    .optional()
    .or(z.literal('')),
    
  address: z.string()
    .max(500, { message: t("validation.errors.addressMaxLength", { max: 500 }) })
    .optional(),
    
  notes: z.string()
    .max(1000, { message: t("validation.errors.notesMaxLength", { max: 1000 }) })
    .optional()
});

export type BeneficiaryFormData = z.infer<ReturnType<typeof createBeneficiaryFormSchema>>;
