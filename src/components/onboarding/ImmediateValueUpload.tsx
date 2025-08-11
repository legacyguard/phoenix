import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ArrowRight,
  Lock,
  Eye,
  Download,
  Sparkles,
  Heart,
  Home,
  Briefcase,
  CreditCard,
  FileCheck,
  Users,
} from "lucide-react";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  category: DocumentCategory;
  importance: "critical" | "important" | "reference";
  insights?: DocumentInsight[];
  suggestedActions?: string[];
}

interface DocumentInsight {
  type: "expiration" | "renewal" | "missing_info" | "security" | "family_share";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: string;
}

type DocumentCategory =
  | "identity"
  | "financial"
  | "property"
  | "insurance"
  | "legal"
  | "medical"
  | "family"
  | "other";

interface ImmediateValueUploadProps {
  onComplete?: (documents: UploadedDocument[]) => void;
  onSkip?: () => void;
  maxDocuments?: number;
  showOnboarding?: boolean;
}

const ImmediateValueUpload: React.FC<ImmediateValueUploadProps> = ({
  onComplete,
  onSkip,
  maxDocuments = 3,
  showOnboarding = true,
}) => {
  const { t } = useTranslation("onboarding");
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<File | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategory | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document categories with icons and colors
  const categories: Array<{
    id: DocumentCategory;
    label: string;
    icon: React.ReactNode;
    color: string;
    examples: string[];
  }> = [
    {
      id: "identity",
      label: t("onboarding:respectful.upload.categories.identity"),
      icon: <Users className="w-5 h-5" />,
      color: "blue",
      examples: ["Passport", "Driver's License", "Birth Certificate"],
    },
    {
      id: "financial",
      label: t("onboarding:respectful.upload.categories.financial"),
      icon: <CreditCard className="w-5 h-5" />,
      color: "green",
      examples: ["Bank Statements", "Investment Accounts", "Tax Returns"],
    },
    {
      id: "property",
      label: t("onboarding:respectful.upload.categories.property"),
      icon: <Home className="w-5 h-5" />,
      color: "purple",
      examples: ["Deeds", "Titles", "Mortgages"],
    },
    {
      id: "insurance",
      label: t("onboarding:respectful.upload.categories.insurance"),
      icon: <Shield className="w-5 h-5" />,
      color: "orange",
      examples: ["Life Insurance", "Health Insurance", "Home Insurance"],
    },
    {
      id: "legal",
      label: t("onboarding:respectful.upload.categories.legal"),
      icon: <FileCheck className="w-5 h-5" />,
      color: "red",
      examples: ["Will", "Power of Attorney", "Trust Documents"],
    },
    {
      id: "medical",
      label: t("onboarding:respectful.upload.categories.medical"),
      icon: <Heart className="w-5 h-5" />,
      color: "pink",
      examples: ["Medical Records", "Prescriptions", "Insurance Cards"],
    },
    {
      id: "family",
      label: t("onboarding:respectful.upload.categories.family"),
      icon: <Users className="w-5 h-5" />,
      color: "indigo",
      examples: [
        "Marriage Certificate",
        "Adoption Papers",
        "Custody Agreements",
      ],
    },
    {
      id: "other",
      label: t("onboarding:respectful.upload.categories.other"),
      icon: <FileText className="w-5 h-5" />,
      color: "gray",
      examples: ["Contracts", "Warranties", "Other Documents"],
    },
  ];

  // Generate insights based on document type
  const generateInsights = (
    file: File,
    category: DocumentCategory,
  ): DocumentInsight[] => {
    const insights: DocumentInsight[] = [];

    // Category-specific insights
    switch (category) {
      case "identity":
        insights.push({
          type: "expiration",
          title: t("onboarding:respectful.upload.insights.checkExpiration"),
          description: t(
            "onboarding:respectful.upload.insights.identityExpiration",
          ),
          priority: "medium",
          action: t("onboarding:respectful.upload.insights.setReminder"),
        });
        break;

      case "insurance":
        insights.push({
          type: "renewal",
          title: t("onboarding:respectful.upload.insights.renewalNeeded"),
          description: t(
            "onboarding:respectful.upload.insights.insuranceReview",
          ),
          priority: "high",
          action: t("onboarding:respectful.upload.insights.reviewCoverage"),
        });
        insights.push({
          type: "family_share",
          title: t("onboarding:respectful.upload.insights.shareBeneficiary"),
          description: t(
            "onboarding:respectful.upload.insights.beneficiaryAccess",
          ),
          priority: "medium",
          action: t("onboarding:respectful.upload.insights.addBeneficiary"),
        });
        break;

      case "legal":
        insights.push({
          type: "security",
          title: t("onboarding:respectful.upload.insights.highSecurity"),
          description: t(
            "onboarding:respectful.upload.insights.legalProtection",
          ),
          priority: "high",
          action: t("onboarding:respectful.upload.insights.enableEncryption"),
        });
        insights.push({
          type: "family_share",
          title: t("onboarding:respectful.upload.insights.executorAccess"),
          description: t("onboarding:respectful.upload.insights.executorNeeds"),
          priority: "high",
          action: t("onboarding:respectful.upload.insights.designateExecutor"),
        });
        break;

      case "financial":
        insights.push({
          type: "security",
          title: t("onboarding:respectful.upload.insights.financialSecurity"),
          description: t(
            "onboarding:respectful.upload.insights.protectFinancial",
          ),
          priority: "high",
          action: t("onboarding:respectful.upload.insights.enableTwoFactor"),
        });
        break;

      case "property":
        insights.push({
          type: "missing_info",
          title: t("onboarding:respectful.upload.insights.propertyDetails"),
          description: t(
            "onboarding:respectful.upload.insights.addPropertyInfo",
          ),
          priority: "low",
          action: t("onboarding:respectful.upload.insights.completeDetails"),
        });
        break;

      default:
        insights.push({
          type: "security",
          title: t("onboarding:respectful.upload.insights.documentSecured"),
          description: t("onboarding:respectful.upload.insights.safelyStored"),
          priority: "low",
        });
    }

    return insights;
  };

  // Generate suggested actions based on document
  const generateSuggestedActions = (category: DocumentCategory): string[] => {
    const baseActions = [
      t("onboarding:respectful.upload.actions.addDescription"),
      t("onboarding:respectful.upload.actions.setAccessPermissions"),
    ];

    const categoryActions: Record<DocumentCategory, string[]> = {
      identity: [
        t("onboarding:respectful.upload.actions.setExpirationReminder"),
        t("onboarding:respectful.upload.actions.addEmergencyContact"),
      ],
      financial: [
        t("onboarding:respectful.upload.actions.linkAccounts"),
        t("onboarding:respectful.upload.actions.addAccountNumbers"),
      ],
      property: [
        t("onboarding:respectful.upload.actions.addPropertyValue"),
        t("onboarding:respectful.upload.actions.linkInsurance"),
      ],
      insurance: [
        t("onboarding:respectful.upload.actions.addBeneficiaries"),
        t("onboarding:respectful.upload.actions.setPremiumReminder"),
      ],
      legal: [
        t("onboarding:respectful.upload.actions.designateExecutor"),
        t("onboarding:respectful.upload.actions.addWitnesses"),
      ],
      medical: [
        t("onboarding:respectful.upload.actions.addEmergencyContacts"),
        t("onboarding:respectful.upload.actions.listMedications"),
      ],
      family: [
        t("onboarding:respectful.upload.actions.addFamilyMembers"),
        t("onboarding:respectful.upload.actions.setSharing"),
      ],
      other: baseActions,
    };

    return [...baseActions, ...(categoryActions[category] || [])];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  const processFile = useCallback(
    async (file: File) => {
      // Check if we've reached the document limit
      if (uploadedDocuments.length >= maxDocuments) {
        return;
      }

      setCurrentDocument(file);
      setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      setIsProcessing(true);

      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        setShowInsights(true);
      }, 1500);
    },
    [uploadedDocuments.length, maxDocuments],
  );

  const handleCategorySelect = (category: DocumentCategory) => {
    setSelectedCategory(category);
  };

  const handleConfirmUpload = () => {
    if (!currentDocument || !selectedCategory) return;

    const newDocument: UploadedDocument = {
      id: `doc-${Date.now()}`,
      name: documentName || currentDocument.name,
      type: currentDocument.type,
      size: currentDocument.size,
      uploadedAt: new Date(),
      category: selectedCategory,
      importance:
        selectedCategory === "legal" || selectedCategory === "insurance"
          ? "critical"
          : "important",
      insights: generateInsights(currentDocument, selectedCategory),
      suggestedActions: generateSuggestedActions(selectedCategory),
    };

    setUploadedDocuments((prev) => [...prev, newDocument]);
    setShowSuccess(true);

    // Reset after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentDocument(null);
      setSelectedCategory(null);
      setDocumentName("");
      setShowInsights(false);
    }, 2000);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(uploadedDocuments);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Save progress to localStorage
  useEffect(() => {
    if (uploadedDocuments.length > 0) {
      localStorage.setItem(
        "immediateValueDocuments",
        JSON.stringify(uploadedDocuments),
      );
    }
  }, [uploadedDocuments]);

  return (
    <div className="immediate-value-upload max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t("respectful.upload.instantValue")}
          </span>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t("respectful.upload.title")}
        </h2>
        <p className="text-xl text-gray-600 mb-2">
          {t("respectful.upload.subtitle")}
        </p>
        <p className="text-gray-500">{t("respectful.upload.description")}</p>
      </div>

      {/* Progress Indicator */}
      {uploadedDocuments.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {t("respectful.upload.progress", {
                current: uploadedDocuments.length,
                total: maxDocuments,
              })}
            </span>
            {onSkip && uploadedDocuments.length > 0 && (
              <button
                onClick={handleComplete}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("respectful.upload.continueWithThese")}
              </button>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(uploadedDocuments.length / maxDocuments) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Upload Area */}
      {!showInsights ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Zone */}
          <div className="order-2 md:order-1">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }
                ${uploadedDocuments.length >= maxDocuments ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() =>
                uploadedDocuments.length < maxDocuments &&
                fileInputRef.current?.click()
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                disabled={uploadedDocuments.length >= maxDocuments}
              />

              {isProcessing ? (
                <div className="py-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {t("respectful.upload.processing")}
                  </p>
                </div>
              ) : showSuccess ? (
                <div className="py-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-green-600 font-medium">
                    {t("respectful.upload.success")}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isDragging
                      ? t("onboarding:respectful.upload.dropHere")
                      : t("onboarding:respectful.upload.dragOrClick")}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("respectful.upload.supportedFormats")}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>{t("respectful.upload.encrypted")}</span>
                  </div>
                </>
              )}
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t("respectful.upload.uploadedDocuments")}
                </h3>
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div
                      className={`p-2 rounded-lg bg-${getCategoryColor(doc.category)}-100`}
                    >
                      <FileText
                        className={`w-5 h-5 text-${getCategoryColor(doc.category)}-600`}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900 text-sm">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {categories.find((c) => c.id === doc.category)?.label} •{" "}
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Benefits and Trust Signals */}
          <div className="order-1 md:order-2">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("respectful.upload.whyUpload")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white rounded-lg p-2 mt-1">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("respectful.upload.benefit1.title")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("respectful.upload.benefit1.description")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white rounded-lg p-2 mt-1">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("respectful.upload.benefit2.title")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("respectful.upload.benefit2.description")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white rounded-lg p-2 mt-1">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("respectful.upload.benefit3.title")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("respectful.upload.benefit3.description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Example Documents */}
              <div className="mt-6 pt-6 border-t border-blue-100">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {t("respectful.upload.exampleDocuments")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Insurance Policy",
                    "Will",
                    "Property Deed",
                    "Bank Statement",
                  ].map((example) => (
                    <div
                      key={example}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t("respectful.upload.security.title")}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {t("respectful.upload.security.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Document Insights and Categorization */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="text-lg font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder={t("respectful.upload.documentName")}
                />
                <p className="text-sm text-gray-500">
                  {currentDocument && formatFileSize(currentDocument.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowInsights(false);
                setCurrentDocument(null);
                setSelectedCategory(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t("respectful.upload.selectCategory")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200
                    ${
                      selectedCategory === category.id
                        ? `border-${category.color}-500 bg-${category.color}-50`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }
                  `}
                >
                  <div className={`text-${category.color}-600 mb-2`}>
                    {category.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {category.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Insights and Actions */}
          {selectedCategory && (
            <div className="space-y-4">
              {/* Smart Insights */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  {t("respectful.upload.smartInsights")}
                </h3>
                <div className="space-y-2">
                  {generateInsights(currentDocument!, selectedCategory).map(
                    (insight, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 flex items-start gap-3"
                      >
                        <Info
                          className={`w-5 h-5 mt-0.5 text-${getPriorityColor(insight.priority)}-600`}
                        />
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900 text-sm">
                            {insight.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                              {insight.action} →
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Suggested Next Steps */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {t("respectful.upload.suggestedActions")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {generateSuggestedActions(selectedCategory)
                    .slice(0, 3)
                    .map((action, index) => (
                      <button
                        key={index}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleConfirmUpload}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  {t("respectful.upload.secureDocument")}
                </button>
                <button
                  onClick={() => {
                    setShowInsights(false);
                    setSelectedCategory(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("respectful.upload.changeCAtegory")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip or Continue */}
      {showOnboarding && (
        <div className="mt-8 flex items-center justify-between">
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              {t("respectful.upload.skipForNow")}
            </button>
          )}

          {uploadedDocuments.length >= maxDocuments && (
            <button
              onClick={handleComplete}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {t("respectful.upload.continue")}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          {t("respectful.upload.helperText")}
        </p>
      </div>
    </div>
  );
};

// Helper function to get category color
const getCategoryColor = (category: DocumentCategory): string => {
  const colors: Record<DocumentCategory, string> = {
    identity: "blue",
    financial: "green",
    property: "purple",
    insurance: "orange",
    legal: "red",
    medical: "pink",
    family: "indigo",
    other: "gray",
  };
  return colors[category] || "gray";
};

// Helper function to get priority color
const getPriorityColor = (priority: "high" | "medium" | "low"): string => {
  const colors = {
    high: "red",
    medium: "yellow",
    low: "green",
  };
  return colors[priority];
};

export default ImmediateValueUpload;
