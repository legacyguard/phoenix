import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  Users,
  Lock,
  Cloud,
  HardDrive,
  Eye,
  Download,
  Share2,
  Trash2,
  AlertCircle } from
'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ProcessedDocument } from '../../../lib/services/document-upload.types';import { useTranslation } from "react-i18next";

interface DocumentPreviewProps {
  document: ProcessedDocument;
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function DocumentPreview({
  document,
  onView,
  onDownload,
  onShare,
  onDelete,
  className
}: DocumentPreviewProps) {
  const getCategoryIcon = () => {
    const icons = {
      home: '🏠',
      family: '👨‍👩‍👧‍👦',
      finance: '💰',
      health: '🏥',
      legal: '⚖️',
      identity: '🆔',
      other: '📄'
    };
    return icons[document.category] || '📄';
  };

  const getCategoryColor = () => {
    const colors = {
      home: 'bg-blue-100 text-blue-800',
      family: 'bg-purple-100 text-purple-800',
      finance: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      legal: 'bg-orange-100 text-orange-800',
      identity: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[document.category] || 'bg-gray-100 text-gray-800';
  };

  const hasExpiry = document.metadata.expiryDate;
  const isExpired = hasExpiry && new Date(document.metadata.expiryDate!) < new Date();
  const expiresWithin30Days = hasExpiry && !isExpired &&
  new Date(document.metadata.expiryDate!) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <div className="p-4 space-y-4">
        {/* Thumbnail and basic info */}
        <div className="flex space-x-4">
          {/* Thumbnail */}
          {document.thumbnail ?
          <img
            src={document.thumbnail}
            alt={document.displayName}
            className="w-20 h-20 object-cover rounded-lg border" /> :


          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          }

          {/* Document info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {document.displayName}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getCategoryIcon()} {document.category}
              </Badge>
              
              {document.encryptionStatus === 'encrypted' &&
              <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              }
            </div>

            {/* Storage location */}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              {document.storageLocation === 'local' ?
              <>
                  <HardDrive className="h-3 w-3" />
                  <span>{t('assets.documentPreview.on_device_1')}</span>
                </> :
              document.storageLocation === 'cloud' ?
              <>
                  <Cloud className="h-3 w-3" />
                  <span>Cloud</span>
                </> :

              <>
                  <HardDrive className="h-3 w-3" />
                  <Cloud className="h-3 w-3" />
                  <span>Both</span>
                </>
              }
            </div>
          </div>
        </div>

        {/* Important dates */}
        {(document.metadata.documentDate || hasExpiry) &&
        <div className="space-y-2">
            {document.metadata.documentDate &&
          <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{t('assets.documentPreview.issued_2')}{format(new Date(document.metadata.documentDate), 'MMM d, yyyy')}</span>
              </div>
          }
            
            {hasExpiry &&
          <div className={cn(
            "flex items-center gap-2 text-xs",
            isExpired && "text-red-600",
            expiresWithin30Days && "text-orange-600"
          )}>
                <AlertCircle className="h-3 w-3" />
                <span>
                  {isExpired ? 'Expired' : 'Expires'}: {format(new Date(document.metadata.expiryDate!), 'MMM d, yyyy')}
                </span>
              </div>
          }
          </div>
        }

        {/* Extracted people */}
        {document.metadata.relatedPeople && document.metadata.relatedPeople.length > 0 &&
        <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {document.metadata.relatedPeople.slice(0, 2).join(', ')}
              {document.metadata.relatedPeople.length > 2 && ` +${document.metadata.relatedPeople.length - 2} more`}
            </span>
          </div>
        }

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {onView &&
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="flex-1">

              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          }
          
          {onDownload &&
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="flex-1">

              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          }
          
          {onShare &&
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex-1">

              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          }
          
          {onDelete &&
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700">

              <Trash2 className="h-4 w-4" />
            </Button>
          }
        </div>

        {/* Sharing status */}
        {document.sharingStatus?.isShared &&
        <div className="bg-blue-50 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-2 text-blue-800">
              <Share2 className="h-3 w-3" />
              <span>{t('assets.documentPreview.shared_with_3')}
              {document.sharingStatus.sharedWith.length} 
                {document.sharingStatus.sharedWith.length === 1 ? ' person' : ' people'}
              </span>
            </div>
          </div>
        }
      </div>
    </Card>);

}

interface DocumentGridProps {
  documents: ProcessedDocument[];
  onView?: (doc: ProcessedDocument) => void;
  onDownload?: (doc: ProcessedDocument) => void;
  onShare?: (doc: ProcessedDocument) => void;
  onDelete?: (doc: ProcessedDocument) => void;
  className?: string;
}

export function DocumentGrid({
  documents,
  onView,
  onDownload,
  onShare,
  onDelete,
  className
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t('assets.documentPreview.no_documents_uploaded_yet_4')}</p>
        <p className="text-sm text-gray-400 mt-1">{t('assets.documentPreview.drop_some_files_above_to_get_s_5')}

        </p>
      </div>);

  }

  return (
    <div className={cn(
      "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {documents.map((doc) =>
      <DocumentPreview
        key={doc.id}
        document={doc}
        onView={onView ? () => onView(doc) : undefined}
        onDownload={onDownload ? () => onDownload(doc) : undefined}
        onShare={onShare ? () => onShare(doc) : undefined}
        onDelete={onDelete ? () => onDelete(doc) : undefined} />

      )}
    </div>);

}