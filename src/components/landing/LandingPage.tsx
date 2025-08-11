import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  const { t } = useTranslation("landing");

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t("hero.headline")}
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              {t("hero.subheadline")}
            </p>
            <p className="text-lg text-gray-600 mb-10">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                {t("hero.primaryCta")}
              </Link>
              <Link
                to="/how-it-works"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                {t("hero.secondaryCta")}
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t("hero.trustIndicator")}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t("hero.securityBadge")}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t("hero.noCommitment")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="problems-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("problems.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("problems.sectionSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-red-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-red-800 mb-4">
                {t("problems.problem1.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("problems.problem1.description")}
              </p>
              <p className="text-sm text-red-600 font-medium">
                {t("problems.problem1.impact")}
              </p>
            </div>

            <div className="bg-orange-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">
                {t("problems.problem2.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("problems.problem2.description")}
              </p>
              <p className="text-sm text-orange-600 font-medium">
                {t("problems.problem2.impact")}
              </p>
            </div>

            <div className="bg-purple-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-purple-800 mb-4">
                {t("problems.problem3.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("problems.problem3.description")}
              </p>
              <p className="text-sm text-purple-600 font-medium">
                {t("problems.problem3.impact")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("solution.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("solution.sectionSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("solution.feature1.title")}
              </h3>
              <p className="text-gray-700 mb-6">
                {t("solution.feature1.description")}
              </p>
              <ul className="space-y-2">
                {t("solution.feature1.benefits", { returnObjects: true }).map(
                  (benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("solution.feature2.title")}
              </h3>
              <p className="text-gray-700 mb-6">
                {t("solution.feature2.description")}
              </p>
              <ul className="space-y-2">
                {t("solution.feature2.benefits", { returnObjects: true }).map(
                  (benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("solution.feature3.title")}
              </h3>
              <p className="text-gray-700 mb-6">
                {t("solution.feature3.description")}
              </p>
              <ul className="space-y-2">
                {t("solution.feature3.benefits", { returnObjects: true }).map(
                  (benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("solution.feature4.title")}
              </h3>
              <p className="text-gray-700 mb-6">
                {t("solution.feature4.description")}
              </p>
              <ul className="space-y-2">
                {t("solution.feature4.benefits", { returnObjects: true }).map(
                  (benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("howItWorks.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("howItWorks.sectionSubtitle")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-start gap-6">
                  <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t(`howItWorks.step${step}.title`)}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {t(`howItWorks.step${step}.description`)}
                    </p>
                    <span className="text-sm text-blue-600 font-medium">
                      {t(`howItWorks.step${step}.timeframe`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("benefits.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("benefits.sectionSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((benefit) => (
              <div
                key={benefit}
                className="bg-white p-8 rounded-lg shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-blue-600">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(`benefits.benefit${benefit}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`benefits.benefit${benefit}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("testimonials.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("testimonials.sectionSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((testimonial) => (
              <div key={testimonial} className="bg-gray-50 p-8 rounded-lg">
                <p className="text-gray-700 mb-6 italic">
                  "{t(`testimonials.testimonial${testimonial}.quote`)}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {t(`testimonials.testimonial${testimonial}.author`)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t(`testimonials.testimonial${testimonial}.location`)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t(`testimonials.testimonial${testimonial}.situation`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t("ui.sectionTitle")}</h2>
            <p className="text-xl text-blue-100">{t("ui.sectionSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((feature) => (
              <div key={feature} className="text-center">
                <h3 className="text-xl font-semibold mb-4">
                  {t("ui.feature${feature}.title")}
                </h3>
                <p className="text-blue-100">
                  {t("ui.feature${feature}.description")}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-blue-100 mb-2">{t("ui.certifications")}</p>
            <p className="text-blue-200">{t("ui.compliance")}</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("faq.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-600">{t("faq.sectionSubtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[1, 2, 3, 4, 5].map((question) => (
              <div key={question} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t(`faq.question${question}.question`)}
                </h3>
                <p className="text-gray-700">
                  {t(`faq.question${question}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{t("cta.finalTitle")}</h2>
          <p className="text-xl mb-6">{t("cta.finalSubtitle")}</p>
          <p className="text-lg mb-10 text-blue-100">
            {t("cta.finalDescription")}
          </p>

          <Link
            to="/signup"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors inline-block mb-8"
          >
            {t("cta.startTrial")}
          </Link>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-100">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {t("cta.noCredit")}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {t("cta.fullAccess")}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {t("cta.supportIncluded")}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
