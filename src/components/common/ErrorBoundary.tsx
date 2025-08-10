import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, resetError }) => {
  const { t } = useTranslation(['errors', 'ui']);
  const navigate = useNavigate();

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            {t('ui-common:general.somethingWrong')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('ui-common:general.unknownError')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message || error.toString()}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRefresh}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('ui-components:actions.refresh')}
            </Button>
            
            <Button 
              onClick={handleGoBack}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('ui-components:actions.goBack')}
            </Button>
            
            <Button 
              onClick={handleGoHome}
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              {t('ui-components:actions.goBack')}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('ui-common:general.unknownError')}
            </p>
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto"
              onClick={() => window.open('mailto:support@legacyguard.com', '_blank')}
            >
              {t('ui-components:actions.contactSupport')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;
export { ErrorBoundary };