import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Shield, Eye } from 'lucide-react';

export const OnboardingIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowScrollHint(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => navigate('/onboarding/wizard');

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/30">
      {/* Hero - minimalist, centered */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-card-foreground">
            “Each of us has things in life we don’t want to leave to chance.”
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground/90">
            “Documents, memories, contacts — small pieces of certainty for our loved ones.”
          </p>

          {showScrollHint && (
            <div className="mt-16 flex items-center justify-center animate-bounce text-muted-foreground/70">
              <ChevronDown className="w-7 h-7" aria-hidden="true" />
              <span className="sr-only">Scroll down</span>
            </div>
          )}
        </div>
      </section>

      {/* Story Cards */}
      <section className="min-h-[80vh] px-6 py-16 flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-card-foreground text-base md:text-lg leading-relaxed">
                “Your partner needs to find the insurance policy but doesn’t know where it is.”
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-card-foreground text-base md:text-lg leading-relaxed">
                “One day your child will need to know what you wanted to tell them.”
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-card-foreground text-base md:text-lg leading-relaxed">
                “Your parents will appreciate a clear list of contacts and tasks.”
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <Button onClick={handleStart} size="lg" className="text-base md:text-lg">
              <span>Begin calmly, step by step</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs md:text-sm text-muted-foreground/80">
              It takes 3–5 minutes. Your answers stay on your device.
            </p>
          </div>
        </div>

        {/* Trust cues */}
        <div className="mt-14 text-xs text-muted-foreground/70 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Your answers are encrypted and only you can see them.</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>We never analyze or sell them.</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardingIntroPage;
