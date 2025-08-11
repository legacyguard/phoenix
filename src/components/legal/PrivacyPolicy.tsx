import React from "react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation("wills");

  return (
    <div className="privacy-policy-page">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("privacyPolicy.title")}
          </h1>
          <p className="text-gray-600">
            {t("privacyPolicy.lastUpdated", { date: "January 15, 2024" })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("privacyPolicy.introduction")}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Information Collection */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("privacyPolicy.sections.informationCollection.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.sections.informationCollection.content")}
            </p>
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Information You Provide:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Account information (name, email, phone number)</li>
                <li>• Family and trusted circle member details</li>
                <li>• Asset and document information</li>
                <li>• Will and estate planning preferences</li>
                <li>• Communication preferences</li>
              </ul>
            </div>
          </section>

          {/* Information Use */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("privacyPolicy.sections.informationUse.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.sections.informationUse.content")}
            </p>
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How We Use Your Information:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Provide and maintain our family protection services</li>
                <li>• Process your requests and transactions</li>
                <li>• Send important notifications and updates</li>
                <li>• Improve our services and user experience</li>
                <li>• Ensure the security of your account</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("privacyPolicy.sections.informationSharing.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.sections.informationSharing.content")}
            </p>
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                When We May Share Information:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• With your explicit consent</li>
                <li>
                  • With designated family members or trusted individuals (as
                  you specify)
                </li>
                <li>• With service providers who assist in our operations</li>
                <li>• To comply with legal requirements or court orders</li>
                <li>• To protect our rights, property, or safety</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("privacyPolicy.sections.dataSecurity.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.sections.dataSecurity.content")}
            </p>
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Security Measures:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• End-to-end encryption for all sensitive data</li>
                <li>
                  • Zero-knowledge architecture (we cannot access your data)
                </li>
                <li>• Regular security audits and penetration testing</li>
                <li>• SOC 2 Type II compliance</li>
                <li>• Secure data centers with physical security</li>
                <li>• Employee background checks and security training</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("privacyPolicy.sections.yourRights.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacyPolicy.sections.yourRights.content")}
            </p>
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Your Rights Include:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Access your personal information</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your account and data</li>
                <li>• Export your data in standard formats</li>
                <li>• Opt out of marketing communications</li>
                <li>• Request information about data processing</li>
              </ul>
            </div>
          </section>
        </div>

        {/* GDPR and CCPA Compliance */}
        <div className="bg-blue-50 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            GDPR and CCPA Compliance
          </h3>
          <p className="text-gray-700 mb-4">
            LegacyGuard complies with the General Data Protection Regulation
            (GDPR) and the California Consumer Privacy Act (CCPA). We respect
            your privacy rights and provide you with control over your personal
            information.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                GDPR Rights (EU Users):
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Right to access and portability</li>
                <li>• Right to rectification</li>
                <li>• Right to erasure</li>
                <li>• Right to restrict processing</li>
                <li>• Right to data portability</li>
                <li>• Right to object</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                CCPA Rights (California Users):
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Right to know what data is collected</li>
                <li>• Right to know if data is sold or disclosed</li>
                <li>• Right to say no to the sale of data</li>
                <li>• Right to access your data</li>
                <li>• Right to equal service and price</li>
                <li>• Right to delete your data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy or want to
            exercise your rights, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p>Email: privacy@legacyguard.com</p>
            <p>Phone: 1-800-LEGACY-1</p>
            <p>
              Address: LegacyGuard, Inc., 123 Protection Way, Family Security,
              FS 12345
            </p>
            <p>Data Protection Officer: dpo@legacyguard.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
