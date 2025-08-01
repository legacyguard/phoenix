import { useState, useCallback, useEffect } from 'react';
import { 
  localProcessingService, 
  OCRResult, 
  OCROptions, 
  ProcessingProgress 
} from '@/services/ocr/LocalProcessingService';

export interface UseLocalOCRState {
  isProcessing: boolean;
  isReady: boolean;
  progress: ProcessingProgress | null;
  result: OCRResult | null;
  error: string | null;
  processingTime: number | null;
}

export interface UseLocalOCRActions {
  processImage: (file: File | Blob, options?: OCROptions) => Promise<OCRResult | null>;
  processMultipleImages: (files: File[], options?: OCROptions) => Promise<OCRResult[]>;
  clearResult: () => void;
  clearError: () => void;
}

export interface UseLocalOCRReturn extends UseLocalOCRState, UseLocalOCRActions {}

export const useLocalOCR = (): UseLocalOCRReturn => {
  const [state, setState] = useState<UseLocalOCRState>({
    isProcessing: false,
    isReady: false,
    progress: null,
    result: null,
    error: null,
    processingTime: null,
  });

  // Check if service is ready on mount
  useEffect(() => {
     
    const checkReady = setInterval(() => {
      if (localProcessingService.isReady()) {
        setState(prev => ({ ...prev, isReady: true }));
        clearInterval(checkReady);
      }
    }, 100);

    return () => clearInterval(checkReady);
  }, []);

  // Set up progress callback
  useEffect(() => {
     
    localProcessingService.setProgressCallback((progress) => {
      setState(prev => ({ ...prev, progress }));
    });
  }, []);

  const processImage = useCallback(async (
    file: File | Blob,
    options?: OCROptions
  ): Promise<OCRResult | null> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      progress: { status: 'preparing', progress: 0, message: 'Starting OCR processing...' }
    }));

    try {
      const result = await localProcessingService.processImage(file, options);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        result,
        processingTime: result.processingTime,
        progress: { status: 'complete', progress: 100, message: 'Processing complete!' }
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        progress: null
      }));

      return null;
    }
  }, []);

  const processMultipleImages = useCallback(async (
    files: File[],
    options?: OCROptions
  ): Promise<OCRResult[]> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      progress: { status: 'preparing', progress: 0, message: 'Starting batch processing...' }
    }));

    try {
      const results = await localProcessingService.processMultipleImages(files, options);
      
      const totalTime = results.reduce((sum, r) => sum + r.processingTime, 0);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: results[0], // Store first result
        processingTime: totalTime,
        progress: { status: 'complete', progress: 100, message: 'All documents processed!' }
      }));

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        progress: null
      }));

      return [];
    }
  }, []);

  const clearResult = useCallback(() => {
     
    setState(prev => ({
      ...prev,
      result: null,
      processingTime: null,
      progress: null
    }));
  }, []);

  const clearError = useCallback(() => {
     
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    ...state,
    processImage,
    processMultipleImages,
    clearResult,
    clearError
  };
};
