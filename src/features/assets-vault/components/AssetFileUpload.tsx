import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Upload,
  File,
  X,
  Lock,
  Tag,
  FileCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { assetFileService, AssetFile } from '../services/AssetFileService';
import { toast } from 'sonner';

interface AssetFileUploadProps {
  assetId: string;
  onUploadComplete?: (file: AssetFile) => void;
  onClose?: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

interface FileUploadItem {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  result?: AssetFile;
}

export const AssetFileUpload: React.FC<AssetFileUploadProps> = ({
  assetId,
  onUploadComplete,
  onClose,
  maxFiles = 5,
  acceptedTypes = ['*/*']
}) => {
  const { t } = useTranslation('assets');
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [encrypt, setEncrypt] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const currentCount = files.length;
    const remainingSlots = maxFiles - currentCount;
    
    if (remainingSlots <= 0) {
      toast.error(t('vault.fileUpload.maxFilesReached', { max: maxFiles }));
      return;
    }

    const filesToAdd = newFiles.slice(0, remainingSlots).map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...filesToAdd]);
  }, [files.length, maxFiles, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }, [addFiles]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const fileItem of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading' as const }
            : f
        ));

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 200);

        // Upload file
        const result = await assetFileService.uploadAssetFile(fileItem.file, {
          assetId,
          tags,
          encrypt
        });

        clearInterval(progressInterval);

        // Update status to complete
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'complete' as const, progress: 100, result }
            : f
        ));

        onUploadComplete?.(result);
        toast.success(t('vault.fileUpload.uploadSuccess', { name: fileItem.file.name }));

      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : f
        ));
        
        toast.error(t('vault.fileUpload.uploadError', { name: fileItem.file.name }));
      }
    }

    setUploading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.startsWith('audio/')) return '🎵';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('vault.fileUpload.title')}</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-gray-400"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={files.length >= maxFiles}
          />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            {t('vault.fileUpload.dragDropText')}
          </p>
          <p className="text-sm text-gray-500">
            {t('vault.fileUpload.clickToSelect')}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {t('vault.fileUpload.maxSize', { size: '100MB' })}
          </p>
        </div>

        {/* Encryption Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-gray-600" />
            <div>
              <Label htmlFor="encrypt-toggle" className="font-medium">
                {t('vault.fileUpload.encryptFiles')}
              </Label>
              <p className="text-sm text-gray-500">
                {t('vault.fileUpload.encryptDescription')}
              </p>
            </div>
          </div>
          <Switch
            id="encrypt-toggle"
            checked={encrypt}
            onCheckedChange={setEncrypt}
          />
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>{t('vault.fileUpload.tags')}</Label>
          <div className="flex gap-2">
            <Input
              placeholder={t('vault.fileUpload.addTag')}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Tag className="h-4 w-4 mr-1" />
              {t('ui:common.add')}
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <Label>{t('vault.fileUpload.selectedFiles')}</Label>
            <div className="space-y-2">
              {files.map(fileItem => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">{getFileIcon(fileItem.file)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileItem.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                    
                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="h-1 mt-2" />
                    )}
                    
                    {fileItem.status === 'error' && (
                      <p className="text-sm text-red-600 mt-1">{fileItem.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {fileItem.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileItem.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {fileItem.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    
                    {fileItem.status === 'complete' && (
                      <FileCheck className="h-5 w-5 text-green-600" />
                    )}
                    
                    {fileItem.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end gap-3">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              {t('ui:common.cancel')}
            </Button>
          )}
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('vault.fileUpload.uploading')}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {t('vault.fileUpload.uploadFiles')}
              </>
            )}
          </Button>
        </div>

        {/* Info Alert */}
        {encrypt && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              {t('vault.fileUpload.encryptionInfo')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
