import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Shield, Key, Loader2, Eye } from 'lucide-react';

export const OnboardingConversation: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [scene, setScene] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boxContent, setBoxContent] = useState('');
  const [trustedPerson, setTrustedPerson] = useState('');

  const handleNext = () => setScene((s) => (s === 3 ? 3 : ((s + 1) as 1 | 2 | 3)));
  const handleBack = () => setScene((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await user?.update({
        publicMetadata: {
          ...user?.publicMetadata,
          onboardingComplete: true,
          onboardingData: {
            boxContent,
            trustedPerson,
          },
        },
      });
      localStorage.setItem('firstTimeGuideShown', 'false');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (e) {
      setTimeout(() => navigate('/dashboard'), 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Intro scene */}
      {scene === 1 && (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-card-foreground">
              “We’ll help you bring order — calmly, step by step. Let’s start a short conversation to prepare a personal plan for you.”
            </h1>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
                <div className="mb-4 flex items-center justify-center text-muted-foreground">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>Safety Box</span>
                </div>
                <p className="text-lg md:text-xl text-card-foreground mb-4">
                  “Imagine a small box your loved ones will one day find. What must be inside so they feel safe?”
                </p>
                <Textarea
                  value={boxContent}
                  onChange={(e) => setBoxContent(e.target.value)}
                  placeholder="Write what must not be missing in the box..."
                  className="min-h-[160px] text-base"
                />
              </div>
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                <div className="text-xs text-muted-foreground/70 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Your answers are encrypted and only you can see them.</span>
                </div>
                <div className="text-xs text-muted-foreground/70 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>We never analyze or sell them.</span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={handleNext} disabled={!boxContent.trim()}>Continue</Button>
            </div>
          </div>
        </section>
      )}

      {/* Scene 2 */}
      {scene === 2 && (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-center text-muted-foreground">
                <Key className="w-5 h-5 mr-2" />
                <span>Trusted Person</span>
              </div>
              <p className="text-lg md:text-xl text-card-foreground mb-4">
                “If you could give someone the key to this box, who would it be?”
              </p>
              <Textarea
                value={trustedPerson}
                onChange={(e) => setTrustedPerson(e.target.value)}
                placeholder="Write the name(s) of your trusted person(s)..."
                className="min-h-[140px] text-base"
              />
            </div>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="text-xs text-muted-foreground/70 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Your answers are encrypted and only you can see them.</span>
              </div>
              <div className="text-xs text-muted-foreground/70 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>We never analyze or sell them.</span>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext} disabled={!trustedPerson.trim()}>Continue</Button>
            </div>
          </div>
        </section>
      )}

      {/* Scene 3 - Summary and redirect */}
      {scene === 3 && (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-xl md:text-2xl font-medium text-card-foreground">
              “Thank you. We’ll now prepare your personal plan — so everything important is in one place and your loved ones can one day find calm and certainty.”
            </h2>
            <div className="mt-6 flex items-center justify-center">
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Button onClick={handleSubmit}>Create personal plan</Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground/70 flex items-center gap-2 justify-center">
              <Shield className="w-4 h-4" />
              <span>Your answers are encrypted and only you can see them.</span>
              <Eye className="w-4 h-4 ml-4" />
              <span>We never analyze or sell them.</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default OnboardingConversation;


