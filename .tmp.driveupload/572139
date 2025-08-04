import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  Star,
  Quote,
  MapPin,
  Shield,
  Users,
  Heart,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle } from
'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  quote: string;
  highlight: string;
  rating: number;
  verified: boolean;
  imageUrl?: string;
}

export const FamilyTestimonials: React.FC = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics({ componentName: 'FamilyTestimonials' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = useMemo(() => [
    {
      id: 1,
      name: t('testimonials.stories.1.name'),
      role: t('testimonials.stories.1.role'),
      location: t('testimonials.stories.1.location'),
      quote: t('testimonials.stories.1.quote'),
      highlight: t('testimonials.stories.1.highlight'),
      rating: 5,
      verified: true
    },
    {
      id: 2,
      name: t('testimonials.stories.2.name'),
      role: t('testimonials.stories.2.role'),
      location: t('testimonials.stories.2.location'),
      quote: t('testimonials.stories.2.quote'),
      highlight: t('testimonials.stories.2.highlight'),
      rating: 5,
      verified: true
    },
    {
      id: 3,
      name: t('testimonials.stories.3.name'),
      role: t('testimonials.stories.3.role'),
      location: t('testimonials.stories.3.location'),
      quote: t('testimonials.stories.3.quote'),
      highlight: t('testimonials.stories.3.highlight'),
      rating: 5,
      verified: true
    }
  ], [t]);


  useEffect(() => {
     
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Track testimonial views
  useEffect(() => {
     
    trackAction('testimonial_viewed', {
      testimonialId: testimonials[currentIndex].id,
      name: testimonials[currentIndex].name,
      autoPlay: isAutoPlaying
    });
  }, [currentIndex, trackAction, isAutoPlaying, testimonials]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    const newIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    setCurrentIndex(newIndex);
    trackAction('testimonial_navigation', {
      direction: 'previous',
      testimonialId: testimonials[newIndex].id,
      name: testimonials[newIndex].name
    });
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    const newIndex = (currentIndex + 1) % testimonials.length;
    setCurrentIndex(newIndex);
    trackAction('testimonial_navigation', {
      direction: 'next',
      testimonialId: testimonials[newIndex].id,
      name: testimonials[newIndex].name
    });
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    trackAction('testimonial_navigation', {
      direction: 'dot',
      testimonialId: testimonials[index].id,
      name: testimonials[index].name
    });
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">{t('testimonials.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{t('testimonials.stats.families')}</p>
            <p className="text-sm text-muted-foreground">{t('testimonials.stats.familiesLabel')}</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{t('testimonials.stats.satisfaction')}</p>
            <p className="text-sm text-muted-foreground">{t('testimonials.stats.satisfactionLabel')}</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{t('testimonials.stats.stressReduction')}</p>
            <p className="text-sm text-muted-foreground">{t('testimonials.stats.stressReductionLabel')}</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{t('testimonials.stats.timeSaved')}</p>
            <p className="text-sm text-muted-foreground">{t('testimonials.stats.timeSavedLabel')}</p>
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}>

              {testimonials.map((testimonial) =>
              <div key={testimonial.id} className="w-full flex-shrink-0">
                  <Card className="mx-4">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <Quote className="h-8 w-8 text-primary/20" />
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) =>
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <blockquote className="text-lg leading-relaxed text-foreground">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      {testimonial.highlight &&
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <p className="text-sm font-medium text-primary">
                            {testimonial.highlight}
                          </p>
                        </div>
                    }

                      <div className="flex items-center justify-between pt-4">
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{testimonial.location}</span>
                          </div>
                        </div>
                        {testimonial.verified &&
                      <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t('testimonials.verified')}
                          </Badge>
                      }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12"
            onClick={handlePrevious}>

            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12"
            onClick={handleNext}>

            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) =>
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ?
              'w-8 bg-primary' :
              'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`
              }
              onClick={() => handleDotClick(index)} />

            )}
          </div>
        </div>

        {/* Authority Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">{t('testimonials.trustedBy')}</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('testimonials.authority.advisors')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('testimonials.authority.attorneys')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('testimonials.authority.counselors')}</span>
            </div>
          </div>
          
          {/* Compliance Badges */}
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="outline" className="text-xs">{t("landing.familyTestimonials._1")}
              {t('testimonials.compliance.gdpr')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              🔒 {t('testimonials.compliance.dataProtection')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✓ {t('testimonials.compliance.iso')}
            </Badge>
          </div>
        </div>
      </div>
    </section>);

};

export default FamilyTestimonials;