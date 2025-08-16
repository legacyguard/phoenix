import React from 'react';
import { WillWizard } from '@/features/will-generator/components/WillWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Shield, 
  Info,
  ArrowLeft,
  Scale,
  Heart,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WillGeneratorPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Scale className="h-10 w-10 text-primary" />
            Create Your Will
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take control of your legacy with our step-by-step will generator. 
            We'll guide you through each decision to create a comprehensive last will and testament.
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <Alert className="border-primary/20 bg-primary/5 max-w-4xl mx-auto">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Legal Notice:</strong> This tool helps you create a basic will template. 
          For complex estates or specific legal requirements, we recommend consulting with 
          an estate planning attorney. The will must be properly signed and witnessed 
          according to your state's laws to be legally valid.
        </AlertDescription>
      </Alert>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Clear Instructions</h3>
              <p className="text-sm text-muted-foreground">
                Ensure your wishes are clearly documented and legally sound
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Protect Your Family</h3>
              <p className="text-sm text-muted-foreground">
                Avoid confusion and conflicts by planning ahead
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Peace of Mind</h3>
              <p className="text-sm text-muted-foreground">
                Know that your loved ones will be taken care of
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Will Wizard */}
      <WillWizard />

      {/* Additional Information */}
      <div className="max-w-4xl mx-auto bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          What You'll Need
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Personal Information</p>
              <p className="text-sm text-muted-foreground">
                Your full legal name and current address
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Executor Details</p>
              <p className="text-sm text-muted-foreground">
                Someone you trust to carry out your wishes
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Beneficiary Information</p>
              <p className="text-sm text-muted-foreground">
                Who will receive your assets and in what proportion
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Guardian Selection</p>
              <p className="text-sm text-muted-foreground">
                If you have minor children, who will care for them
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Estimate */}
      <div className="text-center text-sm text-muted-foreground max-w-4xl mx-auto">
        <p>⏱️ Estimated time to complete: 15-30 minutes</p>
        <p className="mt-1">Your progress is automatically saved, so you can return anytime</p>
      </div>
    </div>
  );
}
