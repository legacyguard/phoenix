import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnError?: boolean;
  resetButtonText?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[FormErrorBoundary] Form error:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { resetOnError = true, resetButtonText = 'Try Again' } = this.props;

      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.formErrorBoundary.form_error_1")}</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{t("common.formErrorBoundary.an_unexpected_error_occurred_w_2")}</p>
            {process.env.NODE_ENV === 'development' && this.state.error &&
            <p className="text-xs font-mono bg-destructive/10 p-2 rounded">
                {this.state.error.message}
              </p>
            }
            {resetOnError &&
            <Button
              size="sm"
              variant="outline"
              onClick={this.handleReset}
              className="mt-2">

                <RefreshCw className="mr-2 h-3 w-3" />
                {resetButtonText}
              </Button>
            }
          </AlertDescription>
        </Alert>);

    }

    return this.props.children;
  }
}