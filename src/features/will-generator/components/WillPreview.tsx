import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  Printer,
  AlertCircle,
  CheckCircle2,
  Scale,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import type { WillContent, WillRequirements } from "@/types/will";
import LegalConsultationModal from "@/components/LegalConsultationModal";
import jsPDF from "jspdf";

interface WillPreviewProps {
  willContent: WillContent;
  requirements: WillRequirements;
  countryCode: string;
  onGenerate: () => void;
}

export function WillPreview({
  willContent,
  requirements,
  countryCode,
  onGenerate,
}: WillPreviewProps) {
  const { t } = useTranslation("wills");
  const [showLegalConsultation, setShowLegalConsultation] = useState(false);

  const formatWillText = (template: string, data: Record<string, unknown>) => {
    return template
      .replace("{name}", data.name || "")
      .replace("{birthDate}", data.birthDate || "")
      .replace("{address}", data.address || "");
  };

  const renderRequirements = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("wills.preview.legalRequirements")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {requirements.requires_handwriting ? (
              <>
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  {t("wills.requirements.handwriting")}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">{t("wills.requirements.typed")}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {t("wills.requirements.witnesses")}:
            </span>
            <Badge variant="secondary">{requirements.witness_count}</Badge>
          </div>

          {requirements.requires_notarization && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                {t("wills.requirements.notarization")}
              </span>
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-2">
            {requirements.signature_requirements}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWillContent = () => {
    const lang = requirements.legal_language;

    return (
      <div className="space-y-6 font-serif">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center">{lang.title}</h2>

        {/* Identity clause */}
        <p>
          {formatWillText(lang.identity, willContent.testator)}
          {lang.soundMind && `, ${lang.soundMind}`},
        </p>

        {/* Revocation clause */}
        <p>{lang.revocation}</p>

        {/* Beneficiaries */}
        <div className="space-y-4">
          <p className="font-medium">{lang.beneficiaries}:</p>
          {willContent.beneficiaries.map((beneficiary, index) => (
            <div key={beneficiary.id} className="ml-4">
              <p>
                {index + 1}. {beneficiary.name} ({beneficiary.relationship})
                {beneficiary.identification &&
                  ` - ${beneficiary.identification}`}
              </p>
              {beneficiary.allocation.map((alloc, aIndex) => (
                <p key={aIndex} className="ml-4 text-sm">
                  {alloc.assetType === "percentage"
                    ? `- ${alloc.value}% ${t("wills.preview.ofEstate")}`
                    : `- ${alloc.description}`}
                </p>
              ))}
              {beneficiary.alternativeBeneficiary && (
                <p className="ml-4 text-sm italic">
                  {t("wills.preview.alternative")}:{" "}
                  {beneficiary.alternativeBeneficiary}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Executor */}
        {willContent.executor && (
          <div className="space-y-2">
            <p className="font-medium">{t("wills.preview.executor")}:</p>
            <p className="ml-4">
              {willContent.executor.name} ({willContent.executor.relationship})
              <br />
              {willContent.executor.address}
              {willContent.executor.phone && (
                <>
                  <br />
                  {willContent.executor.phone}
                </>
              )}
            </p>
            {willContent.executor.alternativeExecutor && (
              <div className="ml-4 mt-2">
                <p className="text-sm italic">
                  {t("wills.preview.alternativeExecutor")}:
                </p>
                <p className="text-sm">
                  {willContent.executor.alternativeExecutor.name}(
                  {willContent.executor.alternativeExecutor.relationship})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Date and signature lines */}
        <div className="mt-12 space-y-8">
          <div className="flex justify-between">
            <div>
              <p>
                {lang.date}
                {t("wills.willPreview._2")}
              </p>
            </div>
            <div>
              <p>
                {t("wills.preview.place")}
                {t("wills.willPreview._2")}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p>_________________________________</p>
            <p className="text-sm">{lang.signature}</p>
          </div>

          {/* Witness signatures */}
          {requirements.witness_count > 0 && (
            <div className="space-y-6 mt-12 pt-6 border-t">
              <p className="font-medium">{t("wills.preview.witnesses")}:</p>
              {Array.from({ length: requirements.witness_count }).map(
                (_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-8">
                    <div>
                      <p>
                        {lang.witness} {index + 1}:
                      </p>
                      <p className="mt-4">_________________________________</p>
                      <p className="text-sm">{t("wills.preview.name")}</p>
                      <p className="mt-2">_________________________________</p>
                      <p className="text-sm">{t("wills.preview.signature")}</p>
                    </div>
                    <div>
                      <p>&nbsp;</p>
                      <p className="mt-4">_________________________________</p>
                      <p className="text-sm">{t("wills.preview.address")}</p>
                      <p className="mt-2">_________________________________</p>
                      <p className="text-sm">{t("wills.preview.date")}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Legal requirements reminder */}
      {renderRequirements()}

      {/* Will preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("wills.preview.title")}</CardTitle>
          <CardDescription>{t("wills.preview.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-8 rounded-lg border min-h-[600px]">
            {renderWillContent()}
          </div>
        </CardContent>
      </Card>

      {/* Critical Execution Instructions Alert */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900 dark:text-amber-200">
          <strong className="font-semibold">
            {t("wills.willPreview.critical_execution_instruction_3")}
          </strong>
          <br />
          {requirements.signature_requirements}
        </AlertDescription>
      </Alert>

      {/* Legal Review Offer Section */}
      <Card className="border-earth-primary/20 bg-earth-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-earth-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-earth-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {t("will.legalReview.title", "Ensure Complete Confidence")}
                <Badge variant="secondary" className="text-xs">
                  {t("wills.willPreview.professional_review_4")}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {t(
                  "will.legalReview.description",
                  `While this template is designed to be legally compliant in ${countryCode}, every family's situation is unique. For a one-time fee, a legal expert from our partner law firm can personally review your generated will and answer any specific questions you have.`,
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>
                {t("wills.willPreview.provided_by_certified_legal_pa_5")}
                {countryCode}
              </span>
            </div>
            <Button
              onClick={() => setShowLegalConsultation(true)}
              className="bg-earth-primary hover:bg-earth-primary/90"
            >
              <Scale className="mr-2 h-4 w-4" />
              {t("will.legalReview.button", "Request a Legal Review")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          {t("wills.preview.print")}
        </Button>
        <Button onClick={onGenerate}>
          <Download className="mr-2 h-4 w-4" />
          {t("wills.preview.generatePDF")}
        </Button>
      </div>

      {/* Legal Consultation Modal */}
      {showLegalConsultation && (
        <LegalConsultationModal
          isOpen={showLegalConsultation}
          onClose={() => setShowLegalConsultation(false)}
          preselectedType="will_review"
          contextData={{
            countryCode,
            documentType: "will",
            generatedDate: new Date().toISOString(),
          }}
        />
      )}
    </div>
  );
}
