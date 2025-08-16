import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/Progress';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Shield, 
  Calendar, 
  Bell,
  Box,
  UserPlus,
  Settings,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Mock data - neskôr bude nahradené reálnymi dátami
  const userData = {
    name: 'John Doe',
    digitalAssets: 7,
    trustedGuardians: 2,
    profileCompletion: 60
  };

  const recentActivities = [
    {
      id: 1,
      icon: Box,
      text: 'You added a new asset: "Crypto Wallet"',
      time: '2 hours ago',
      type: 'asset'
    },
    {
      id: 2,
      icon: UserPlus,
      text: 'You invited a new guardian: "Jane Doe"',
      time: '1 day ago',
      type: 'guardian'
    },
    {
      id: 3,
      icon: Settings,
      text: 'Updated your privacy settings',
      time: '3 days ago',
      type: 'settings'
    },
    {
      id: 4,
      icon: CheckCircle,
      text: 'Completed your will document',
      time: '1 week ago',
      type: 'document'
    }
  ];

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'text-blue-500';
      case 'guardian':
        return 'text-green-500';
      case 'settings':
        return 'text-purple-500';
      case 'document':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <AppLayout>
      {/* Main Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-card-foreground mb-2">
          Welcome to Your Legacy, {userData.name}! 👋
        </h1>
        <p className="text-xl text-muted-foreground">
          Your digital legacy is secure and well-organized. Here's what's happening with your account.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Digital Assets Card */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Digital Assets</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Box className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-card-foreground mb-2">
                {userData.digitalAssets}
              </div>
              <p className="text-muted-foreground">items secured</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Manage Assets
            </Button>
          </CardFooter>
        </Card>

        {/* Trusted Guardians Card */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Trusted Guardians</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-card-foreground mb-2">
                {userData.trustedGuardians}
              </div>
              <p className="text-muted-foreground">people in your circle</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" size="sm">
              <Users className="w-4 h-4 mr-2" />
              View Guardians
            </Button>
          </CardFooter>
        </Card>

        {/* Completion Progress Card */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Profile Completion</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-card-foreground mb-3">
                {userData.profileCompletion}%
              </div>
              <Progress value={userData.profileCompletion} className="mb-3" />
              <p className="text-muted-foreground">Complete your profile</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Complete your profile to ensure your legacy is protected.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>
                Your latest account activities and updates
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg bg-muted ${getActivityIconColor(activity.type)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">
                      {activity.text}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your legacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Create New Document
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Guardian
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Box className="w-4 h-4 mr-2" />
              Upload Asset
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              Important updates and reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Annual Review Due
                  </p>
                  <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">
                    Your annual account review is due in 15 days
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    New Feature Available
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    Try our new AI document analysis tool
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              🎉 Welcome to Phoenix! 🎉
            </h3>
            <p className="text-muted-foreground mb-4">
              Your secure digital legacy management platform is ready to help you organize and protect what matters most. 
              Start by completing your profile and adding your first digital assets.
            </p>
            <div className="flex space-x-3">
              <Button size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
