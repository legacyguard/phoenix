import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { BarChart3, FileText, Users, Settings, Wallet, CreditCard, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const mobileNavItems = [
  {
    label: 'dashboard',
    icon: BarChart3,
    href: '/dashboard',
  },
  {
    label: 'assets',
    icon: Wallet,
    href: '/assets',
  },
  {
    label: 'documents',
    icon: FileText,
    href: '/vault',
  },
  {
    label: 'guardians',
    icon: Users,
    href: '/guardians',
  },
  {
    label: 'subscriptions',
    icon: CreditCard,
    href: '/subscriptions',
  },
  {
    label: 'settings',
    icon: Settings,
    href: '/user-profile',
  },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation('ui-common');

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-700 bg-sidebar dark:bg-dark-sidebar shadow-md">
      <div className="grid h-16 grid-cols-6">
        {mobileNavItems.map((item) => {
          const isItemActive = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isItemActive 
                  ? "text-nav-icon-active" 
                  : "text-nav-icon hover:text-nav-icon-active"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isItemActive ? "text-nav-icon-active" : "text-nav-icon"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                isItemActive ? "text-nav-icon-active" : "text-nav-icon"
              )}>
                {t(`navigation.${item.label}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};