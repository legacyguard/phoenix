import React, { useState } from "react";
import { useAI } from "../../../lib/hooks/useAI";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { DocumentAnalysis } from "../../../lib/services/openai.types";
import type { useTranslation } from "react-i18next";

export function DocumentUploadExample() {
  const { analyzeDocument, isAnalyzing, analysisError, generateMessage } =
    useAI();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [encouragement, setEncouragement] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setAnalysis(null);
      setEncouragement("");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    // Generate encouraging message while analyzing
    const message = await generateMessage(
      "User is uploading an important document",
      "encouraging",
    );
    if (message) {
      setEncouragement(message);
    }

    // Analyze the document
    const result = await analyzeDocument(selectedFile);
    if (result) {
      setAnalysis(result);

      // Generate celebratory message based on document type
      if (result.type === "insurance") {
        const celebrateMessage = await generateMessage(
          "User uploaded their insurance documents protecting their family",
          "celebratory",
        );
        if (celebrateMessage) {
          setEncouragement(celebrateMessage);
        }
      }
    }
  };

  const getDocumentIcon = (type: string) => {
    const icons = {
      insurance: "🛡️",
      will: "📜",
      medical: "🏥",
      financial: "💰",
      property: "🏠",
      other: "📄",
    };
    return icons[type as keyof typeof icons] || "📄";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {t("ai.documentUploadExample.document_analysis_example_1")}
        </CardTitle>
        <CardDescription>
          {t("ai.documentUploadExample.upload_a_document_image_to_see_2")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            accept={t("ocr.hybridDocumentProcessor.image_3")}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t(
                "ocr.hybridDocumentProcessor.click_to_upload_a_document_ima_4",
              )}
            </span>
          </label>
          {selectedFile && (
            <p className="mt-2 text-sm font-medium">{selectedFile.name}</p>
          )}
        </div>

        {/* Encouragement Message */}
        {encouragement && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {encouragement}
            </AlertDescription>
          </Alert>
        )}

        {/* Analyze Button */}
        {selectedFile && !analysis && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("ai.documentUploadExample.analyzing_your_document_5")}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                {t("ai.documentUploadExample.analyze_document_6")}
              </>
            )}
          </Button>
        )}

        {/* Error Display */}
        {analysisError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{analysisError.userMessage}</AlertDescription>
          </Alert>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getDocumentIcon(analysis.type)}</span>
              <div>
                <h3 className="font-semibold capitalize">
                  {analysis.type} Document
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("ai.documentUploadExample.confidence_7")}
                  {(analysis.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Extracted Data */}
            {analysis.extractedData.title && (
              <div>
                <h4 className="font-medium text-sm text-gray-600">
                  {t("ai.documentUploadExample.document_title_8")}
                </h4>
                <p>{analysis.extractedData.title}</p>
              </div>
            )}

            {analysis.extractedData.summary && (
              <div>
                <h4 className="font-medium text-sm text-gray-600">Summary</h4>
                <p className="text-sm">{analysis.extractedData.summary}</p>
              </div>
            )}

            {analysis.extractedData.expirationDate && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {t("ai.documentUploadExample.expires_on_9")}
                  {new Date(
                    analysis.extractedData.expirationDate,
                  ).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">
                  {t("ai.documentUploadExample.helpful_suggestions_10")}
                </h4>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Documents */}
            {analysis.relatedDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">
                  {t(
                    "ai.documentUploadExample.related_documents_to_consider_11",
                  )}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.relatedDocuments.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
