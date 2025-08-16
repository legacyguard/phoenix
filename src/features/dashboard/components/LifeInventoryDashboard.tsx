import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Home,
  Heart,
  Shield,
  FileText,
  Users,
  Landmark,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Info,
  Sparkles,
  Building2
} from 'lucide-react';
import { MicroTaskEngine } from '@/features/tasks/MicroTaskEngine';
import { addBankAccountSequence } from '@/features/tasks/sequences';
import { TaskSequence, TaskProgress } from '@/types/tasks';
import { cn } from '@/lib/utils';

interface LifeItem {
  id: string;
  title: string;
  completed: boolean;
  critical?: boolean;
}

interface LifeArea {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'complete' | 'needs_attention' | 'critical';
  items: LifeItem[];
  nextAction: string;
  whyImportant: string;
  scenario: string;
  taskSequence?: TaskSequence;
}

export function LifeInventoryDashboard() {
  const { user, isLoaded } = useUser();
  const [isTaskEngineOpen, setIsTaskEngineOpen] = useState(false);
  const [selectedTaskSequence, setSelectedTaskSequence] = useState<TaskSequence | null>(null);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);

  // Get onboarding data from Clerk metadata
  const onboardingData = user?.publicMetadata?.onboardingData as any;

  useEffect(() => {
    // Initialize life areas based on user's onboarding answers
    const areas: LifeArea[] = [];

    // Always add financial security as it's critical for everyone
    areas.push({
      id: 'financial-security',
      title: 'Financial Security',
      icon: <Landmark className="w-5 h-5" />,
      status: 'critical',
      items: [
        { id: 'bank-main', title: 'Primary Bank Account', completed: false, critical: true },
        { id: 'bank-savings', title: 'Savings Account', completed: false },
        { id: 'investments', title: 'Investments', completed: false }
      ],
      nextAction: 'Start First Step',
      whyImportant: 'Securing your financial information ensures your loved ones can access critical resources when needed most.',
      scenario: 'What if something happens tomorrow and your family needs immediate access to funds?',
      taskSequence: addBankAccountSequence
    });

    // Add property management if user owns real estate
    if (onboardingData?.ownsRealEstate) {
      areas.push({
        id: 'home-property',
        title: 'Home & Property',
        icon: <Home className="w-5 h-5" />,
        status: 'critical', // More critical if they own property
        items: [
          { id: 'property-deed', title: 'Property Deed', completed: false, critical: true },
          { id: 'mortgage', title: 'Mortgage Documents', completed: false },
          { id: 'insurance-home', title: 'Home Insurance', completed: false }
        ],
        nextAction: 'Secure Property Documents',
        whyImportant: 'Property documentation ensures smooth transfer of your most valuable assets.',
        scenario: 'Your family needs to know how to manage or transfer your property without legal complications.'
      });
    }

    // Add business area if user owns a business
    if (onboardingData?.ownsBusiness) {
      areas.push({
        id: 'business-continuity',
        title: 'Business Continuity',
        icon: <Building2 className="w-5 h-5" />,
        status: 'critical',
        items: [
          { id: 'business-docs', title: 'Business Documents', completed: false, critical: true },
          { id: 'succession-plan', title: 'Succession Plan', completed: false, critical: true },
          { id: 'business-accounts', title: 'Business Accounts', completed: false }
        ],
        nextAction: 'Secure Business Documents',
        whyImportant: 'Protect your business continuity for your family.',
        scenario: 'What happens to your business if you cannot continue?'
      });
    }

    // Add family protection if user has children
    if (onboardingData?.hasChildren) {
      areas.push({
        id: 'family-protection',
        title: 'Family Protection',
        icon: <Users className="w-5 h-5" />,
        status: 'critical', // Critical when they have children
        items: [
          { id: 'guardians', title: 'Guardians for Children', completed: false, critical: true },
          { id: 'emergency-contacts', title: 'Emergency Contacts', completed: false },
          { id: 'medical-info', title: "Children's Medical Information", completed: false, critical: true }
        ],
        nextAction: 'Set Up Guardianship',
        whyImportant: 'Ensure your children are cared for by people you trust.',
        scenario: 'Who will take care of your children if something happens to both parents?'
      });
    }

    // Always add legal documents
    areas.push({
      id: 'legal-documents',
      title: 'Legal Documents',
      icon: <FileText className="w-5 h-5" />,
      status: 'critical',
      items: [
        { id: 'will', title: 'Last Will & Testament', completed: false, critical: true },
        { id: 'power-attorney', title: 'Power of Attorney', completed: false },
        { id: 'advance-directive', title: 'Advance Directive', completed: false }
      ],
      nextAction: 'Create Essential Documents',
      whyImportant: 'Legal documents ensure your wishes are respected and your family is protected.',
      scenario: 'Without proper legal documents, your wishes may not be honored during critical times.'
    });

    // Check for saved progress
    areas.forEach(area => {
      if (area.taskSequence) {
        const savedProgress = localStorage.getItem(`task_progress_${area.taskSequence.id}`);
        if (savedProgress) {
          const progress: TaskProgress = JSON.parse(savedProgress);
          if (progress.completedAt) {
            // Mark first item as complete if sequence is done
            area.items[0].completed = true;
            area.status = area.items.every(item => item.completed) ? 'complete' : 'needs_attention';
          }
        }
      }
    });

    setLifeAreas(areas);
  }, [user, onboardingData]);

  const handleStartTask = (taskSequence: TaskSequence) => {
    setSelectedTaskSequence(taskSequence);
    setIsTaskEngineOpen(true);
  };

  const handleTaskComplete = (data: Record<string, any>) => {
    // Update the dashboard to reflect completion
    setLifeAreas(prev => prev.map(area => {
      if (area.taskSequence?.id === selectedTaskSequence?.id) {
        // Mark first item as complete
        const updatedItems = [...area.items];
        updatedItems[0].completed = true;
        
        return {
          ...area,
          items: updatedItems,
          status: updatedItems.every(item => item.completed) ? 'complete' : 'needs_attention'
        };
      }
      return area;
    }));

    // Save the collected data (following privacy-first architecture)
    const encryptedData = btoa(JSON.stringify(data)); // Simple encoding for demo
    localStorage.setItem(`secure_${selectedTaskSequence?.id}`, encryptedData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Needs Attention</Badge>;
    }
  };

  const criticalCount = lifeAreas.filter(area => area.status === 'critical').length;
  const completedCount = lifeAreas.filter(area => area.status === 'complete').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header with empathetic message */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Your Life Inventory
        </h1>
        <p className="text-muted-foreground text-lg">
          Secure what matters most, one step at a time
        </p>
      </div>

      {/* Status Overview (not gamified, just informative) */}
      {criticalCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="ml-2">
            <span className="font-medium">Important areas need your attention</span>{' '}
            You have {criticalCount} critical {criticalCount === 1 ? 'area' : 'areas'} to review
          </AlertDescription>
        </Alert>
      )}

      {/* Life Areas Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {lifeAreas.map((area) => (
          <Card 
            key={area.id}
            id={`life-area-${area.id}`}
            className={cn(
              "transition-all duration-300 hover:shadow-lg",
              area.status === 'critical' && "border-red-200 dark:border-red-800",
              area.status === 'complete' && "border-green-200 dark:border-green-800"
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    area.status === 'complete' ? "bg-green-100 dark:bg-green-900/20" :
                    area.status === 'critical' ? "bg-red-100 dark:bg-red-900/20" :
                    "bg-amber-100 dark:bg-amber-900/20"
                  )}>
                    {area.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{area.title}</CardTitle>
                    {getStatusBadge(area.status)}
                  </div>
                </div>
              </div>
              <CardDescription className="mt-3 text-sm italic">
                {area.scenario}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Items checklist */}
              <div className="space-y-2">
                {area.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : item.critical ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-sm",
                      item.completed && "line-through text-muted-foreground"
                    )}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Why Important */}
              <Alert className="border-0 bg-muted/50">
                <Heart className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  {area.whyImportant}
                </AlertDescription>
              </Alert>

              {/* Action Button */}
              {area.status !== 'complete' && area.taskSequence && (
                <Button
                  onClick={() => handleStartTask(area.taskSequence!)}
                  className={cn(
                    "w-full gap-2",
                    area.status === 'critical' && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  {area.nextAction}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reassuring message */}
      {completedCount > 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <span className="font-medium">Great progress!</span>{' '}
            You've completed {completedCount} {completedCount === 1 ? 'area' : 'areas'}. Your family is more secure.
          </AlertDescription>
        </Alert>
      )}

      {/* MicroTaskEngine Modal */}
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
    </div>
  );
}
