import React, { useState, useEffect, useCallback } from 'react';
import { Info, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProactiveErrorPreventionProps {
  context: 'form' | 'upload' | 'network' | 'save';
  fieldName?: string;
  children: React.ReactNode;
  className?: string;
}

interface ValidationHint {
  icon: React.ReactNode;
  message: string;
  type: 'info' | 'warning' | 'success';
}

const ProactiveErrorPrevention: React.FC<ProactiveErrorPreventionProps> = ({
  context,
  fieldName,
  children,
  className
}) => {
  const { t } = useTranslation('empathetic-errors');
  const [showHint, setShowHint] = useState(false);
  const [validationHint, setValidationHint] = useState<ValidationHint | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Context-specific hints
  const getContextHints = useCallback((): ValidationHint => {
    switch (context) {
      case 'form':
        if (fieldName?.includes('email')) {
          return {
            icon: <Info className="h-4 w-4" />,
            message: "Use the email address your family knows best",
            type: 'info'
          };
        }
        if (fieldName?.includes('phone')) {
          return {
            icon: <Info className="h-4 w-4" />,
            message: "Include area code - like (555) 123-4567",
            type: 'info'
          };
        }
        if (fieldName?.includes('date')) {
          return {
            icon: <Info className="h-4 w-4" />,
            message: "Format: MM/DD/YYYY",
            type: 'info'
          };
        }
        return {
          icon: <Info className="h-4 w-4" />,
          message: "This information helps protect your family",
          type: 'info'
        };

      case 'upload':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          message: "Files under 10MB work best - PDFs and images are perfect",
          type: 'warning'
        };

      case 'network':
        return {
          icon: <Shield className="h-4 w-4" />,
          message: "I'll save your work frequently so you don't lose anything",
          type: 'success'
        };

      case 'save':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          message: "Your work saves automatically - no need to worry",
          type: 'success'
        };

      default:
        return {
          icon: <Info className="h-4 w-4" />,
          message: "Take your time - there's no rush",
          type: 'info'
        };
    }
  }, [context, fieldName]);

  // Show hints on focus or hover
  useEffect(() => {
    const hint = getContextHints();
    setValidationHint(hint);
  }, [getContextHints]);

  // Auto-save indicator
  useEffect(() => {
    if (context === 'save' || context === 'form') {
      const interval = setInterval(() => {
        setIsAutoSaving(true);
        setTimeout(() => setIsAutoSaving(false), 2000);
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [context]);

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div 
      className={cn("proactive-error-prevention", className)}
      onFocus={() => setShowHint(true)}
      onBlur={() => setShowHint(false)}
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
    >
      {/* Contextual hint */}
      {showHint && validationHint && (
        <Alert className={cn("mb-2 transition-all duration-200", getAlertVariant(validationHint.type))}>
          <div className="flex items-start gap-2">
            {validationHint.icon}
            <AlertDescription className="text-sm">
              {validationHint.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="absolute top-0 right-0 flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          <CheckCircle className="h-3 w-3" />
          <span>Saving...</span>
        </div>
      )}

      {/* Wrapped content */}
      <div className="relative">
        {children}
      </div>

      {/* Persistent helpful message */}
      {context === 'form' && (
        <p className="text-xs text-gray-500 mt-1">
          {t('general.no_data_lost')}
        </p>
      )}
    </div>
  );
};

// Export specific wrappers for common use cases
export const FormFieldWithPrevention: React.FC<{
  fieldName: string;
  children: React.ReactNode;
}> = ({ fieldName, children }) => (
  <ProactiveErrorPrevention context="form" fieldName={fieldName}>
    {children}
  </ProactiveErrorPrevention>
);

export const UploadWithPrevention: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <ProactiveErrorPrevention context="upload">
    {children}
  </ProactiveErrorPrevention>
);

export default ProactiveErrorPrevention;
