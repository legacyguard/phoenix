import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Key, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SensitiveData {
  accountName?: string;
  accountNumber?: string;
  username?: string;
  password?: string;
  pin?: string;
  notes?: string;
  [key: string]: Record<string, unknown>;
}

interface JustInTimeAccessProps {
  taskId: string;
  taskTitle: string;
  onAccessGranted?: () => void;
  trigger?: React.ReactNode;
}

export const JustInTimeAccess: React.FC<JustInTimeAccessProps> = ({
  taskId,
  taskTitle,
  onAccessGranted,
  trigger,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation("ui-common");
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [sensitiveData, setSensitiveData] = useState<SensitiveData | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReauthentication = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify the password with Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (authError) {
        setError(t("justInTimeAccess.errors.incorrectPassword"));
        return;
      }

      setIsAuthenticated(true);

      // Fetch the sensitive information
      await fetchSensitiveData();

      // Log the access
      await logAccess();

      if (onAccessGranted) {
        onAccessGranted();
      }
    } catch (err) {
      console.error("Re-authentication failed:", err);
      setError(t("justInTimeAccess.errors.verificationFailed"));
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const fetchSensitiveData = async () => {
    try {
      const { data, error } = await supabase
        .from("sensitive_vault")
        .select("*")
        .contains("task_associations", [taskId])
        .single();

      if (error || !data) {
        setError(t("justInTimeAccess.errors.noDataFound"));
        return;
      }

      // In a real application, decrypt the data here
      // For now, we'll simulate decryption
      const decryptedData = data.encrypted_data as SensitiveData;
      setSensitiveData(decryptedData);
    } catch (err) {
      console.error("Failed to fetch sensitive data:", err);
      setError(t("justInTimeAccess.errors.retrievalFailed"));
    }
  };

  const logAccess = async () => {
    try {
      const { error } = await supabase.from("access_logs").insert({
        user_id: user?.id,
        actor: "TRUSTED_PERSON",
        action: t("justInTimeAccess.logAction", {
          name:
            user?.user_metadata?.full_name || t("justInTimeAccess.executor"),
          taskTitle,
        }),
        target_id: taskId,
        metadata: {
          task_title: taskTitle,
          accessed_at: new Date().toISOString(),
          access_type: "just_in_time",
        },
      });

      if (error) {
        console.error("Failed to log access:", error);
      }
    } catch (err) {
      console.error("Error logging access:", err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAuthenticated(false);
    setSensitiveData(null);
    setPassword("");
    setError(null);
    setShowPassword(false);
  };

  const renderSensitiveField = (
    label: string,
    value: string | undefined,
    isPassword: boolean = false,
  ) => {
    if (!value) return null;

    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium" data-testid="justintimeaccess-label">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            value={value}
            readOnly
            type={isPassword && !showPassword ? "password" : "text"}
            className="font-mono" data-testid="justintimeaccess-input"
          />
          {isPassword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="px-2" data-testid="justintimeaccess-showpassword"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" data-testid="justintimeaccess-eyeoff" />
              ) : (
                <Eye className="h-4 w-4" data-testid="justintimeaccess-eye" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} data-testid="justintimeaccess-trigger">
      <DialogTrigger asChild data-testid="justintimeaccess-trigger">
        {trigger || (
          <Button variant="ghost" size="sm" className="text-xs" data-testid="justintimeaccess-button">
            <Key className="h-3 w-3 mr-1" data-testid="justintimeaccess-key" />
            {t("justInTimeAccess.viewAccountDetails")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" data-testid="justintimeaccess-dialogcontent">
        <DialogHeader data-testid="justintimeaccess-dialogheader">
          <DialogTitle className="flex items-center gap-2" data-testid="justintimeaccess-t-justintimeaccess-title">
            <Shield className="h-5 w-5 text-blue-500" data-testid="justintimeaccess-shield" />
            {t("justInTimeAccess.title")}
          </DialogTitle>
          <DialogDescription data-testid="justintimeaccess-dialogdescription">
            {t("justInTimeAccess.description", { taskTitle })}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <Alert data-testid="justintimeaccess-alert">
              <AlertCircle className="h-4 w-4" data-testid="justintimeaccess-alertcircle" />
              <AlertDescription data-testid="justintimeaccess-t-justintimeaccess-securitynotice">
                {t("justInTimeAccess.securityNotice")}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password" data-testid="justintimeaccess-t-justintimeaccess-fields-password">
                {t("justInTimeAccess.fields.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReauthentication()}
                placeholder={t("justInTimeAccess.placeholders.enterPassword")} data-testid="justintimeaccess-input"
              />
            </div>

            {error && (
              <Alert variant="destructive" data-testid="justintimeaccess-alert">
                <AlertCircle className="h-4 w-4" data-testid="justintimeaccess-alertcircle" />
                <AlertDescription data-testid="justintimeaccess-error">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} data-testid="justintimeaccess-t-justintimeaccess-actions-cancel">
                {t("justInTimeAccess.actions.cancel")}
              </Button>
              <Button
                onClick={handleReauthentication}
                disabled={!password || loading} data-testid="justintimeaccess-button"
              >
                {loading
                  ? t("justInTimeAccess.actions.verifying")
                  : t("justInTimeAccess.actions.verify")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sensitiveData ? (
              <Card data-testid="justintimeaccess-card">
                <CardContent className="pt-6 space-y-4" data-testid="justintimeaccess-cardcontent">
                  {renderSensitiveField(
                    t("justInTimeAccess.fields.accountName"),
                    sensitiveData.accountName,
                  )}
                  {renderSensitiveField(
                    t("justInTimeAccess.fields.accountNumber"),
                    sensitiveData.accountNumber,
                  )}
                  {renderSensitiveField(
                    t("justInTimeAccess.fields.username"),
                    sensitiveData.username,
                  )}
                  {renderSensitiveField(
                    t("justInTimeAccess.fields.passwordField"),
                    sensitiveData.password,
                    true,
                  )}
                  {renderSensitiveField(
                    t("justInTimeAccess.fields.pin"),
                    sensitiveData.pin,
                    true,
                  )}

                  {sensitiveData.notes && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium" data-testid="justintimeaccess-label">
                        {t("justInTimeAccess.fields.additionalNotes")}
                      </Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{sensitiveData.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Alert data-testid="justintimeaccess-alert">
                <AlertCircle className="h-4 w-4" data-testid="justintimeaccess-alertcircle" />
                <AlertDescription data-testid="justintimeaccess-t-justintimeaccess-nosensitiveinfo">
                  {t("justInTimeAccess.noSensitiveInfo")}
                </AlertDescription>
              </Alert>
            )}

            <Separator data-testid="justintimeaccess-separator" />

            <div className="text-xs text-muted-foreground">
              <p>{t("justInTimeAccess.accessLogged")}</p>
              <p>
                {t("justInTimeAccess.accessTime", {
                  time: new Date().toLocaleString(),
                })}
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose} data-testid="justintimeaccess-t-justintimeaccess-actions-close">
                {t("justInTimeAccess.actions.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
