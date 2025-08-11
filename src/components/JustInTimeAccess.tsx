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
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            value={value}
            readOnly
            type={isPassword && !showPassword ? "password" : "text"}
            className="font-mono"
          />
          {isPassword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="px-2"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-xs">
            <Key className="h-3 w-3 mr-1" />
            {t("justInTimeAccess.viewAccountDetails")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            {t("justInTimeAccess.title")}
          </DialogTitle>
          <DialogDescription>
            {t("justInTimeAccess.description", { taskTitle })}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("justInTimeAccess.securityNotice")}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t("justInTimeAccess.fields.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReauthentication()}
                placeholder={t("justInTimeAccess.placeholders.enterPassword")}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t("justInTimeAccess.actions.cancel")}
              </Button>
              <Button
                onClick={handleReauthentication}
                disabled={!password || loading}
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
              <Card>
                <CardContent className="pt-6 space-y-4">
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
                      <Label className="text-sm font-medium">
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t("justInTimeAccess.noSensitiveInfo")}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground">
              <p>{t("justInTimeAccess.accessLogged")}</p>
              <p>
                {t("justInTimeAccess.accessTime", {
                  time: new Date().toLocaleString(),
                })}
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                {t("justInTimeAccess.actions.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
