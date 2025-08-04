import React, { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { logErrorToSupabase } from '@/utils/errorTracking';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showStackTrace: boolean;
}

class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showStackTrace: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const timestamp = new Date().toISOString();
    const { errorId } = this.state;
    
    // Detailed logging for debugging
    console.error('[ErrorBoundary] Component error caught:', {
      errorId,
      timestamp,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      errorBoundaryProps: this.props,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    // Save errorInfo to state
    this.setState({ errorInfo });

    // Optional callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Toast notification for development
    if (process.env.NODE_ENV === 'development') {
      toast.error(`Application error (${errorId})`, {
        description: error.message,
        duration: 10000
      });
    }

    // In production, this would send the error to a monitoring service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Log to Supabase
    logErrorToSupabase(error, errorInfo);

    // Save to localStorage for debug purposes
    try {
      const errorData = {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        componentStack: errorInfo.componentStack,
        url: window.location.href
      };
      
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      // Keep only the last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to save error to localStorage:', e);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showStackTrace: false
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleStackTrace = () => {
    this.setState(prev => ({ showStackTrace: !prev.showStackTrace }));
  };

  formatStackTrace = (stack: string | undefined): string[] => {
    if (!stack) return [];
    return stack
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, showStackTrace } = this.state;
      const { fallback, showDetails = process.env.NODE_ENV === 'development', t } = this.props;

      // If custom fallback is defined, use it
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-2xl">{t('errorBoundary.title')}</CardTitle>
                  <CardDescription>
                    {t('errorBoundary.description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error ID for support */}
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {t('errorBoundary.errorId')}: <code className="text-xs bg-background px-2 py-1 rounded">{errorId}</code>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('errorBoundary.tryAgain')}
                </Button>
                <Button onClick={this.handleReload} variant="secondary">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('errorBoundary.reloadPage')}
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  {t('errorBoundary.goToHomepage')}
                </Button>
              </div>

              {/* Technical details (only in development or if enabled) */}
              {showDetails && error && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center justify-between">
                      {t('errorBoundary.technicalDetails')}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={this.toggleStackTrace}
                        className="h-6"
                      >
                        {showStackTrace ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            {t('errorBoundary.hide')}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            {t('errorBoundary.show')}
                          </>
                        )}
                      </Button>
                    </h4>
                    
                    {/* Error message */}
                    <div className="bg-destructive/10 p-3 rounded-md">
                      <p className="text-sm font-mono text-destructive">
                        {error.name}: {error.message}
                      </p>
                    </div>

                    {/* Stack trace */}
                    {showStackTrace && (
                      <div className="space-y-2">
                        {error.stack && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                              {t('errorBoundary.stackTrace')}:
                            </p>
                            <div className="bg-muted/30 p-3 rounded-md max-h-48 overflow-y-auto">
                              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                {this.formatStackTrace(error.stack).map((line, i) => (
                                  <div key={i} className="py-0.5">{line}</div>
                                ))}
                              </pre>
                            </div>
                          </div>
                        )}

                        {errorInfo?.componentStack && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                              {t('errorBoundary.componentStack')}:
                            </p>
                            <div className="bg-muted/30 p-3 rounded-md max-h-48 overflow-y-auto">
                              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                {errorInfo.componentStack}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help text */}
              <p className="text-sm text-muted-foreground pt-4">
                {t('errorBoundary.helpText')}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation('common')(ErrorBoundaryComponent);
