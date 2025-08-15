import React from 'react';
import { AppLayout } from './AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Shield,
  Calendar,
  Bell
} from 'lucide-react';

export const AppLayoutExample: React.FC = () => {
  return (
    <AppLayout>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Vitajte späť! Tu je prehľad vašej aktivity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Celková Hodnota</p>
                <p className="text-2xl font-bold text-foreground">€125,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Guardians</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dokumenty</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bezpečnosť</p>
                <p className="text-2xl font-bold text-foreground">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Posledná Aktivita</span>
            </CardTitle>
            <CardDescription>
              Prehľad vašich nedávnych akcií
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pridaný nový asset</p>
                  <p className="text-xs text-muted-foreground">Pred 2 hodinami</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Aktualizovaný profil</p>
                  <p className="text-xs text-muted-foreground">Pred 1 dňom</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nahraný dokument</p>
                  <p className="text-xs text-muted-foreground">Pred 3 dňami</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Rýchle Akcie</span>
            </CardTitle>
            <CardDescription>
              Často používané funkcie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <FileText className="w-6 h-6" />
                <span className="text-sm">Pridať Asset</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">Pridať Guardian</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Shield className="w-6 h-6" />
                <span className="text-sm">Bezpečnosť</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Kalendár</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Vitajte v Phoenix aplikácii! 🎉
            </h3>
            <p className="text-muted-foreground mb-4">
              Toto je demonštračná stránka pre AppLayout komponent. 
              Môžete vidieť, ako sa sidebar a hlavný obsah komponujú dohromady.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline">
                Prezrieť dokumentáciu
              </Button>
              <Button>
                Začať používať
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AppLayoutExample;
