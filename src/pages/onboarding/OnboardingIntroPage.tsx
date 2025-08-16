import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';

export const OnboardingIntroPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleStartOnboarding = () => {
    navigate('/onboarding/wizard');
  };

  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Welcome Header */}
        <div className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary/10 rounded-full">
              <Heart className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-card-foreground leading-tight">
            Welcome, <span className="text-primary">{userName}</span>.
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-card-foreground/80 leading-tight">
            Let's begin your life's inventory.
          </h2>
        </div>

        {/* Main Content */}
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Pain Point 1: Chaos and Uncertainty */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Understanding Your Concerns</span>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We know that thinking about the future can be overwhelming. You've worked hard to build your life, 
              and the thought of your loved ones navigating stress and confusion in a difficult time is a heavy burden. 
              <span className="text-card-foreground font-medium"> That's why we're here.</span>
            </p>
          </div>

          {/* Pain Point 2: Procrastination and Complexity */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Our Approach</span>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              In the next few minutes, we will guide you through a series of simple, human questions – 
              <span className="text-card-foreground font-medium"> not legal jargon</span>. There are no right or wrong answers. 
              This is not a test. It's a quiet moment for reflection, designed to help us understand what matters most to you.
            </p>
          </div>

          {/* Value Promise */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">What You'll Get</span>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your responses will allow us to create a personalized dashboard for you – 
              <span className="text-card-foreground font-medium"> a clear, simple overview of your life's inventory</span>. 
              It will show you, step-by-step, how to achieve complete peace of mind. 
              Your information is secure, private, and you are always in control.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-6 pt-8">
          <Button 
            onClick={handleStartOnboarding}
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>I'm ready. Let's start.</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
            This will take approximately 5-10 minutes. You can pause and continue at any time.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="pt-12 border-t border-border/20">
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs text-muted-foreground/60">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Your data, your control</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Built with care</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingIntroPage;
