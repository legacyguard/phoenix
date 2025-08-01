import React, { Component, ReactNode, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

// Loading fallback component
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Wrapper pre async komponenty s Error Boundary a Suspense
export class AsyncErrorBoundary extends Component<Props, State> {
  render() {
    const { 
      children, 
      fallback, 
      loadingFallback = <DefaultLoadingFallback />,
      onError 
    } = this.props;

    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Suspense fallback={loadingFallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    );
  }
}

// HOC pre ľahšie použitie
export function withAsyncErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    loadingFallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }
) {
  return (props: P) => (
    <AsyncErrorBoundary {...options}>
      <Component {...props} />
    </AsyncErrorBoundary>
  );
}
