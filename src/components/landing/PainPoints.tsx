import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Lock, Clock } from 'lucide-react';

export const PainPoints: React.FC = () => {
  const { t } = useTranslation('landing');

  const worries = [
    {
      icon: HelpCircle,
      key: 'worry1',
      color: 'text-warm-primary'
    },
    {
      icon: Lock,
      key: 'worry2',
      color: 'text-earth-primary'
    },
    {
      icon: Clock,
      key: 'worry3',
      color: 'text-primary'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('painPoints.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('painPoints.sectionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {worries.map(({ icon: Icon, key, color }) => (
            <Card key={key} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className={`${color} mb-4`}>
                  <Icon className="h-10 w-10" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground">
                  {t(`painPoints.${key}.title`)}
                </h3>
                
                <p className="text-muted-foreground">
                  {t(`painPoints.${key}.description`)}
                </p>
                
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-primary">
                    {t(`painPoints.${key}.solution`)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
