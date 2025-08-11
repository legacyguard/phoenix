import { useEffect } from "react";
import { logger } from "@/utils/logger";

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export const usePerformanceMonitoring = (enableLogging = false) => {
  useEffect(() => {
    if (typeof window === "undefined" || !("performance" in window)) {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Helper function to log metrics
    const logMetric = (name: string, value: number) => {
      if (enableLogging) {
        logger.info(`[Performance] ${name}: ${value.toFixed(2)}ms`);
      }

      // Send to analytics service (if configured)
      if (window.gtag) {
        window.gtag("event", "web_vitals", {
          event_category: "Performance",
          event_label: name,
          value: Math.round(value),
          non_interaction: true,
        });
      }
    };

    // Observe First Contentful Paint (FCP)
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            metrics.FCP = entry.startTime;
            logMetric("FCP", entry.startTime);
            observer.disconnect();
          }
        }
      });
      observer.observe({ entryTypes: ["paint"] });
    };

    // Observe Largest Contentful Paint (LCP)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.LCP = lastEntry.startTime;
        logMetric("LCP", lastEntry.startTime);
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // Stop observing after load event
      window.addEventListener(
        "load",
        () => {
          observer.disconnect();
        },
        { once: true },
      );
    };

    // Observe First Input Delay (FID)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          metrics.FID = fidEntry.processingStart - fidEntry.startTime;
          logMetric("FID", metrics.FID);
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ["first-input"] });
    };

    // Observe Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts without recent user input
          if (
            !(entry as PerformanceEntry & { hadRecentInput?: boolean })
              .hadRecentInput
          ) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds after the first entry in the session,
            // include the entry in the current session. Otherwise, start a new session.
            if (
              sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              sessionValue +=
                (entry as PerformanceEntry & { value?: number }).value || 0;
              sessionEntries.push(entry);
            } else {
              sessionValue =
                (entry as PerformanceEntry & { value?: number }).value || 0;
              sessionEntries = [entry];
            }

            // If the current session value is larger than the current CLS value,
            // update CLS and the entries contributing to it.
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              clsEntries = sessionEntries;
              metrics.CLS = clsValue;
              logMetric("CLS", clsValue);
            }
          }
        }
      });
      observer.observe({ entryTypes: ["layout-shift"] });

      // Stop observing after load event
      window.addEventListener(
        "load",
        () => {
          observer.disconnect();
        },
        { once: true },
      );
    };

    // Measure Time to First Byte (TTFB)
    const measureTTFB = () => {
      const navigationEntry = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navigationEntry && navigationEntry.responseStart) {
        metrics.TTFB =
          navigationEntry.responseStart - navigationEntry.requestStart;
        logMetric("TTFB", metrics.TTFB);
      }
    };

    // Start observations
    try {
      observeFCP();
      observeLCP();
      observeFID();
      observeCLS();
      measureTTFB();
    } catch (error) {
      logger.error("Performance monitoring error:", error);
    }

    // Log all metrics on page unload
    return () => {
      if (enableLogging) {
        logger.info("[Performance] Final metrics:", metrics);
      }
    };
  }, [enableLogging]);
};

// Helper hook to measure component render performance
export const useRenderPerformance = (
  componentName: string,
  enableLogging = false,
) => {
  useEffect(() => {
    if (!enableLogging) return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      logger.info(
        `[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`,
      );
    };
  }, [componentName, enableLogging]);
};
