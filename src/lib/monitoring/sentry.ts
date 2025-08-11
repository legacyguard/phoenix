import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured, error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        traceFetch: true,
        traceXHR: true,
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],

    // Filtering
    beforeSend(event, hint) {
      // Filter out non-error events in development
      if (process.env.NODE_ENV === "development") {
        const error = hint.originalException;
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return null; // Don't send client errors in dev
          }
        }
      }

      // Filter sensitive data
      if (event.request?.cookies) {
        event.request.cookies = "[FILTERED]";
      }

      if (event.extra) {
        const filtered = { ...event.extra };
        const sensitiveKeys = [
          "password",
          "token",
          "key",
          "secret",
          "authorization",
        ];

        Object.keys(filtered).forEach((key) => {
          if (
            sensitiveKeys.some((sensitive) =>
              key.toLowerCase().includes(sensitive),
            )
          ) {
            filtered[key] = "[FILTERED]";
          }
        });

        event.extra = filtered;
      }

      return event;
    },
  });
}

// Custom error boundary for React components
export function logError(error: Error, errorInfo?: unknown) {
  console.error("Application error:", error);

  if (SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (errorInfo) {
        scope.setContext("errorInfo", errorInfo);
      }
      Sentry.captureException(error);
    });
  }
}

// Performance monitoring helper
export function measurePerformance(transactionName: string) {
  return Sentry.startTransaction({
    name: transactionName,
    op: "custom",
  });
}

// User context helper
export function setUserContext(user: {
  id: string;
  email?: string;
  name?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

// Clear user context on logout
export function clearUserContext() {
  Sentry.setUser(null);
}

// Custom breadcrumb helper
export function addBreadcrumb(
  message: string,
  category: string,
  data?: unknown,
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: "info",
    timestamp: Date.now() / 1000,
    data,
  });
}
