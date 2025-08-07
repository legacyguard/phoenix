import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, Shield, FileCheck, Users, Home, Briefcase, 
  TrendingUp, Clock, AlertCircle, CheckCircle, 
  ChevronRight, Sparkles, Target, Calendar, Coffee,
  Award, BookOpen, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskItem } from '@/components/onboarding/OnboardingWizard';
import { cn } from '@/lib/utils';
import { 
  analyzeOnboardingResponses, 
  generatePersonalizedDashboard, 
  generateTaskRecommendations,
  UserProfile,
  DashboardConfig 
} from '@/services/onboardingAnalysis';

interface PersonalizedDashboardContentProps {
  tasks: TaskItem[];
  onboardingAnswers: any;
  completionScore: number;
}

export const PersonalizedDashboardContent: React.FC<PersonalizedDashboardContentProps> = ({
  tasks,
  onboardingAnswers,
  completionScore
}) => {
  const lifeAnswers = onboardingAnswers?.lifeAnswers;
  
  // Analyze user responses to create profile
  const userProfile = useMemo(() => {
    if (!lifeAnswers) return null;
    return analyzeOnboardingResponses(lifeAnswers, onboardingAnswers);
  }, [lifeAnswers, onboardingAnswers]);
  
  // Generate personalized dashboard configuration
  const dashboardConfig = useMemo(() => {
    if (!userProfile) return null;
    return generatePersonalizedDashboard(userProfile);
  }, [userProfile]);
  
  // Get additional task recommendations
  const additionalRecommendations = useMemo(() => {
    if (!userProfile) return [];
    return generateTaskRecommendations(userProfile, tasks);
  }, [userProfile, tasks]);
  
  // Group tasks by pillar
  const tasksByPillar = tasks.reduce((acc, task) => {
    if (!acc[task.pillar]) acc[task.pillar] = [];
    acc[task.pillar].push(task);
    return acc;
  }, {} as Record<string, TaskItem[]>);

  // Get priority tasks
  const priorityTasks = tasks
    .filter(t => t.priority === 'high' && !t.completed)
    .slice(0, 3);

  // Calculate progress
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Generate personalized insights based on answers
  const getPersonalizedInsights = () => {
    const insights = [];
    
    if (lifeAnswers?.familyStructure === 'young_children') {
      insights.push({
        icon: Heart,
        title: "Your Children's Future",
        description: "Based on what you've told us, securing guardianship and education funding are top priorities.",
        color: "text-pink-600",
        bgColor: "bg-pink-50"
      });
    }
    
    if (lifeAnswers?.financialComplexity === 'business_owner') {
      insights.push({
        icon: Briefcase,
        title: "Business Continuity",
        description: "Your business needs succession planning to ensure your family's financial security continues.",
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      });
    }
    
    if (lifeAnswers?.emotionalConcern === 'family_confusion') {
      insights.push({
        icon: Users,
        title: "Clear Family Guidance",
        description: "We'll help create a clear roadmap so your family knows exactly what to do and when.",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      });
    }
    
    if (lifeAnswers?.timelineUrgency === 'immediate') {
      insights.push({
        icon: Clock,
        title: "Urgent Timeline",
        description: "We've prioritized the most critical tasks to address your immediate needs first.",
        color: "text-red-600",
        bgColor: "bg-red-50"
      });
    }
    
    return insights;
  };

  const personalizedInsights = getPersonalizedInsights();

  // Generate timeline based on urgency
  const getTimeline = () => {
    const urgency = lifeAnswers?.timelineUrgency;
    switch (urgency) {
      case 'immediate':
        return { text: 'Next 2 weeks', description: 'Critical items need immediate attention' };
      case 'soon':
        return { text: 'Next 3 months', description: 'Important tasks to complete soon' };
      case 'eventually':
        return { text: 'This year', description: 'Steady progress toward your goals' };
      default:
        return { text: 'At your pace', description: 'Take your time to get things right' };
    }
  };

  const timeline = getTimeline();

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      'Target': Target,
      'Heart': Heart,
      'Shield': Shield,
      'FileCheck': FileCheck,
      'Users': Users,
      'Briefcase': Briefcase,
      'Clock': Clock,
      'Coffee': Coffee,
      'Sparkles': Sparkles
    };
    return icons[iconName] || Target;
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Message */}
      <Card className="bg-gradient-to-br from-warm-sage/10 to-warm-cream/10 border-warm-sage/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-warm-sage" />
            Your Personalized Protection Plan
          </CardTitle>
          <CardDescription className="text-base">
            Based on your answers, we've created a custom plan that addresses your specific concerns and priorities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-warm-sage">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Personalized Tasks</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-warm-sage">{timeline.text}</div>
              <div className="text-sm text-muted-foreground">Recommended Timeline</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-warm-sage">{priorityTasks.length}</div>
              <div className="text-sm text-muted-foreground">Priority Actions</div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedTasks} of {tasks.length} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Personalized Insights from Analysis */}
      {(dashboardConfig?.personalizedInsights && dashboardConfig.personalizedInsights.length > 0) || personalizedInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Use dashboard config insights if available, otherwise fall back to original */}
          {(dashboardConfig?.personalizedInsights || personalizedInsights).map((insight, index) => {
            const IconComponent = dashboardConfig?.personalizedInsights 
              ? getIconComponent(insight.icon)
              : insight.icon;
            const bgColor = insight.bgColor || `bg-${insight.color}-50`;
            const textColor = insight.color || "text-gray-600";
            
            return (
              <Card key={insight.id || index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", bgColor)}>
                      <IconComponent className={cn("h-5 w-5", textColor)} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {insight.description}
                      </CardDescription>
                      {insight.actionLink && (
                        <Link 
                          to={insight.actionLink} 
                          className="text-sm text-warm-sage hover:underline mt-2 inline-block"
                        >
                          Learn more →
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Priority Actions - Enhanced with intelligent recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-warm-sage" />
                {userProfile?.emotionalState === 'overwhelmed' 
                  ? 'Let\'s Start With Just These'
                  : 'Your Priority Actions'
                }
              </CardTitle>
              <CardDescription>
                {userProfile?.urgencyLevel === 'high'
                  ? 'Critical tasks that need immediate attention'
                  : timeline.description
                }
              </CardDescription>
            </div>
            <Badge 
              variant={userProfile?.urgencyLevel === 'high' ? 'destructive' : 'secondary'} 
              className={userProfile?.urgencyLevel === 'high' ? '' : 'text-warm-sage'}
            >
              {timeline.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Combine original tasks with intelligent recommendations */}
          {(dashboardConfig?.priorityTasks || priorityTasks).length > 0 ? (
            priorityTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:border-warm-sage/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-warm-sage/10">
                  {task.pillar === 'secure' && <Shield className="h-5 w-5 text-warm-sage" />}
                  {task.pillar === 'organize' && <FileCheck className="h-5 w-5 text-warm-sage" />}
                  {task.pillar === 'transfer' && <Heart className="h-5 w-5 text-warm-sage" />}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {task.pillar}
                    </Badge>
                  </div>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link to={task.link || '/'}>
                      Start This Task
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Great job! You've completed all priority tasks. Check the full task list below for more ways to protect your family.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Family-Specific Recommendations */}
      {lifeAnswers?.familyStructure && (
        <Card className="border-warm-sage/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-warm-sage" />
              Tailored for Your Family Situation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lifeAnswers.familyStructure === 'young_children' && (
                <Alert className="border-pink-200 bg-pink-50">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <AlertDescription>
                    <strong>For your young children:</strong> We've prioritized guardianship planning and education funding. 
                    Consider setting up a meeting with potential guardians to discuss your wishes.
                  </AlertDescription>
                </Alert>
              )}
              
              {lifeAnswers.familyStructure === 'blended_family' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>For your blended family:</strong> Clear documentation is essential to prevent conflicts. 
                    We recommend explicitly stating inheritance plans for all family members.
                  </AlertDescription>
                </Alert>
              )}
              
              {lifeAnswers.familyStructure === 'extended_care' && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <AlertDescription>
                    <strong>For family members needing care:</strong> Document detailed care instructions, medical needs, 
                    and preferred providers to ensure continuity of care.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intelligent Assistant Messages */}
      {dashboardConfig?.assistantMessages && dashboardConfig.assistantMessages.length > 0 && (
        <div className="space-y-3">
          {dashboardConfig.assistantMessages.map((message, index) => (
            <Alert 
              key={index} 
              className={cn(
                "border-warm-sage/20",
                message.type === 'warning' && "border-yellow-500/20 bg-yellow-50",
                message.type === 'encouragement' && "bg-warm-sage/5"
              )}
            >
              {message.type === 'warning' && <AlertCircle className="h-4 w-4" />}
              {message.type === 'guidance' && <Target className="h-4 w-4" />}
              {message.type === 'encouragement' && <Heart className="h-4 w-4" />}
              {message.type === 'welcome' && <Sparkles className="h-4 w-4" />}
              <AlertDescription className="text-base">
                {message.content}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Quick Wins Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-warm-sage" />
            {userProfile?.emotionalState === 'overwhelmed' 
              ? 'Small Steps You Can Take Right Now'
              : 'Quick Wins - Start Here'
            }
          </CardTitle>
          <CardDescription>
            {userProfile?.timeAvailability === 'limited'
              ? 'Perfect for your busy schedule - each takes under 5 minutes'
              : 'Simple tasks you can complete in under 15 minutes'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dashboardConfig?.quickWins && dashboardConfig.quickWins.length > 0 ? (
              dashboardConfig.quickWins.map((quickWin) => (
                <Button 
                  key={quickWin.id} 
                  variant="outline" 
                  className="justify-start text-left h-auto py-3" 
                  asChild
                >
                  <Link to={quickWin.link}>
                    <div className="flex items-start gap-3 w-full">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{quickWin.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {quickWin.description} • {quickWin.timeEstimate}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>
              ))
            ) : (
              <>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/profile">
                    <Clock className="mr-2 h-4 w-4" />
                    Complete your profile (5 min)
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/manual">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Add emergency contacts (10 min)
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Support Message */}
      {lifeAnswers?.emotionalConcern && (
        <Alert className="border-warm-sage/30 bg-warm-sage/5">
          <Heart className="h-4 w-4 text-warm-sage" />
          <AlertDescription className="text-base">
            {lifeAnswers.emotionalConcern === 'family_confusion' && 
              "We understand your concern about family confusion. Every task we've created includes clear instructions your family can follow."}
            {lifeAnswers.emotionalConcern === 'financial_burden' && 
              "To prevent financial surprises, we'll help you document all accounts, debts, and obligations clearly."}
            {lifeAnswers.emotionalConcern === 'family_conflict' && 
              "Clear documentation and communication prevent conflicts. We'll guide you through creating unambiguous instructions."}
            {lifeAnswers.emotionalConcern === 'lost_opportunities' && 
              "Nothing will be forgotten. We'll help you create a comprehensive inventory of everything important."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
