import { z } from 'zod';
import { MAX_FILE_SIZES } from '@/utils/constants';

// Function to create document form schema with translations
export const createDocumentFormSchema = (t: (key: string, params?: Record<string, unknown>) => string) => z.object({
  name: z.string()
    .min(1, { message: t("validation.errors.documentNameRequired") })
    .max(200, { message: t("validation.errors.nameMaxLength", { max: 200 }) })
    .trim(),
    
  type: z.string()
    .min(1, { message: t("validation.errors.documentTypeRequired") }),
    
  country_code: z.string()
    .length(2, { message: t("validation.errors.countryCodeLength") }),
    
  expiration_date: z.date()
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      return date > new Date();
    }, {
      message: t("validation.errors.expirationDateFuture")
    }),
    
  description: z.string()
    .max(1000, { message: t("validation.errors.descriptionMaxLength", { max: 1000 }) })
    .optional(),
    
  tags: z.array(z.string())
    .max(10, { message: t("validation.errors.maxTags", { max: 10 }) })
    .optional(),
    
  is_key_document: z.boolean()
    .optional()
    .default(false)
});

// Function to create file upload schema with translations
export const createFileUploadSchema = (t: (key: string, params?: Record<string, unknown>) => string) => z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZES.starter, {
      message: t("validation.errors.fileSizeTooLarge", { maxSize: "10MB" })
    })
    .refine((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain'
      ];
      return allowedTypes.includes(file.type);
    }, {
      message: t("validation.errors.invalidFileType", { types: "PDF, DOC, DOCX, JPG, PNG or TXT" })
    })
});

export type DocumentFormData = z.infer<ReturnType<typeof createDocumentFormSchema>>;
export type FileUploadData = z.infer<ReturnType<typeof createFileUploadSchema>>;
