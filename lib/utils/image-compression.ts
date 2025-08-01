import type { CompressionOptions } from '../services/document-upload.types';

// Default compression options
const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 2400,
  maxHeight: 3200,
  quality: 0.85,
  format: 'jpeg',
};

// Compress image file
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Skip compression for non-images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        opts.maxWidth!,
        opts.maxHeight!
      );

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw image with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new file with compressed data
          const compressedFile = new File(
            [blob],
            file.name,
            {
              type: `image/${opts.format}`,
              lastModified: Date.now(),
            }
          );

          // Only use compressed version if it's actually smaller
          if (compressedFile.size < file.size) {
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression didn't help
          }
        },
        `image/${opts.format}`,
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Load image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

// Calculate dimensions maintaining aspect ratio
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // If image is already smaller than max dimensions, keep original size
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Resize based on which dimension exceeds the max
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

// Generate thumbnail for preview
export async function generateThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate thumbnail dimensions
      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        maxSize,
        maxSize
      );

      canvas.width = width;
      canvas.height = height;

      // Draw thumbnail
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Return as data URL
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      reject(new Error('Failed to generate thumbnail'));
    };

    // Handle different file types
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDFs, return a generic icon
      resolve(generatePdfThumbnail());
    } else {
      // For other files, return a generic document icon
      resolve(generateDocumentThumbnail());
    }
  });
}

// Generate PDF thumbnail placeholder
function generatePdfThumbnail(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = 200;
  canvas.height = 200;

  // Draw PDF icon
  ctx.fillStyle = '#DC2626'; // Red
  ctx.fillRect(0, 0, 200, 200);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PDF', 100, 100);

  return canvas.toDataURL();
}

// Generate generic document thumbnail
function generateDocumentThumbnail(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = 200;
  canvas.height = 200;

  // Draw document icon
  ctx.fillStyle = '#6B7280'; // Gray
  ctx.fillRect(0, 0, 200, 200);
  
  // Draw paper shape
  ctx.fillStyle = 'white';
  ctx.fillRect(30, 20, 140, 160);
  
  // Draw lines
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(50, 50 + i * 25);
    ctx.lineTo(150, 50 + i * 25);
    ctx.stroke();
  }

  return canvas.toDataURL();
}

// Estimate compression savings
export function estimateCompressionSavings(
  originalSize: number,
  quality: number = 0.85
): { estimatedSize: number; savings: number; percentage: number } {
  // Rough estimation based on typical compression ratios
  const compressionRatio = quality * 0.7; // Approximate
  const estimatedSize = originalSize * compressionRatio;
  const savings = originalSize - estimatedSize;
  const percentage = (savings / originalSize) * 100;

  return {
    estimatedSize: Math.round(estimatedSize),
    savings: Math.round(savings),
    percentage: Math.round(percentage),
  };
}

// Convert HEIC/HEIF to JPEG (requires heic2any library in production)
export async function convertHeicToJpeg(file: File): Promise<File> {
  // For now, return original file
  // In production, would use heic2any library
  console.warn('HEIC conversion not implemented. Returning original file.');
  return file;
}
