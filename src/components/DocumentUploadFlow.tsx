import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ClassificationResult,
  DocumentCategory,
  DocumentProcessingResult,
} from "../types/document-ai";
import { classifyDocumentFromBase64 } from "../functions/document-classifier";
import { useLocalOCR } from "@/hooks/useLocalOCR";
import { useUserSettings } from "@/hooks/useUserSettings";

interface DocumentUploadFlowProps {
  onDocumentProcessed?: (result: DocumentProcessingResult) => void;
  apiKey: string; // In production, this should come from a secure backend
  existingPossessions?: Array<{ id: string; name: string; type: string }>;
  trustedPeople?: Array<{ id: string; name: string; relationship: string }>;
}

type UploadStep =
  | "modeSelection"
  | "upload"
  | "analyzing"
  | "classified"
  | "extracting"
  | "linking"
  | "complete";

type ProcessingMode = "hybrid" | "local";

const DocumentUploadFlow: React.FC<DocumentUploadFlowProps> = ({
  onDocumentProcessed,
  apiKey,
  existingPossessions = [],
  trustedPeople = [],
}) => {
  const { t } = useTranslation("assets");
  const { defaultProcessingMode } = useUserSettings();
  const [currentStep, setCurrentStep] = useState<UploadStep>("modeSelection");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>(
    defaultProcessingMode,
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [classification, setClassification] =
    useState<ClassificationResult | null>(null);
  const [extractedData, setExtractedData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [suggestedLinks, setSuggestedLinks] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { processImage, isReady, progress, result: ocrResult } = useLocalOCR();

  // Step progress indicator
  const steps = [
    { id: "upload", label: "Upload Document", icon: "📤" },
    { id: "analyzing", label: "Analyzing", icon: "🔍" },
    { id: "classified", label: "Document Type", icon: "📋" },
    { id: "extracting", label: "Extracting Info", icon: "📝" },
    { id: "linking", label: "Finding Connections", icon: "🔗" },
    { id: "complete", label: "Complete", icon: "✅" },
  ];

  const getStepIndex = (step: UploadStep) =>
    steps.findIndex((s) => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  // Handle processing mode selection
  const handleModeSelect = (mode: ProcessingMode) => {
    setProcessingMode(mode);
    setCurrentStep("upload"); // Move to upload step after selecting mode
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError(t("common:documentUploader.please_upload_an_image_or_pdf__1"));
        return;
      }

      setUploadedFile(file);
      setError(null);

      if (processingMode === "local") {
        setCurrentStep("analyzing");
        try {
          // Perform local OCR processing
          const result = await processImage(file);
          if (result) {
            const metadata = { documentId: `doc_${Date.now()}` }; // Basic, local extraction
            setExtractedData(metadata);
            setCurrentStep("extracting");
            // Skipping linking stage due to local privacy
            setCurrentStep("complete");
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to process document locally",
          );
          setCurrentStep("upload");
        }
        return;
      }

      setCurrentStep("analyzing");

      try {
        if (processingMode === "hybrid") {
          // Step 1: Convert file to base64
          const base64 = await fileToBase64(file);

          // Step 2: Classify the document
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time
          const classificationResult = await classifyDocumentFromBase64(
            base64,
            file.type,
            apiKey,
          );

          setClassification(classificationResult);
          setCurrentStep("classified");

          // Step 3: Extract metadata (simulated for now)
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const metadata = await extractDocumentMetadata(
            classificationResult,
            base64,
          );
          setExtractedData(metadata);
          setCurrentStep("extracting");

          // Step 4: Find related items (simulated for now)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const links = await findRelatedItems(classificationResult, metadata);
          setSuggestedLinks(links);
          setCurrentStep("linking");

          // Step 5: Complete
          await new Promise((resolve) => setTimeout(resolve, 500));
          setCurrentStep("complete");
        }

        // Call parent callback if provided
        if (classification && onDocumentProcessed) {
          onDocumentProcessed({
            classification,
            extractedMetadata: extractedData || {},
            suggestions: suggestedLinks || {},
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to process document in ${processingMode} mode`,
        );
        setCurrentStep("upload");
      }
    },
    [
      apiKey,
      onDocumentProcessed,
      processImage,
      processingMode,
      classification,
      extractedData,
      findRelatedItems,
      suggestedLinks,
      t,
    ],
  );

  // Simulated metadata extraction
  const extractDocumentMetadata = async (
    classification: ClassificationResult,
    base64: string,
  ): Promise<Record<string, unknown>> => {
    // Simulate metadata extraction
    return {
      documentType: classification.category,
      confidence: classification.confidence,
      extractedText: "Sample extracted text...",
      metadata: {
        title: "Sample Document",
        date: new Date().toISOString(),
        author: "Unknown",
      },
    };
  };

  // Simulated relationship finding
  const findRelatedItems = useCallback(
    async (
      classification: ClassificationResult,
      metadata: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      const suggestions: Record<string, unknown> = {
        relatedPossessions: [],
        relatedPeople: [],
        relevantScenarios: [],
      };

      // Find related possessions based on document type
      if (
        classification.category === "property_deed" ||
        classification.category === "vehicle_title"
      ) {
        const relatedPossession = existingPossessions.find(
          (p) => p.type === "home" || p.type === "vehicle",
        );
        if (relatedPossession) {
          suggestions.relatedPossessions.push({
            possessionId: relatedPossession.id,
            possessionName: relatedPossession.name,
            confidence: 0.9,
            reasoning: "Document type matches possession category",
          });
        }
      }

      // Find related people
      if (
        classification.category === "insurance_policy" ||
        classification.category === "will_or_trust"
      ) {
        const spouse = trustedPeople.find(
          (p) =>
            p.relationship.toLowerCase() === "spouse" ||
            p.relationship.toLowerCase() === "wife",
        );
        if (spouse) {
          suggestions.relatedPeople.push({
            personId: spouse.id,
            personName: spouse.name,
            relationship: spouse.relationship,
            confidence: 0.8,
            reasoning: "Likely beneficiary based on document type",
          });
        }
      }

      // Determine relevant scenarios
      switch (classification.category) {
        case "insurance_policy":
        case "will_or_trust":
          suggestions.relevantScenarios.push({
            scenario: "sudden_passing",
            importance: "critical",
            reasoning: "Essential for family financial security",
          });
          break;
        case "medical_document":
          suggestions.relevantScenarios.push({
            scenario: "incapacitated",
            importance: "critical",
            reasoning: "Needed for medical decision making",
          });
          break;
        case "business_document":
          suggestions.relevantScenarios.push({
            scenario: "hospitalized",
            importance: "high",
            reasoning: "Business continuity planning",
          });
          break;
      }

      return suggestions;
    },
    [existingPossessions, trustedPeople],
  );

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect],
  );

  // Reset flow
  const resetFlow = () => {
    setCurrentStep("upload");
    setUploadedFile(null);
    setClassification(null);
    setExtractedData(null);
    setSuggestedLinks(null);
    setError(null);
  };

  return (
    <div className="p-4 md:p-6 font-sans max-w-screen-xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
        {t("documentUploader.smart_document_upload_2")}
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
        {t("documentUploadFlow.upload_any_document_and_watch__3")}
      </p>

      {/* Progress Steps */}
      <div className="mb-6 md:mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-fit px-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 ${
                  index <= currentStepIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <span className="text-sm md:text-lg">{step.icon}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-12 md:w-16 mx-1 md:mx-2 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 min-w-fit px-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="text-xs text-gray-600 text-center w-16 md:w-20"
            >
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Mode Selection */}
      {currentStep === "modeSelection" && (
        <div className="mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
            {t("documentUploadFlow.select_processing_mode_4")}
          </h3>
          <div className="space-y-3 md:space-y-4">
            <div
              onClick={() => handleModeSelect("hybrid")}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                processingMode === "hybrid"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      processingMode === "hybrid"
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-400"
                    }`}
                  >
                    {processingMode === "hybrid" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900">
                    {t("settings.privacySettings.hybrid_mode_recommended_5")}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {t("documentUploadFlow.combines_local_and_cloud_ai_fo_6")}
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleModeSelect("local")}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                processingMode === "local"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      processingMode === "local"
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-400"
                    }`}
                  >
                    {processingMode === "local" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900">
                    {t("settings.privacySettings.local_only_privacy_mode_7")}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {t("documentUploadFlow.processes_your_document_entire_8")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {t("documentUploadFlow.your_default_is_set_to_9")}
              <strong>
                {defaultProcessingMode === "hybrid"
                  ? "Hybrid Mode"
                  : "Local-Only Mode"}
              </strong>
            </p>
            <button
              onClick={() => setCurrentStep("upload")}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm md:text-base font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Upload Area - Show only on upload step */}
      {currentStep === "upload" && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            accept={t("documentUploader.image_application_pdf_4")}
            onChange={handleChange}
          />

          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox={t("documentUploader.0_0_48_48_5")}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={t("documentUploader.m24_12v12m0_0l_4_4m4_4l4_4m10__6")}
                />
              </svg>
            </div>
            <p className="text-sm md:text-base text-gray-700 font-medium mb-1">
              {t("documentUploader.drop_your_document_here_or_cli_7")}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {t("documentUploader.supports_images_and_pdfs_up_to_8")}
            </p>
          </label>
        </div>
      )}

      {/* Processing Status */}
      {currentStep !== "upload" &&
        currentStep !== "complete" &&
        currentStep !== "modeSelection" && (
          <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <div className="flex items-start mb-4">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mr-3 md:mr-4 flex-shrink-0"></div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">
                  {currentStep === "analyzing" && "Analyzing your document..."}
                  {currentStep === "classified" &&
                    "Identifying document type..."}
                  {currentStep === "extracting" &&
                    "Extracting key information..."}
                  {currentStep === "linking" && "Finding related items..."}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {currentStep === "analyzing" &&
                    "Our AI is examining the document structure and content"}
                  {currentStep === "classified" &&
                    `Document identified as: ${classification?.category.replace(/_/g, " ")}`}
                  {currentStep === "extracting" &&
                    "Reading important details from your document"}
                  {currentStep === "linking" &&
                    "Connecting to your existing possessions and people"}
                </p>
              </div>
            </div>

            {/* Show classification result during later steps */}
            {classification && currentStep !== "analyzing" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">
                  {t("documentUploader.document_type_11")}
                </p>
                <p className="font-semibold text-gray-900 capitalize">
                  {classification.category.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {classification.reasoning}
                </p>
              </div>
            )}
          </div>
        )}

      {/* Complete Status */}
      {currentStep === "complete" && classification && (
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="flex items-start mb-4">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full mr-3 md:mr-4 flex-shrink-0">
              <span className="text-xl md:text-2xl">✅</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                {t("documentUploadFlow.document_processing_complete_16")}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {t("documentUploadFlow.your_document_has_been_analyze_17")}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4 mt-6">
            {/* Document Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                {t("documentUploadFlow.document_information_18")}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("documentUploadFlow.type_19")}
                  </span>
                  <span className="font-medium capitalize">
                    {classification.category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("documentUploadFlow.suggested_title_20")}
                  </span>
                  <span className="font-medium">
                    {classification.suggestedTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("ai.documentUploadExample.confidence_7")}
                  </span>
                  <span className="font-medium">
                    {Math.round(classification.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted Data Preview */}
            {extractedData?.specificMetadata && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {t("documentUploadFlow.extracted_information_22")}
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {Object.entries(extractedData.specificMetadata)
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Suggested Links */}
            {suggestedLinks &&
              (suggestedLinks.relatedPossessions?.length > 0 ||
                suggestedLinks.relatedPeople?.length > 0) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    {t("documentUploadFlow.suggested_connections_23")}
                  </h4>
                  <div className="space-y-2 text-sm text-green-800">
                    {suggestedLinks.relatedPossessions?.map(
                      (item: Record<string, unknown>) => (
                        <div
                          key={item.possessionId}
                          className="flex items-center"
                        >
                          <span>🏠</span>
                          <span className="ml-2">
                            {t("documentUploadFlow.link_to_24")}
                            {item.possessionName}
                          </span>
                        </div>
                      ),
                    )}
                    {suggestedLinks.relatedPeople?.map(
                      (person: Record<string, unknown>) => (
                        <div
                          key={person.personId}
                          className="flex items-center"
                        >
                          <span>👤</span>
                          <span className="ml-2">
                            {t("documentUploadFlow.related_to_25")}
                            {person.personName} ({person.relationship})
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm md:text-base font-semibold rounded-md hover:bg-blue-700 transition-colors">
              {t("documentUploadFlow.save_document_26")}
            </button>
            <button
              onClick={resetFlow}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm md:text-base font-semibold rounded-md hover:bg-gray-50 transition-colors"
            >
              {t("documentUploadFlow.upload_another_27")}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={resetFlow}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            {t("documentUploadFlow.try_again_28")}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadFlow;
