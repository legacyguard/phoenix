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

      // Konvertujeme error na Error objekt
      let errorObj: Error;
      if (error instanceof Error) {
        errorObj = error;
      } else if (typeof error === "string") {
        errorObj = new Error(error);
      } else {
        errorObj = new Error(fallbackMessage);
      }

      // Zachytiť stack trace ak ešte neexistuje
      if (captureStackTrace && !errorObj.stack) {
        Error.captureStackTrace(errorObj, handleError);
      }

      // Vytvoríme detailný error objekt
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

      // Logovanie do konzoly
      console.error(`[${context}] Error:`, errorDetails);

      // Toast notifikácia
      if (showToast) {
        toast.error(errorObj.message || fallbackMessage);
      }

      // Uložiť do localStorage pre debugging
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

      // Hodiť error ďalej pre Error Boundary
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

      // V produkcii by sa tu poslalo do monitorovacej služby
      if (process.env.NODE_ENV === "production") {
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

      // V produkcii poslať do monitorovacej služby
      if (process.env.NODE_ENV === "production") {
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

// Helper funkcia pre získanie breadcrumbs
function getBreadcrumbs(): Array<Record<string, unknown>> {
  try {
    // Tu by sme mohli implementovať vlastný breadcrumb systém
    // Zatiaľ vrátime základné informácie
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
