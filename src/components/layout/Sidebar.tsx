import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package, 
  Users,
  Home,
  Mail,
  Archive,
  FileText, 
  Settings, 
  HelpCircle,
  BookUser,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Wallet,
  CreditCard,
  Lock,
  Crown,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/hooks/useSubscription';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavigationSection {
  title?: string;
  items: Array<{
    label: string;
    icon: any;
    href: string;
  }>;
}

const navigationSections: NavigationSection[] = [
  {
    items: [
      {
        label: 'dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
    ],
  },
  {
    title: 'MY VAULT',
    items: [
      {
        label: 'vault',
        icon: Package,
        href: '/vault',
      },
      {
        label: 'trustedCircle',
        icon: Users,
        href: '/trusted-circle',
      },
      {
        label: 'familyHub',
        icon: Home,
        href: '/family-hub',
      },
      {
        label: 'legacyBriefing',
        icon: Mail,
        href: '/briefing',
      },
      {
        label: 'executorToolkit',
        icon: Lock,
        href: '/executor-toolkit',
      },
    ],
  },
  {
    title: 'OTHER',
    items: [
      {
        label: 'assets',
        icon: Wallet,
        href: '/assets',
      },
      {
        label: 'subscriptions',
        icon: CreditCard,
        href: '/subscriptions',
      },
      {
        label: 'manual',
        icon: BookUser,
        href: '/manual',
      },
      {
        label: 'will',
        icon: FileSignature,
        href: '/will',
      },
      {
        label: 'consultations',
        icon: Scale,
        href: '/consultations',
      },
      {
        label: 'settings',
        icon: Settings,
        href: '/user-profile',
      },
      {
        label: 'help',
        icon: HelpCircle,
        href: '/help',
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { isPremium, isLoading } = useSubscription();

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className={cn(
      "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex items-center justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 transition-colors hover:bg-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 p-2">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-2">
              {section.title && !isCollapsed && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </p>
                </div>
              )}
              {section.items.map((item) => {
                const isItemActive = isActive(item.href);
                const isPrimary = item.label === 'dashboard';
                const isPremiumFeature = item.label === 'executorToolkit';
                const isLocked = isPremiumFeature && !isPremium && !isLoading;
                
                return (
                  <Link
                    key={item.href}
                    to={isLocked ? '/pricing' : item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                      isItemActive && "bg-earth-primary/10 text-earth-primary hover:bg-earth-primary/20",
                      isPrimary && !isItemActive && "font-semibold",
                      isCollapsed && "justify-center px-2",
                      isLocked && "opacity-60 hover:opacity-80"
                    )}
                  >
                    <div className="relative">
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isItemActive && "text-earth-primary",
                        isPrimary && !isItemActive && "text-primary"
                      )} />
                      {isLocked && (
                        <Lock className="absolute -bottom-1 -right-1 h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="transition-opacity duration-200">
                          {t(`navigation.${item.label}`)}
                        </span>
                        {isLocked && (
                          <Crown className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-earth-primary/10">
              <Package className="h-4 w-4 text-earth-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-sm">
                <p className="font-medium text-foreground">{t('app.name')}</p>
                <p className="text-xs text-muted-foreground">{t('app.tagline')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};