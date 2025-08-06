import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingSection } from '@/components/landing/PricingSection';
import { ScenarioShowcase } from '@/components/landing/ScenarioShowcase';
import { FamilyPreparednessCalculator } from '@/components/landing/FamilyPreparednessCalculator';
import { FamilyTestimonials } from '@/components/landing/FamilyTestimonials';
import { 
  Shield, 
  Lock, 
  Users, 
  Cloud, 
  Heart, 
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  Infinity as InfinityIcon,
  Home,
  FileSearch,
  Navigation
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { t } = useTranslation('landing');
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-heritage text-primary-foreground py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            {/* Family count - social proof */}
            <p className="text-lg text-primary-foreground/80">
              {t('testimonials.title')}
            </p>
            
            {/* Urgency subtitle */}
            <p className="text-md text-primary-foreground/70 animate-pulse">
              {t('hero.urgencySubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                variant="cta" 
                size="xl"
                className="bg-background text-primary hover:bg-background/90"
              >
                <Link to="/register">
                  {t('hero.cta_primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="xl"
                className="bg-background/95 border-2 border-background text-foreground hover:bg-background hover:text-primary"
              >
                <Link to="/demo">
                  {t('hero.cta_secondary')}
                  <span className="block text-xs font-normal mt-1">
                    {t('hero.secondaryContext')}
                  </span>
                </Link>
              </Button>
            </div>
            
            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Shield className="h-4 w-4" />
                <span>{t('hero.trustSignals.dataOwnership')}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <span className="text-base">🇪🇺</span>
                <span>{t('hero.trustSignals.gdprCompliant')}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Heart className="h-4 w-4" />
                <span>{t('hero.trustSignals.europeanFamilies')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <ScenarioShowcase />

      {/* Testimonials Section */}
      <FamilyTestimonials />

      {/* Calculator Section */}
      <FamilyPreparednessCalculator />

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Sleep Better for You */}
            <Card variant="heritage" className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t('landing.sleepBetter.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.sleepBetter.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* No Chaos for Your Family */}
            <Card variant="earth" className="text-center">
              <CardHeader>
                <div className="mx-auto bg-earth-primary/10 p-4 rounded-full w-fit mb-4">
                  <Home className="h-10 w-10 text-earth-primary" />
                </div>
                <CardTitle className="text-2xl">{t('landing.noChaos.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.noChaos.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Clear Instructions for Everyone */}
            <Card variant="heritage" className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Navigation className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t('landing.clearInstructions.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.clearInstructions.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-warm text-background">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('cta.description')}
          </p>
          <Button 
            asChild
            size="xl"
            className="bg-background text-primary hover:bg-background/90 border-2 border-background font-semibold shadow-lg"
          >
            <Link to="/register">
              {t('cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;