import { useState, useCallback, useEffect, useRef } from 'react';
import { ocrService } from '../services/ocr.service';
import type {
  OCRResult,
  OCROptions,
  OCRProgress,
  OCRError,
  AnonymizationOptions,
  AnonymizedText,
} from '../services/ocr.types';

interface UseOCRReturn {
  // Main OCR function
  processDocument: (file: File, options?: OCROptions) => Promise<OCRResult | null>;
  
  // State
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  error: OCRError | null;
  result: OCRResult | null;
  
  // Utilities
  anonymizeText: (text: string, options?: AnonymizationOptions) => AnonymizedText;
  reset: () => void;
  
  // Privacy mode
  isPrivacyMode: boolean;
  setPrivacyMode: (enabled: boolean) => void;
}

export function useOCR(): UseOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<OCRError | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [isPrivacyMode, setPrivacyMode] = useState(true); // Default to privacy mode
  
  // Keep track of current processing to handle component unmounts
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Cleanup OCR service when component unmounts
      ocrService.terminate();
    };
  }, []);

  const handleProgress = useCallback((progressData: OCRProgress) => {
    if (isMountedRef.current) {
      setProgress(progressData.progress);
      setProgressMessage(progressData.message);
    }
  }, []);

  const processDocument = useCallback(async (
    file: File,
    options: OCROptions = {}
  ): Promise<OCRResult | null> => {
    // Reset state
    setError(null);
    setResult(null);
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting document processing...');

    try {
      // Merge options with privacy mode setting
      const ocrOptions: OCROptions = {
        ...options,
        localOnly: isPrivacyMode || options.localOnly,
        preprocessImage: options.preprocessImage !== false, // Default to true
        onProgress: handleProgress,
      };

      // Perform OCR
      const ocrResult = await ocrService.extractTextFromImage(file, ocrOptions);

      if (isMountedRef.current) {
        setResult(ocrResult);
        setIsProcessing(false);
        setProgress(100);
        setProgressMessage('Document processed successfully!');
      }

      // Store in IndexedDB for offline access if privacy mode is enabled
      if (isPrivacyMode && ocrResult) {
        await storeOCRResult(ocrResult);
      }

      return ocrResult;
    } catch (err) {
      const ocrError = err as OCRError;
      
      if (isMountedRef.current) {
        setError(ocrError);
        setIsProcessing(false);
        setProgress(0);
        setProgressMessage('');
      }

      console.error('OCR processing failed:', ocrError);
      return null;
    }
  }, [isPrivacyMode, handleProgress]);

  const anonymizeText = useCallback((
    text: string,
    options: AnonymizationOptions = {}
  ): AnonymizedText => {
    return ocrService.anonymizeText(text, options);
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setProgressMessage('');
    setError(null);
    setResult(null);
  }, []);

  return {
    processDocument,
    isProcessing,
    progress,
    progressMessage,
    error,
    result,
    anonymizeText,
    reset,
    isPrivacyMode,
    setPrivacyMode,
  };
}

// Store OCR results in IndexedDB for offline access
async function storeOCRResult(result: OCRResult): Promise<void> {
  try {
    // Open IndexedDB
    const dbName = 'LegacyGuardOCR';
    const storeName = 'ocrResults';
    
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('documentType', 'documentType.type', { unique: false });
      }
    };

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Store the result
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const resultWithId = {
      ...result,
      id: Date.now(),
    };
    
    await new Promise<void>((resolve, reject) => {
      const addRequest = store.add(resultWithId);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    });

    db.close();
  } catch (error) {
    console.warn('Failed to store OCR result in IndexedDB:', error);
    // Don't throw - this is a nice-to-have feature
  }
}

// Hook for retrieving stored OCR results
export function useStoredOCRResults() {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredResults();
  }, []);

  const loadStoredResults = async () => {
    try {
      const dbName = 'LegacyGuardOCR';
      const storeName = 'ocrResults';
      
      const request = indexedDB.open(dbName, 1);
      
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      const storedResults = await new Promise<OCRResult[]>((resolve, reject) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });

      db.close();
      
      // Sort by timestamp, newest first
      storedResults.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setResults(storedResults);
    } catch (error) {
      console.warn('Failed to load stored OCR results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, refresh: loadStoredResults };
}
