import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useErrorTracking } from '@/utils/errorTracking';

export function ErrorTest() {
  const { t } = useTranslation('common');
  const { logError, logWarning, logCritical } = useErrorTracking();

  const triggerError = () => {
    throw new Error('Test error from ErrorTest component');
  };

  const triggerAsyncError = async () => {
    await Promise.reject(new Error('Test async rejection'));
  };

  const triggerTrackedError = () => {
    logError('Manual test error', { 
      component: 'ErrorTest',
      action: 'button-click' 
    });
  };

  const triggerCriticalError = () => {
    logCritical('Test critical error', { 
      component: 'ErrorTest',
      severity: 'high' 
    });
  };

  const triggerMultipleCriticalErrors = () => {
    // Trigger multiple errors to test threshold
    for (let i = 0; i < 6; i++) {
      logCritical(`Critical error ${i + 1}`, { 
        component: 'ErrorTest',
        index: i 
      });
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">{t('errorTest.title')}</h2>
      
      <div className="space-y-2">
        <Button onClick={triggerError} variant="destructive">
          {t('errorTest.triggerSyncError')}
        </Button>
        
        <Button onClick={triggerAsyncError} variant="destructive">
          {t('errorTest.triggerAsyncError')}
        </Button>
        
        <Button onClick={triggerTrackedError} variant="outline">
          {t('errorTest.logRegularError')}
        </Button>
        
        <Button onClick={triggerCriticalError} variant="outline">
          {t('errorTest.logCriticalError')}
        </Button>
        
        <Button onClick={triggerMultipleCriticalErrors} variant="destructive">
          {t('errorTest.triggerAlert')}
        </Button>
      </div>
    </div>
  );
}
