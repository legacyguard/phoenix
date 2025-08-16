import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WillStepProps } from '@/types/will';
import { Person } from '@/types/people';
import { getPeople } from '@/services/peopleService';
import { createWill } from '@/services/willService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  FileText, 
  ArrowLeft, 
  Loader2,
  User,
  Gavel,
  Baby,
  Gift,
  Percent,
  Heart
} from 'lucide-react';

export function Step7_Review({ data, onUpdate, onBack }: WillStepProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const loadedPeople = await getPeople();
      setPeople(loadedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const getPersonName = (personId: string) => {
    const person = people.find(p => p.id === personId);
    return person?.fullName || 'Unknown';
  };

  const handleGenerateWill = async () => {
    setIsGenerating(true);
    try {
      const will = await createWill(data);
      toast.success('Your will has been generated successfully!');
      
      // Redirect to a success page or next steps
      setTimeout(() => {
        navigate('/will/next-steps');
      }, 2000);
    } catch (error) {
      console.error('Error generating will:', error);
      toast.error('Failed to generate will. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Will</h2>
        <p className="text-muted-foreground">
          Please review all the information below. You can go back to any step to make changes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {data.personalInfo.fullName}</p>
            <p><span className="text-muted-foreground">Address:</span> {data.personalInfo.address}</p>
            <p><span className="text-muted-foreground">City, State ZIP:</span> {data.personalInfo.city}, {data.personalInfo.state} {data.personalInfo.zipCode}</p>
          </div>
        </Card>

        {/* Executor */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Executor
          </h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Primary:</span> {getPersonName(data.executor.primary)}</p>
            {data.executor.alternate && (
              <p><span className="text-muted-foreground">Alternate:</span> {getPersonName(data.executor.alternate)}</p>
            )}
          </div>
        </Card>

        {/* Guardians */}
        {data.guardians && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" />
              Guardians for Minor Children
            </h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Children:</span> {data.guardians.forChildren.join(', ')}</p>
              <p><span className="text-muted-foreground">Primary Guardian:</span> {getPersonName(data.guardians.primary)}</p>
              {data.guardians.alternate && (
                <p><span className="text-muted-foreground">Alternate Guardian:</span> {getPersonName(data.guardians.alternate)}</p>
              )}
            </div>
          </Card>
        )}

        {/* Specific Gifts */}
        {data.specificGifts.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Specific Gifts
            </h3>
            <div className="space-y-2 text-sm">
              {data.specificGifts.map(gift => (
                <p key={gift.id}>
                  <span className="font-medium">{gift.assetName}</span>
                  <span className="text-muted-foreground"> → </span>
                  {gift.beneficiaryName}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Residual Estate */}
        {data.residualBeneficiaries.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Residual Estate Distribution
            </h3>
            <div className="space-y-1 text-sm">
              {data.residualBeneficiaries.map(beneficiary => (
                <p key={beneficiary.personId}>
                  <span className="font-medium">{beneficiary.personName}</span>: {beneficiary.percentage}%
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Final Wishes */}
        {data.finalWishes && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Final Wishes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{data.finalWishes}</p>
          </Card>
        )}
      </div>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Your will is ready to be generated. After generation, you'll need to print, 
          sign it in front of witnesses, and store it safely.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={handleGenerateWill}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate My Will
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
