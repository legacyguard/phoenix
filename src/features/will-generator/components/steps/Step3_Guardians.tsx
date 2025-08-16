import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { WillStepProps } from '@/types/will';
import { Person } from '@/types/people';
import { getPeople } from '@/services/peopleService';
import { 
  Baby, 
  Info, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck,
  Shield,
  Plus,
  X
} from 'lucide-react';

export function Step3_Guardians({ data, onUpdate, onNext, onBack }: WillStepProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState('');
  const [children, setChildren] = useState<string[]>(data.guardians?.forChildren || []);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const loadedPeople = await getPeople();
      // Filter for people who could be guardians
      const eligiblePeople = loadedPeople.filter(person => 
        person.roles.includes('guardian') || 
        ['friend', 'sibling', 'parent'].includes(person.relationship)
      );
      setPeople(eligiblePeople);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = () => {
    if (childName.trim()) {
      const newChildren = [...children, childName.trim()];
      setChildren(newChildren);
      setChildName('');
      onUpdate({
        guardians: {
          ...data.guardians!,
          forChildren: newChildren
        }
      });
    }
  };

  const handleRemoveChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
    onUpdate({
      guardians: {
        ...data.guardians!,
        forChildren: newChildren
      }
    });
  };

  const handleSelectPrimary = (personId: string) => {
    onUpdate({
      guardians: {
        primary: personId,
        alternate: data.guardians?.alternate,
        forChildren: children
      }
    });
  };

  const handleSelectAlternate = (personId: string) => {
    onUpdate({
      guardians: {
        ...data.guardians!,
        alternate: personId === 'none' ? undefined : personId
      }
    });
  };

  const isValid = () => {
    return children.length > 0 && data.guardians?.primary;
  };

  const handleNext = () => {
    if (isValid()) {
      const newCompletedSteps = new Set(data.completedSteps);
      newCompletedSteps.add(3);
      onUpdate({ completedSteps: newCompletedSteps });
      onNext();
    }
  };

  const handleSkip = () => {
    onUpdate({ guardians: undefined });
    onNext();
  };

  const getPrimaryGuardian = () => people.find(p => p.id === data.guardians?.primary);
  const getAlternateGuardian = () => people.find(p => p.id === data.guardians?.alternate);

  if (loading) {
    return <div className="text-center py-8">Loading your trusted circle...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Appoint Guardians for Minor Children</h2>
        <p className="text-muted-foreground">
          If you have minor children (under 18), you should appoint guardians who will 
          care for them if both parents pass away.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          Guardians will have legal responsibility for your children's care, education, 
          and upbringing. Choose someone who shares your values and has the ability to 
          care for your children.
        </AlertDescription>
      </Alert>

      {/* Children Names */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          Minor Children
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter child's name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddChild()}
          />
          <Button type="button" onClick={handleAddChild} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {children.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {children.map((child, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {child}
                <button
                  onClick={() => handleRemoveChild(index)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {children.length > 0 && people.length > 0 && (
        <>
          {/* Primary Guardian */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Primary Guardian
            </h3>
            <RadioGroup
              value={data.guardians?.primary || ''}
              onValueChange={handleSelectPrimary}
            >
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 ease-in-out mb-2"
                >
                  <RadioGroupItem value={person.id} id={`guardian-${person.id}`} />
                  <Label
                    htmlFor={`guardian-${person.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{person.fullName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {person.relationship}
                      </Badge>
                      {person.roles.includes('guardian') && (
                        <Badge variant="default" className="text-xs">
                          Designated Guardian
                        </Badge>
                      )}
                    </div>
                    {person.notes && (
                      <p className="text-xs text-muted-foreground">{person.notes}</p>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Alternate Guardian */}
          {data.guardians?.primary && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Alternate Guardian (Optional)
              </h3>
              <RadioGroup
                value={data.guardians?.alternate || 'none'}
                onValueChange={handleSelectAlternate}
              >
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 ease-in-out mb-2">
                  <RadioGroupItem value="none" id="alt-guardian-none" />
                  <Label htmlFor="alt-guardian-none" className="cursor-pointer">
                    <span className="font-medium">No alternate guardian</span>
                  </Label>
                </div>
                {people
                  .filter(p => p.id !== data.guardians?.primary)
                  .map((person) => (
                    <div
                      key={person.id}
                      className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 ease-in-out mb-2"
                    >
                      <RadioGroupItem value={person.id} id={`alt-guardian-${person.id}`} />
                      <Label
                        htmlFor={`alt-guardian-${person.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{person.fullName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {person.relationship}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
          )}
        </>
      )}

      {/* No children option */}
      {children.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            If you don't have minor children, you can skip this step.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onBack}
          size="lg"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          {children.length === 0 && (
            <Button 
              variant="outline"
              onClick={handleSkip}
              size="lg"
            >
              Skip This Step
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={children.length > 0 && !isValid()}
            size="lg"
            className="gap-2"
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
