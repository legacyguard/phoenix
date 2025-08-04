import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface RetryStatusProps {
  isRetrying: boolean;
  attemptCount: number;
  maxAttempts?: number;
  error?: Error | null;
  onRetry?: () => void;
  onCancel?: () => void;
  showOfflineStatus?: boolean;
}

export const RetryStatus: React.FC<RetryStatusProps> = ({
  isRetrying,
  attemptCount,
  maxAttempts = 3,
  error,
  onRetry,
  onCancel,
  showOfflineStatus = true
}) => {
  const isOnline = useOnlineStatus();
  
  if (!isRetrying && !error && (showOfflineStatus ? isOnline : true)) {
    return null;
  }

  const progress = (attemptCount / maxAttempts) * 100;

  return (
    <div className="space-y-2">
      {/* Offline status */}
      {showOfflineStatus && !isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You are offline. Operations will continue when connection is restored.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Retry status */}
      {isRetrying && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Retrying request... (attempt {attemptCount} of {maxAttempts})</span>
                {onCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error status */}
      {error && !isRetrying && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <span>{error.message || 'Operation failed'}</span>
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="mt-2"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Try Again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
