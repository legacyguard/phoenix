import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield, Heart, Clock, Users, FileText, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const RespectfulLanding: React.FC = () => {
  const { t } = useTranslation(['landing', 'onboarding']);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const benefits = [
    { icon: Shield, key: 'security' },
    { icon: Heart, key: 'family' },
    { icon: Clock, key: 'time' },
    { icon: Users, key: 'support' },
    { icon: FileText, key: 'documents' },
    { icon: Lock, key: 'privacy' }
  ];

  const steps = [
    { progress: 20, key: 'assess' },
    { progress: 40, key: 'organize' },
    { progress: 60, key: 'designate' },
    { progress: 80, key: 'document' },
    { progress: 100, key: 'maintain' }
  ];

  return (
    <div className="respectful-landing">
      {/* Hero Section - Warm and Supportive */}
      <section className="hero-section bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  {t('landing:hero.trustIndicator')}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('landing:hero.headline')}
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
                {t('landing:hero.subheadline')}
              </p>

              {/* Supporting Text */}
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
                {t('landing:hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/signup"
                  className="group bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {t('landing:hero.primaryCta')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demo"
                  className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 font-medium py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('landing:hero.secondaryCta')}
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t('landing:hero.noCommitment')}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t('landing:hero.securityBadge')}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t('onboarding:respectful.landing.trustSignals.professionalSupport')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Section - Empathetic */}
      <section className="understanding-section py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('onboarding:respectful.landing.understanding.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('onboarding:respectful.landing.understanding.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {['concern1', 'concern2', 'concern3'].map((concern, index) => (
              <div 
                key={concern} 
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">
                  {index === 0 ? '🤝' : index === 1 ? '💭' : '🌟'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t(`onboarding:respectful.landing.understanding.${concern}.title`)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(`onboarding:respectful.landing.understanding.${concern}.description`)}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {t(`onboarding:respectful.landing.understanding.${concern}.approach`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help Section - Clear Steps */}
      <section className="how-we-help-section py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('onboarding:respectful.landing.process.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('onboarding:respectful.landing.process.subtitle')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t(`onboarding:respectful.landing.process.${step.key}.title`)}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t(`onboarding:respectful.landing.process.${step.key}.description`)}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-blue-600 font-medium">
                        {t(`onboarding:respectful.landing.process.${step.key}.time`)}
                      </span>
                      <div className="flex-grow bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Value-Focused */}
      <section className="benefits-section py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('onboarding:respectful.landing.benefits.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('onboarding:respectful.landing.benefits.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={benefit.key}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`onboarding:respectful.landing.benefits.${benefit.key}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t(`onboarding:respectful.landing.benefits.${benefit.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Real Stories */}
      <section className="testimonials-section py-16 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('onboarding:respectful.landing.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('onboarding:respectful.landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <div className="relative">
                {['story1', 'story2', 'story3'].map((story, index) => (
                  <div
                    key={story}
                    className={`transition-opacity duration-500 ${
                      activeTestimonial === index ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                  >
                    <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic">
                      "{t(`onboarding:respectful.landing.testimonials.${story}.quote`)}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {t(`onboarding:respectful.landing.testimonials.${story}.author`)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t(`onboarding:respectful.landing.testimonials.${story}.context`)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial Navigation */}
              <div className="flex justify-center gap-2 mt-8">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeTestimonial === index 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="security-section py-16 md:py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('onboarding:respectful.landing.security.title')}
            </h2>
            <p className="text-xl text-gray-300">
              {t('onboarding:respectful.landing.security.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {['encryption', 'privacy', 'compliance', 'control'].map((feature) => (
              <div key={feature} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`onboarding:respectful.landing.security.${feature}.title`)}
                </h3>
                <p className="text-sm text-gray-400">
                  {t(`onboarding:respectful.landing.security.${feature}.description`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400">
              {t('onboarding:respectful.landing.security.certifications')}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Supportive Close */}
      <section className="final-cta-section py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('onboarding:respectful.landing.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              {t('onboarding:respectful.landing.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t('onboarding:respectful.landing.cta.primaryButton')}
              </Link>
              <Link
                to="/consultation"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium py-4 px-8 rounded-lg text-lg transition-all duration-200"
              >
                {t('onboarding:respectful.landing.cta.secondaryButton')}
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('onboarding:respectful.landing.cta.promise1')}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('onboarding:respectful.landing.cta.promise2')}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('onboarding:respectful.landing.cta.promise3')}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RespectfulLanding;
