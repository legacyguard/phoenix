import React from 'react';
import { Progress } from '@/components/ui/progress';
import { FileText, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';import { useTranslation } from "react-i18next";

interface OCRProgressProps {
  progress: number;
  message: string;
  isVisible: boolean;
  className?: string;
}

export function OCRProgress({
  progress,
  message,
  isVisible,
  className
}: OCRProgressProps) {
  if (!isVisible) return null;

  // Select icon based on progress stage
  const getIcon = () => {
    if (progress < 20) return <FileText className="h-5 w-5 text-blue-600" />;
    if (progress < 80) return <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />;
    return <Heart className="h-5 w-5 text-green-600" />;
  };

  // Get encouraging subtitle based on progress
  const getSubtitle = () => {
    if (progress < 10) return "Getting everything ready for you...";
    if (progress < 30) return "Your document is in good hands...";
    if (progress < 60) return "Working through the details carefully...";
    if (progress < 90) return "Almost finished organizing everything...";
    if (progress === 100) return "All done! Your document is ready.";
    return "Taking care of your important information...";
  };

  return (
    <div className={cn(
      "w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border transition-all duration-300",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      className
    )}>
      <div className="space-y-4">
        {/* Icon and main message */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {message}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <Progress
          value={progress}
          className="h-2" />


        {/* Progress percentage */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{progress}{t("oCRProgress.complete_1")}</span>
          {progress > 0 && progress < 100 &&
          <span className="animate-pulse">{t("oCRProgress.please_wait_2")}</span>
          }
        </div>
      </div>
    </div>);

}

interface OCRStatusMessageProps {
  documentType?: string;
  confidence?: number;
  language?: string;
  className?: string;
}

export function OCRStatusMessage({
  documentType,
  confidence,
  language,
  className
}: OCRStatusMessageProps) {
  const getDocumentTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      insurance_policy: 'Insurance Policy',
      bank_statement: 'Bank Statement',
      property_deed: 'Property Deed',
      identity_card: 'Identity Card',
      passport: 'Passport',
      will: 'Will',
      medical_record: 'Medical Record',
      contract: 'Contract',
      invoice: 'Invoice',
      receipt: 'Receipt',
      unknown: 'Document'
    };
    return typeMap[type] || 'Document';
  };

  const getLanguageDisplay = (lang: string) => {
    const langMap: Record<string, string> = {
      cs: 'Czech',
      sk: 'Slovak',
      en: 'English',
      other: 'Other'
    };
    return langMap[lang] || lang;
  };

  const getConfidenceMessage = (conf: number) => {
    if (conf >= 90) return "Excellent quality scan!";
    if (conf >= 80) return "Good quality document.";
    if (conf >= 70) return "Readable document.";
    return "The scan quality could be better, but we got the important parts.";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {documentType &&
      <div className="flex items-center space-x-2 text-sm">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{t("oCRProgress.detected_3")}</span>
          <span className="font-medium text-gray-900">
            {getDocumentTypeDisplay(documentType)}
          </span>
        </div>
      }
      
      {language &&
      <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">{t("oCRProgress.language_4")}</span>
          <span className="font-medium text-gray-900">
            {getLanguageDisplay(language)}
          </span>
        </div>
      }
      
      {confidence !== undefined &&
      <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">{t("oCRProgress.quality_5")}</span>
          <span className={cn(
          "font-medium",
          confidence >= 80 ? "text-green-600" :
          confidence >= 70 ? "text-yellow-600" : "text-orange-600"
        )}>
            {Math.round(confidence)}%
          </span>
          <span className="text-gray-500 text-xs">
            - {getConfidenceMessage(confidence)}
          </span>
        </div>
      }
    </div>);

}