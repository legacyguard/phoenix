import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Camera, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useDocumentUpload,
  useUploadPreferences,
} from "../../../lib/hooks/useDocumentUpload";
import type { UPLOAD } from "@/utils/constants";

interface SmartUploadZoneProps {
  onUploadStart?: () => void;
  className?: string;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function SmartUploadZone({
  onUploadStart,
  className,
  maxFiles = UPLOAD.maxFiles,
  acceptedTypes = UPLOAD.acceptedTypes,
}: SmartUploadZoneProps) {
  const { t } = useTranslation("ui-common");
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useDocumentUpload();
  const { preferences } = useUploadPreferences();

  // Process selected files
  const handleFiles = useCallback(
    async (files: File[]) => {
      // Limit number of files
      const filesToUpload = files.slice(0, maxFiles);

      // Filter accepted types
      const validFiles = filesToUpload.filter((file) => {
        return acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const baseType = type.replace("/*", "");
            return file.type.startsWith(baseType);
          }
          return file.type === type;
        });
      });

      if (validFiles.length === 0) {
        console.warn("No valid files selected");
        return;
      }

      // Start upload
      onUploadStart?.();

      // Upload with user preferences
      await upload(validFiles, {
        privacy: preferences.privacy,
        compress: preferences.autoCompress,
        encrypt: preferences.autoEncrypt,
        processOCR: preferences.processOCR,
        analyzeWithAI: preferences.analyzeWithAI,
        generateThumbnail: preferences.generateThumbnail,
        familySharing: preferences.familySharing,
      });
    },
    [maxFiles, acceptedTypes, upload, preferences, onUploadStart],
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev - 1);

      if (dragCounter - 1 === 0) {
        setIsDragging(false);
      }
    },
    [dragCounter],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Open camera (mobile)
  const openCamera = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div
      data-testid="upload-zone"
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-gray-300 hover:border-gray-400",
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        data-testid="file-input"
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t("assets.smartUploadZone.file_upload_1")}
      />

      <div className="p-8 sm:p-12 text-center">
        {/* Upload icon with animation */}
        <div className="mx-auto mb-6 relative">
          <div
            className={cn(
              "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center transition-all",
              isDragging && "scale-110 bg-primary/20",
            )}
          >
            <Upload
              className={cn(
                "h-10 w-10 text-primary transition-all",
                isDragging && "scale-110",
              )}
            />
          </div>
          {isDragging && (
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
          )}
        </div>

        {/* Main message */}
        <h3 className="text-lg font-semibold mb-2">
          {isDragging
            ? t("assets.zone.dropHereActive")
            : t("assets.zone.dropHere")}
        </h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          {isDragging
            ? t("assets.zone.descriptionActive")
            : t("assets.zone.description")}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={openFilePicker} variant="default" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("assets.zone.chooseFiles")}
          </Button>

          {/* Show camera button on mobile */}
          <Button
            onClick={openCamera}
            variant="outline"
            className="gap-2 sm:hidden"
          >
            <Camera className="h-4 w-4" />
            {t("assets.zone.takePhoto")}
          </Button>
        </div>

        {/* Supported types */}
        <p className="text-xs text-muted-foreground mt-6">
          {t("assets.smartUploadZone.supports_images_jpeg_png_and_p_2")}
          {maxFiles}
          {t("assets.smartUploadZone.files_at_once_3")}
        </p>

        {/* Privacy indicator */}
        {preferences.privacy === "local" && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            {t("assets.zone.processingLocally")}
          </div>
        )}
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-12 w-12 text-primary mx-auto mb-3 animate-bounce" />
            <p className="text-lg font-semibold text-primary">
              {t("assets.zone.dragOverlay.title")}
            </p>
            <p className="text-sm text-primary/70">
              {t("assets.zone.dragOverlay.subtitle")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
