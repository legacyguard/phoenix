import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Copy, Mail, QrCode, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  ShareModalProps,
  ShareExpiration,
  CreateShareLinkParams,
} from "@/types/sharing";
import { sharingService } from "@/services/sharingService";
import { useToast } from "@/hooks/use-toast";
import type { cn } from "@/lib/utils";

export function ShareModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
  onShare,
}: ShareModalProps) {
  const { t } = useTranslation("sharing");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Form state
  const [expiration, setExpiration] = useState<ShareExpiration>("7d");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [maxViews, setMaxViews] = useState<string>("");
  const [watermark, setWatermark] = useState(true);
  const [allowDownload, setAllowDownload] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      const params: CreateShareLinkParams = {
        content_type: contentType,
        content_id: contentId,
        title: contentTitle,
        expiration,
        password: password || undefined,
        max_views: maxViews ? parseInt(maxViews) : undefined,
        settings: {
          watermark,
          allow_download: allowDownload,
          custom_message: customMessage || undefined,
        },
      };

      const link = await sharingService.createShareLink(params);
      const shareUrl = `${window.location.origin}/share/${link.token}`;
      setShareLink(shareUrl);

      // Generate QR code
      const qr = await sharingService.generateQRCode(shareUrl);
      setQrCode(qr);

      toast({
        title: t("sharing.linkGenerated"),
        description: t("sharing.linkGeneratedDesc"),
      });

      if (onShare) {
        onShare(link);
      }
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: t("ui-elements:ui.error"),
        description: t("sharing.generateError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: t("sharing.linkCopied"),
        description: t("sharing.linkCopiedDesc"),
      });
    } catch (error) {
      toast({
        title: t("ui-elements:ui.error"),
        description: t("sharing.copyError"),
        variant: "destructive",
      });
    }
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(
      t("sharing.emailSubject", { title: contentTitle }),
    );
    const body = encodeURIComponent(
      t("sharing.emailBody", {
        message: customMessage || t("sharing.defaultMessage"),
        link: shareLink,
      }),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("sharing.shareTitle")}</DialogTitle>
        </DialogHeader>

        {!shareLink ? (
          <div className="space-y-4">
            <div>
              <Label>{t("sharing.expiration")}</Label>
              <Select
                value={expiration}
                onValueChange={(value) =>
                  setExpiration(value as ShareExpiration)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">{t("sharing.expire24h")}</SelectItem>
                  <SelectItem value="7d">{t("sharing.expire7d")}</SelectItem>
                  <SelectItem value="30d">{t("sharing.expire30d")}</SelectItem>
                  <SelectItem value="never">
                    {t("sharing.expireNever")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("sharing.password")}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("sharing.passwordPlaceholder")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("sharing.passwordHint")}
              </p>
            </div>

            <div>
              <Label>{t("sharing.maxViews")}</Label>
              <Input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder={t("sharing.maxViewsPlaceholder")}
                min="1"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="watermark">{t("sharing.watermark")}</Label>
                <Switch
                  id="watermark"
                  checked={watermark}
                  onCheckedChange={setWatermark}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="download">{t("sharing.allowDownload")}</Label>
                <Switch
                  id="download"
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                />
              </div>
            </div>

            <div>
              <Label>{t("sharing.customMessage")}</Label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t("sharing.customMessagePlaceholder")}
              />
            </div>

            <Button
              onClick={generateShareLink}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sharing.generating")}
                </>
              ) : (
                t("sharing.generateLink")
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {t("sharing.yourLink")}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>

            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link">{t("sharing.link")}</TabsTrigger>
                <TabsTrigger value="email">{t("sharing.email")}</TabsTrigger>
                <TabsTrigger value="qr">{t("sharing.qrCode")}</TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sharing.linkReady")}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <Button onClick={sendEmail} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  {t("sharing.sendEmail")}
                </Button>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4">
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code" className="max-w-[200px]" />
                  </div>
                )}
                <p className="text-sm text-center text-muted-foreground">
                  {t("sharing.qrHint")}
                </p>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShareLink("");
                  setQrCode("");
                }}
                className="flex-1"
              >
                {t("sharing.newLink")}
              </Button>
              <Button onClick={onClose} className="flex-1">
                {t("ui-elements:ui.done")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
