import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Activity, Info, Clock, Edit2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import format from "date-fns/format";

interface ExecutorStatus {
  status: string;
  status_description?: string;
  updated_at: string;
}

interface ExecutorStatusReportingProps {
  deceasedUserId: string;
  isReadOnly?: boolean;
}

export const ExecutorStatusReporting: React.FC<
  ExecutorStatusReportingProps
> = ({ deceasedUserId, isReadOnly = false }) => {
  const { user } = useAuth();
  const { t } = useTranslation("family-core");

  const STATUS_OPTIONS = [
    {
      value: "initial_review",
      label: t("estateStatus.statuses.initialReview"),
      color: "bg-gray-500",
    },
    {
      value: "gathering_documents",
      label: t("estateStatus.statuses.gatheringDocuments"),
      color: "bg-blue-500",
    },
    {
      value: "probate_initiated",
      label: t("estateStatus.statuses.probateInitiated"),
      color: "bg-indigo-500",
    },
    {
      value: "assets_being_valued",
      label: t("estateStatus.statuses.assetsBeingValued"),
      color: "bg-purple-500",
    },
    {
      value: "debts_being_settled",
      label: t("estateStatus.statuses.debtsBeingSettled"),
      color: "bg-orange-500",
    },
    {
      value: "tax_preparation",
      label: t("estateStatus.statuses.taxPreparation"),
      color: "bg-yellow-500",
    },
    {
      value: "ready_for_distribution",
      label: t("estateStatus.statuses.readyForDistribution"),
      color: "bg-teal-500",
    },
    {
      value: "distribution_in_progress",
      label: t("estateStatus.statuses.distributionInProgress"),
      color: "bg-green-500",
    },
    {
      value: "estate_closed",
      label: t("estateStatus.statuses.estateClosed"),
      color: "bg-green-700",
    },
  ];
  const [currentStatus, setCurrentStatus] = useState<ExecutorStatus | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    status_description: "",
  });

  useEffect(() => {
    fetchCurrentStatus();
  }, [fetchCurrentStatus]);

  const fetchCurrentStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("executor_status")
        .select("*")
        .eq("deceased_user_id", deceasedUserId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setCurrentStatus(data);
        setFormData({
          status: data.status,
          status_description: data.status_description || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch current status:", err);
    }
  }, [deceasedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("executor_status").insert({
        executor_id: user?.id,
        deceased_user_id: deceasedUserId,
        status: formData.status,
        status_description: formData.status_description || null,
      });

      if (error) throw error;

      // Log this action
      await supabase.from("access_logs").insert({
        user_id: user?.id,
        actor: "USER",
        action: t("estateStatus.logAction", {
          status: STATUS_OPTIONS.find((s) => s.value === formData.status)
            ?.label,
        }),
        metadata: { status: formData.status },
      });

      await fetchCurrentStatus();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  };

  const currentStatusInfo = currentStatus
    ? getStatusInfo(currentStatus.status)
    : null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("estateStatus.title")}
            </CardTitle>
            <CardDescription>{t("estateStatus.description")}</CardDescription>
          </div>
          {!isReadOnly && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Edit2 className="h-4 w-4 mr-1" />
                  {t("estateStatus.updateStatus")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("estateStatus.dialog.title")}</DialogTitle>
                  <DialogDescription>
                    {t("estateStatus.dialog.description")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {t("estateStatus.fields.status")}*
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "estateStatus.placeholders.selectStatus",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_description">
                      {t("estateStatus.fields.additionalDetails")}
                    </Label>
                    <Textarea
                      id="status_description"
                      value={formData.status_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status_description: e.target.value,
                        })
                      }
                      placeholder={t(
                        "estateStatus.placeholders.additionalContext",
                      )}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("estateStatus.actions.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.status}
                    >
                      {loading
                        ? t("estateStatus.actions.updating")
                        : t("estateStatus.actions.update")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {currentStatus ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${currentStatusInfo!.color}`}
              />
              <h3 className="text-lg font-semibold">
                {currentStatusInfo!.label}
              </h3>
            </div>

            {currentStatus.status_description && (
              <p className="text-sm text-muted-foreground">
                {currentStatus.status_description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {t("estateStatus.lastUpdated", {
                  date: format(
                    new Date(currentStatus.updated_at),
                    "MMM d, yyyy h:mm a",
                  ),
                })}
              </span>
            </div>

            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>{t("estateStatus.progress")}</span>
                <span>
                  {STATUS_OPTIONS.findIndex(
                    (s) => s.value === currentStatus.status,
                  ) + 1}{" "}
                  of {STATUS_OPTIONS.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((STATUS_OPTIONS.findIndex((s) => s.value === currentStatus.status) + 1) / STATUS_OPTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {isReadOnly
                ? t("estateStatus.empty.readOnly")
                : t("estateStatus.empty.noStatus")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
