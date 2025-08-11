import { ErrorInfo } from "react";
import { logger } from "@/utils/logger";

interface EmpatheticErrorLog {
  timestamp: Date;
  error: Error;
  errorInfo?: ErrorInfo;
  context: string;
  userImpact: string;
  recoveryAttempts: number;
  resolved: boolean;
}

const errorLogs: EmpatheticErrorLog[] = [];

export const logEmpatheticError = (
  error: Error,
  errorInfo?: ErrorInfo,
  context: string = "general",
) => {
  const userImpact = determineUserImpact(error, context);

  const errorLog: EmpatheticErrorLog = {
    timestamp: new Date(),
    error,
    errorInfo,
    context,
    userImpact,
    recoveryAttempts: 0,
    resolved: false,
  };

  errorLogs.push(errorLog);

  // Send to monitoring service with empathetic context
  if (process.env.NODE_ENV === "production") {
    sendToMonitoring(errorLog);
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    logger.group("🤗 Empathetic Error Log");
    logger.error("Error:", error);
    logger.info("Context:", context);
    logger.info("User Impact:", userImpact);
    logger.info("Stack:", errorInfo?.componentStack);
    logger.groupEnd();
  }
};

const determineUserImpact = (error: Error, context: string): string => {
  // Network errors
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return "User may experience delays or inability to save their work";
  }

  // Validation errors
  if (
    error.message.includes("validation") ||
    error.message.includes("invalid")
  ) {
    return "User may be confused about what information is needed";
  }

  // Component errors
  if (context.includes("component")) {
    return "User interface may not be working as expected";
  }

  // Default
  return "User experience may be disrupted";
};

const sendToMonitoring = async (errorLog: EmpatheticErrorLog) => {
  try {
    // Send to your monitoring service (e.g., Sentry, LogRocket)
    // Include empathetic context for better support responses
    await fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...errorLog,
        error: {
          message: errorLog.error.message,
          stack: errorLog.error.stack,
          name: errorLog.error.name,
        },
      }),
    });
  } catch (e) {
    // Silently fail - don't create more errors
    logger.error("Failed to log error to monitoring:", e);
  }
};

export const getErrorLogs = () => errorLogs;

export const markErrorResolved = (timestamp: Date) => {
  const log = errorLogs.find((log) => log.timestamp === timestamp);
  if (log) {
    log.resolved = true;
  }
};

export const incrementRecoveryAttempts = (timestamp: Date) => {
  const log = errorLogs.find((log) => log.timestamp === timestamp);
  if (log) {
    log.recoveryAttempts++;
  }
};
