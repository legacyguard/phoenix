import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';
import { useAuthLogging } from '@/hooks/useAuthLogging';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { usePWA } from '@/hooks/usePWA';
import { useAuth } from '@/contexts/AuthContext';

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { cacheCriticalData } = usePWA();
  const { user } = useAuth();
  
  // Log authentication activities
  useAuthLogging();

  // Cache critical data when user logs in
  useEffect(() => {
    if (user?.id) {
      cacheCriticalData(user.id);
    }
  }, [user?.id, cacheCriticalData]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
        />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          "pt-16", // Account for fixed header
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pt-16 pb-16">
          <div className="container mx-auto p-4">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
};
