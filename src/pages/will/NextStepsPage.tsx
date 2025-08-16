import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { getCurrentWill } from '@/services/willService';
import { Will } from '@/types/will';
import { toast } from 'sonner';
import {
  Printer,
  Shield,
  Users,
  Lock,
  Mail,
  CheckCircle2,
  ArrowRight,
  FileText,
  Download,
  Calendar,
  Home,
  AlertCircle,
  BookOpen,
  Phone,
  Briefcase
} from 'lucide-react';

export function NextStepsPage() {
  const navigate = useNavigate();
  const [will, setWill] = useState<Will | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWill();
  }, []);

  const loadWill = async () => {
    try {
      const currentWill = await getCurrentWill();
      if (!currentWill) {
        toast.error('No will found. Please create a will first.');
        navigate('/will');
        return;
      }
      setWill(currentWill);
    } catch (error) {
      console.error('Error loading will:', error);
      toast.error('Failed to load your will.');
    }
  };

  const toggleStep = (stepId: string) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleDownloadTemplate = () => {
    // In a real app, this would generate and download a PDF
    toast.info('PDF generation will be available soon.');
  };

  const handleScheduleConsultation = () => {
    // In a real app, this would open a scheduling tool
    toast.info('Attorney consultation scheduling coming soon.');
  };

  const nextSteps = [
    {
      id: 'print',
      title: 'Print Your Will',
      description: 'Print your will on standard letter-size paper. Use quality paper for durability.',
      icon: Printer,
      action: handleDownloadTemplate,
      actionLabel: 'Download PDF'
    },
    {
      id: 'review',
      title: 'Review with an Attorney',
      description: 'While not required, consulting with an estate planning attorney ensures your will meets all legal requirements.',
      icon: Briefcase,
      action: handleScheduleConsultation,
      actionLabel: 'Find Attorney',
      optional: true
    },
    {
      id: 'sign',
      title: 'Sign in Front of Witnesses',
      description: 'Sign your will in the presence of at least two witnesses who are not beneficiaries.',
      icon: Users,
      important: true
    },
    {
      id: 'witnesses',
      title: 'Have Witnesses Sign',
      description: 'Your witnesses must sign the will immediately after watching you sign.',
      icon: CheckCircle2,
      important: true
    },
    {
      id: 'notarize',
      title: 'Consider Notarization',
      description: 'While not required in most states, notarization can add an extra layer of validity.',
      icon: Shield,
      optional: true
    },
    {
      id: 'store',
      title: 'Store Safely',
      description: 'Keep the original in a secure location like a safe deposit box or fireproof safe.',
      icon: Lock
    },
    {
      id: 'inform',
      title: 'Inform Your Executor',
      description: 'Let your executor know where to find your will and any important documents.',
      icon: Mail
    },
    {
      id: 'copies',
      title: 'Distribute Copies',
      description: 'Give copies (marked as copies) to your executor and attorney if you have one.',
      icon: FileText
    }
  ];

  const legalRequirements = [
    {
      title: 'Age Requirement',
      description: 'You must be at least 18 years old (19 in some states)',
      icon: Calendar
    },
    {
      title: 'Mental Capacity',
      description: 'You must be of sound mind when signing',
      icon: AlertCircle
    },
    {
      title: 'Witness Requirements',
      description: 'Most states require 2 witnesses; some require 3',
      icon: Users
    },
    {
      title: 'No Beneficiary Witnesses',
      description: 'Witnesses cannot be beneficiaries in your will',
      icon: Shield
    }
  ];

  const resources = [
    {
      title: 'State-Specific Requirements',
      description: 'Learn about your state\'s specific will requirements',
      icon: BookOpen,
      link: '#'
    },
    {
      title: 'Estate Planning Guide',
      description: 'Comprehensive guide to estate planning',
      icon: FileText,
      link: '#'
    },
    {
      title: 'Attorney Directory',
      description: 'Find qualified estate planning attorneys near you',
      icon: Phone,
      link: '#'
    }
  ];

  const completedSteps = checkedSteps.size;
  const totalSteps = nextSteps.filter(s => !s.optional).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Your Will is Ready!
          </h1>
          <p className="text-lg text-muted-foreground">
            Follow these steps to make your will legally binding
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion Progress</span>
            <span className="font-medium">{completedSteps} of {totalSteps} required steps</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary rounded-full h-3 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Important Notice */}
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <strong>Important:</strong> Your will is not legally binding until it has been properly 
          signed and witnessed according to your state's laws. The digital version serves as a 
          template that must be printed and executed properly.
        </AlertDescription>
      </Alert>

      {/* Next Steps Checklist */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Next Steps Checklist</h2>
        <div className="grid gap-3">
          {nextSteps.map((step) => (
            <Card 
              key={step.id}
              className={`p-4 transition-all ${
                checkedSteps.has(step.id) ? 'bg-primary/5 border-primary/20' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleStep(step.id)}
                  className="mt-1 flex-shrink-0"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    checkedSteps.has(step.id) 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground hover:border-primary'
                  }`}>
                    {checkedSteps.has(step.id) && (
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">
                      {step.title}
                      {step.optional && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (Optional)
                        </span>
                      )}
                      {step.important && (
                        <span className="ml-2 text-xs text-red-600 font-normal">
                          (Required)
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  {step.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={step.action}
                      className="gap-2"
                    >
                      {step.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Legal Requirements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Legal Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legalRequirements.map((req, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <req.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{req.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {req.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Helpful Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map((resource, index) => (
            <Card 
              key={index} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => toast.info('Resource links coming soon')}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <resource.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Need Help?</h3>
          <p className="text-muted-foreground">
            Estate planning can be complex. Consider consulting with an attorney to ensure 
            your will properly reflects your wishes and complies with local laws.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleScheduleConsultation}>
              Schedule Consultation
            </Button>
            <Button variant="outline" onClick={() => navigate('/help')}>
              View Help Center
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
