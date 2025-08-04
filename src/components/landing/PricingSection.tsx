import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { stripeService } from '@/services/stripeService';

export const PricingSection: React.FC = () => {
  const { t } = useTranslation('ui');

  const plans = [
  {
    id: 'starter',
    name: t('pricing.starter.name'),
    price: t('pricing.starter.price'),
    period: '',
    description: t('pricing.starter.description'),
    features: [
    t('pricing.starter.features.storage', { amount: t('pricing.starter.limits.storage') }),
    t('pricing.starter.features.guardians', { count: t('pricing.starter.limits.guardians') }),
    t('pricing.starter.features.documents'),
    t('pricing.starter.features.playbook'),
    t('pricing.starter.features.support')],

    buttonText: t('pricing.starter.button'),
    buttonLink: '/register',
    highlighted: false
  },
  {
    id: 'premium',
    name: t('pricing.premium.name'),
    price: t('pricing.premium.price'),
    period: t('pricing.premium.period'),
    description: t('pricing.premium.description'),
    features: [
    t('pricing.premium.features.storage', { amount: t('pricing.premium.limits.storage') }),
    t('pricing.premium.features.guardians', { count: t('pricing.premium.limits.guardians') }),
    t('pricing.premium.features.manual'),
    t('pricing.premium.features.support')],

    buttonText: t('pricing.premium.button'),
    buttonLink: '/register',
    highlighted: true,
    badge: t('pricing.premium.badge')
  },
  {
    id: 'enterprise',
    name: t('pricing.enterprise.name'),
    price: t('pricing.enterprise.price'),
    period: '',
    description: t('pricing.enterprise.description'),
    features: [
    t('pricing.enterprise.features.storage', { amount: t('pricing.enterprise.limits.storage') }),
    t('pricing.enterprise.features.guardians'),
    t('pricing.enterprise.features.legal'),
    t('pricing.enterprise.features.support')],

    buttonText: t('pricing.enterprise.button'),
    buttonLink: 'mailto:sales@legacyguard.com',
    highlighted: false
  }];


  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {t('pricing.mainTitle')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('pricing.mainSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) =>
          <Card
            key={plan.id}
            className={`relative flex flex-col ${
            plan.highlighted ?
            'border-primary shadow-lg scale-105' :
            'border-border'}`
            }>

              {plan.badge &&
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
            }
              
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period &&
                <span className="text-lg text-muted-foreground">{plan.period}</span>
                }
                </div>
              </CardHeader>

              <CardContent className="flex-1 px-6 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) =>
                <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                )}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col items-stretch px-6 pb-6 gap-2">
                {plan.id === 'enterprise' ?
              <a href={plan.buttonLink} className="w-full">
                    <Button
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                  className="w-full">

                      {plan.buttonText}
                    </Button>
                  </a> :

              <>
                    <Link to={plan.buttonLink} className="w-full">
                      <Button
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                    className="w-full">

                        {plan.buttonText}
                      </Button>
                    </Link>
                    {plan.id === 'premium' &&
                <Button
                  onClick={() => stripeService.createCheckoutSession(plan.id, 'user-id')}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                  className="w-full">{t("landing.pricingSection.upgrade_with_stripe_1")}


                </Button>
                }
                  </>
              }
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </section>);

};

export default PricingSection;