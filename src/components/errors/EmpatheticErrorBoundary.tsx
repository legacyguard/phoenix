import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Heart, RefreshCw, Phone, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { logEmpatheticError } from '@/utils/error-logging';
import { contactSupport } from '@/utils/support';
import './EmpatheticErrorBoundary.css';

interface EmpatheticErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
}

const EmpatheticErrorBoundary: React.FC<EmpatheticErrorBoundaryProps> = ({ 
  children, 
  context = 'general' 
}) => {
  const { t } = useTranslation('errors');
  const [errorContext] = useState<string>(context);
  
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="empathetic-error-boundary">
          <div className="error-comfort">
            <Heart className="comfort-icon" size={48} />
            <h2>Something Unexpected Happened</h2>
            <p>{t('general.something_wrong')}</p>
          </div>
          
          <div className="error-explanation">
            <p>This kind of thing happens sometimes with technology. It's not your fault, and it doesn't mean anything is wrong with your planning.</p>
          </div>
          
          <div className="error-actions">
            <Button 
              onClick={resetErrorBoundary} 
              className="primary-action"
              size="lg"
            >
              <RefreshCw className="mr-2" size={20} />
              Let Me Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="secondary-action"
              size="lg"
            >
              <Home className="mr-2" size={20} />
              Start Fresh
            </Button>
            <Button 
              onClick={() => contactSupport(error)} 
              variant="ghost"
              className="support-action"
              size="lg"
            >
              <Phone className="mr-2" size={20} />
              Get Personal Help
            </Button>
          </div>
          
          <div className="reassurance">
            <p>Remember: You're doing something really important for your family. Don't let a technical hiccup stop you.</p>
            <p className="text-sm text-muted-foreground mt-2">{t('recovery.data_secure')}</p>
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log error with empathetic context
        logEmpatheticError(error, errorInfo, errorContext);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default EmpatheticErrorBoundary;
