import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const { t } = useTranslation('subscription');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = ['essential', 'family', 'premium'];

  return (
    <div className="pricing-page">
      {/* Header Section */}
      <section className="header-section py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('header.title')}
          </h1>
          <p className="text-xl text-gray-700 mb-4">
            {t('header.subtitle')}
          </p>
          <p className="text-lg text-gray-600">
            {t('header.description')}
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="billing-toggle-section py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-2 text-sm text-green-600">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan}
                className={`relative bg-white rounded-lg shadow-lg border-2 p-8 ${
                  t('landing.${plan}.mostPopular') === 'true'
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-200'
                }`}
              >
                {t('landing.${plan}.mostPopular') === 'true' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {t('landing.pricing.mostPopular')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('landing.${plan}.name')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('landing.${plan}.description')}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingCycle === 'monthly' 
                        ? t('landing.${plan}.price')
                        : t('landing.${plan}.annualPrice')
                      }
                    </span>
                    <span className="text-gray-600 ml-2">
                      {billingCycle === 'monthly' 
                        ? t('landing.${plan}.period')
                        : '/year'
                      }
                    </span>
                  </div>
                  
                  {billingCycle === 'annual' && (
                    <p className="text-green-600 font-medium text-sm">
                      {t('landing.${plan}.annualSavings')}
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Features:</h4>
                  <ul className="space-y-3">
                    {t(`plans.${plan}.features`, { returnObjects: true }).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {t(`plans.${plan}.limitations`, { returnObjects: true }) && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Limitations:</h4>
                    <ul className="space-y-2">
                      {t(`plans.${plan}.limitations`, { returnObjects: true }).map((limitation: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {t('landing.${plan}.bestFor')}
                  </p>
                  <Link
                    to="/signup"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      t('landing.${plan}.mostPopular') === 'true'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {t('landing.${plan}.cta')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trial Section */}
      <section className="trial-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('trial.title')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('trial.subtitle')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included:</h3>
                <ul className="space-y-3 text-left">
                  {t('trial.features', { returnObjects: true }).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Started:</h3>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors inline-block mb-4"
                >
                  {t('trial.cta')}
                </Link>
                <p className="text-sm text-gray-600">
                  {t('trial.guarantee')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t('ui.title')}
            </h2>
            <p className="text-xl text-blue-100">
              {t('ui.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {t('security.features', { returnObjects: true }).map((feature: string, index: number) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-blue-100">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="support-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('support.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('support.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Essential Plan</h3>
              <ul className="space-y-3">
                {t('support.essential', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="text-gray-600">{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Family Plan</h3>
              <ul className="space-y-3">
                {t('support.family', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="text-gray-600">{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Premium Plan</h3>
              <ul className="space-y-3">
                {t('support.premium', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="text-gray-600">{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {t('faq.questions', { returnObjects: true }).map((faq: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Protect Your Family?
          </h2>
          <p className="text-xl mb-8">
            Start your free trial today and experience the peace of mind that comes with comprehensive family protection.
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PricingPage; 