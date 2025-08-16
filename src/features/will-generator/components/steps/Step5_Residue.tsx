import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { WillStepProps, ResidualBeneficiary } from '@/types/will';
import { Person } from '@/types/people';
import { getPeople } from '@/services/peopleService';
import { validateResidualPercentages } from '@/services/willService';
import { Percent, Info, ArrowRight, ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';

export function Step5_Residue({ data, onUpdate, onNext, onBack }: WillStepProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [percentage, setPercentage] = useState('');

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const loadedPeople = await getPeople();
      setPeople(loadedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = () => {
    if (selectedPerson && percentage) {
      const person = people.find(p => p.id === selectedPerson);
      const percentNum = parseFloat(percentage);
      
      if (person && percentNum > 0 && percentNum <= 100) {
        const newBeneficiary: ResidualBeneficiary = {
          personId: person.id,
          personName: person.fullName,
          percentage: percentNum
        };
        
        onUpdate({
          residualBeneficiaries: [...data.residualBeneficiaries, newBeneficiary]
        });
        
        setSelectedPerson('');
        setPercentage('');
      }
    }
  };

  const handleRemoveBeneficiary = (personId: string) => {
    onUpdate({
      residualBeneficiaries: data.residualBeneficiaries.filter(b => b.personId !== personId)
    });
  };

  const availablePeople = people.filter(
    person => !data.residualBeneficiaries.some(b => b.personId === person.id)
  );

  const totalPercentage = data.residualBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const isValid = validateResidualPercentages(data.residualBeneficiaries);

  const handleNext = () => {
    if (isValid) {
      const newCompletedSteps = new Set(data.completedSteps);
      newCompletedSteps.add(5);
      onUpdate({ completedSteps: newCompletedSteps });
      onNext();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your trusted circle...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Distribute Residual Estate</h2>
        <p className="text-muted-foreground">
          The residual estate includes everything not specifically gifted. Distribute it 
          among your beneficiaries by percentage.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          The percentages must add up to exactly 100%. This ensures your entire estate 
          is distributed according to your wishes.
        </AlertDescription>
      </Alert>

      {/* Add Beneficiary Form */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Select Beneficiary</label>
            <Select value={selectedPerson} onValueChange={setSelectedPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a beneficiary" />
              </SelectTrigger>
              <SelectContent>
                {availablePeople.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.fullName} ({person.relationship})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Percentage</label>
            <Input
              type="number"
              min="1"
              max="100"
              placeholder="e.g., 50"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </div>
        </div>
        
        <Button
          onClick={handleAddBeneficiary}
          disabled={!selectedPerson || !percentage}
          className="mt-4 w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficiary
        </Button>
      </Card>

      {/* Beneficiaries List */}
      {data.residualBeneficiaries.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Residual Beneficiaries
          </h3>
          {data.residualBeneficiaries.map(beneficiary => (
            <Card key={beneficiary.personId} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{beneficiary.personName}</p>
                  <p className="text-lg font-bold text-primary">{beneficiary.percentage}%</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBeneficiary(beneficiary.personId)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
          
          {/* Total Percentage Display */}
          <div className={`p-4 rounded-lg ${isValid ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
            <p className="font-semibold">
              Total: {totalPercentage}%
              {isValid && <span className="text-green-600 ml-2">✓ Valid</span>}
              {!isValid && totalPercentage > 0 && (
                <span className="text-red-600 ml-2">Must equal 100%</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Warning if no beneficiaries */}
      {data.residualBeneficiaries.length === 0 && data.specificGifts.length === 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            You must distribute your estate either through specific gifts or residual 
            beneficiaries (or both).
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isValid && data.residualBeneficiaries.length > 0}
          size="lg" 
          className="gap-2"
        >
          Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
