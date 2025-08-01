
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, UserProfile } from "@clerk/clerk-react";
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CountryProvider } from "@/contexts/CountryContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { GeoLocationProvider } from "@/providers/GeoLocationProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorDebugPanel } from "@/components/debug/ErrorDebugPanel";
import { ConsentManager } from "./components/privacy/ConsentManager";
import { Loader2 } from "lucide-react";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

// Loading component for lazy loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Lazy load all page components
const Landing = React.lazy(() => import("./pages/Landing"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AssetDetail = React.lazy(() => import("./pages/AssetDetail").then(m => ({ default: m.AssetDetail })));
const Manual = React.lazy(() => import("./pages/Manual").then(m => ({ default: m.Manual })));
const Will = React.lazy(() => import("./pages/Will").then(m => ({ default: m.Will })));
const InviteAcceptance = React.lazy(() => import("./pages/InviteAcceptance").then(m => ({ default: m.InviteAcceptance })));
const GuardianView = React.lazy(() => import('@/pages/GuardianView').then(m => ({ default: m.GuardianView })));
const TestError = React.lazy(() => import('@/pages/TestError'));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Help = React.lazy(() => import("./pages/Help"));
const AssetOverview = React.lazy(() => import("./components/assets/AssetOverview").then(m => ({ default: m.AssetOverview })));
const SubscriptionDashboard = React.lazy(() => import("./components/subscriptions/SubscriptionDashboard").then(m => ({ default: m.SubscriptionDashboard })));
const OCRDemo = React.lazy(() => import("./pages/OCRDemo").then(m => ({ default: m.OCRDemo })));
const UploadDemo = React.lazy(() => import("./pages/UploadDemo").then(m => ({ default: m.UploadDemo })));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const AdminAnalytics = React.lazy(() => import("./pages/admin/Analytics"));
const Vault = React.lazy(() => import("./pages/Vault"));
const TrustedCircle = React.lazy(() => import("./components/TrustedCircle"));
const FamilyHub = React.lazy(() => import("./components/FamilyHub"));
const LegacyLetters = React.lazy(() => import("./pages/LegacyLetters"));
const Pricing = React.lazy(() => import("./pages/Pricing"));

// Create the QueryClient outside of the component to avoid the hook issue
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  // Enable performance monitoring in production
  usePerformanceMonitoring(import.meta.env.PROD);

  return (
    <ErrorProvider>
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <QueryClientProvider client={queryClient}>
          <CountryProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </CountryProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ErrorProvider>
  );
};

const AppContent = () => {
  const { t } = useTranslation();

  return (
    <GeoLocationProvider>
      <>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes with marketing layout */}
        <Route path="/" element={<MarketingLayout><Landing /></MarketingLayout>} />
        <Route path="/login" element={<MarketingLayout><Login /></MarketingLayout>} />
        <Route path="/register" element={<MarketingLayout><Register /></MarketingLayout>} />
        <Route path="/privacy-policy" element={<MarketingLayout><PrivacyPolicy /></MarketingLayout>} />
        <Route path="/cookies" element={<MarketingLayout><CookiePolicy /></MarketingLayout>} />
              
              {/* Protected Application routes with full layout */}
              <Route path="/dashboard" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/assets" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<AssetOverview />} />
                <Route path=":assetId" element={<AssetDetail />} />
              </Route>
              <Route path="/subscriptions" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<SubscriptionDashboard />} />
              </Route>
              <Route path="/manual" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Manual />} />
              </Route>
              <Route path="/will" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Will />} />
              </Route>
              <Route path="/vault" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Vault />} />
              </Route>
              <Route path="/trusted-circle" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<TrustedCircle />} />
              </Route>
              <Route path="/user-profile" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={
                  <div className="container mx-auto px-4 lg:px-8 py-8">
                    <UserProfile />
                  </div>
                } />
              </Route>
              <Route path="/help" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Help />} />
              </Route>
              
              {/* Family Hub */}
              <Route path="/family-hub" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<FamilyHub />} />
              </Route>
              
              {/* Legacy Letters */}
              <Route path="/legacy-letters" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<LegacyLetters />} />
              </Route>
              
              {/* Test error route - REMOVE BEFORE PRODUCTION */}
              <Route path="/test-error" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<TestError />} />
              </Route>
              
              {/* Demo routes - REMOVE BEFORE PRODUCTION */}
              <Route path="/ocr-demo" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<OCRDemo />} />
              </Route>
              <Route path="/upload-demo" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<UploadDemo />} />
              </Route>
              <Route path="/analytics" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Analytics />} />
              </Route>
              
              {/* Admin routes */}
              <Route path="/admin/analytics" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<AdminAnalytics />} />
              </Route>
              
              {/* Pricing route */}
              <Route path="/pricing" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<Pricing />} />
              </Route>
              
              {/* Guardian routes */}
              <Route path="/invite/:inviteToken" element={<MarketingLayout><InviteAcceptance /></MarketingLayout>} />
              <Route path="/guardian-view" element={
                <SignedIn>
                  <MainLayout />
                </SignedIn>
              }>
                <Route index element={<GuardianView />} />
              </Route>

        /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    <Route path="*" element={<MarketingLayout><NotFound /></MarketingLayout>} />
      </Routes>
      </Suspense>
      
      {/* GDPR Consent Manager */}
      <ConsentManager />
      
      {/* Error Debug Panel - only in development */}
      <ErrorDebugPanel />
    </>
    </GeoLocationProvider>
  );
};

export default App;
