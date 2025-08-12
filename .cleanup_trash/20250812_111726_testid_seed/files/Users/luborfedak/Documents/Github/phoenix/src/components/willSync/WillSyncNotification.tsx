import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, X, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WillSyncLog, WillChanges } from "@/types/willSync";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

interface WillSyncNotificationProps {
  syncLog: WillSyncLog;
  onApprove?: (logId: string) => void;
  onReject?: (logId: string) => void;
  onDismiss?: (logId: string) => void;
  onViewChanges?: (logId: string) => void;
}

export function WillSyncNotification({
  syncLog,
  onApprove,
  onReject,
  onDismiss,
  onViewChanges,
}: WillSyncNotificationProps) {
  const { t } = useTranslation("wills");

  const getStatusIcon = () => {
    switch (syncLog.status) {
      case "pending":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "approved":
      case "auto_applied":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variant =
      syncLog.status === "pending"
        ? "secondary"
        : syncLog.status === "approved" || syncLog.status === "auto_applied"
          ? "default"
          : "destructive";

    return (
      <Badge variant={variant}>{t(`willSync.status.${syncLog.status}`)}</Badge>
    );
  };

  const renderChangeSummary = (changes: WillChanges) => {
    const items: string[] = [];

    if (changes.added?.assets?.length) {
      items.push(
        t("willSync.changes.assetsAdded", {
          count: changes.added.assets.length,
        }),
      );
    }
    if (changes.removed?.beneficiaries?.length) {
      items.push(
        t("willSync.changes.beneficiariesRemoved", {
          count: changes.removed.beneficiaries.length,
        }),
      );
    }
    if (changes.modified?.allocations?.length) {
      items.push(
        t("willSync.changes.allocationsModified", {
          count: changes.modified.allocations.length,
        }),
      );
    }

    return items.length > 0
      ? items.join(", ")
      : t("willSync.changes.noChanges");
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div className="space-y-1">
              <CardTitle className="text-base">
                {t(`willSync.events.${syncLog.trigger_event}`)}
              </CardTitle>
              <CardDescription>
                {formatDistanceToNow(new Date(syncLog.created_at), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDismiss(syncLog.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {renderChangeSummary(syncLog.changes_made)}
          </div>

          {syncLog.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onApprove?.(syncLog.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t("willSync.approve")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(syncLog.id)}
              >
                <X className="mr-2 h-4 w-4" />
                {t("willSync.reject")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewChanges?.(syncLog.id)}
              >
                {t("willSync.viewChanges")}
              </Button>
            </div>
          )}

          {syncLog.status === "auto_applied" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              {t("willSync.autoApplied")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
