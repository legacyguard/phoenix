import type { PreprocessingOptions } from "./ocr.types";

export class DocumentPreprocessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
  }

  async preprocessImage(
    file: File,
    options: PreprocessingOptions = {},
  ): Promise<File> {
    const {
      resize = true,
      maxWidth = 2400,
      maxHeight = 3200,
      enhanceContrast = true,
      removeNoise = true,
      deskew = false,
      binarize = true,
    } = options;

    // Load image
    const img = await this.loadImage(file);

    // Calculate dimensions
    const { width, height } = this.calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight,
      resize,
    );

    // Set canvas size
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw image
    this.ctx.drawImage(img, 0, 0, width, height);

    // Get image data
    let imageData = this.ctx.getImageData(0, 0, width, height);

    // Apply preprocessing steps
    if (removeNoise) {
      imageData = this.removeNoise(imageData);
    }

    if (enhanceContrast) {
      imageData = this.enhanceContrast(imageData);
    }

    if (binarize) {
      imageData = this.binarize(imageData);
    }

    // Put processed image back
    this.ctx.putImageData(imageData, 0, 0);

    // Convert to blob and file
    const blob = await this.canvasToBlob(this.canvas);
    return new File([blob], file.name, { type: "image/png" });
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    resize: boolean,
  ): { width: number; height: number } {
    if (!resize) {
      return { width: originalWidth, height: originalHeight };
    }

    let width = originalWidth;
    let height = originalHeight;

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Resize if necessary
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private removeNoise(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    // Simple median filter for noise reduction
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Get surrounding pixels
        const pixels = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            pixels.push(data[nIdx]); // Red channel only
          }
        }

        // Sort and get median
        pixels.sort((a, b) => a - b);
        const median = pixels[4]; // Middle value

        // Apply median to all channels
        output[idx] = median;
        output[idx + 1] = median;
        output[idx + 2] = median;
      }
    }

    return new ImageData(output, width, height);
  }

  private enhanceContrast(imageData: ImageData): ImageData {
    const data = imageData.data;

    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2],
      );
      histogram[gray]++;
    }

    // Find min and max values (ignore outliers)
    const totalPixels = data.length / 4;
    const threshold = totalPixels * 0.01; // 1% threshold

    let min = 0;
    let max = 255;
    let count = 0;

    // Find min
    for (let i = 0; i < 256; i++) {
      count += histogram[i];
      if (count > threshold) {
        min = i;
        break;
      }
    }

    // Find max
    count = 0;
    for (let i = 255; i >= 0; i--) {
      count += histogram[i];
      if (count > threshold) {
        max = i;
        break;
      }
    }

    // Apply contrast stretching
    const scale = 255 / (max - min);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2],
      );
      const adjusted = Math.round((gray - min) * scale);
      const value = Math.max(0, Math.min(255, adjusted));

      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }

    return imageData;
  }

  private binarize(imageData: ImageData): ImageData {
    const data = imageData.data;

    // Calculate adaptive threshold using Otsu's method
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // Already grayscale from contrast enhancement
      histogram[gray]++;
    }

    const total = data.length / 4;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;

    for (let i = 0; i < 256; i++) {
      wB += histogram[i];
      if (wB === 0) continue;

      wF = total - wB;
      if (wF === 0) break;

      sumB += i * histogram[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;

      const variance = wB * wF * (mB - mF) * (mB - mF);

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = i;
      }
    }

    // Apply threshold
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }

    return imageData;
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        "image/png",
        1.0,
      );
    });
  }

  // Helper method to detect if image needs rotation
  async detectOrientation(file: File): Promise<number> {
    // This is a placeholder - in production, you'd use EXIF data
    // or image analysis to detect orientation
    return 0; // No rotation needed
  }

  // Method to anonymize text for privacy
  static anonymizeText(
    text: string,
    options: {
      preserveStructure?: boolean;
      preserveDates?: boolean;
      preserveAmounts?: boolean;
    } = {},
  ): { text: string; removedCount: number } {
    let anonymized = text;
    let removedCount = 0;

    // Czech/Slovak personal ID patterns
    const personalPatterns = [
      /\d{6}\/\d{3,4}/g, // Birth number
      /[A-Z]{2}\d{6}/g, // ID card number
      /\+?\d{3}\s?\d{3}\s?\d{3}\s?\d{3}/g, // Phone numbers
      /[\w.-]+@[\w.-]+\.\w+/g, // Email addresses
      /\d{3}\s?\d{2}\s?\d{2}\s?\d{2}/g, // Czech/Slovak phone
    ];

    // Names (simplified - would need more sophisticated NER in production)
    const namePatterns = [/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g];

    // Replace personal patterns
    personalPatterns.forEach((pattern) => {
      const matches = anonymized.match(pattern);
      if (matches) {
        removedCount += matches.length;
        anonymized = anonymized.replace(pattern, "[REMOVED]");
      }
    });

    // Replace names (if not preserving structure)
    if (!options.preserveStructure) {
      namePatterns.forEach((pattern) => {
        const matches = anonymized.match(pattern);
        if (matches) {
          removedCount += matches.length;
          anonymized = anonymized.replace(pattern, "[NAME]");
        }
      });
    }

    // Optionally preserve dates
    if (!options.preserveDates) {
      const datePattern = /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/g;
      const matches = anonymized.match(datePattern);
      if (matches) {
        removedCount += matches.length;
        anonymized = anonymized.replace(datePattern, "[DATE]");
      }
    }

    // Optionally preserve amounts
    if (!options.preserveAmounts) {
      const amountPattern = /\d+[,.\s]?\d*\s*(K|CZK|EUR|USD|\$)/g;
      const matches = anonymized.match(amountPattern);
      if (matches) {
        removedCount += matches.length;
        anonymized = anonymized.replace(amountPattern, "[AMOUNT]");
      }
    }

    return { text: anonymized, removedCount };
  }
}
