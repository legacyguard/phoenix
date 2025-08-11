import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Shield,
  Cookie,
  BarChart3,
  Info,
  X,
  Check,
  AlertCircle,
  Eye,
  Database,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { cn } from "@/lib/utils";

export interface ConsentPreferences {
  necessary: boolean; // Always true - required cookies
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consentDate?: string;
  lastUpdated?: string;
}

interface ConsentManagerProps {
  onConsentUpdate?: (preferences: ConsentPreferences) => void;
}

const CONSENT_KEY = "legacyguard-consent-preferences";
const CONSENT_SHOWN_KEY = "legacyguard-consent-shown";

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  onConsentUpdate,
}) => {
  const { t } = useTranslation("ui-common");
  const { enableTracking, disableTracking } = useAnalytics({
    componentName: "ConsentManager",
  });

  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Load consent preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(CONSENT_KEY);
    const consentShown = localStorage.getItem(CONSENT_SHOWN_KEY);

    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);

      // Apply analytics preference
      if (parsed.analytics) {
        enableTracking();
      } else {
        disableTracking();
      }
    } else if (!consentShown) {
      // Show banner if no consent has been given
      setShowBanner(true);
    }
  }, [disableTracking, enableTracking]);

  const savePreferences = (newPreferences: ConsentPreferences) => {
    const updatedPreferences = {
      ...newPreferences,
      lastUpdated: new Date().toISOString(),
      consentDate: preferences.consentDate || new Date().toISOString(),
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(updatedPreferences));
    localStorage.setItem(CONSENT_SHOWN_KEY, "true");
    setPreferences(updatedPreferences);

    // Apply analytics preference
    if (updatedPreferences.analytics) {
      enableTracking();
    } else {
      disableTracking();
    }

    onConsentUpdate?.(updatedPreferences);
  };

  const handleAcceptAll = () => {
    const allEnabled: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allEnabled);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handlePreferenceChange = (
    key: keyof ConsentPreferences,
    value: boolean,
  ) => {
    if (key === "necessary") return; // Cannot disable necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const CookieDetails = () => (
    <Tabs defaultValue="necessary" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="necessary">
          {t("ui-elements:ui.cookies.necessary.title")}
        </TabsTrigger>
        <TabsTrigger value="analytics">
          {t("ui-elements:ui.cookies.analytics.title")}
        </TabsTrigger>
        <TabsTrigger value="marketing">
          {t("ui-elements:ui.cookies.marketing.title")}
        </TabsTrigger>
        <TabsTrigger value="preferences">
          {t("ui-elements:ui.cookies.preferences.title")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="necessary" className="space-y-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium">
              {t("ui-elements:ui.cookies.necessary.title")}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("ui-elements:ui.cookies.necessary.description")}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-3 w-3 text-green-600" />
                <span>
                  {t("ui-elements:ui.cookies.necessary.items.authentication")}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-3 w-3 text-green-600" />
                <span>
                  {t("ui-elements:ui.cookies.necessary.items.security")}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-3 w-3 text-green-600" />
                <span>
                  {t("ui-elements:ui.cookies.necessary.items.preferences")}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>
                  {t("ui-elements:ui.cookies.necessary.retention")}:
                </strong>{" "}
                {t("ui.cookies.necessary.retentionPeriod")}
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.necessary}
            disabled
            className="opacity-50"
          />
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="flex items-start space-x-3">
          <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium">
              {t("ui-elements:ui.cookies.analytics.title")}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("ui-elements:ui.cookies.analytics.description")}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-3 w-3 text-blue-600" />
                <span>{t("ui.cookies.analytics.items.pageViews")}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-3 w-3 text-blue-600" />
                <span>{t("ui.cookies.analytics.items.featureUsage")}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-3 w-3 text-blue-600" />
                <span>
                  {t("ui-elements:ui.cookies.analytics.items.performance")}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-xs">
                <strong>
                  {t("ui-elements:ui.cookies.analytics.privacy")}:
                </strong>{" "}
                {t("ui.cookies.analytics.privacyNote")}
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.analytics}
            onCheckedChange={(checked) =>
              handlePreferenceChange("analytics", checked)
            }
          />
        </div>
      </TabsContent>

      <TabsContent value="marketing" className="space-y-4">
        <div className="flex items-start space-x-3">
          <Globe className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium">
              {t("ui-elements:ui.cookies.marketing.title")}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("ui-elements:ui.cookies.marketing.description")}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Database className="h-3 w-3 text-purple-600" />
                <span>
                  {t("ui-elements:ui.cookies.marketing.items.retargeting")}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Database className="h-3 w-3 text-purple-600" />
                <span>
                  {t("ui-elements:ui.cookies.marketing.items.campaigns")}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-xs">
                <strong>
                  {t("ui-elements:ui.cookies.marketing.partners")}:
                </strong>{" "}
                {t("ui.cookies.marketing.partnersList")}
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.marketing}
            onCheckedChange={(checked) =>
              handlePreferenceChange("marketing", checked)
            }
          />
        </div>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4">
        <div className="flex items-start space-x-3">
          <Cookie className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium">
              {t("ui-elements:ui.cookies.preferences.title")}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("ui-elements:ui.cookies.preferences.description")}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-3 w-3 text-orange-600" />
                <span>
                  {t("ui-elements:ui.cookies.preferences.items.language")}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-3 w-3 text-orange-600" />
                <span>
                  {t("ui-elements:ui.cookies.preferences.items.theme")}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-3 w-3 text-orange-600" />
                <span>
                  {t("ui-elements:ui.cookies.preferences.items.layout")}
                </span>
              </div>
            </div>
          </div>
          <Switch
            checked={preferences.preferences}
            onCheckedChange={(checked) =>
              handlePreferenceChange("preferences", checked)
            }
          />
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <Card className="max-w-4xl mx-auto shadow-2xl border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Cookie className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {t("ui-elements:ui.banner.title")}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBanner(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {t("ui-elements:ui.banner.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAcceptAll} className="flex-1">
                    {t("ui.banner.acceptAll")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(true)}
                    className="flex-1"
                  >
                    {t("ui-elements:ui.banner.customize")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleRejectAll}
                    className="flex-1"
                  >
                    {t("ui.banner.rejectAll")}
                  </Button>
                </div>

                <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
                  <a href="/privacy" className="hover:underline">
                    {t("ui.banner.privacyPolicy")}
                  </a>
                  <span>•</span>
                  <a href="/cookies" className="hover:underline">
                    {t("ui.banner.cookiePolicy")}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Cookie Settings Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t("ui-elements:ui.details.title")}</span>
            </DialogTitle>
            <DialogDescription>
              {t("ui-elements:ui.details.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            <CookieDetails />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {t("ui.details.dataCollected.title")}
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• {t("ui.details.dataCollected.item1")}</li>
                    <li>• {t("ui.details.dataCollected.item2")}</li>
                    <li>• {t("ui.details.dataCollected.item3")}</li>
                    <li>• {t("ui.details.dataCollected.item4")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {t("ui.details.yourRights.title")}
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• {t("ui.details.yourRights.item1")}</li>
                    <li>• {t("ui.details.yourRights.item2")}</li>
                    <li>• {t("ui.details.yourRights.item3")}</li>
                    <li>• {t("ui.details.yourRights.item4")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDetails(false)}
              className="flex-1"
            >
              {t("ui-elements:ui.details.cancel")}
            </Button>
            <Button onClick={handleAcceptSelected} className="flex-1">
              {t("ui.details.savePreferences")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Settings Panel Component for User Profile
export const ConsentSettings: React.FC = () => {
  const { t } = useTranslation("ui-common");
  const { enableTracking, disableTracking } = useAnalytics({
    componentName: "ConsentSettings",
  });
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem(CONSENT_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePreferenceUpdate = (
    key: keyof ConsentPreferences,
    value: boolean,
  ) => {
    if (key === "necessary") return;

    const updatedPreferences = {
      ...preferences,
      [key]: value,
      lastUpdated: new Date().toISOString(),
    };

    setPreferences(updatedPreferences);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updatedPreferences));

    // Apply analytics preference
    if (key === "analytics") {
      if (value) {
        enableTracking();
      } else {
        disableTracking();
      }
    }
  };

  const handleWithdrawConsent = () => {
    const minimalPreferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      lastUpdated: new Date().toISOString(),
    };

    setPreferences(minimalPreferences);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(minimalPreferences));
    disableTracking();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cookie className="h-5 w-5" />
          <span>{t("ui-elements:ui.settings.title")}</span>
        </CardTitle>
        <CardDescription>
          {t("ui-elements:ui.settings.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics-toggle">
                {t("ui-elements:ui.settings.analytics.label")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("ui-elements:ui.settings.analytics.description")}
              </p>
            </div>
            <Switch
              id="analytics-toggle"
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                handlePreferenceUpdate("analytics", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-toggle">
                {t("ui-elements:ui.settings.marketing.label")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("ui-elements:ui.settings.marketing.description")}
              </p>
            </div>
            <Switch
              id="marketing-toggle"
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                handlePreferenceUpdate("marketing", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preferences-toggle">
                {t("ui-elements:ui.settings.preferences.label")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("ui-elements:ui.settings.preferences.description")}
              </p>
            </div>
            <Switch
              id="preferences-toggle"
              checked={preferences.preferences}
              onCheckedChange={(checked) =>
                handlePreferenceUpdate("preferences", checked)
              }
            />
          </div>
        </div>

        {preferences.consentDate && (
          <div className="text-xs text-muted-foreground">
            {t("ui.settings.consentGiven")}:{" "}
            {new Date(preferences.consentDate).toLocaleDateString()}
            {preferences.lastUpdated && (
              <span className="block">
                {t("ui.settings.lastUpdated")}:{" "}
                {new Date(preferences.lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleWithdrawConsent}
            className="w-full"
          >
            {t("ui.settings.withdrawConsent")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
