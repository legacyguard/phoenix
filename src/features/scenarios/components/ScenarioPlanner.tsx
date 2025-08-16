import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Heart,
  ChevronRight,
  Users,
  Lock,
  FileWarning,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { MicroTaskEngine } from '@/features/tasks/MicroTaskEngine';
import { TaskSequence } from '@/types/tasks';
import { cn } from '@/lib/utils';

interface Gap {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  whyItMatters: string;
  severity: 'critical' | 'important' | 'moderate';
}

interface ScenarioPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioType: 'incapacity' | 'sudden-death' | 'accident' | 'illness';
  userLifeAreas: any[]; // From LifeInventoryDashboard
  userProgress?: Record<string, any>;
}

export function ScenarioPlanner({
  isOpen,
  onClose,
  scenarioType,
  userLifeAreas,
  userProgress = {}
}: ScenarioPlannerProps) {
  const [identifiedGaps, setIdentifiedGaps] = useState<Gap[]>([]);
  const [isTaskEngineOpen, setIsTaskEngineOpen] = useState(false);
  const [selectedTaskSequence, setSelectedTaskSequence] = useState<TaskSequence | null>(null);

  // Scenario configurations
  const scenarios = {
    'incapacity': {
      title: "What If You Were Incapacitated for 3 Months?",
      description: "Imagine you're in a serious accident and unable to manage your affairs for an extended period.",
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      focusAreas: ['financial', 'medical', 'family']
    },
    'sudden-death': {
      title: "What If Something Happens to You Tomorrow?",
      description: "Your family would need immediate access to critical resources and information.",
      icon: <Heart className="w-6 h-6 text-red-600" />,
      focusAreas: ['financial', 'legal', 'family', 'digital']
    },
    'accident': {
      title: "What If You Had a Serious Accident?",
      description: "Emergency contacts and medical information would be crucial for your care.",
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      focusAreas: ['medical', 'family', 'financial']
    },
    'illness': {
      title: "What If You Face a Long-Term Illness?",
      description: "Your loved ones would need to manage both your care and your affairs.",
      icon: <FileWarning className="w-6 h-6 text-purple-600" />,
      focusAreas: ['medical', 'financial', 'legal', 'family']
    }
  };

  const currentScenario = scenarios[scenarioType];

  // Analyze user data to identify gaps
  useEffect(() => {
    if (!isOpen) return;

    const gaps: Gap[] = [];

    // Check for financial access gaps
    const financialArea = userLifeAreas.find(area => area.id === 'financial-security');
    if (financialArea) {
      // Check if critical items are incomplete
      financialArea.items.forEach((item: any) => {
        if (item.critical && !item.completed) {
          gaps.push({
            id: `financial-${item.id}`,
            icon: <Lock className="w-5 h-5 text-red-600" />,
            title: `No access configured for ${item.title}`,
            description: `Your ${item.title.toLowerCase()} is not accessible to your trusted people.`,
            whyItMatters: "Without access, your family cannot manage these funds to cover expenses during your incapacity.",
            severity: 'critical'
          });
        }
      });
    }

    // Check for missing trusted people
    if (!userProgress?.trustedPeopleAdded) {
      gaps.push({
        id: 'no-trusted-people',
        icon: <Users className="w-5 h-5 text-amber-600" />,
        title: "No Trusted Circle established",
        description: "You haven't designated anyone to help manage your affairs.",
        whyItMatters: "Without trusted people, no one can legally act on your behalf during an emergency.",
        severity: 'critical'
      });
    }

    // Check for missing legal documents
    const legalArea = userLifeAreas.find(area => area.id === 'legal-documents');
    if (legalArea) {
      const willItem = legalArea.items.find((item: any) => item.id === 'will');
      const poaItem = legalArea.items.find((item: any) => item.id === 'power-attorney');
      
      if (!willItem?.completed) {
        gaps.push({
          id: 'no-will',
          icon: <FileWarning className="w-5 h-5 text-red-600" />,
          title: "No Last Will & Testament",
          description: "Your wishes for asset distribution are not legally documented.",
          whyItMatters: "Without a will, the state decides how your assets are distributed, which may not align with your wishes.",
          severity: 'critical'
        });
      }

      if (!poaItem?.completed && (scenarioType === 'incapacity' || scenarioType === 'illness')) {
        gaps.push({
          id: 'no-poa',
          icon: <Shield className="w-5 h-5 text-amber-600" />,
          title: "No Power of Attorney",
          description: "No one can make financial or medical decisions for you.",
          whyItMatters: "During incapacity, critical decisions may be delayed or made by strangers appointed by the court.",
          severity: 'critical'
        });
      }
    }

    // Check for missing medical information (for medical scenarios)
    if ((scenarioType === 'accident' || scenarioType === 'illness') && !userProgress?.medicalInfoAdded) {
      gaps.push({
        id: 'no-medical-info',
        icon: <Heart className="w-5 h-5 text-amber-600" />,
        title: "No Medical Information on File",
        description: "Emergency contacts and medical history are not documented.",
        whyItMatters: "In a medical emergency, every minute counts. Missing information could delay critical care.",
        severity: 'important'
      });
    }

    // Sort gaps by severity
    gaps.sort((a, b) => {
      const severityOrder = { critical: 0, important: 1, moderate: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    setIdentifiedGaps(gaps);
  }, [isOpen, scenarioType, userLifeAreas, userProgress]);

  const getSeverityBadge = (severity: Gap['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'important':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Important</Badge>;
      case 'moderate':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Moderate</Badge>;
    }
  };

  const handleStartSolution = () => {
    // Create a custom task sequence for addressing the most critical gap
    const criticalGap = identifiedGaps.find(gap => gap.severity === 'critical');
    
    if (criticalGap) {
      // For demo, we'll create a simple task sequence
      // In production, this would be dynamically generated based on the gap
      const solutionSequence: TaskSequence = {
        id: `solve-${criticalGap.id}`,
        title: `Resolve: ${criticalGap.title}`,
        category: 'legal',
        totalEstimatedTime: 15,
        tasks: [
          {
            id: 'understand-issue',
            title: 'Understanding the Issue',
            description: criticalGap.description,
            estimatedTime: 2,
            component: 'Confirmation',
            required: true,
            whyImportant: criticalGap.whyItMatters,
            completionMessage: 'Great! Let\'s fix this together.'
          },
          {
            id: 'identify-solution',
            title: 'Who should have access?',
            description: 'Name the person you trust to handle this responsibility.',
            estimatedTime: 3,
            component: 'Input',
            placeholder: 'e.g., Sarah Johnson (spouse)',
            required: true,
            completionMessage: 'Perfect choice. Your loved one will be prepared.'
          },
          {
            id: 'document-access',
            title: 'Document Access Details',
            description: 'Provide any specific instructions or access information.',
            estimatedTime: 5,
            component: 'Textarea',
            placeholder: 'e.g., Account is at First National Bank, branch on Main Street...',
            required: false,
            completionMessage: 'Excellent! This information will be invaluable.'
          },
          {
            id: 'confirm-completion',
            title: 'I understand this will be stored securely',
            description: 'Your information will be encrypted and only accessible to your designated trusted person when needed.',
            estimatedTime: 1,
            component: 'Confirmation',
            required: true
          }
        ],
        whyImportant: 'Addressing this gap ensures your loved ones can act swiftly in an emergency.',
        completionBenefit: 'Your family now has clear guidance for this critical situation.',
        scenario: 'Taking action today prevents tomorrow\'s crisis.'
      };

      setSelectedTaskSequence(solutionSequence);
      setIsTaskEngineOpen(true);
    }
  };

  const handleTaskComplete = (data: Record<string, any>) => {
    // Update the gaps list to reflect completion
    setIdentifiedGaps(prev => prev.filter(gap => gap.id !== identifiedGaps[0]?.id));
    setIsTaskEngineOpen(false);
    setSelectedTaskSequence(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          className="w-full lg:w-1/2 overflow-y-auto"
          style={{
            maxWidth: '800px',
            backgroundColor: 'var(--background)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <SheetHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              {currentScenario.icon}
              <SheetTitle className="text-2xl font-bold">
                {currentScenario.title}
              </SheetTitle>
            </div>
            <SheetDescription className="text-base leading-relaxed">
              {currentScenario.description}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            {/* Identified Gaps Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Identified Gaps</h3>
                {identifiedGaps.length > 0 && (
                  <Badge variant="secondary">{identifiedGaps.length} issues found</Badge>
                )}
              </div>

              {identifiedGaps.length === 0 ? (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Excellent preparation!
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          You've addressed all critical issues for this scenario. Your loved ones are well-prepared.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {identifiedGaps.map((gap) => (
                    <Card 
                      key={gap.id}
                      className={cn(
                        "transition-all duration-300 ease-in-out",
                        gap.severity === 'critical' && "border-red-200 dark:border-red-800",
                        gap.severity === 'important' && "border-amber-200 dark:border-amber-800"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {gap.icon}
                            <div className="space-y-1">
                              <CardTitle className="text-base">{gap.title}</CardTitle>
                              {getSeverityBadge(gap.severity)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {gap.description}
                        </p>
                        <Alert className="border-0 bg-muted/50">
                          <Lightbulb className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm">
                            <span className="font-medium">Why this matters:</span> {gap.whyItMatters}
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Recommended Solution Section */}
            {identifiedGaps.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Your Path to Peace of Mind</h3>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">
                      We'll guide you through resolving these issues
                    </CardTitle>
                    <CardDescription>
                      Start with the most critical gap. Each step takes just a few minutes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">1</span>
                        </div>
                        <p className="text-sm">Address the most critical issue first</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">2</span>
                        </div>
                        <p className="text-sm">Follow our simple, guided steps</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">3</span>
                        </div>
                        <p className="text-sm">Secure your family's future</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleStartSolution}
                      size="default"
                      className="w-full mt-6"
                    >
                      Start Addressing Critical Gaps
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <SheetFooter className="mt-8">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close Scenario Analysis
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* MicroTaskEngine for solutions */}
      {selectedTaskSequence && (
        <MicroTaskEngine
          taskSequence={selectedTaskSequence}
          isOpen={isTaskEngineOpen}
          onClose={() => {
            setIsTaskEngineOpen(false);
            setSelectedTaskSequence(null);
          }}
          onComplete={handleTaskComplete}
        />
      )}
    </>
  );
}
