import React, { ReactNode } from "react";
import { AsyncErrorBoundary } from "./AsyncErrorBoundary";

// HOC pre ľahšie použitie
export function withAsyncErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    loadingFallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
) {
  return (props: P) => (
    <AsyncErrorBoundary {...options}>
      <Component {...props} />
    </AsyncErrorBoundary>
  );
}
