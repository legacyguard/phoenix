import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle2, 
  Heart,
  Plane,
  Calendar,
  FileText,
  Phone,
  Users,
  ArrowRight
} from 'lucide-react';

export const ScenarioShowcase: React.FC = () => {
  const { t } = useTranslation();

  const scenarios = [
    {
      icon: Heart,
      title: t('scenarios.hospitalStay.title'),
      before: {
        situation: t('scenarios.hospitalStay.before.situation'),
        emotion: t('scenarios.hospitalStay.before.emotion'),
        consequence: t('scenarios.hospitalStay.before.consequence')
      },
      after: {
        situation: t('scenarios.hospitalStay.after.situation'),
        emotion: t('scenarios.hospitalStay.after.emotion'),
        benefit: t('scenarios.hospitalStay.after.benefit')
      }
    },
    {
      icon: Plane,
      title: t('scenarios.businessTrip.title'),
      before: {
        situation: t('scenarios.businessTrip.before.situation'),
        emotion: t('scenarios.businessTrip.before.emotion'),
        consequence: t('scenarios.businessTrip.before.consequence')
      },
      after: {
        situation: t('scenarios.businessTrip.after.situation'),
        emotion: t('scenarios.businessTrip.after.emotion'),
        benefit: t('scenarios.businessTrip.after.benefit')
      }
    },
    {
      icon: Calendar,
      title: t('scenarios.suddenLoss.title'),
      before: {
        situation: t('scenarios.suddenLoss.before.situation'),
        emotion: t('scenarios.suddenLoss.before.emotion'),
        consequence: t('scenarios.suddenLoss.before.consequence')
      },
      after: {
        situation: t('scenarios.suddenLoss.after.situation'),
        emotion: t('scenarios.suddenLoss.after.emotion'),
        benefit: t('scenarios.suddenLoss.after.benefit')
      }
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('scenarios.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('scenarios.subtitle')}
          </p>
        </div>

        <div className="space-y-12 max-w-6xl mx-auto">
          {scenarios.map((scenario, index) => (
            <Card key={index} className="overflow-hidden shadow-lg">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <scenario.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">{scenario.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  {/* Before - Without LegacyGuard */}
                  <div className="p-8 bg-red-50/50">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-red-900">
                        {t('scenarios.labels.before')}
                      </h3>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        {scenario.before.situation}
                      </p>
                      <div className="bg-red-100/50 rounded-lg p-4 border border-red-200">
                        <p className="text-sm italic text-red-800">
                          <strong>{t('scenarios.labels.feeling')}:</strong> {scenario.before.emotion}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-red-700">
                        {scenario.before.consequence}
                      </p>
                    </div>
                  </div>

                  {/* After - With LegacyGuard */}
                  <div className="p-8 bg-green-50/50">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-green-900">
                        {t('scenarios.labels.after')}
                      </h3>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        {scenario.after.situation}
                      </p>
                      <div className="bg-green-100/50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm italic text-green-800">
                          <strong>{t('scenarios.labels.feeling')}:</strong> {scenario.after.emotion}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-green-700">
                        {scenario.after.benefit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial footer */}
                <div className="bg-muted/50 px-8 py-4 border-t">
                  <p className="text-sm text-center text-muted-foreground italic">
                    {t(`scenarios.testimonials.${index + 1}`)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button 
            variant="default" 
            size="lg"
            className="animate-pulse"
            asChild
          >
            <a href="/register">
              {t('scenarios.bottomCta.primary')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            asChild
          >
            <a href="/register">
              {t('scenarios.bottomCta.secondary')}
            </a>
          </Button>
        </div>

        {/* Urgency Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground italic">
            {t('scenarios.bottomCta.urgency')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ScenarioShowcase;
