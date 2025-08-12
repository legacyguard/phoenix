import React, { Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, UserProfile, useUser } from "@clerk/clerk-react";
import { ProtectedRoute, AdminRoute } from "@/components/auth/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CountryProvider } from "@/contexts/CountryContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { AssistantProvider } from "@/contexts/AssistantContext";
import { GeoLocationProvider } from "@/providers/GeoLocationProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { ErrorBoundary } from "@/components/common/ErrorBoundaryI18n";
import { ErrorDebugPanel } from "@/components/debug/ErrorDebugPanel";
import { FeatureFlagPanel } from "@/components/debug/FeatureFlagPanel";
import { ConsentManager } from "./components/privacy/ConsentManager";
import { Loader2 } from "lucide-react";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { UserFlowManager } from "@/components/auth/UserFlowManager";
import { FeatureFlagProvider } from "@/config/features";
import { AuthenticatedRedirect } from "@/components/auth/AuthenticatedRedirect";
import { logEnvironmentInfo } from "@/utils/env-check";

// Loading component for lazy loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Optimized lazy loading with grouped components for better performance
// Group 1: Marketing/Public pages (loaded together for better UX)
const MarketingPages = React.lazy(() =>
  import("./pages").then((m) => ({
    Landing: m.Landing,
    Login: m.Login,
    Register: m.Register,
    TermsOfService: m.TermsOfService,
    RefundPolicy: m.RefundPolicy,
    PrivacyPolicy: m.PrivacyPolicy,
    CookiePolicy: m.CookiePolicy,
    Pricing: m.Pricing,
  }))
);

// Group 2: Core dashboard and main app features
const CoreAppFeatures = React.lazy(() =>
  import("./features").then((m) => ({
    Dashboard: m.dashboard?.components?.Dashboard,
    AssetOverview: m.assetsVault?.components?.AssetOverview,
    AssetDetail: m.assetsVault?.components?.AssetDetail,
    Vault: m.assetsVault?.components?.VaultDashboard?.Vault,
    SubscriptionDashboard: m.subscriptions?.components?.SubscriptionDashboard,
    TrustedCircle: m.familyCircle?.components?.TrustedCircle,
    FamilyHub: m.familyCircle?.components?.FamilyHub,
  }))
);

// Group 3: Will and legal features
const LegalFeatures = React.lazy(() =>
  import("./features/will-generator").then((m) => ({
    Will: m.WillGenerator,
  }))
);

// Group 4: Utility and demo pages (development only)
const UtilityPages = React.lazy(() =>
  import("./pages").then((m) => ({
    Manual: m.Manual,
    Help: m.Help,
    NotFound: m.NotFound,
    Analytics: m.Analytics,
    AdminAnalytics: m.admin?.Analytics,
    OCRDemo: m.OCRDemo,
    UploadDemo: m.UploadDemo,
    TestError: m.TestError,
  }))
);

// Group 5: Guardian and invitation features
const GuardianFeatures = React.lazy(() =>
  import("./pages").then((m) => ({
    GuardianView: m.GuardianView,
    InviteAcceptance: m.InviteAcceptance,
  }))
);

// Group 6: Legacy and family features
const LegacyFeatures = React.lazy(() =>
  import("./pages").then((m) => ({
    LegacyLetters: m.LegacyLetters,
  }))
);

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

  // Log environment configuration in development
  React.useEffect(() => {
    logEnvironmentInfo();
  }, []);

  return (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <CountryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                {/* Dev-only utilities: ErrorDebugPanel and FeatureFlagPanel are safe and non-production */}
                <AssistantProvider>
                  <ErrorBoundary showDetails={(import.meta.env.DEV || import.meta.env.VITE_E2E)}>
                    <AppContent />
                  </ErrorBoundary>
                </AssistantProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </CountryProvider>
      </QueryClientProvider>
    </ErrorProvider>
  );
};

const AppContent = () => {
  const { t } = useTranslation("ui-common");
  const { user } = useUser();

  return (
    <FeatureFlagProvider userId={user?.id}>
      <ErrorBoundary showDetails={true}>
        <UserFlowManager>
          <GeoLocationProvider>
            <>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes with marketing layout */}
                  <Route
                    path="/"
                    element={
                      <MarketingLayout>
                        <AuthenticatedRedirect>
                          <MarketingPages.Landing />
                        </AuthenticatedRedirect>
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <MarketingLayout>
                        <MarketingPages.Login />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <MarketingLayout>
                        <MarketingPages.Register />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/privacy-policy"
                    element={
                      <MarketingLayout>
                        <MarketingPages.PrivacyPolicy />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/cookies"
                    element={
                      <MarketingLayout>
                        <MarketingPages.CookiePolicy />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/terms-of-service"
                    element={
                      <MarketingLayout>
                        <MarketingPages.TermsOfService />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/refund-policy"
                    element={
                      <MarketingLayout>
                        <MarketingPages.RefundPolicy />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <MarketingLayout>
                        <MarketingPages.Pricing />
                      </MarketingLayout>
                    }
                  />

                  {/* Protected Application routes with full layout */}
                  <Route
                    path="/dashboard"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<CoreAppFeatures.Dashboard />} />
                  </Route>
                  <Route
                    path="/assets"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<CoreAppFeatures.AssetOverview />} />
                    <Route path=":assetId" element={<CoreAppFeatures.AssetDetail />} />
                  </Route>
                  <Route
                    path="/subscriptions"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<CoreAppFeatures.SubscriptionDashboard />} />
                  </Route>
                  <Route
                    path="/manual"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<UtilityPages.Manual />} />
                  </Route>
                  <Route
                    path="/will"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<LegalFeatures.Will />} />
                  </Route>
                  <Route
                    path="/vault"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<CoreAppFeatures.Vault />} />
                  </Route>
                  <Route
                    path="/trusted-circle"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<CoreAppFeatures.TrustedCircle />} />
                  </Route>
                  <Route
                    path="/user-profile"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route
                      index
                      element={
                        <div className="container mx-auto px-4 lg:px-8 py-8">
                          <UserProfile />
                        </div>
                      }
                    />
                  </Route>
                  <Route
                    path="/help"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<UtilityPages.Help />} />
                  </Route>

                  {/* Family Hub */}
                  <Route
                    path="/family-hub"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<CoreAppFeatures.FamilyHub />} />
                  </Route>

                  {/* Legacy Letters */}
                  <Route
                    path="/legacy-letters"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<LegacyFeatures.LegacyLetters />} />
                  </Route>

                  {/* Demo routes - only in development */}
                  {(import.meta.env.DEV || import.meta.env.VITE_E2E) && (
                    <>
                      <Route
                        path="/test-error"
                        element={
                          <SignedIn>
                            <MainLayout />
                          </SignedIn>
                        }
                      >
                        <Route index element={<UtilityPages.TestError />} />
                      </Route>

                      <Route
                        path="/ocr-demo"
                        element={
                          <SignedIn>
                            <MainLayout />
                          </SignedIn>
                        }
                      >
                        <Route index element={<UtilityPages.OCRDemo />} />
                      </Route>
                      <Route
                        path="/upload-demo"
                        element={
                          <SignedIn>
                            <MainLayout />
                          </SignedIn>
                        }
                      >
                        <Route index element={<UtilityPages.UploadDemo />} />
                      </Route>
                    </>
                  )}
                  <Route
                    path="/analytics"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<UtilityPages.Analytics />} />
                  </Route>

                  {/* Admin routes */}
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <MainLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<UtilityPages.AdminAnalytics />} />
                  </Route>

                  {/* Guardian routes */}
                  <Route
                    path="/invite/:inviteToken"
                    element={
                      <MarketingLayout>
                        <GuardianFeatures.InviteAcceptance />
                      </MarketingLayout>
                    }
                  />
                  <Route
                    path="/guardian-view"
                    element={
                      <SignedIn>
                        <MainLayout />
                      </SignedIn>
                    }
                  >
                    <Route index element={<GuardianFeatures.GuardianView />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route
                    path="*"
                    element={
                      <MarketingLayout>
                        <UtilityPages.NotFound />
                      </MarketingLayout>
                    }
                  />
                </Routes>
              </Suspense>

              {/* GDPR Consent Manager */}
              <ConsentManager />

              {/* Error Debug Panel - only in development */}
              <ErrorDebugPanel />

              {/* Feature Flag Panel - only in development */}
              <FeatureFlagPanel />
            </>
          </GeoLocationProvider>
        </UserFlowManager>
      </ErrorBoundary>
    </FeatureFlagProvider>
  );
};

export default App;
