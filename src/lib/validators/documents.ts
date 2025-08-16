/**
 * Document validation schemas using Zod
 * Provides robust form validation for document operations
 */

import { z } from 'zod';

// Base document schema
export const documentSchema = z.object({
  name: z.string()
    .min(3, { message: "Document name must be at least 3 characters long." })
    .max(100, { message: "Document name cannot exceed 100 characters." })
    .trim(),
  
  category: z.enum(['personal', 'financial', 'legal', 'medical', 'property', 'education', 'other'], {
    required_error: "Please select a document category.",
    invalid_type_error: "Please select a valid document category."
  }),
  
  status: z.enum(['active', 'expired', 'archived']).optional(),
  
  issueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid issue date." }),
  
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid expiry date." }),
  
  documentNumber: z.string()
    .max(50, { message: "Document number cannot exceed 50 characters." })
    .optional(),
  
  issuingAuthority: z.string()
    .max(100, { message: "Issuing authority cannot exceed 100 characters." })
    .optional(),
  
  notes: z.string()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
  
  tags: z.array(z.string().max(20))
    .max(10, { message: "Cannot have more than 10 tags." })
    .optional(),
  
  reminderDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid reminder date." }),
}).refine((data) => {
  // Custom validation: if expiry date is provided, it should be after issue date
  if (data.expiryDate && data.issueDate) {
    const expiryDate = new Date(data.expiryDate);
    const issueDate = new Date(data.issueDate);
    return expiryDate > issueDate;
  }
  return true;
}, {
  message: "Expiry date must be after issue date.",
  path: ["expiryDate"]
}).refine((data) => {
  // Custom validation: if reminder date is provided, it should be before expiry date
  if (data.reminderDate && data.expiryDate) {
    const reminderDate = new Date(data.reminderDate);
    const expiryDate = new Date(data.expiryDate);
    return reminderDate < expiryDate;
  }
  return true;
}, {
  message: "Reminder date must be before expiry date.",
  path: ["reminderDate"]
});

// Schema for adding a new document
export const addDocumentSchema = z.object({
  name: z.string()
    .min(3, { message: "Document name must be at least 3 characters long." })
    .max(100, { message: "Document name cannot exceed 100 characters." })
    .trim(),
  
  category: z.enum(['personal', 'financial', 'legal', 'medical', 'property', 'education', 'other'], {
    required_error: "Please select a document category.",
    invalid_type_error: "Please select a valid document category."
  }),
  
  status: z.enum(['active', 'expired', 'archived']).optional(),
  
  issueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid issue date." }),
  
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid expiry date." }),
  
  documentNumber: z.string()
    .max(50, { message: "Document number cannot exceed 50 characters." })
    .optional(),
  
  issuingAuthority: z.string()
    .max(100, { message: "Issuing authority cannot exceed 100 characters." })
    .optional(),
  
  notes: z.string()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
  
  tags: z.array(z.string().max(20))
    .max(10, { message: "Cannot have more than 10 tags." })
    .optional(),
  
  reminderDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid reminder date." }),

  file: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    }, { message: "File size must be less than 10MB." })
    .refine((file) => {
      if (!file) return true;
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      return allowedTypes.includes(file.type);
    }, { message: "File type not supported. Please upload PDF, image, Word document, or text file." }),
}).refine((data) => {
  // Custom validation: if expiry date is provided, it should be after issue date
  if (data.expiryDate && data.issueDate) {
    const expiryDate = new Date(data.expiryDate);
    const issueDate = new Date(data.issueDate);
    return expiryDate > issueDate;
  }
  return true;
}, {
  message: "Expiry date must be after issue date.",
  path: ["expiryDate"]
}).refine((data) => {
  // Custom validation: if reminder date is provided, it should be before expiry date
  if (data.reminderDate && data.expiryDate) {
    const reminderDate = new Date(data.reminderDate);
    const expiryDate = new Date(data.expiryDate);
    return reminderDate < expiryDate;
  }
  return true;
}, {
  message: "Reminder date must be before expiry date.",
  path: ["reminderDate"]
});

// Schema for updating an existing document
export const updateDocumentSchema = z.object({
  id: z.string().min(1, { message: "Document ID is required." }),
  name: z.string()
    .min(3, { message: "Document name must be at least 3 characters long." })
    .max(100, { message: "Document name cannot exceed 100 characters." })
    .trim()
    .optional(),
  
  category: z.enum(['personal', 'financial', 'legal', 'medical', 'property', 'education', 'other'])
    .optional(),
  
  status: z.enum(['active', 'expired', 'archived']).optional(),
  
  issueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid issue date." }),
  
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid expiry date." }),
  
  documentNumber: z.string()
    .max(50, { message: "Document number cannot exceed 50 characters." })
    .optional(),
  
  issuingAuthority: z.string()
    .max(100, { message: "Issuing authority cannot exceed 100 characters." })
    .optional(),
  
  notes: z.string()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
  
  tags: z.array(z.string().max(20))
    .max(10, { message: "Cannot have more than 10 tags." })
    .optional(),
  
  reminderDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid reminder date." }),

  file: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    }, { message: "File size must be less than 10MB." })
    .refine((file) => {
      if (!file) return true;
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      return allowedTypes.includes(file.type);
    }, { message: "File type not supported. Please upload PDF, image, Word document, or text file." }),
}).refine((data) => {
  // Custom validation: if expiry date is provided, it should be after issue date
  if (data.expiryDate && data.issueDate) {
    const expiryDate = new Date(data.expiryDate);
    const issueDate = new Date(data.issueDate);
    return expiryDate > issueDate;
  }
  return true;
}, {
  message: "Expiry date must be after issue date.",
  path: ["expiryDate"]
}).refine((data) => {
  // Custom validation: if reminder date is provided, it should be before expiry date
  if (data.reminderDate && data.expiryDate) {
    const reminderDate = new Date(data.reminderDate);
    const expiryDate = new Date(data.expiryDate);
    return reminderDate < expiryDate;
  }
  return true;
}, {
  message: "Reminder date must be before expiry date.",
  path: ["reminderDate"]
});

// Schema for document search
export const documentSearchSchema = z.object({
  query: z.string()
    .min(1, { message: "Search query is required." })
    .max(100, { message: "Search query cannot exceed 100 characters." }),
  
  category: z.enum(['personal', 'financial', 'legal', 'medical', 'property', 'education', 'other', 'all'])
    .optional(),
  
  status: z.enum(['active', 'expired', 'archived', 'all'])
    .optional(),
  
  assignedPerson: z.string().optional(),
});

// Schema for document filters
export const documentFilterSchema = z.object({
  categories: z.array(z.enum(['personal', 'financial', 'legal', 'medical', 'property', 'education', 'other']))
    .optional(),
  
  statuses: z.array(z.enum(['active', 'expired', 'archived']))
    .optional(),
  
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  
  assignedPeople: z.array(z.string()).optional(),
  
  tags: z.array(z.string()).optional(),
});

// Export types
export type DocumentFormData = z.infer<typeof documentSchema>;
export type AddDocumentData = z.infer<typeof addDocumentSchema>;
export type UpdateDocumentData = z.infer<typeof updateDocumentSchema>;
export type DocumentSearchData = z.infer<typeof documentSearchSchema>;
export type DocumentFilterData = z.infer<typeof documentFilterSchema>;

// Helper functions for validation
export const validateDocument = (data: unknown): DocumentFormData => {
  return documentSchema.parse(data);
};

export const validateAddDocument = (data: unknown): AddDocumentData => {
  return addDocumentSchema.parse(data);
};

export const validateUpdateDocument = (data: unknown): UpdateDocumentData => {
  return updateDocumentSchema.parse(data);
};

export const validateDocumentSearch = (data: unknown): DocumentSearchData => {
  return documentSearchSchema.parse(data);
};

export const validateDocumentFilter = (data: unknown): DocumentFilterData => {
  return documentFilterSchema.parse(data);
};

// Safe validation functions that don't throw
export const safeValidateDocument = (data: unknown): { success: true; data: DocumentFormData } | { success: false; errors: string[] } => {
  const result = documentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map(err => err.message);
    return { success: false, errors };
  }
};
