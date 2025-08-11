import React, { useState, useCallback } from 'react';
import type { ClassificationResult, DocumentCategory } from '../types/document-ai';
import { classifyDocumentFromBase64 } from '../functions/document-classifier';import type { useTranslation } from "react-i18next";

interface DocumentUploaderProps {
  onDocumentProcessed?: (result: ClassificationResult, file: File) => void;
  apiKey: string; // In production, this should come from a secure backend
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed, apiKey }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Category descriptions for user understanding
  const categoryDescriptions: Record<DocumentCategory, string> = {
    insurance_policy: t('documentUploader.categoryDescriptions.insurance_policy'),
    property_deed: t('documentUploader.categoryDescriptions.property_deed'),
    vehicle_title: t('documentUploader.categoryDescriptions.vehicle_title'),
    bank_statement: t('documentUploader.categoryDescriptions.bank_statement'),
    investment_statement: t('documentUploader.categoryDescriptions.investment_statement'),
    will_or_trust: t('documentUploader.categoryDescriptions.will_or_trust'),
    business_document: t('documentUploader.categoryDescriptions.business_document'),
    personal_id: t('documentUploader.categoryDescriptions.personal_id'),
    tax_document: t('documentUploader.categoryDescriptions.tax_document'),
    medical_document: t('documentUploader.categoryDescriptions.medical_document'),
    other: t('documentUploader.categoryDescriptions.other')
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError(t("documentUploader.errors.fileTypeError"));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Classify the document
      const classification = await classifyDocumentFromBase64(
        base64,
        file.type,
        apiKey
      );

      setResult(classification);

      // Call parent callback if provided
      if (onDocumentProcessed) {
        onDocumentProcessed(classification, file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('documentUploader.errors.processingError'));
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, onDocumentProcessed]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
     
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
     
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("documentUploader.smart_document_upload_2")}</h2>
      <p className="text-gray-600 mb-6">{t("documentUploader.upload_any_document_and_our_ai_3")}

      </p>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ?
        'border-blue-500 bg-blue-50' :
        'border-gray-300 hover:border-gray-400'}`
        }
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}>

        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept={t("documentUploader.image_application_pdf_4")}
          onChange={handleChange}
          disabled={isProcessing} />

        <label
          htmlFor="file-upload"
          className="cursor-pointer">

          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox={t("documentUploader.0_0_48_48_5")}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={t("documentUploader.m24_12v12m0_0l_4_4m4_4l4_4m10__6")} />

            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-1">{t("documentUploader.drop_your_document_here_or_cli_7")}

          </p>
          <p className="text-sm text-gray-500">{t("documentUploader.supports_images_and_pdfs_up_to_8")}

          </p>
        </label>
      </div>

      {/* Processing Indicator */}
      {isProcessing &&
      <div className="mt-6 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-700">{t("ai.documentUploadExample.analyzing_your_document_5")}</p>
          </div>
        </div>
      }

      {/* Error Message */}
      {error &&
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      }

      {/* Classification Result */}
      {result &&
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("documentUploader.document_analysis_complete_10")}</h3>
          
          <div className="space-y-4">
            {/* Document Type */}
            <div>
              <p className="text-sm font-medium text-gray-600">{t("documentUploader.document_type_11")}</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {result.category.replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {categoryDescriptions[result.category]}
              </p>
            </div>

            {/* Suggested Title */}
            {result.suggestedTitle &&
          <div>
                <p className="text-sm font-medium text-gray-600">{t("documentUploader.suggested_title_12")}</p>
                <p className="text-gray-900">{result.suggestedTitle}</p>
              </div>
          }

            {/* Confidence Score */}
            <div>
              <p className="text-sm font-medium text-gray-600">{t('documentUploader.confidence')}</p>
              <div className="flex items-center mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                  className={`h-2 rounded-full ${
                  result.confidence >= 0.8 ?
                  'bg-green-500' :
                  result.confidence >= 0.6 ?
                  'bg-yellow-500' :
                  'bg-red-500'}`
                  }
                  style={{ width: `${result.confidence * 100}%` }} />

                </div>
                <span className={`text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* AI Reasoning */}
            <div>
              <p className="text-sm font-medium text-gray-600">{t("documentUploader.ai_analysis_13")}</p>
              <p className="text-sm text-gray-700 mt-1">{result.reasoning}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors">{t("documentUploader.continue_with_this_classificat_14")}

          </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors">{t("documentUploader.change_category_15")}

          </button>
          </div>
        </div>
      }

      {/* Supported Documents Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">{t("documentUploader.documents_we_can_process_16")}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
          <div>{t("documentUploader.insurance_policies_life_health_17")}</div>
          <div>{t("documentUploader.property_deeds_and_titles_18")}</div>
          <div>{t("documentUploader.vehicle_ownership_documents_19")}</div>
          <div>{t("documentUploader.bank_and_investment_statements_20")}</div>
          <div>{t("documentUploader.wills_and_estate_planning_docu_21")}</div>
          <div>{t("documentUploader.business_contracts_and_ownersh_22")}</div>
          <div>{t("documentUploader.personal_identification_docume_23")}</div>
          <div>{t("documentUploader.tax_returns_and_documents_24")}</div>
        </div>
      </div>
    </div>);

};

export default DocumentUploader;