import React, { Component, ReactNode, Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

// Wrapper pre async komponenty s Error Boundary a Suspense
export class AsyncErrorBoundary extends Component<Props, State> {
  render() {
    const {
      children,
      fallback,
      loadingFallback = (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ),
      onError,
    } = this.props;

    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Suspense fallback={loadingFallback}>{children}</Suspense>
      </ErrorBoundary>
    );
  }
}
