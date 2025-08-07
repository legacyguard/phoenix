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
import { PainPoints } from '@/components/landing/PainPoints';
import { EmotionalValidation } from '@/components/landing/EmotionalValidation';
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
      <section className="relative bg-gradient-to-br from-warm-light via-background to-primary/5 text-foreground py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            {/* Trust indicator */}
            <p className="text-sm font-medium text-muted-foreground">
              {t('hero.trustIndicator')}
            </p>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
              {t('hero.headline')}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {t('hero.subheadline')}
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild
                variant="default" 
                size="xl"
                className="bg-warm-primary hover:bg-warm-primary/90 text-white shadow-lg"
              >
                <Link to="/register">
                  {t('hero.primaryCta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="xl"
                className="border-2 hover:bg-muted"
              >
                <Link to="/demo">
                  {t('hero.secondaryCta')}
                  <span className="block text-xs font-normal mt-1">
                    {t('hero.secondaryContext')}
                  </span>
                </Link>
              </Button>
            </div>
            
            {/* No commitment message */}
            <p className="text-sm text-muted-foreground">
              {t('hero.noCommitment')}
            </p>
            
            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{t('hero.trustSignals.dataOwnership')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>{t('hero.trustSignals.gdprCompliant')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{t('hero.trustSignals.europeanFamilies')}</span>
              </div>
            </div>
            
            {/* Security badge */}
            <p className="text-xs text-muted-foreground">
              {t('hero.securityBadge')}
            </p>
          </div>
        </div>
      </section>

      {/* Pain Points Section */>
      <PainPoints />

      {/* Emotional Validation Section */}
      <EmotionalValidation />

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
              {t('features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Sleep Better for You */}
            <Card variant="heritage" className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t('features.sleepBetter.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('features.sleepBetter.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* No Chaos for Your Family */}
            <Card variant="earth" className="text-center">
              <CardHeader>
                <div className="mx-auto bg-earth-primary/10 p-4 rounded-full w-fit mb-4">
                  <Home className="h-10 w-10 text-earth-primary" />
                </div>
                <CardTitle className="text-2xl">{t('features.noChaos.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('features.noChaos.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Clear Instructions for Everyone */}
            <Card variant="heritage" className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Navigation className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t('features.clearInstructions.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('features.clearInstructions.description')}
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
            {t('cta.finalTitle')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('cta.finalDescription')}
          </p>
          <Button 
            asChild
            size="xl"
            className="bg-background text-primary hover:bg-background/90 border-2 border-background font-semibold shadow-lg"
          >
            <Link to="/register">
              {t('hero.primaryCta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;