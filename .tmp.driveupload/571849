import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Cookie, BarChart3, Globe, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConsentSettings } from '@/components/privacy/ConsentManager';

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const cookieCategories = [
    {
      icon: Shield,
      title: t('cookies.policy.necessary.title'),
      description: t('cookies.policy.necessary.description'),
      purpose: t('cookies.policy.necessary.purpose'),
      examples: [
        { name: 'auth_token', duration: '7 days', description: t('cookies.policy.necessary.examples.auth') },
        { name: 'session_id', duration: 'Session', description: t('cookies.policy.necessary.examples.session') },
        { name: 'security_csrf', duration: '1 hour', description: t('cookies.policy.necessary.examples.csrf') },
        { name: 'consent_preferences', duration: '1 year', description: t('cookies.policy.necessary.examples.consent') }
      ],
      required: true,
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: t('cookies.policy.analytics.title'),
      description: t('cookies.policy.analytics.description'),
      purpose: t('cookies.policy.analytics.purpose'),
      examples: [
        { name: '_ga', duration: '2 years', description: t('cookies.policy.analytics.examples.ga') },
        { name: '_gid', duration: '24 hours', description: t('cookies.policy.analytics.examples.gid') },
        { name: 'analytics_session', duration: '30 minutes', description: t('cookies.policy.analytics.examples.session') }
      ],
      required: false,
      color: 'text-blue-600'
    },
    {
      icon: Globe,
      title: t('cookies.policy.marketing.title'),
      description: t('cookies.policy.marketing.description'),
      purpose: t('cookies.policy.marketing.purpose'),
      examples: [
        { name: 'fbp', duration: '3 months', description: t('cookies.policy.marketing.examples.facebook') },
        { name: '_gcl_au', duration: '3 months', description: t('cookies.policy.marketing.examples.google') }
      ],
      required: false,
      color: 'text-purple-600'
    },
    {
      icon: Cookie,
      title: t('cookies.policy.preferences.title'),
      description: t('cookies.policy.preferences.description'),
      purpose: t('cookies.policy.preferences.purpose'),
      examples: [
        { name: 'theme_preference', duration: '1 year', description: t('cookies.policy.preferences.examples.theme') },
        { name: 'language', duration: '1 year', description: t('cookies.policy.preferences.examples.language') },
        { name: 'ui_settings', duration: '1 year', description: t('cookies.policy.preferences.examples.ui') }
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
          {t('common.back')}
        </Button>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">{t('cookies.policy.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('cookies.policy.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('cookies.policy.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span>{t('cookies.policy.overview.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>{t('cookies.policy.overview.intro')}</p>
              <ul className="space-y-2">
                <li>{t('cookies.policy.overview.point1')}</li>
                <li>{t('cookies.policy.overview.point2')}</li>
                <li>{t('cookies.policy.overview.point3')}</li>
                <li>{t('cookies.policy.overview.point4')}</li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('cookies.policy.categories.title')}</h2>
            
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
                            {t('cookies.policy.required')}
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
                    <h4 className="font-medium mb-2">{t('cookies.policy.purpose')}:</h4>
                    <p className="text-sm text-muted-foreground">{category.purpose}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('cookies.policy.examples')}:</h4>
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
              <CardTitle>{t('cookies.policy.yourRights.title')}</CardTitle>
              <CardDescription>
                {t('cookies.policy.yourRights.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('cookies.policy.yourRights.right1')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('cookies.policy.yourRights.right2')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('cookies.policy.yourRights.right3')}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">{t('cookies.policy.yourRights.right4')}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('cookies.policy.manage.title')}</h2>
            <ConsentSettings />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('cookies.policy.contact.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{t('cookies.policy.contact.description')}</p>
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>{t('cookies.policy.contact.email')}:</strong>{' '}
                  <a href="mailto:privacy@legacyguard.app" className="text-primary hover:underline">
                    privacy@legacyguard.app
                  </a>
                </p>
                <p className="text-sm">
                  <strong>{t('cookies.policy.contact.address')}:</strong>{' '}
                  {t('cookies.policy.contact.addressDetails')}
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
