import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "../services/document-upload.types";

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const SUPPORTED_DOCUMENT_TYPES = ["application/pdf"];
const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES,
];

// File size limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const LARGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_IMAGE_SIZE = 10 * 1024; // 10KB

// File validation utility
export function validateDocument(file: File): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      code: "file_too_large",
      message: `File size ${formatFileSize(file.size)} exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
      userMessage:
        "This file is quite large. Would you like me to compress it for you?",
      recoverable: true,
    });
  } else if (file.size > LARGE_FILE_SIZE) {
    warnings.push({
      code: "large_file",
      message: `File size is ${formatFileSize(file.size)}`,
      suggestion:
        "This might take a moment to process. I can compress it to speed things up.",
    });
  }

  // Check if file is too small (might be corrupted)
  if (file.type.startsWith("image/") && file.size < MIN_IMAGE_SIZE) {
    warnings.push({
      code: "low_quality",
      message: "File size is very small",
      suggestion:
        "This image might be low quality. Try taking a clearer photo if text is hard to read.",
    });
  }

  // Check file type
  if (!ALL_SUPPORTED_TYPES.includes(file.type)) {
    // Check if it's a common unsupported type
    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      errors.push({
        code: "unsupported_format",
        message: "Word documents not directly supported",
        userMessage:
          "I can't read Word documents directly. Could you save it as a PDF first?",
        recoverable: false,
      });
      suggestions.push('Open the document in Word and use "Save as PDF"');
    } else {
      errors.push({
        code: "invalid_type",
        message: `File type ${file.type} not supported`,
        userMessage:
          "I can only process images (JPEG, PNG) and PDFs right now.",
        recoverable: false,
      });
    }
  }

  // Check file name for suspicious patterns
  if (hasSupiciousFileName(file.name)) {
    errors.push({
      code: "virus_detected",
      message: "Suspicious file name detected",
      userMessage:
        "This file name looks suspicious. Please check it's from a trusted source.",
      recoverable: false,
    });
  }

  // Check for corrupted files (basic check)
  if (file.size === 0) {
    errors.push({
      code: "corrupted",
      message: "File appears to be empty",
      userMessage:
        "This file seems to be empty or corrupted. Try uploading it again?",
      recoverable: true,
    });
  }

  // Add helpful suggestions based on file type
  if (file.type === "application/pdf" && warnings.length === 0) {
    suggestions.push("PDFs work great! I'll extract all the text for you.");
  } else if (SUPPORTED_IMAGE_TYPES.includes(file.type) && errors.length === 0) {
    suggestions.push("I'll enhance this image for better text recognition.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function hasSupiciousFileName(fileName: string): boolean {
  const suspicious = [".exe", ".bat", ".cmd", ".scr", ".vbs", ".js"];
  const lowerName = fileName.toLowerCase();
  return (
    suspicious.some((ext) => lowerName.endsWith(ext)) ||
    lowerName.includes("virus") ||
    lowerName.includes("malware")
  );
}

// Check if file might be a duplicate
export async function checkForDuplicate(
  file: File,
  existingFiles: { name: string; checksum: string }[],
): Promise<boolean> {
  // Simple name-based check for now
  // In production, would calculate and compare checksums
  return existingFiles.some((existing) => existing.name === file.name);
}

// Validate image dimensions
export async function validateImageDimensions(
  file: File,
): Promise<{
  valid: boolean;
  width?: number;
  height?: number;
  error?: string;
}> {
  if (!file.type.startsWith("image/")) {
    return { valid: true }; // Not an image, skip dimension check
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Check minimum dimensions for OCR
      const MIN_WIDTH = 200;
      const MIN_HEIGHT = 200;

      if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
        resolve({
          valid: false,
          width: img.width,
          height: img.height,
          error:
            "Image is too small for reliable text extraction. Try a higher resolution photo.",
        });
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: "Could not read image dimensions. The file might be corrupted.",
      });
    };

    img.src = url;
  });
}

// Get file extension
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

// Suggest file type based on extension if MIME type is generic
export function suggestFileType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }

  const ext = getFileExtension(file.name);
  const extToType: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    heic: "image/heic",
    heif: "image/heif",
    webp: "image/webp",
  };

  return extToType[ext] || "application/octet-stream";
}
