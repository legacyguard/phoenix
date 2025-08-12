import React from "react";
import { useTranslation } from "react-i18next";
import { HybridDocumentProcessor } from "@/components/ocr/HybridDocumentProcessor";
import { useStoredOCRResults } from "../../lib/hooks/useOCR";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, FileText, Globe } from "lucide-react";
import format from "date-fns/format";

export function OCRDemo() {
  const { t } = useTranslation("ui-common");
  const { results: storedResults, isLoading: isLoadingStored } =
    useStoredOCRResults();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t("demo.ocr.title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("demo.ocr.subtitle")}
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Badge variant="secondary" className="px-3 py-1" data-testid="ocrdemo-badge">
            <Shield className="mr-1 h-3 w-3" data-testid="ocrdemo-shield" />
            {t("demo.ocr.badge.localProcessing")}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1" data-testid="ocrdemo-badge">
            <Globe className="mr-1 h-3 w-3" data-testid="ocrdemo-globe" />
            {t("demo.ocr.badge.languageSupport")}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1" data-testid="ocrdemo-t-demo-ocr-badge-smartdetection">
            <FileText className="mr-1 h-3 w-3" data-testid="ocrdemo-filetext" />
            {t("demo.ocr.badge.smartDetection")}
          </Badge>
        </div>
      </div>

      {/* Main processor */}
      <HybridDocumentProcessor data-testid="ocrdemo-hybriddocumentprocessor" />

      {/* Previously processed documents */}
      {storedResults.length > 0 && (
        <Card data-testid="ocrdemo-card">
          <CardHeader data-testid="ocrdemo-t-demo-ocr-previousdocuments-title">
            <CardTitle data-testid="ocrdemo-t-demo-ocr-previousdocuments-title">{t("demo.ocr.previousDocuments.title")}</CardTitle>
            <CardDescription data-testid="ocrdemo-t-demo-ocr-previousdocuments-description">
              {t("demo.ocr.previousDocuments.description")}
            </CardDescription>
          </CardHeader>
          <CardContent data-testid="ocrdemo-control">
            <div className="space-y-3">
              {storedResults.slice(0, 5).map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" data-testid="ocrdemo-filetext" />
                    <div>
                      <p className="font-medium text-sm">
                        {result.documentType?.type.replace(/_/g, " ") ||
                          t("demo.ocr.unknownDocument")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.language === "cs"
                          ? t("demo.ocr.language.czech")
                          : result.language === "sk"
                            ? t("demo.ocr.language.slovak")
                            : result.language === "en"
                              ? t("demo.ocr.language.english")
                              : t("demo.ocr.language.other")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" data-testid="ocrdemo-clock" />
                    <span>
                      {format(new Date(result.timestamp), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card data-testid="ocrdemo-card">
          <CardHeader data-testid="ocrdemo-cardheader">
            <Shield className="h-8 w-8 text-green-600 mb-2" data-testid="ocrdemo-shield" />
            <CardTitle className="text-lg" data-testid="ocrdemo-t-demo-ocr-features-completeprivacy">
              {t("demo.ocr.features.completePrivacy")}
            </CardTitle>
          </CardHeader>
          <CardContent data-testid="ocrdemo-cardcontent">
            <p className="text-sm text-gray-600">
              {t("demo.ocr.privacyDescription")}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="ocrdemo-card">
          <CardHeader data-testid="ocrdemo-cardheader">
            <Globe className="h-8 w-8 text-blue-600 mb-2" data-testid="ocrdemo-globe" />
            <CardTitle className="text-lg" data-testid="ocrdemo-t-demo-ocr-features-multilanguage">
              {t("demo.ocr.features.multiLanguage")}
            </CardTitle>
          </CardHeader>
          <CardContent data-testid="ocrdemo-cardcontent">
            <p className="text-sm text-gray-600">
              {t("demo.ocr.languageDescription")}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="ocrdemo-card">
          <CardHeader data-testid="ocrdemo-cardheader">
            <FileText className="h-8 w-8 text-purple-600 mb-2" data-testid="ocrdemo-filetext" />
            <CardTitle className="text-lg" data-testid="ocrdemo-t-demo-ocr-features-smartdetection">
              {t("demo.ocr.features.smartDetection")}
            </CardTitle>
          </CardHeader>
          <CardContent data-testid="ocrdemo-cardcontent">
            <p className="text-sm text-gray-600">
              {t("demo.ocr.detectionDescription")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Privacy notice */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>{t("demo.ocr.privacyNotice.local")}</p>
        <p>{t("demo.ocr.privacyNotice.ai")}</p>
      </div>
    </div>
  );
}
