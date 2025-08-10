import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';import { useTranslation } from "react-i18next";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation('ui-common');

  let errorMessage: string;
  let errorStatus: number | undefined;
  let errorDetails: string | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText;
    errorDetails = error.data?.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack;
  } else {
    errorMessage = 'Unknown error';
  }

  // Log error details
  console.error('[RouteErrorBoundary] Caught error:', {
    timestamp: new Date().toISOString(),
    errorMessage,
    errorStatus,
    errorDetails,
    location: window.location.href
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>
              {errorStatus === 404 ? 'Page Not Found' : 'Error Loading Page'}
            </CardTitle>
          </div>
          <CardDescription>
            {errorStatus === 404 ?
            'The requested page does not exist or has been moved.' :
            'An error occurred while loading this page.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm">
              {errorStatus && <span className="font-medium">{t('ui.routeErrorBoundary.code_1')}{errorStatus}</span>}
              {errorStatus && errorMessage && ' - '}
              {errorMessage}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate('/')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="flex-1">

              <RefreshCw className="mr-2 h-4 w-4" />{t('ui.routeErrorBoundary.reload_page_2')}

            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && errorDetails &&
          <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">{t('ui.routeErrorBoundary.technical_details_3')}

            </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                {errorDetails}
              </pre>
            </details>
          }
        </CardContent>
      </Card>
    </div>);

}