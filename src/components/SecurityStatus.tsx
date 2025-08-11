import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Shield, Home, Key, Server, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SecurityFeature {
  title: string;
  icon: React.ReactNode;
  explanation: string;
  analogy: string;
  familyBenefit: string;
}

const SecurityStatus: React.FC = () => {
  const { t } = useTranslation("ui-common");
  const securityFeatures: SecurityFeature[] = [
    {
      title: t("securityStatus.features.endToEndEncryption"),
      icon: <Lock className="w-8 h-8 text-blue-600" />,
      explanation: t("securityStatus.explanations.endToEndEncryption"),
      analogy: t("securityStatus.analogies.endToEndEncryption"),
      familyBenefit: t("securityStatus.familyBenefits.endToEndEncryption"),
    },
    {
      title: t("securityStatus.features.secureCloudStorage"),
      icon: <Shield className="w-8 h-8 text-green-600" />,
      explanation: t("securityStatus.explanations.secureCloudStorage"),
      analogy: t("securityStatus.analogies.secureCloudStorage"),
      familyBenefit: t("securityStatus.familyBenefits.secureCloudStorage"),
    },
    {
      title: t("securityStatus.features.localOnlyPrivacyMode"),
      icon: <Home className="w-8 h-8 text-purple-600" />,
      explanation: t("securityStatus.explanations.localOnlyPrivacyMode"),
      analogy: t("securityStatus.analogies.localOnlyPrivacyMode"),
      familyBenefit: t("securityStatus.familyBenefits.localOnlyPrivacyMode"),
    },
    {
      title: t("securityStatus.features.multiFactorAuthentication"),
      icon: <Key className="w-8 h-8 text-orange-600" />,
      explanation: t("securityStatus.explanations.multiFactorAuthentication"),
      analogy: t("securityStatus.analogies.multiFactorAuthentication"),
      familyBenefit: t(
        "securityStatus.familyBenefits.multiFactorAuthentication",
      ),
    },
    {
      title: t("securityStatus.features.europeanDataCenters"),
      icon: <Server className="w-8 h-8 text-indigo-600" />,
      explanation: t("securityStatus.explanations.europeanDataCenters"),
      analogy: t("securityStatus.analogies.europeanDataCenters"),
      familyBenefit: t("securityStatus.familyBenefits.europeanDataCenters"),
    },
    {
      title: t("securityStatus.features.zeroKnowledgeArchitecture"),
      icon: <Eye className="w-8 h-8 text-red-600 opacity-50 relative" />,
      explanation: t("securityStatus.explanations.zeroKnowledgeArchitecture"),
      analogy: t("securityStatus.analogies.zeroKnowledgeArchitecture"),
      familyBenefit: t(
        "securityStatus.familyBenefits.zeroKnowledgeArchitecture",
      ),
    },
  ];

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-800">
        {t("securityStatus.howWeProtectYourLegacy")}
      </h2>
      <p className="text-gray-600 mt-1">
        {t("securityStatus.yourTrustIsOurHighestPriority")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {securityFeatures.map((feature, index) => (
          <Card
            key={index}
            className="flex flex-col hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {feature.explanation}
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-gray-600 italic">
                  "{feature.analogy}"
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-green-50 px-4 py-3 rounded-b-lg">
              <p className="text-sm">
                <span className="font-semibold text-green-800">
                  {t("securityStatus.forYourFamily")}
                </span>{" "}
                <span className="text-green-700">{feature.familyBenefit}</span>
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Overall Security Status */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("securityStatus.yourSecurityStatusFullyProtected")}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {t("securityStatus.allSecurityFeaturesAreActive")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatus;
