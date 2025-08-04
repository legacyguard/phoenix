import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send error to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("errorBoundary.something_went_wrong_1")}

            </h1>
            
            <p className="text-gray-600 mb-6">{t("errorBoundary.we_encountered_an_unexpected_e_2")}

            </p>

            {process.env.NODE_ENV === 'development' && this.state.error &&
            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo &&
              <details className="text-xs text-red-700">
                    <summary className="cursor-pointer">{t("errorBoundary.stack_trace_3")}</summary>
                    <pre className="mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
              }
              </div>
            }

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="gap-2">

                <RefreshCw className="h-4 w-4" />{t("common.errorBoundary.try_again_4")}

              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="gap-2">

                <Home className="h-4 w-4" />{t("errorBoundary.go_home_5")}

              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">{t("errorBoundary.if_this_problem_persists_pleas_6")}

            </p>
          </Card>
        </div>);

    }

    return this.props.children;
  }
}