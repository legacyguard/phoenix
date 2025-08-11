import { useState, useCallback, useRef, useEffect } from "react";
import { documentUploadService } from "../services/document-upload.service";
import type {
  UploadOptions,
  UploadProgress,
  UploadQueueItem,
  UploadError,
  UploadResult,
} from "../services/document-upload.types";

interface UseDocumentUploadReturn {
  // Upload functions
  upload: (files: File[], options?: UploadOptions) => Promise<void>;
  uploadSingle: (file: File, options?: UploadOptions) => Promise<UploadResult>;

  // Queue management
  uploadQueue: UploadQueueItem[];
  overallProgress: number;
  currentProcessing: string;

  // Queue control
  retry: (id: string) => Promise<void>;
  cancel: (id: string) => void;
  clearCompleted: () => void;

  // State
  isUploading: boolean;
  errors: Array<{ id: string; error: UploadError }>;
  successCount: number;
  failureCount: number;
}

const MAX_CONCURRENT_UPLOADS = 3;

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState("");
  const [errors, setErrors] = useState<
    Array<{ id: string; error: UploadError }>
  >([]);

  // Track active uploads
  const activeUploads = useRef(0);
  const isMounted = useRef(true);
  const processQueueRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Calculate overall progress
  const overallProgress =
    uploadQueue.length === 0
      ? 0
      : Math.round(
          uploadQueue.reduce((sum, item) => sum + item.progress, 0) /
            uploadQueue.length,
        );

  // Count successes and failures
  const successCount = uploadQueue.filter(
    (item) => item.status === "completed",
  ).length;
  const failureCount = uploadQueue.filter(
    (item) => item.status === "failed",
  ).length;

  // Process single upload
  const processUpload = useCallback(async (item: UploadQueueItem) => {
    if (!isMounted.current) return;

    // Update status to processing
    setUploadQueue((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: "processing", startedAt: new Date() }
          : i,
      ),
    );

    setCurrentProcessing(item.file.name);

    try {
      // Create progress handler
      const onProgress = (progress: UploadProgress) => {
        if (!isMounted.current) return;

        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  progress: progress.progress,
                  currentStage: progress.stage,
                }
              : i,
          ),
        );
      };

      // Upload document
      const result = await documentUploadService.uploadDocument(item.file, {
        ...item.options,
        onProgress,
      });

      if (!isMounted.current) return;

      // Update queue with result
      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: result.status === "success" ? "completed" : "failed",
                result,
                completedAt: new Date(),
                progress: 100,
                error: result.error,
              }
            : i,
        ),
      );

      // Track errors
      if (result.error) {
        setErrors((prev) => [...prev, { id: item.id, error: result.error }]);
      }
    } catch (error) {
      if (!isMounted.current) return;

      // Handle unexpected errors
      const uploadError: UploadError = {
        code: "unexpected_error",
        message: error instanceof Error ? error.message : "Unknown error",
        userMessage: "Something went wrong. Please try again.",
        stage: "validating",
        recoverable: true,
      };

      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "failed",
                error: uploadError,
                completedAt: new Date(),
              }
            : i,
        ),
      );

      setErrors((prev) => [...prev, { id: item.id, error: uploadError }]);
    } finally {
      activeUploads.current--;

      if (isMounted.current) {
        setCurrentProcessing("");
        // Process next item in queue
        processQueueRef.current?.();
      }
    }
  }, []);

  // Process queue
  const processQueue = useCallback(() => {
    if (activeUploads.current >= MAX_CONCURRENT_UPLOADS) return;

    const pendingItem = uploadQueue.find((item) => item.status === "pending");
    if (!pendingItem) return;

    activeUploads.current++;
    processUpload(pendingItem);
  }, [uploadQueue, processUpload]);

  // Store processQueue in ref
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // Upload multiple files
  const upload = useCallback(
    async (files: File[], options: UploadOptions = {}) => {
      // Create queue items
      const newItems: UploadQueueItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: "pending",
        progress: 0,
        retryCount: 0,
        addedAt: new Date(),
        options,
      }));

      // Add to queue
      setUploadQueue((prev) => [...prev, ...newItems]);
      setIsUploading(true);

      // Start processing
      processQueue();
    },
    [processQueue],
  );

  // Upload single file
  const uploadSingle = useCallback(
    async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
      return documentUploadService.uploadDocument(file, options);
    },
    [],
  );

  // Retry failed upload
  const retry = useCallback(
    async (id: string) => {
      const item = uploadQueue.find((i) => i.id === id);
      if (!item || item.status !== "failed") return;

      // Reset item status
      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "pending",
                progress: 0,
                error: undefined,
                retryCount: i.retryCount + 1,
              }
            : i,
        ),
      );

      // Remove from errors
      setErrors((prev) => prev.filter((e) => e.id !== id));

      // Process queue
      processQueue();
    },
    [uploadQueue, processQueue],
  );

  // Cancel upload
  const cancel = useCallback((id: string) => {
    setUploadQueue((prev) =>
      prev.map((i) =>
        i.id === id && i.status === "pending"
          ? {
              ...i,
              status: "cancelled",
            }
          : i,
      ),
    );
  }, []);

  // Clear completed items
  const clearCompleted = useCallback(() => {
    setUploadQueue((prev) =>
      prev.filter((i) => i.status !== "completed" && i.status !== "cancelled"),
    );
  }, []);

  // Update uploading state
  useEffect(() => {
    const hasActive = uploadQueue.some(
      (i) => i.status === "pending" || i.status === "processing",
    );
    setIsUploading(hasActive);
  }, [uploadQueue]);

  return {
    upload,
    uploadSingle,
    uploadQueue,
    overallProgress,
    currentProcessing,
    retry,
    cancel,
    clearCompleted,
    isUploading,
    errors,
    successCount,
    failureCount,
  };
}

// Hook for managing upload preferences
export function useUploadPreferences() {
  const [preferences, setPreferences] = useState({
    privacy: "cloud" as "local" | "cloud" | "hybrid",
    autoCompress: true,
    autoEncrypt: true,
    processOCR: true,
    analyzeWithAI: true,
    generateThumbnail: true,
    familySharing: false,
  });

  const updatePreference = useCallback(
    <K extends keyof typeof preferences>(
      key: K,
      value: (typeof preferences)[K],
    ) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("uploadPreferences");
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load upload preferences");
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("uploadPreferences", JSON.stringify(preferences));
  }, [preferences]);

  return {
    preferences,
    updatePreference,
  };
}
