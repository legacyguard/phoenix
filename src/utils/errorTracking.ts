import { supabase } from "@/integrations/supabase/client";

export type ErrorLevel = "error" | "warning" | "critical";

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: Record<string, unknown>;
}

interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  vendor: string;
  screenResolution: string;
  viewport: string;
  timezone: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: Array<Record<string, unknown>> = [];
  private isProcessing = false;
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds

  private constructor() {
    // Set up global error handler
    this.setupGlobalErrorHandler();

    // Set up periodic flush
    setInterval(() => this.flushErrors(), this.flushInterval);

    // Flush on page unload
    window.addEventListener("beforeunload", () => this.flushErrors());
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private setupGlobalErrorHandler() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.logError(
        "critical",
        `Unhandled Promise Rejection: ${event.reason}`,
        {
          type: "unhandledRejection",
          promise: event.promise,
          reason: event.reason,
        },
      );
    });

    // Handle global errors
    window.addEventListener("error", (event) => {
      this.logError(
        "critical",
        event.message,
        {
          type: "globalError",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        },
        event.error?.stack,
      );
    });
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  async logError(
    level: ErrorLevel,
    message: string,
    context?: ErrorContext,
    stack?: string,
  ) {
    try {
      // Add structured console logging
      const logData = {
        level,
        message,
        context,
        stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      // Console log with appropriate method
      switch (level) {
        case "critical":
          console.error("🚨 [CRITICAL ERROR]", logData);
          break;
        case "error":
          console.error("❌ [ERROR]", logData);
          break;
        case "warning":
          console.warn("⚠️ [WARNING]", logData);
          break;
      }

      // Add to queue for batch processing
      this.errorQueue.push({
        error_level: level,
        error_message: message,
        error_stack: stack,
        error_context: context || {},
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        browser_info: this.getBrowserInfo(),
      });

      // Process immediately if critical
      if (level === "critical") {
        await this.flushErrors();
      }
    } catch (error) {
      // Fallback to console if logging fails
      console.error("Failed to log error:", error);
      console.error("Original error:", { level, message, context, stack });
    }
  }

  private async flushErrors() {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const errors = this.errorQueue.splice(0, this.batchSize);

    try {
      // Log errors to Supabase
      for (const error of errors) {
        const { error: dbError } = await supabase.rpc("log_error", error);

        if (dbError) {
          console.error("Failed to log error to database:", dbError);
          // Re-add to queue if failed
          this.errorQueue.unshift(error);
        }
      }

      // Check if we should send critical error alert
      const { data: alertData, error: alertError } = await supabase.rpc(
        "check_critical_error_threshold",
      );

      if (
        !alertError &&
        alertData &&
        alertData.length > 0 &&
        alertData[0].should_alert
      ) {
        await this.sendCriticalErrorAlert(alertData[0].error_count);
      }
    } catch (error) {
      console.error("Error flushing error logs:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendCriticalErrorAlert(errorCount: number) {
    try {
      // Call Edge Function to send alert email
      const { error } = await supabase.functions.invoke(
        "send-critical-error-alert",
        {
          body: {
            errorCount,
            timeWindow: "1 hour",
          },
        },
      );

      if (error) {
        console.error("Failed to send critical error alert:", error);
      }
    } catch (error) {
      console.error("Error sending critical error alert:", error);
    }
  }

  // Convenience methods
  logWarning(message: string, context?: ErrorContext) {
    return this.logError("warning", message, context);
  }

  logCritical(message: string, context?: ErrorContext, stack?: string) {
    return this.logError("critical", message, context, stack);
  }

  // React Error Boundary integration
  logErrorBoundary(error: Error, errorInfo: Record<string, unknown>) {
    return this.logError(
      "critical",
      error.message,
      {
        type: "errorBoundary",
        componentStack: errorInfo.componentStack,
        ...errorInfo,
      },
      error.stack,
    );
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// React hook for error tracking
export function useErrorTracking() {
  return {
    logError: (message: string, context?: ErrorContext) =>
      errorTracker.logError("error", message, context),
    logWarning: (message: string, context?: ErrorContext) =>
      errorTracker.logWarning(message, context),
    logCritical: (message: string, context?: ErrorContext) =>
      errorTracker.logCritical(message, context),
  };
}

// Error boundary error logger
export function logErrorToSupabase(
  error: Error,
  errorInfo: Record<string, unknown>,
) {
  errorTracker.logErrorBoundary(error, errorInfo);
}
