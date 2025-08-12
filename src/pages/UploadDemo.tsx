import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SmartUploadZone } from "@/components/upload/SmartUploadZone";
import { UploadQueueList } from "@/components/upload/UploadProgress";
import { DocumentGrid } from "@/components/upload/DocumentPreview";
import { Shield, Sparkles, HardDrive, Cloud, Heart } from "lucide-react";
import {
  useDocumentUpload,
  useUploadPreferences,
} from "../../lib/hooks/useDocumentUpload";
import { documentStorage } from "../../lib/services/document-storage.service";
import type { ProcessedDocument } from "../../lib/services/document-upload.types";
import { logger } from "@/utils/logger";

export function UploadDemo() {
  const { t } = useTranslation("ui-common");
  const {
    upload,
    uploadQueue,
    overallProgress,
    retry,
    cancel,
    clearCompleted,
    isUploading,
    successCount,
    failureCount,
  } = useDocumentUpload();

  const { preferences, updatePreference } = useUploadPreferences();
  const [uploadedDocuments, setUploadedDocuments] = useState<
    ProcessedDocument[]
  >([]);
  const [storageStats, setStorageStats] = useState({
    localCount: 0,
    cloudCount: 0,
    totalSize: 0,
  });

  // Load storage stats
  React.useEffect(() => {
    loadStorageStats();
  }, [successCount]);

  const loadStorageStats = async () => {
    const stats = await documentStorage.getStorageStats();
    setStorageStats(stats);
  };

  // Simulate loading uploaded documents
  React.useEffect(() => {
    const completed = uploadQueue
      .filter((item) => item.status === "completed" && item.result?.document)
      .map((item) => item.result!.document!);

    setUploadedDocuments((prev) => [...prev, ...completed]);
  }, [successCount, uploadQueue]);

  const handleUploadStart = () => {
    logger.info(t("demo.upload.console.uploadStarted"));
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t("demo.upload.title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("demo.upload.subtitle")}
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Badge variant="secondary" className="px-3 py-1" data-testid="uploaddemo-t-demo-upload-badge-encryption">
            <Shield className="mr-1 h-3 w-3" data-testid="uploaddemo-shield" />
            {t("demo.upload.badge.encryption")}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1" data-testid="uploaddemo-t-demo-upload-badge-aianalysis">
            <Sparkles className="mr-1 h-3 w-3" data-testid="uploaddemo-sparkles" />
            {t("demo.upload.badge.aiAnalysis")}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1" data-testid="uploaddemo-badge">
            <Heart className="mr-1 h-3 w-3" data-testid="uploaddemo-heart" />
            {t("demo.upload.badge.familySharing")}
          </Badge>
        </div>
      </div>

      {/* Upload Settings */}
      <Card data-testid="uploaddemo-card">
        <CardHeader data-testid="uploaddemo-t-demo-upload-settings-title">
          <CardTitle data-testid="uploaddemo-t-demo-upload-settings-title">{t("demo.upload.settings.title")}</CardTitle>
          <CardDescription data-testid="uploaddemo-t-demo-upload-settings-description">
            {t("demo.upload.settings.description")}
          </CardDescription>
        </CardHeader>
        <CardContent data-testid="uploaddemo-privacy-mode">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Privacy Mode */}
            <div className="space-y-2">
              <Label data-testid="uploaddemo-t-demo-upload-settings-storagelocation">{t("demo.upload.settings.storageLocation")}</Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant={
                    preferences.privacy === "local" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => updatePreference("privacy", "local")}
                  className="flex-1" data-testid="uploaddemo-button"
                >
                  <HardDrive className="h-4 w-4 mr-1" data-testid="uploaddemo-harddrive" />
                  {t("demo.upload.settings.local")}
                </Button>
                <Button
                  variant={
                    preferences.privacy === "cloud" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => updatePreference("privacy", "cloud")}
                  className="flex-1" data-testid="uploaddemo-button"
                >
                  <Cloud className="h-4 w-4 mr-1" data-testid="uploaddemo-cloud" />
                  {t("demo.upload.settings.cloud")}
                </Button>
              </div>
            </div>

            {/* Auto Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="compress" className="text-sm" data-testid="uploaddemo-t-demo-upload-features-autocompress">
                  {t("demo.upload.features.autoCompress")}
                </Label>
                <Switch
                  id="compress"
                  checked={preferences.autoCompress}
                  onCheckedChange={(checked) =>
                    updatePreference("autoCompress", checked)
                  } data-testid="uploaddemo-switch"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="encrypt" className="text-sm" data-testid="uploaddemo-t-demo-upload-features-autoencrypt">
                  {t("demo.upload.features.autoEncrypt")}
                </Label>
                <Switch
                  id="encrypt"
                  checked={preferences.autoEncrypt}
                  onCheckedChange={(checked) =>
                    updatePreference("autoEncrypt", checked)
                  } data-testid="uploaddemo-switch"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ocr" className="text-sm" data-testid="uploaddemo-t-demo-upload-features-processocr">
                  {t("demo.upload.features.processOCR")}
                </Label>
                <Switch
                  id="ocr"
                  checked={preferences.processOCR}
                  onCheckedChange={(checked) =>
                    updatePreference("processOCR", checked)
                  } data-testid="uploaddemo-switch"
                />
              </div>
            </div>

            {/* AI Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai" className="text-sm" data-testid="uploaddemo-t-demo-upload-features-aianalysis">
                  {t("demo.upload.features.aiAnalysis")}
                </Label>
                <Switch
                  id="ai"
                  checked={preferences.analyzeWithAI}
                  onCheckedChange={(checked) =>
                    updatePreference("analyzeWithAI", checked)
                  }
                  disabled={preferences.privacy === "local"} data-testid="uploaddemo-switch"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="family" className="text-sm" data-testid="uploaddemo-t-demo-upload-features-familysharing">
                  {t("demo.upload.features.familySharing")}
                </Label>
                <Switch
                  id="family"
                  checked={preferences.familySharing}
                  onCheckedChange={(checked) =>
                    updatePreference("familySharing", checked)
                  } data-testid="uploaddemo-switch"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Upload Area */}
      <Tabs defaultValue="upload" className="w-full" data-testid="uploaddemo-tabs">
        <TabsList className="grid w-full grid-cols-3" data-testid="uploaddemo-t-demo-upload-tabs-upload">
          <TabsTrigger value="upload" data-testid="uploaddemo-t-demo-upload-tabs-upload">
            {t("demo.upload.tabs.upload")}
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="uploaddemo-tabstrigger">
            {t("demo.upload.tabs.documents")} ({uploadedDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="uploaddemo-t-demo-upload-tabs-stats">{t("demo.upload.tabs.stats")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6" data-testid="uploaddemo-upload-zone">
          {/* Upload Zone */}
          <SmartUploadZone onUploadStart={handleUploadStart} data-testid="uploaddemo-smartuploadzone" />

          {/* Upload Progress */}
          {uploadQueue.length > 0 && (
            <Card data-testid="uploaddemo-card">
              <CardHeader data-testid="uploaddemo-cardheader">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" data-testid="uploaddemo-t-demo-upload-progress-title">
                    {t("demo.upload.progress.title")}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">
                      ✓{" "}
                      {t("demo.upload.progress.completed", {
                        count: successCount,
                      })}
                    </span>
                    {failureCount > 0 && (
                      <span className="text-red-600">
                        ✗{" "}
                        {t("demo.upload.progress.failed", {
                          count: failureCount,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {isUploading && (
                  <Progress value={overallProgress} className="mt-2" data-testid="uploaddemo-progress" />
                )}
              </CardHeader>
              <CardContent data-testid="uploaddemo-cardcontent">
                <UploadQueueList
                  items={uploadQueue}
                  onRetry={retry}
                  onCancel={cancel}
                  onClearCompleted={clearCompleted} data-testid="uploaddemo-uploadqueuelist"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6" data-testid="uploaddemo-tabscontent">
          <DocumentGrid
            documents={uploadedDocuments}
            onView={(doc) => logger.info(t("demo.upload.console.view"), doc)}
            onDownload={(doc) =>
              logger.info(t("demo.upload.console.download"), doc)
            }
            onShare={(doc) => logger.info(t("demo.upload.console.share"), doc)}
            onDelete={(doc) =>
              logger.info(t("demo.upload.console.delete"), doc)
            } data-testid="uploaddemo-documentgrid"
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6" data-testid="uploaddemo-tabscontent">
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-testid="uploaddemo-card">
              <CardHeader data-testid="uploaddemo-cardheader">
                <CardTitle className="text-sm font-medium" data-testid="uploaddemo-t-demo-upload-stats-localstorage-title">
                  {t("demo.upload.stats.localStorage.title")}
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="uploaddemo-cardcontent">
                <div className="text-2xl font-bold">
                  {storageStats.localCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("demo.upload.stats.localStorage.description")}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="uploaddemo-card">
              <CardHeader data-testid="uploaddemo-cardheader">
                <CardTitle className="text-sm font-medium" data-testid="uploaddemo-t-demo-upload-stats-cloudstorage-title">
                  {t("demo.upload.stats.cloudStorage.title")}
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="uploaddemo-cardcontent">
                <div className="text-2xl font-bold">
                  {storageStats.cloudCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("demo.upload.stats.cloudStorage.description")}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="uploaddemo-card">
              <CardHeader data-testid="uploaddemo-cardheader">
                <CardTitle className="text-sm font-medium" data-testid="uploaddemo-t-demo-upload-stats-totalsize-title">
                  {t("demo.upload.stats.totalSize.title")}
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="uploaddemo-cardcontent">
                <div className="text-2xl font-bold">
                  {(storageStats.totalSize / 1024 / 1024).toFixed(1)} MB
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("demo.upload.stats.totalSize.description")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Processing Stats */}
          <Card data-testid="uploaddemo-card">
            <CardHeader data-testid="uploaddemo-cardheader">
              <CardTitle data-testid="uploaddemo-cardtitle">
                {t("demo.upload.stats.processingStats.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-testid="uploaddemo-cardcontent">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {t("demo.upload.stats.processingStats.documentsProcessed")}
                  </span>
                  <span className="font-medium">
                    {successCount + failureCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("demo.upload.stats.successRate")}</span>
                  <span className="font-medium">
                    {successCount + failureCount > 0
                      ? Math.round(
                          (successCount / (successCount + failureCount)) * 100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("demo.upload.stats.averageTime")}</span>
                  <span className="font-medium">
                    {t("demo.upload.stats.averageTimeValue")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <Alert data-testid="uploaddemo-alert">
        <Shield className="h-4 w-4" data-testid="uploaddemo-shield" />
        <AlertDescription data-testid="uploaddemo-preferences-privacy-local">
          {preferences.privacy === "local" ? (
            <>
              <strong>{t("demo.upload.privacy.localMode.title")}</strong>{" "}
              {t("demo.upload.privacy.localMode.description")}
            </>
          ) : (
            <>
              <strong>{t("demo.upload.privacy.cloudMode.title")}</strong>{" "}
              {t("demo.upload.privacy.cloudMode.description")}
            </>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
