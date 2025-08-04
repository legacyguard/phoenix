import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Play, 
  FileText, 
  Users, 
  Heart,
  Building,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: 'documents' | 'guardians' | 'assets' | 'beneficiaries' | 'legal';
  videoUrl?: string;
  steps: string[];
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
}

interface ContextHelpProps {
  currentContext: string;
  userProgress: {
    guardians: number;
    documents: number;
    assets: number;
    beneficiaries: number;
  };
}

export const ContextHelp: React.FC<ContextHelpProps> = ({
  currentContext,
  userProgress
}) => {
  const { t } = useTranslation('common');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const helpTopics: HelpTopic[] = [
    {
      id: 'upload-documents',
      title: t('help.topics.uploadDocuments.title'),
      description: t('help.topics.uploadDocuments.description'),
      category: 'documents',
      steps: [
        t('help.topics.uploadDocuments.steps.1'),
        t('help.topics.uploadDocuments.steps.2'),
        t('help.topics.uploadDocuments.steps.3'),
        t('help.topics.uploadDocuments.steps.4'),
        t('help.topics.uploadDocuments.steps.5')
      ],
      estimatedTime: 5,
      priority: 'high'
    },
    {
      id: 'add-guardians',
      title: t('help.topics.addGuardians.title'),
      description: t('help.topics.addGuardians.description'),
      category: 'guardians',
      steps: [
        t('help.topics.addGuardians.steps.1'),
        t('help.topics.addGuardians.steps.2'),
        t('help.topics.addGuardians.steps.3'),
        t('help.topics.addGuardians.steps.4'),
        t('help.topics.addGuardians.steps.5')
      ],
      estimatedTime: 8,
      priority: 'high'
    },
    {
      id: 'list-assets',
      title: t('help.topics.listAssets.title'),
      description: t('help.topics.listAssets.description'),
      category: 'assets',
      steps: [
        t('help.topics.listAssets.steps.1'),
        t('help.topics.listAssets.steps.2'),
        t('help.topics.listAssets.steps.3'),
        t('help.topics.listAssets.steps.4'),
        t('help.topics.listAssets.steps.5')
      ],
      estimatedTime: 10,
      priority: 'medium'
    },
    {
      id: 'designate-beneficiaries',
      title: t('help.topics.designateBeneficiaries.title'),
      description: t('help.topics.designateBeneficiaries.description'),
      category: 'beneficiaries',
      steps: [
        t('help.topics.designateBeneficiaries.steps.1'),
        t('help.topics.designateBeneficiaries.steps.2'),
        t('help.topics.designateBeneficiaries.steps.3'),
        t('help.topics.designateBeneficiaries.steps.4'),
        t('help.topics.designateBeneficiaries.steps.5')
      ],
      estimatedTime: 6,
      priority: 'high'
    },
    {
      id: 'create-will',
      title: t('help.topics.createWill.title'),
      description: t('help.topics.createWill.description'),
      category: 'legal',
      steps: [
        t('help.topics.createWill.steps.1'),
        t('help.topics.createWill.steps.2'),
        t('help.topics.createWill.steps.3'),
        t('help.topics.createWill.steps.4'),
        t('help.topics.createWill.steps.5')
      ],
      estimatedTime: 15,
      priority: 'high'
    }
  ];

  const getRelevantTopics = (): HelpTopic[] => {
    // Filter topics based on user progress and current context
    let relevantTopics = helpTopics;

    // If user has no guardians, prioritize guardian help
    if (userProgress.guardians === 0) {
      relevantTopics = relevantTopics.filter(topic => topic.category === 'guardians');
    }
    // If user has no documents, prioritize document help
    else if (userProgress.documents === 0) {
      relevantTopics = relevantTopics.filter(topic => topic.category === 'documents');
    }
    // If user has no assets, prioritize asset help
    else if (userProgress.assets === 0) {
      relevantTopics = relevantTopics.filter(topic => topic.category === 'assets');
    }
    // If user has no beneficiaries, prioritize beneficiary help
    else if (userProgress.beneficiaries === 0) {
      relevantTopics = relevantTopics.filter(topic => topic.category === 'beneficiaries');
    }

    // Sort by priority
    return relevantTopics.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents':
        return <FileText className="h-4 w-4" />;
      case 'guardians':
        return <Users className="h-4 w-4" />;
      case 'assets':
        return <Building className="h-4 w-4" />;
      case 'beneficiaries':
        return <Heart className="h-4 w-4" />;
      case 'legal':
        return <Shield className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const relevantTopics = getRelevantTopics();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {t('help.needHelp')}
            </CardTitle>
            <Sheet open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {t('help.getHelp')}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t('help.helpAndTutorials')}</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Context-based recommendations */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">
                      {t('help.recommendedForYou')}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {t('help.basedOnProgress')}
                    </p>
                  </div>

                  {/* Help Topics */}
                  <div className="space-y-4">
                    {relevantTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              {getCategoryIcon(topic.category)}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{topic.title}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(topic.priority)}`}
                                >
                                  {t(`help.priority.${topic.priority}`)}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {topic.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {topic.estimatedTime} {t('help.stepDetails.minutes')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {topic.steps.length} {t('help.stepDetails.steps')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Tips */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">
                      {t('help.quickTips.title')}
                    </h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• {t('help.quickTips.tip1')}</li>
                      <li>• {t('help.quickTips.tip2')}</li>
                      <li>• {t('help.quickTips.tip3')}</li>
                      <li>• {t('help.quickTips.tip4')}</li>
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('help.personalizedHelpDescription')}
            </p>
            
            {relevantTopics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t('help.recommendedTopics')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {relevantTopics.slice(0, 3).map((topic) => (
                    <Badge key={topic.id} variant="outline" className="text-xs">
                      {topic.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Sheet open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <SheetContent className="w-[600px] sm:w-[800px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedTopic.category)}
                {selectedTopic.title}
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-medium mb-2">{t('help.stepDetails.description')}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTopic.description}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-3">{t('help.stepDetails.stepByStepInstructions')}</h3>
                <div className="space-y-3">
                  {selectedTopic.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTopic.videoUrl && (
                <div>
                  <h3 className="font-medium mb-2">{t('help.stepDetails.videoTutorial')}</h3>
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    {t('help.stepDetails.watchVideoTutorial')}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {t('help.stepDetails.estimatedTime')}: {selectedTopic.estimatedTime} {t('help.stepDetails.minutes')}
                </div>
                <Button onClick={() => setSelectedTopic(null)}>
                  {t('help.stepDetails.gotIt')}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}; 