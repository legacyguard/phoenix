import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Cookie, BarChart3, Globe, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConsentSettings } from '@/components/privacy/ConsentManager';

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation('ui');
  const navigate = useNavigate();

  const cookieCategories = [
    {
      icon: Shield,
      title: t('wills.policy.necessary.title'),
      description: t('wills.policy.necessary.description'),
      purpose: t('wills.policy.necessary.purpose'),
      examples: [
        { name: 'auth_token', duration: t('wills.policy.duration.days', { count: 7 }), description: t('wills.policy.necessary.examples.auth') },
        { name: 'session_id', duration: t('wills.policy.duration.session'), description: t('wills.policy.necessary.examples.session') },
        { name: 'security_csrf', duration: t('wills.policy.duration.hours', { count: 1 }), description: t('wills.policy.necessary.examples.csrf') },
        { name: 'consent_preferences', duration: t('wills.policy.duration.years', { count: 1 }), description: t('wills.policy.necessary.examples.consent') }
      ],
      required: true,
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: t('wills.policy.analytics.title'),
      description: t('wills.policy.analytics.description'),
      purpose: t('wills.policy.analytics.purpose'),
      examples: [
        { name: '_ga', duration: t('wills.policy.duration.years', { count: 2 }), description: t('wills.policy.analytics.examples.ga') },
        { name: '_gid', duration: t('wills.policy.duration.hours', { count: 24 }), description: t('wills.policy.analytics.examples.gid') },
        { name: 'analytics_session', duration: t('wills.policy.duration.minutes', { count: 30 }), description: t('wills.policy.analytics.examples.session') }
      ],
      required: false,
      color: 'text-blue-600'
    },
    {
      icon: Globe,
      title: t('wills.policy.marketing.title'),
      description: t('wills.policy.marketing.description'),
      purpose: t('wills.policy.marketing.purpose'),
      examples: [
        { name: 'fbp', duration: t('wills.policy.duration.months', { count: 3 }), description: t('wills.policy.marketing.examples.facebook') },
        { name: '_gcl_au', duration: t('wills.policy.duration.months', { count: 3 }), description: t('wills.policy.marketing.examples.google') }
      ],
      required: false,
      color: 'text-purple-600'
    },
    {
      icon: Cookie,
      title: t('wills.policy.preferences.title'),
      description: t('wills.policy.preferences.description'),
      purpose: t('wills.policy.preferences.purpose'),
      examples: [
        { name: 'theme_preference', duration: t('wills.policy.duration.years', { count: 1 }), description: t('wills.policy.preferences.examples.theme') },
        { name: 'language', duration: t('wills.policy.duration.years', { count: 1 }), description: t('wills.policy.preferences.examples.language') },
        { name: 'ui_settings', duration: t('wills.policy.duration.years', { count: 1 }), description: t('wills.policy.preferences.examples.ui') }
      ],
      required: false,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('ui.back')}
        </Button>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">{t('wills.policy.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('wills.policy.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('wills.policy.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span>{t('wills.policy.overview.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>{t('wills.policy.overview.intro')}</p>
              <ul className="space-y-2">
                <li>{t('wills.policy.overview.point1')}</li>
                <li>{t('wills.policy.overview.point2')}</li>
                <li>{t('wills.policy.overview.point3')}</li>
                <li>{t('wills.policy.overview.point4')}</li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('wills.policy.categories.title')}</h2>
            
            {cookieCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        {category.required && (
                          <Badge variant="secondary" className="mt-1">
                            {t('wills.policy.required')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('wills.policy.purpose')}:</h4>
                    <p className="text-sm text-muted-foreground">{category.purpose}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('wills.policy.examples')}:</h4>
                    <div className="space-y-2">
                      {category.examples.map((example, idx) => (
                        <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <code className="text-sm font-mono">{example.name}</code>
                              <p className="text-xs text-muted-foreground mt-1">
                                {example.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {example.duration}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>{t('wills.policy.yourRights.title')}</CardTitle>
              <CardDescription>
                {t('wills.policy.yourRights.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('wills.policy.yourRights.right1')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('wills.policy.yourRights.right2')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('wills.policy.yourRights.right3')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('wills.policy.yourRights.right4')}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('wills.policy.manage.title')}</h2>
            <ConsentSettings />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('wills.policy.contact.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{t('wills.policy.contact.description')}</p>
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>{t('wills.policy.contact.email')}:</strong>{' '}
                  <a href="mailto:privacy@legacyguard.app" className="text-primary hover:underline">
                    privacy@legacyguard.app
                  </a>
                </p>
                <p className="text-sm">
                  <strong>{t('wills.policy.contact.address')}:</strong>{' '}
                  {t('wills.policy.contact.addressDetails')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
