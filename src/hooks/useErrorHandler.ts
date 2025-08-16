import { useCallback } from "react";
import { toast } from "sonner";

interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  context?: string;
  captureStackTrace?: boolean;
}

export const useErrorHandler = () => {
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        fallbackMessage = "An unexpected error occurred",
        context = "Application",
        captureStackTrace = true,
      } = options;

      // Convert error to Error object
      let errorObj: Error;
      if (error instanceof Error) {
        errorObj = error;
      } else if (typeof error === "string") {
        errorObj = new Error(error);
      } else {
        errorObj = new Error(fallbackMessage);
      }

      // Capture stack trace if it doesn't exist yet
      if (captureStackTrace && !errorObj.stack) {
        Error.captureStackTrace(errorObj, handleError);
      }

      // Create detailed error object
      const errorDetails = {
        timestamp: new Date().toISOString(),
        context,
        error: {
          message: errorObj.message,
          name: errorObj.name,
          stack: errorObj.stack,
          cause: (errorObj as Error & { cause?: unknown }).cause,
        },
        location: {
          href: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
        },
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      // Log to console
      console.error(`[${context}] Error:`, errorDetails);

      // Toast notification
      if (showToast) {
        toast.error(errorObj.message || fallbackMessage);
      }

      // Save to localStorage for debugging
      try {
        const errors = JSON.parse(localStorage.getItem("app_errors") || "[]");
        errors.push(errorDetails);
        if (errors.length > 10) {
          errors.shift();
        }
        localStorage.setItem("app_errors", JSON.stringify(errors));
      } catch (e) {
        console.error("Failed to save error to localStorage:", e);
      }

      // Throw error forward for Error Boundary
      throw errorObj;
    },
    [],
  );

  const logError = useCallback(
    (
      message: string,
      error?: unknown,
      additionalData?: Record<string, unknown>,
    ) => {
      const errorDetails = {
        timestamp: new Date().toISOString(),
        message,
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
              }
            : error,
        additionalData,
        location: window.location.href,
      };

      console.error("[Error Log]:", errorDetails);

      // In production this would be sent to monitoring service
      if ((import.meta.env.PROD && !import.meta.env.VITE_E2E)) {
        // window.Sentry?.captureMessage(message, {
        //   level: 'error',
        //   extra: errorDetails
        // });
      }
    },
    [],
  );

  const captureException = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      const errorDetails = {
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        context,
        breadcrumbs: getBreadcrumbs(),
      };

      console.error("[Exception Captured]:", errorDetails);

      // In production send to monitoring service
      if ((import.meta.env.PROD && !import.meta.env.VITE_E2E)) {
        // window.Sentry?.captureException(error, {
        //   contexts: { custom: context }
        // });
      }
    },
    [],
  );

  return {
    handleError,
    logError,
    captureException,
  };
};

// Helper function to get breadcrumbs
function getBreadcrumbs(): Array<Record<string, unknown>> {
  try {
    // Here we could implement custom breadcrumb system
    // For now return basic information
    return [
      {
        timestamp: new Date().toISOString(),
        category: "navigation",
        data: {
          from: document.referrer,
          to: window.location.href,
        },
      },
    ];
  } catch {
    return [];
  }
}
