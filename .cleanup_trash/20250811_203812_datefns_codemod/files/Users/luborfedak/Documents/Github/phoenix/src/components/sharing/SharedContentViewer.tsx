import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { sharingService } from "@/services/sharingService";
import type { SharedLink, ContentType } from "@/types/sharing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Lock,
  FileText,
  Users,
  PiggyBank,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

interface SharedContentViewerProps {
  token?: string;
  password?: string;
}

export function SharedContentViewer({
  token,
  password,
}: SharedContentViewerProps) {
  const { t } = useTranslation("sharing");
  const { token: routeToken } = useParams<{ token: string }>();
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [providedPassword, setProvidedPassword] = useState(password || "");
  const [needsPassword, setNeedsPassword] = useState(false);

  const effectiveToken = routeToken || token || "";

  const checkShareLink = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const link = await sharingService.getShareLinkByToken(effectiveToken);

      if (!link) {
        setError(t("sharing.linkExpired"));
        setLoading(false);
        return;
      }

      setSharedLink(link);

      // Check if password is required
      if (link.password_hash && !providedPassword) {
        setNeedsPassword(true);
        setLoading(false);
        return;
      }

      // If password provided, validate it
      if (link.password_hash && providedPassword) {
        const isValid = await sharingService.validateSharePassword(
          effectiveToken,
          providedPassword,
        );
        if (!isValid) {
          setNeedsPassword(true);
          setError(t("sharing.incorrectPassword"));
          setLoading(false);
          return;
        }
      }

      // Log access
      await sharingService.logShareAccess(effectiveToken, {
        user_agent: navigator.userAgent,
        referer: document.referrer,
      });

      // Fetch content
      const contentData = await sharingService.getSharedContent(
        link.content_type,
        link.content_id,
      );
      setContent(contentData);
      setNeedsPassword(false);
    } catch (err) {
      console.error("Error loading shared content:", err);
      setError(t("sharing.loadError"));
    } finally {
      setLoading(false);
    }
  }, [effectiveToken, providedPassword, t]);

  useEffect(() => {
    if (effectiveToken) {
      checkShareLink();
    }
  }, [effectiveToken, checkShareLink]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await checkShareLink();
  };

  const renderContent = () => {
    if (!sharedLink || !content) return null;

    switch (sharedLink.content_type) {
      case "playbook_section":
        return renderPlaybookSection();
      case "asset_summary":
        return renderAssetSummary();
      case "inheritance_allocation":
        return renderInheritanceAllocation();
      case "document":
        return renderDocument();
      default:
        return null;
    }
  };

  const renderPlaybookSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">
          {content.title || t("sharing.playbookSection")}
        </h2>
      </div>
      {content.description && (
        <p className="text-muted-foreground">{content.description}</p>
      )}
      <div className="space-y-4">
        {content.playbook_contacts?.map((contact: Record<string, unknown>) => (
          <Card key={contact.id}>
            <CardHeader>
              <CardTitle className="text-lg">{contact.contact.name}</CardTitle>
              <CardDescription>{contact.contact.relationship}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {contact.contact.email && (
                  <p>
                    {t("sharing.sharedContentViewer.email_1")}
                    {contact.contact.email}
                  </p>
                )}
                {contact.contact.phone && (
                  <p>
                    {t("sharing.sharedContentViewer.phone_2")}
                    {contact.contact.phone}
                  </p>
                )}
                {contact.notes && (
                  <p className="text-muted-foreground">{contact.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAssetSummary = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PiggyBank className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">{t("sharing.assetSummary")}</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {t("sharing.totalAssets", { count: content.totalAssets })}
          </CardTitle>
          <CardDescription>
            {t("sharing.lastUpdated", {
              date: format(new Date(content.lastUpdated), "PPP"),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.categories.map((category: Record<string, unknown>) => (
              <div
                key={category.name}
                className="flex justify-between items-center"
              >
                <span className="font-medium">{category.name}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">{category.count}</span>
                  <span className="text-muted-foreground ml-2">
                    ({category.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInheritanceAllocation = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">
          {t("sharing.inheritanceAllocation")}
        </h2>
      </div>
      <div className="grid gap-4">
        {content.beneficiaries.map((beneficiary: Record<string, unknown>) => (
          <Card key={beneficiary.name}>
            <CardHeader>
              <CardTitle className="text-lg">{beneficiary.name}</CardTitle>
              <CardDescription>{beneficiary.relationship}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {beneficiary.allocation}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t("sharing.totalAllocated")}</span>
              <span className="font-bold">{content.totalAllocated}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t("sharing.unallocated")}</span>
              <span className="font-bold">{content.unallocated}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocument = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">{content.title}</h2>
      </div>
      {content.description && (
        <p className="text-muted-foreground">{content.description}</p>
      )}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p>
              <strong>{t("sharing.fileType")}:</strong> {content.file_type}
            </p>
            <p>
              <strong>{t("sharing.uploadedAt")}:</strong>{" "}
              {format(new Date(content.created_at), "PPP")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {t("sharing.accessDenied")}
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t("sharing.protectedContent")}</CardTitle>
            <CardDescription>
              {t("sharing.enterPasswordToView")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">{t("sharing.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={providedPassword}
                  onChange={(e) => setProvidedPassword(e.target.value)}
                  placeholder={t("sharing.passwordPlaceholder")}
                  required
                />

                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                {t("sharing.unlock")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header with watermark */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">{t("ui-elements:ui.name")}</span>
            </div>
            {sharedLink?.settings?.watermark && (
              <span className="text-sm text-muted-foreground">
                {t("sharing.sharedFrom")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {sharedLink?.settings?.custom_message && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {sharedLink.settings.custom_message}
              </p>
            </CardContent>
          </Card>
        )}

        {renderContent()}

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          {sharedLink?.expires_at && (
            <p>
              {t("sharing.expiresOn", {
                date: format(new Date(sharedLink.expires_at), "PPP"),
              })}
            </p>
          )}
          {sharedLink?.max_views && (
            <p>
              {t("sharing.viewsRemaining", {
                remaining: sharedLink.max_views - sharedLink.view_count,
              })}
            </p>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print:break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
