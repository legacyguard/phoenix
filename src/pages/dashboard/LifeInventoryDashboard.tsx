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
  AlertTriangle,
  CheckCircle2,
  ArrowRightCircle
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

    // Core Wish Card (always present)
    cards.push({
      id: 'core-wish',
      title: `Your Core Wish`,
      description: data.mainMotivation ? `“${data.mainMotivation}”` : 'This is the heart of your plan.',
      icon: Target,
      status: 'not_started',
      statusText: 'Ready to begin',
      actionText: 'View & Secure',
      actionVariant: 'default'
    });

    // Keepers of the Keys Card (always present)
    cards.push({
      id: 'keepers-of-keys',
      title: 'The Keepers of the Keys',
      description: data.trustedPeople ? `Trusted people: ${data.trustedPeople}` : 'Add the people you trust.',
      icon: Users,
      status: 'needs_attention',
      statusText: 'Next Step Recommended',
      actionText: 'Manage Keepers',
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
        statusText: 'Next Step Recommended',
        actionText: 'View & Secure',
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
        statusText: 'Immediate Priority',
        actionText: 'Start this 5-minute step',
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
        statusText: 'Next Step Recommended',
        actionText: 'View & Secure',
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
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
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
        return <ArrowRightCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
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
          {userName ? `Your Treasure Box, ${userName}` : 'Your Treasure Box'}
        </h1>
        <p className="text-xl text-muted-foreground">An overview of your legacy — calm, clear, and personal.</p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.id} 
              className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-primary/40"
              id={card.id === 'mission' ? 'mission-card' : 
                  card.id === 'keepers-of-keys' ? 'trusted-circle-card' : 
                  card.id === 'real-estate' || card.id === 'children-future' || card.id === 'business-continuity' ? 'life-area-card' : undefined}
              role="region"
              aria-label={`Life Area: ${card.title}, Status: ${card.statusText}`}
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

      {/* Removed Quick Actions temporarily to reduce cognitive load */}

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Calm, clear next steps</h3>
          <p className="text-muted-foreground mb-4">Each card above is part of your Treasure Box. Start where the app recommends — one gentle step at a time.</p>
          <div className="flex space-x-3">
            <Button size="sm">
              <Target className="w-4 h-4 mr-2" />
              Open Your Core Wish
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
