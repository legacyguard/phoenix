import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedProgress } from '@/components/ui/AnimatedProgress';
import { Heart, Users, Home, Building2, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  // Step 1: Life Situation
  hasSpouse: boolean;
  hasChildren: boolean;
  ownsBusiness: boolean;
  ownsRealEstate: boolean;
  
  // Step 2: Main Motivation
  mainMotivation: string;
  
  // Step 3: Trusted People
  trustedPeople: string;
}

const TOTAL_STEPS = 3;

export const EmotionalOnboarding: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    hasSpouse: false,
    hasChildren: false,
    ownsBusiness: false,
    ownsRealEstate: false,
    mainMotivation: '',
    trustedPeople: ''
  });

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save onboarding data to user metadata
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          onboardingComplete: true,
          onboardingData: formData
        }
      });

      // Set localStorage flag
      localStorage.setItem('firstTimeGuideShown', 'false');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Still redirect even if saving fails
      navigate('/dashboard');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // All checkboxes are optional
      case 2:
        return formData.mainMotivation.trim().length > 0;
      case 3:
        return formData.trustedPeople.trim().length > 0;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-card-foreground mb-2">
          To best guide you, tell us a little about your life.
        </h2>
        <p className="text-muted-foreground">
          These details help us personalize your experience and create a plan that fits your unique situation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="hasSpouse"
            checked={formData.hasSpouse}
            onCheckedChange={(checked) => handleInputChange('hasSpouse', checked)}
          />
          <label htmlFor="hasSpouse" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Do you have a spouse or partner?
          </label>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="hasChildren"
            checked={formData.hasChildren}
            onCheckedChange={(checked) => handleInputChange('hasChildren', checked)}
          />
          <label htmlFor="hasChildren" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Do you have children?
          </label>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="ownsBusiness"
            checked={formData.ownsBusiness}
            onCheckedChange={(checked) => handleInputChange('ownsBusiness', checked)}
          />
          <label htmlFor="ownsBusiness" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Do you own a business?
          </label>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="ownsRealEstate"
            checked={formData.ownsRealEstate}
            onCheckedChange={(checked) => handleInputChange('ownsRealEstate', checked)}
          />
          <label htmlFor="ownsRealEstate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Do you own real estate?
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-card-foreground mb-2">
          What is most important for you to preserve for your loved ones?
        </h2>
        <p className="text-muted-foreground">
          This can be anything from digital files, financial access, to personal messages or memories. 
          Your answer will help create your first 'Mission'.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="For example: Ensure my family has access to our finances, preserve our family photos, or maintain our business operations..."
          value={formData.mainMotivation}
          onChange={(e) => handleInputChange('mainMotivation', e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Take your time. This will become the foundation of your life inventory plan.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-card-foreground mb-2">
          Who are the key people in your life you trust implicitly?
        </h2>
        <p className="text-muted-foreground">
          Think of your spouse, children, or a close friend. These will form the foundation of your 'Trusted Circle'.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="List the names of people you trust completely. For example: Sarah (spouse), Michael (son), Emma (daughter), John (best friend)..."
          value={formData.trustedPeople}
          onChange={(e) => handleInputChange('trustedPeople', e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          These are the people who will help protect and manage your legacy when needed.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <AnimatedProgress
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        </div>

        {/* Main Content */}
        <Card className="w-full">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
          
          {/* Navigation */}
          <CardFooter className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === TOTAL_STEPS ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>Complete Setup</span>
                <Heart className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Encouragement */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            You're doing great! Each step brings you closer to peace of mind.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmotionalOnboarding;
