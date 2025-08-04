import React from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar } from 'lucide-react';
import { API_URLS } from '@/utils/constants';

const Help: React.FC = () => {
  const { t } = useTranslation('ui');

  const faqItems = [
    {
      id: 'q1',
      question: t('helpPage.faq.q1.question'),
      answer: t('helpPage.faq.q1.answer'),
    },
    {
      id: 'q2',
      question: t('helpPage.faq.q2.question'),
      answer: t('helpPage.faq.q2.answer'),
    },
    {
      id: 'q3',
      question: t('helpPage.faq.q3.question'),
      answer: t('helpPage.faq.q3.answer'),
    },
    {
      id: 'q4',
      question: t('helpPage.faq.q4.question'),
      answer: t('helpPage.faq.q4.answer'),
    },
    {
      id: 'q5',
      question: t('helpPage.faq.q5.question'),
      answer: t('helpPage.faq.q5.answer'),
    },
  ];

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@legacyguard.com';
  };

  const handleScheduleClick = () => {
    window.open(API_URLS.support, '_blank');
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-3">
          {t('helpPage.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('helpPage.subtitle')}
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-primary mb-6">
          {t('helpPage.faq.title')}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-b border-border">
              <AccordionTrigger className="text-left hover:no-underline py-5">
                <span className="text-base font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-primary mb-2">
          {t('helpPage.contact.title')}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="heritage" className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('helpPage.contact.email.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                {t('helpPage.contact.email.description')}
              </p>
              <Button 
                onClick={handleEmailClick}
                className="w-full"
                variant="default"
              >
                {t('helpPage.contact.email.button')}
              </Button>
            </CardContent>
          </Card>

          <Card variant="heritage" className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('helpPage.contact.call.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                {t('helpPage.contact.call.description')}
              </p>
              <Button 
                onClick={handleScheduleClick}
                className="w-full"
                variant="outline"
              >
                {t('helpPage.contact.call.button')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;

