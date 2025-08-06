// src/pages/admin/Analytics.tsx

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Shield, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Lazy load AnalyticsDashboard
const AnalyticsDashboard = lazy(() => import('@/components/admin/AnalyticsDashboard'));

const AdminAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user) {
      // Simple admin check - in production, this would be more secure
      const isAdmin = user.emailAddresses?.some(email => 
                       email.emailAddress.endsWith('@legacyguard.com')) || 
                     user.publicMetadata?.role === 'admin';
      setIsAuthorized(isAdmin);
    } else {
      setIsAuthorized(false);
    }
  }, [user]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">{t('dashboard.verifyingAuthorization')}</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.accessDenied.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('dashboard.accessDenied.description')}
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  // Authorized - show analytics dashboard
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">{t('dashboard.loadingAnalytics')}</p>
        </div>
      </div>
    }>
      <AnalyticsDashboard />
    </Suspense>
  );
};

export default AdminAnalyticsPage;
