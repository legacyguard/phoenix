import { toast } from "sonner";

interface ErrorHandlerOptions {
  operation: string;
  context?: string;
  showToast?: boolean;
  customMessage?: string;
}

export function handleError(
  error: Record<string, unknown>,
  options: ErrorHandlerOptions,
): void {
  const {
    operation,
    context = "Application",
    showToast = true,
    customMessage,
  } = options;

  const timestamp = new Date().toISOString();
  const errorMessage = error?.message || "Unknown error";
  const errorCode = error?.code || "UNKNOWN_ERROR";

  // Detailed logging for debugging
  console.error(`[${context}] Error during ${operation}:`, {
    timestamp,
    operation,
    errorCode,
    errorMessage,
    errorDetails: error,
    stack: error?.stack,
  });

  if (showToast) {
    // Use custom message if provided, otherwise use error message
    const message = customMessage || errorMessage;
    toast.error(message);
  }
}

export function getErrorMessage(
  error: Record<string, unknown>,
  t: (key: string) => string,
): string {
  // Specific messages based on error type
  if (error?.code === "PGRST116") {
    return t("errors:errors.dataNotFound");
  } else if (error?.message?.includes("network")) {
    return t("errors:errors.networkError");
  } else if (error?.message?.includes("permission")) {
    return t("errors:errors.permissionDenied");
  } else if (error?.message?.includes("duplicate")) {
    return t("errors:errors.duplicateRecord");
  }

  // Default to the error message or a generic error
  return error?.message || t("errors:errors.unknown");
}
