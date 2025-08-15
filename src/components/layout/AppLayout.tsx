import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  Settings, 
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { useUser, UserButton } from '@clerk/clerk-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isActive?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    isActive: true
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Box,
    href: '/assets'
  },
  {
    id: 'guardians',
    label: 'Guardians',
    icon: Users,
    href: '/guardians'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  }
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useUser();

  const handleNavigation = (href: string) => {
    // TODO: Implement navigation logic
    console.log('Navigating to:', href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        {/* Logo/Názov aplikácie */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-card-foreground">
            Phoenix
          </h1>
        </div>

        {/* Navigácia */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={item.isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(item.href)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Profil používateľa */}
        <div className="p-4 border-t border-border">
          <Card className="bg-background/50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.emailAddresses[0]?.emailAddress || 'user@example.com'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Clerk UserButton - automaticky zobrazí avatar a poskytne možnosť odhlásenia */}
          <div className="mt-2">
            <UserButton 
              appearance={{
                elements: {
                  userButtonBox: "w-full",
                  userButtonTrigger: "w-full justify-start",
                }
              }}
            />
          </div>
        </div>
      </aside>

      {/* Hlavný obsah */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
