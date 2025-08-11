import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AnalyticsDemo } from "@/components/analytics/AnalyticsDemo";
import { Shield, AlertCircle, ExternalLink } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const Analytics: React.FC = () => {
  const { t } = useTranslation("ui-common");
  const { isTrackingEnabled } = useAnalytics({ componentName: "Analytics" });

  if (!isTrackingEnabled) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">
              {t("analytics.disabled.title")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("analytics.disabled.subtitle")}
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("analytics.disabled.alert.title")}</AlertTitle>
            <AlertDescription>
              {t("analytics.disabled.alert.description")}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.disabled.privacy.title")}</CardTitle>
              <CardDescription>
                {t("analytics.disabled.privacy.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">
                  {t("analytics.disabled.privacy.whatWeTrack")}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t("analytics.disabled.privacy.item1")}</li>
                  <li>{t("analytics.disabled.privacy.item2")}</li>
                  <li>{t("analytics.disabled.privacy.item3")}</li>
                  <li>{t("analytics.disabled.privacy.item4")}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">
                  {t("analytics.disabled.privacy.whatWeDontTrack")}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t("analytics.disabled.privacy.noItem1")}</li>
                  <li>{t("analytics.disabled.privacy.noItem2")}</li>
                  <li>{t("analytics.disabled.privacy.noItem3")}</li>
                </ul>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" asChild>
                  <a href="/user-profile">
                    {t("analytics.disabled.privacy.manageConsent")}
                  </a>
                </Button>
                <Button variant="link" asChild>
                  <a href="/privacy-policy">
                    {t("analytics.disabled.privacy.learnMore")}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Demo component for testing - REMOVE BEFORE PRODUCTION */}
      {process.env.NODE_ENV === "development" && <AnalyticsDemo />}

      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;
