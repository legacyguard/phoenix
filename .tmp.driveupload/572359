import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  Loader2 } from
'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadQueueItem } from '../../../lib/services/document-upload.types';import { useTranslation } from "react-i18next";

interface UploadProgressProps {
  item: UploadQueueItem;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
}

export function UploadProgress({
  item,
  onRetry,
  onCancel,
  className
}: UploadProgressProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageMessage = () => {
    if (!item.currentStage) return 'Waiting to start...';

    const messages = {
      validating: '🔍 Checking your document...',
      compressing: '📦 Making it smaller for you...',
      reading: '📖 Reading your document...',
      analyzing: '🤖 Understanding what this is...',
      encrypting: '🔐 Securing your information...',
      storing: '💾 Keeping it safe...',
      complete: '✅ All done!'
    };

    return messages[item.currentStage] || 'Processing...';
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-200",
      getStatusColor(),
      className
    )}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {item.file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(item.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {item.status === 'failed' && onRetry &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetry(item.id)}
              className="h-8 px-2">

                <RefreshCw className="h-4 w-4" />
              </Button>
            }
            
            {item.status === 'pending' && onCancel &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(item.id)}
              className="h-8 px-2">

                <X className="h-4 w-4" />
              </Button>
            }
          </div>
        </div>

        {/* Progress */}
        {(item.status === 'processing' || item.status === 'pending') &&
        <>
            <Progress value={item.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {getStageMessage()}
            </p>
          </>
        }

        {/* Error message */}
        {item.status === 'failed' && item.error &&
        <div className="flex items-start space-x-2 pt-1">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">
                {item.error.userMessage}
              </p>
              {item.error.recoverable &&
            <p className="text-xs text-red-600 mt-1">{t("upload.uploadProgress.don_t_worry_you_can_try_again_1")}

            </p>
            }
            </div>
          </div>
        }

        {/* Success message */}
        {item.status === 'completed' && item.result?.document &&
        <div className="pt-1">
            <p className="text-sm text-green-800">
              {item.result.document.displayName}{t("upload.uploadProgress.is_now_secure_2")}
          </p>
            {item.result.summary?.familyMessage &&
          <p className="text-xs text-green-600 mt-1">
                💚 {item.result.summary.familyMessage}
              </p>
          }
          </div>
        }

        {/* Retry count */}
        {item.retryCount > 0 &&
        <p className="text-xs text-muted-foreground">{t("upload.uploadProgress.retry_attempt_3")}
          {item.retryCount}
          </p>
        }
      </div>
    </Card>);

}

interface UploadQueueListProps {
  items: UploadQueueItem[];
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onClearCompleted?: () => void;
  className?: string;
}

export function UploadQueueList({
  items,
  onRetry,
  onCancel,
  onClearCompleted,
  className
}: UploadQueueListProps) {
  if (items.length === 0) {
    return null;
  }

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const hasCompleted = completedCount > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Uploading {items.length} {items.length === 1 ? 'document' : 'documents'}
        </h3>
        
        {hasCompleted && onClearCompleted &&
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCompleted}
          className="text-xs">{t("upload.uploadProgress.clear_completed_4")}

          {completedCount})
          </Button>
        }
      </div>

      {/* Queue items */}
      <div className="space-y-3">
        {items.map((item) =>
        <UploadProgress
          key={item.id}
          item={item}
          onRetry={onRetry}
          onCancel={onCancel} />

        )}
      </div>
    </div>);

}