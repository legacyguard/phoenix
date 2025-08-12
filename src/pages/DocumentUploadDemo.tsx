import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DocumentUploadFlow from "../components/DocumentUploadFlow";
import type { DocumentProcessingResult } from "../types/document-ai";

const DocumentUploadDemo: React.FC = () => {
  const { t } = useTranslation("ui-common");
  const [processedDocuments, setProcessedDocuments] = useState<
    DocumentProcessingResult[]
  >([]);

  // Mock data for existing possessions and trusted people
  const mockPossessions = [
    {
      id: "p1",
      name: t("demo.documentUpload.mockData.possessions.familyHome"),
      type: "home",
    },
    {
      id: "p2",
      name: t("demo.documentUpload.mockData.possessions.lakeCabin"),
      type: "home",
    },
    {
      id: "p3",
      name: t("demo.documentUpload.mockData.possessions.retirementAccount"),
      type: "savings",
    },
    {
      id: "p4",
      name: t("demo.documentUpload.mockData.possessions.emergencyFund"),
      type: "savings",
    },
    {
      id: "p5",
      name: t("demo.documentUpload.mockData.possessions.businessLLC"),
      type: "business",
    },
    {
      id: "p6",
      name: t("demo.documentUpload.mockData.possessions.vehicle"),
      type: "vehicle",
    },
  ];

  const mockTrustedPeople = [
    {
      id: "tp1",
      name: t("demo.documentUpload.mockData.trustedPeople.person1.name"),
      relationship: t(
        "demo.documentUpload.mockData.trustedPeople.person1.relationship",
      ),
    },
    {
      id: "tp2",
      name: t("demo.documentUpload.mockData.trustedPeople.person2.name"),
      relationship: t(
        "demo.documentUpload.mockData.trustedPeople.person2.relationship",
      ),
    },
    {
      id: "tp3",
      name: t("demo.documentUpload.mockData.trustedPeople.person3.name"),
      relationship: t(
        "demo.documentUpload.mockData.trustedPeople.person3.relationship",
      ),
    },
    {
      id: "tp4",
      name: t("demo.documentUpload.mockData.trustedPeople.person4.name"),
      relationship: t(
        "demo.documentUpload.mockData.trustedPeople.person4.relationship",
      ),
    },
  ];

  // Handler for when a document is processed
  const handleDocumentProcessed = (result: DocumentProcessingResult) => {
    setProcessedDocuments((prev) => [...prev, result]);

    // Here you would typically:
    // 1. Save the document to your backend
    // 2. Update the user's possession/document list
    // 3. Create the suggested links
    // 4. Navigate to document details or next step
  };

  // For demo purposes, use a placeholder API key
  // In production, this should come from a secure backend endpoint
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || "your-api-key-here";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("demo.documentUpload.title")}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {t("demo.documentUpload.description")}
          </p>
        </div>

        {/* Upload Flow Component */}
        <div className="mb-8">
          <DocumentUploadFlow
            apiKey={API_KEY}
            onDocumentProcessed={handleDocumentProcessed}
            existingPossessions={mockPossessions}
            trustedPeople={mockTrustedPeople} data-testid="documentuploaddemo-documentuploadflow"
          />
        </div>

        {/* Processed Documents List */}
        {processedDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("demo.documentUpload.recentlyProcessed", {
                count: processedDocuments.length,
              })}
            </h2>
            <div className="space-y-3">
              {processedDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {doc.classification.suggestedTitle ||
                          t("demo.documentUpload.untitledDocument")}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {doc.classification.category.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          doc.classification.confidence >= 0.8
                            ? "text-green-600"
                            : doc.classification.confidence >= 0.6
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {t("demo.documentUpload.confidence", {
                          percent: Math.round(
                            doc.classification.confidence * 100,
                          ),
                        })}
                      </span>
                      {doc.suggestions?.relatedPossessions &&
                        doc.suggestions.relatedPossessions.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t("demo.documentUpload.suggestedConnections", {
                              count: doc.suggestions.relatedPossessions.length,
                            })}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Guide */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📘 {t("demo.documentUpload.integrationGuide.title")}
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>{t("demo.documentUpload.integrationGuide.description")}</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>{t("demo.documentUpload.integrationGuide.step1")}</li>
              <li>{t("demo.documentUpload.integrationGuide.step2")}</li>
              <li>{t("demo.documentUpload.integrationGuide.step3")}</li>
              <li>{t("demo.documentUpload.integrationGuide.step4")}</li>
              <li>{t("demo.documentUpload.integrationGuide.step5")}</li>
            </ol>
            <p className="mt-3">
              {t("demo.documentUpload.integrationGuide.benefit")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadDemo;
