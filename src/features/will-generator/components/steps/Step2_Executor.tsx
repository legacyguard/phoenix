import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { WillStepProps } from '@/types/will';
import { Person } from '@/types/people';
import { getPeople } from '@/services/peopleService';
import { 
  Gavel, 
  Info, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck,
  Shield,
  AlertCircle
} from 'lucide-react';

export function Step2_Executor({ data, onUpdate, onNext, onBack }: WillStepProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const loadedPeople = await getPeople();
      // Filter for people who could be executors (adults with executor role or close relationships)
      const eligiblePeople = loadedPeople.filter(person => 
        person.roles.includes('executor') || 
        person.roles.includes('trustee') ||
        ['spouse', 'child', 'sibling', 'parent'].includes(person.relationship)
      );
      setPeople(eligiblePeople);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrimary = (personId: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      onUpdate({
        executor: {
          ...data.executor,
          primary: personId
        }
      });
    }
  };

  const handleSelectAlternate = (personId: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      onUpdate({
        executor: {
          ...data.executor,
          alternate: personId === 'none' ? undefined : personId
        }
      });
    }
  };

  const isValid = () => {
    return data.executor.primary;
  };

  const handleNext = () => {
    if (isValid()) {
      const newCompletedSteps = new Set(data.completedSteps);
      newCompletedSteps.add(2);
      onUpdate({ completedSteps: newCompletedSteps });
      onNext();
    }
  };

  const getPrimaryExecutor = () => people.find(p => p.id === data.executor.primary);
  const getAlternateExecutor = () => people.find(p => p.id === data.executor.alternate);

  if (loading) {
    return <div className="text-center py-8">Loading your trusted circle...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Appoint Your Executor</h2>
        <p className="text-muted-foreground">
          Your executor is responsible for carrying out the instructions in your will. 
          Choose someone you trust who is organized and capable of handling this responsibility.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          An executor manages your estate, pays debts and taxes, and distributes assets 
          according to your will. Consider choosing someone who is financially responsible 
          and lives nearby.
        </AlertDescription>
      </Alert>

      {people.length === 0 ? (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            You haven't added any people to your trusted circle yet. Please add people 
            in the "My Loved Ones" section before creating your will.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Primary Executor */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Primary Executor
              </h3>
              <RadioGroup
                value={data.executor.primary}
                onValueChange={handleSelectPrimary}
              >
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 ease-in-out mb-2"
                  >
                    <RadioGroupItem value={person.id} id={`primary-${person.id}`} />
                    <Label
                      htmlFor={`primary-${person.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{person.fullName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {person.relationship}
                        </Badge>
                        {person.roles.includes('executor') && (
                          <Badge variant="default" className="text-xs">
                            <Gavel className="h-3 w-3 mr-1" />
                            Designated Executor
                          </Badge>
                        )}
                      </div>
                      {person.address && (
                        <p className="text-sm text-muted-foreground">{person.address}</p>
                      )}
                      {person.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{person.notes}</p>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Alternate Executor */}
          {data.executor.primary && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Alternate Executor (Optional)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  An alternate executor will serve if your primary executor is unable or unwilling to act.
                </p>
                <RadioGroup
                  value={data.executor.alternate || 'none'}
                  onValueChange={handleSelectAlternate}
                >
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 ease-in-out mb-2">
                    <RadioGroupItem value="none" id="alternate-none" />
                    <Label htmlFor="alternate-none" className="cursor-pointer">
                      <span className="font-medium">No alternate executor</span>
                    </Label>
                  </div>
                  {people
                    .filter(p => p.id !== data.executor.primary)
                    .map((person) => (
                      <div
                        key={person.id}
                        className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 ease-in-out mb-2"
                      >
                        <RadioGroupItem value={person.id} id={`alternate-${person.id}`} />
                        <Label
                          htmlFor={`alternate-${person.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{person.fullName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {person.relationship}
                            </Badge>
                          </div>
                          {person.address && (
                            <p className="text-sm text-muted-foreground">{person.address}</p>
                          )}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Selected Summary */}
          {data.executor.primary && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Your Selection:</h4>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Primary Executor:</span>{' '}
                  <span className="font-medium">{getPrimaryExecutor()?.fullName}</span>
                </p>
                {data.executor.alternate && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Alternate Executor:</span>{' '}
                    <span className="font-medium">{getAlternateExecutor()?.fullName}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </>
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
        <Button 
          onClick={handleNext}
          disabled={!isValid()}
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
