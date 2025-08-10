import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation('legal');

  return (
    <div className="terms-of-service-page">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('termsOfService.title')}
          </h1>
          <div className="text-gray-600 space-y-2">
            <p>{t('termsOfService.lastUpdated', { date: 'January 15, 2024' })}</p>
            <p>{t('termsOfService.effectiveDate', { date: 'January 15, 2024' })}</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {t('termsOfService.introduction')}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('termsOfService.sections.acceptance.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('termsOfService.sections.acceptance.content')}
            </p>
          </section>

          {/* Service Description */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('termsOfService.sections.description.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('termsOfService.sections.description.content')}
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('termsOfService.sections.userResponsibilities.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('termsOfService.sections.userResponsibilities.content')}
            </p>
          </section>

          {/* Privacy and Data Protection */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('termsOfService.sections.privacy.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('termsOfService.sections.privacy.content')}
            </p>
          </section>

          {/* Limitations of Liability */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('termsOfService.sections.limitations.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('termsOfService.sections.limitations.content')}
            </p>
          </section>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p>Email: legal@legacyguard.com</p>
            <p>Phone: 1-800-LEGACY-1</p>
            <p>Address: LegacyGuard, Inc., 123 Protection Way, Family Security, FS 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 