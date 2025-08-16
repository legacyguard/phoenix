import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FirstTimeUserGuide from '@/components/guides/FirstTimeUserGuide';
import { 
  Heart, 
  Users, 
  Home, 
  Building2, 
  Target, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface OnboardingData {
  hasSpouse: boolean;
  hasChildren: boolean;
  ownsBusiness: boolean;
  ownsRealEstate: boolean;
  mainMotivation: string;
  trustedPeople: string;
}

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'critical' | 'needs_attention' | 'completed' | 'not_started';
  statusText: string;
  actionText: string;
  actionVariant: 'default' | 'outline' | 'secondary';
}

export const LifeInventoryDashboard: React.FC = () => {
  const { user } = useUser();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);

  useEffect(() => {
    if (user?.publicMetadata?.onboardingData) {
      const data = user.publicMetadata.onboardingData as OnboardingData;
      setOnboardingData(data);
      generateDashboardCards(data);
    }
  }, [user]);

  const generateDashboardCards = (data: OnboardingData) => {
    const cards: DashboardCard[] = [];

    // Mission Card (always present)
    cards.push({
      id: 'mission',
      title: `Mission: ${data.mainMotivation}`,
      description: 'This is your primary focus. Let\'s break it down into small, manageable steps.',
      icon: Target,
      status: 'not_started',
      statusText: 'Ready to begin',
      actionText: 'Start First Step',
      actionVariant: 'default'
    });

    // Trusted Circle Card (always present)
    cards.push({
      id: 'trusted-circle',
      title: 'Your Trusted Circle',
      description: `Your trusted people: ${data.trustedPeople}`,
      icon: Users,
      status: 'needs_attention',
      statusText: 'Not yet invited',
      actionText: 'Manage Your Circle',
      actionVariant: 'outline'
    });

    // Conditional cards based on onboarding responses
    if (data.ownsRealEstate) {
      cards.push({
        id: 'real-estate',
        title: 'Your Home & Properties',
        description: 'Secure documentation and access to your real estate assets.',
        icon: Home,
        status: 'needs_attention',
        statusText: 'Needs attention',
        actionText: 'Secure Properties',
        actionVariant: 'outline'
      });
    }

    if (data.hasChildren) {
      cards.push({
        id: 'children-future',
        title: 'Securing Your Children\'s Future',
        description: 'Ensure your children have access to resources and guidance they need.',
        icon: Heart,
        status: 'critical',
        statusText: 'Critical priority',
        actionText: 'Plan Future',
        actionVariant: 'default'
      });
    }

    if (data.ownsBusiness) {
      cards.push({
        id: 'business-continuity',
        title: 'Business Continuity Plan',
        description: 'Maintain business operations and transfer ownership smoothly.',
        icon: Building2,
        status: 'needs_attention',
        statusText: 'Needs attention',
        actionText: 'Plan Continuity',
        actionVariant: 'outline'
      });
    }

    setDashboardCards(cards);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'needs_attention':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'completed':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'not_started':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'needs_attention':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'not_started':
        return <Target className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCardAction = (cardId: string) => {
    // TODO: Implement specific actions for each card
    console.log(`Action clicked for card: ${cardId}`);
  };

  if (!onboardingData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your personalized dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  return (
    <AppLayout>
      {/* Main Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-card-foreground mb-2">
          Welcome to Your Life Inventory, {userName}
        </h1>
        <p className="text-xl text-muted-foreground">
          Based on your responses, we've created a personalized plan to help you secure what matters most.
        </p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.id} 
              className="hover:shadow-lg transition-all duration-200"
              id={card.id === 'mission' ? 'mission-card' : 
                  card.id === 'trusted-circle' ? 'trusted-circle-card' : 
                  card.id === 'real-estate' || card.id === 'children-future' || card.id === 'business-continuity' ? 'life-area-card' : undefined}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-muted-foreground mb-4">{card.description}</p>
                
                {/* Status Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(card.status)}`}>
                  {getStatusIcon(card.status)}
                  <span>{card.statusText}</span>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant={card.actionVariant}
                  className="w-full"
                  size="sm"
                  onClick={() => handleCardAction(card.id)}
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <Card className="mb-8" id="quick-actions-section">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you get started with your life inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="w-6 h-6" />
              <span className="font-medium">Review Security</span>
              <span className="text-xs text-muted-foreground">Check your current setup</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="w-6 h-6" />
              <span className="font-medium">Invite Guardians</span>
              <span className="text-xs text-muted-foreground">Add trusted people</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Target className="w-6 h-6" />
              <span className="text-xs text-muted-foreground">Define your priorities</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Welcome to Your Personalized Life Inventory
          </h3>
          <p className="text-muted-foreground mb-4">
            You've taken the first step toward securing your legacy. Each card above represents an area of your life 
            that we can help you protect and organize. Start with your Mission card to begin building your plan.
          </p>
          <div className="flex space-x-3">
            <Button size="sm">
              <Target className="w-4 h-4 mr-2" />
              Start with Mission
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* First Time User Guide */}
      <FirstTimeUserGuide />
    </AppLayout>
  );
};

export default LifeInventoryDashboard;
