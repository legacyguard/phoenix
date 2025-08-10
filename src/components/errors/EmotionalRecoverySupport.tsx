import React from 'react';
import { Heart, ArrowRight, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmotionalRecoverySupportProps {
  errorType: string;
  onContinue?: () => void;
  onTakeBreak?: () => void;
}

const EmotionalRecoverySupport: React.FC<EmotionalRecoverySupportProps> = ({ 
  errorType, 
  onContinue,
  onTakeBreak 
}) => {
  const { t } = useTranslation('errors');
  
  // Get context-specific emotional support
  const getEmotionalSupport = () => {
    switch (errorType) {
      case 'timeout':
      case 'network':
        return t('emotional_support.time_pressure');
      case 'validation':
        return t('emotional_support.frustration');
      case 'save_failed':
        return t('emotional_support.overwhelm');
      default:
        return t('emotional_support.discouragement');
    }
  };
  
  return (
    <Card className="emotional-recovery p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">You're Still Making Great Progress</h3>
        <p className="text-gray-600">
          Technical issues are frustrating, especially when you're working on something 
          so important for your family.
        </p>
      </div>
      
      <div className="recovery-encouragement bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-blue-900">
          {getEmotionalSupport()}
        </p>
        <p className="text-blue-800 mt-2">
          What you're doing matters. Your family will benefit from this work, 
          regardless of temporary technical hiccups.
        </p>
      </div>
      
      <div className="next-steps">
        <p className="text-gray-600 mb-4">
          When you're ready, I'm here to help you continue. We'll get through this together.
        </p>
        
        <div className="flex gap-3 justify-center">
          {onContinue && (
            <Button 
              onClick={onContinue}
              className="flex items-center gap-2"
            >
              Continue Where I Left Off
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          
          {onTakeBreak && (
            <Button 
              onClick={onTakeBreak}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              Take a Quick Break
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {t('recovery.auto_save_worked')}
        </p>
      </div>
    </Card>
  );
};

export default EmotionalRecoverySupport;
