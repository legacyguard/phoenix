import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WillStepProps } from '@/types/will';
import { Heart, Info, ArrowRight, ArrowLeft } from 'lucide-react';

export function Step6_FinalWishes({ data, onUpdate, onNext, onBack }: WillStepProps) {
  const handleChange = (value: string) => {
    onUpdate({ finalWishes: value });
  };

  const handleNext = () => {
    const newCompletedSteps = new Set(data.completedSteps);
    newCompletedSteps.add(6);
    onUpdate({ completedSteps: newCompletedSteps });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Final Wishes & Instructions</h2>
        <p className="text-muted-foreground">
          Share any special instructions, funeral wishes, or personal messages you'd like 
          to include in your will.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          This section is optional but can provide important guidance to your loved ones. 
          Consider including funeral preferences, charitable wishes, or personal messages.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="finalWishes">
            <Heart className="inline h-4 w-4 mr-1" />
            Your Final Wishes (Optional)
          </Label>
          <Textarea
            id="finalWishes"
            placeholder="Enter any special instructions, funeral wishes, or messages to your loved ones..."
            value={data.finalWishes}
            onChange={(e) => handleChange(e.target.value)}
            rows={10}
            className="resize-none"
          />
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">Consider Including:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Funeral or memorial service preferences</li>
            <li>• Burial or cremation wishes</li>
            <li>• Charitable donations in your memory</li>
            <li>• Care instructions for pets</li>
            <li>• Personal messages to family members</li>
            <li>• Instructions for digital accounts and passwords</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} size="lg" className="gap-2">
          Review Will
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
