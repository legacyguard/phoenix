import { useEffect, useRef } from "react";

// Performance monitoring utilities
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(key: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(key, { ...this.getMetric(key), renderTime: duration });
      return duration;
    };
  }

  recordApiResponseTime(key: string, duration: number): void {
    const current = this.getMetric(key);
    this.recordMetric(key, { ...current, apiResponseTime: duration });
  }

  recordLoadTime(key: string, duration: number): void {
    const current = this.getMetric(key);
    this.recordMetric(key, { ...current, loadTime: duration });
  }

  getMetric(key: string): PerformanceMetrics {
    return (
      this.metrics.get(key) || {
        loadTime: 0,
        renderTime: 0,
        apiResponseTime: 0,
      }
    );
  }

  getAllMetrics(): Record<string, PerformanceMetrics> {
    return Object.fromEntries(this.metrics);
  }

  private recordMetric(key: string, metric: PerformanceMetrics): void {
    this.metrics.set(key, metric);
  }

  clearMetrics(key?: string): void {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(0);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const renderTime = performance.now() - startTimeRef.current;
      monitor.recordRenderTime(componentName, renderTime);
    };
  }, [componentName, monitor]);

  return {
    startTimer: () => monitor.startTimer(componentName),
    recordApiResponseTime: (duration: number) =>
      monitor.recordApiResponseTime(componentName, duration),
    getMetrics: () => monitor.getMetric(componentName),
  };
}

// Extend PerformanceMonitor with render time
declare module "./performance" {
  interface PerformanceMonitor {
    recordRenderTime(key: string, duration: number): void;
  }
}

PerformanceMonitor.prototype.recordRenderTime = function (
  key: string,
  duration: number,
): void {
  const current = this.getMetric(key);
  this.recordMetric(key, { ...current, renderTime: duration });
};

// Web Vitals tracking
export function reportWebVitals(metric: unknown) {
  if (process.env.NODE_ENV === "production") {
    // Send to analytics service
    console.log("Web Vital:", metric);
  }
}

// Memory usage tracking
export function getMemoryUsage(): number | undefined {
  if ("memory" in performance) {
    return (performance as { memory: { usedJSHeapSize: number } }).memory
      .usedJSHeapSize;
  }
  return undefined;
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
