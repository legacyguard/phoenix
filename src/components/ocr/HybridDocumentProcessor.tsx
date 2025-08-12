import React, { useState } from "react";
import { useOCR } from "../../../lib/hooks/useOCR";
import { useAI } from "../../../lib/hooks/useAI";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LocalProcessingIndicator,
  PrivacyToggle,
} from "../LocalProcessingIndicator";
import { OCRProgress, OCRStatusMessage } from "../OCRProgress";
import { Upload, FileText, Shield, Sparkles, Eye, EyeOff } from "lucide-react";
import type { OCRResult } from "../../../lib/services/ocr.types";
import type { useTranslation } from "react-i18next";

export function HybridDocumentProcessor() {
  const {
    processDocument,
    isProcessing,
    progress,
    progressMessage,
    error: ocrError,
    result: ocrResult,
    anonymizeText,
    isPrivacyMode,
    setPrivacyMode,
    reset: resetOCR,
  } = useOCR();

  const { analyzeDocument, isAnalyzing, analysisError } = useAI();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [aiEnhancement, setAiEnhancement] = useState<Record<
    string,
    unknown
  > | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      resetOCR();
      setAiEnhancement(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    // Step 1: Local OCR processing
    const result = await processDocument(selectedFile, {
      localOnly: isPrivacyMode,
      preprocessImage: true,
    });

    if (!result) return;

    // Step 2: Optional AI enhancement (only if not in privacy mode)
    if (
      !isPrivacyMode &&
      result.documentType &&
      result.documentType.confidence < 0.8
    ) {
      // Anonymize text before sending to AI
      const anonymized = anonymizeText(result.text, {
        preserveStructure: true,
        preserveDates: true,
        preserveAmounts: true,
      });

      // Send anonymized text to AI for better analysis
      const aiResult = await analyzeDocument(selectedFile);
      if (aiResult) {
        setAiEnhancement(aiResult);
      }
    }
  };

  const getProcessingTime = () => {
    if (!ocrResult) return null;
    const seconds = (ocrResult.processingTime / 1000).toFixed(1);
    return `Processed in ${seconds} seconds`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto" data-testid="hybriddocumentprocessor-card">
      <CardHeader data-testid="hybriddocumentprocessor-cardheader">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle data-testid="hybriddocumentprocessor-cardtitle">
              {t("ocr.hybridDocumentProcessor.hybrid_document_processor_1")}
            </CardTitle>
            <CardDescription data-testid="hybriddocumentprocessor-carddescription">
              {t(
                "ocr.hybridDocumentProcessor.process_documents_locally_with_2",
              )}
            </CardDescription>
          </div>
          <LocalProcessingIndicator isLocal={isPrivacyMode} data-testid="hybriddocumentprocessor-localprocessingindicator" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6" data-testid="hybriddocumentprocessor-privacy-mode-toggle">
        {/* Privacy Mode Toggle */}
        <PrivacyToggle
          isPrivacyMode={isPrivacyMode}
          onToggle={setPrivacyMode} data-testid="hybriddocumentprocessor-privacytoggle"
        />

        {/* File Upload */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            accept={t("ocr.hybridDocumentProcessor.image_3")}
            onChange={handleFileSelect}
            className="hidden"
            id="ocr-file-upload" data-testid="hybriddocumentprocessor-input"
          />

          <label
            htmlFor="ocr-file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" data-testid="hybriddocumentprocessor-upload" />
            <span className="text-sm text-muted-foreground">
              {t(
                "ocr.hybridDocumentProcessor.click_to_upload_a_document_ima_4",
              )}
            </span>
            <span className="text-xs text-gray-500">
              {t(
                "ocr.hybridDocumentProcessor.supports_czech_slovak_and_engl_5",
              )}
            </span>
          </label>
          {selectedFile && (
            <p className="mt-2 text-sm font-medium">{selectedFile.name}</p>
          )}
        </div>

        {/* Process Button */}
        {selectedFile && !ocrResult && (
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full" data-testid="hybriddocumentprocessor-isprocessing"
          >
            {isProcessing ? (
              <>{t("ocr.hybridDocumentProcessor.processing_6")}</>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" data-testid="hybriddocumentprocessor-filetext" />
                {t("ocr.hybridDocumentProcessor.process_document_7")}
              </>
            )}
          </Button>
        )}

        {/* Progress Display */}
        <OCRProgress
          progress={progress}
          message={progressMessage}
          isVisible={isProcessing} data-testid="hybriddocumentprocessor-ocrprogress"
        />

        {/* Error Display */}
        {(ocrError || analysisError) && (
          <Alert variant="destructive" data-testid="hybriddocumentprocessor-alert">
            <AlertDescription data-testid="hybriddocumentprocessor-alertdescription">
              {ocrError?.userMessage || analysisError?.userMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {ocrResult && (
          <div className="space-y-4">
            {/* Status Information */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <OCRStatusMessage
                documentType={ocrResult.documentType?.type}
                confidence={
                  ocrResult.documentType?.confidence
                    ? ocrResult.documentType.confidence * 100
                    : undefined
                }
                language={ocrResult.language} data-testid="hybriddocumentprocessor-ocrstatusmessage"
              />

              {getProcessingTime() && (
                <p className="text-xs text-gray-500">{getProcessingTime()}</p>
              )}
            </div>

            {/* Results Tabs */}
            <Tabs defaultValue="summary" className="w-full" data-testid="hybriddocumentprocessor-tabs">
              <TabsList className="grid w-full grid-cols-3" data-testid="hybriddocumentprocessor-tabslist">
                <TabsTrigger value="summary" data-testid="hybriddocumentprocessor-summary">
                  <Shield className="mr-2 h-4 w-4" data-testid="hybriddocumentprocessor-shield" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="extracted" data-testid="hybriddocumentprocessor-tabstrigger">
                  <FileText className="mr-2 h-4 w-4" data-testid="hybriddocumentprocessor-filetext" />
                  {t("ocr.hybridDocumentProcessor.extracted_data_8")}
                </TabsTrigger>
                {aiEnhancement && (
                  <TabsTrigger value="enhanced" data-testid="hybriddocumentprocessor-tabstrigger">
                    <Sparkles className="mr-2 h-4 w-4" data-testid="hybriddocumentprocessor-sparkles" />
                    {t("ocr.hybridDocumentProcessor.ai_enhanced_9")}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="summary" className="space-y-4" data-testid="hybriddocumentprocessor-tabscontent">
                <div className="prose prose-sm max-w-none">
                  <h4>
                    {t("ocr.hybridDocumentProcessor.document_overview_10")}
                  </h4>
                  <p>
                    {t(
                      "ocr.hybridDocumentProcessor.we_successfully_read_your_11",
                    )}
                    {ocrResult.documentType?.type.replace(/_/g, " ")}
                    {t("ocr.hybridDocumentProcessor.document_12")}
                    {ocrResult.structuredData?.issueDate && (
                      <>
                        {t(
                          "ocr.hybridDocumentProcessor.the_document_was_issued_on_13",
                        )}
                        {new Date(
                          ocrResult.structuredData.issueDate,
                        ).toLocaleDateString()}
                        .
                      </>
                    )}
                  </p>

                  {/* Text Preview with Privacy Toggle */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">
                        {t("ocr.hybridDocumentProcessor.document_text_14")}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOriginalText(!showOriginalText)} data-testid="hybriddocumentprocessor-showoriginaltext"
                      >
                        {showOriginalText ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" data-testid="hybriddocumentprocessor-eyeoff" />
                            {t("ocr.hybridDocumentProcessor.hide_text_15")}
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" data-testid="hybriddocumentprocessor-eye" />
                            {t("ocr.hybridDocumentProcessor.show_text_16")}
                          </>
                        )}
                      </Button>
                    </div>

                    {showOriginalText && (
                      <div className="bg-white border rounded p-4 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {ocrResult.text}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="extracted" className="space-y-4" data-testid="hybriddocumentprocessor-ocrresult-structureddata">
                {ocrResult.structuredData ? (
                  <div className="space-y-3">
                    {Object.entries(ocrResult.structuredData).map(
                      ([key, value]) => {
                        if (value === undefined || value === null) return null;

                        return (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b"
                          >
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-sm font-medium">
                              {Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {t(
                      "ocr.hybridDocumentProcessor.no_structured_data_could_be_ex_17",
                    )}
                  </p>
                )}
              </TabsContent>

              {aiEnhancement && (
                <TabsContent value="enhanced" className="space-y-4" data-testid="hybriddocumentprocessor-tabscontent">
                  <Alert className="bg-blue-50 border-blue-200" data-testid="hybriddocumentprocessor-alert">
                    <Sparkles className="h-4 w-4 text-blue-600" data-testid="hybriddocumentprocessor-sparkles" />
                    <AlertDescription className="text-blue-800" data-testid="hybriddocumentprocessor-alertdescription">
                      {t(
                        "ocr.hybridDocumentProcessor.ai_enhancement_was_applied_to__18",
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-medium">
                      {t("ocr.hybridDocumentProcessor.ai_insights_19")}
                    </h4>
                    {aiEnhancement.suggestions?.map(
                      (suggestion: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-green-600">•</span>
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Privacy Notice */}
            {isPrivacyMode && (
              <Alert className="bg-green-50 border-green-200" data-testid="hybriddocumentprocessor-alert">
                <Shield className="h-4 w-4 text-green-600" data-testid="hybriddocumentprocessor-shield" />
                <AlertDescription className="text-green-800" data-testid="hybriddocumentprocessor-alertdescription">
                  {t(
                    "ocr.hybridDocumentProcessor.this_document_was_processed_en_20",
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
