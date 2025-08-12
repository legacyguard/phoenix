import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGenderAwareTranslation } from "@/i18n/useGenderAwareTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";
import { willSchema, WillFormData } from "@/schemas/willSchema";

interface WillFormProps {
  onSubmit: (data: WillFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<WillFormData>;
  contacts?: Array<{ id: string; name: string; role: string }>;
  isLoading?: boolean;
}

export const WillForm: React.FC<WillFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  contacts = [],
  isLoading = false,
}) => {
  const { t } = useGenderAwareTranslation("legal");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WillFormData>({
    resolver: zodResolver(willSchema),
    defaultValues: {
      status: initialData?.status || "draft",
      physical_location: initialData?.physical_location || "",
      executor_contact_id: initialData?.executor_contact_id || "",
      notes: initialData?.notes || "",
    },
  });

  const watchStatus = watch("status");

  const statusOptions = [
    {
      key: "draft",
      label: t("wills:wills.status.draft"),
      variant: "secondary",
    },
    {
      key: "notarized",
      label: t("wills:wills.status.notarized"),
      variant: "default",
    },
    {
      key: "stored",
      label: t("wills:wills.status.stored"),
      variant: "default",
    },
    {
      key: "updated",
      label: t("wills:wills.status.updated"),
      variant: "secondary",
    },
  ];

  const getStatusVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    const option = statusOptions.find((opt) => opt.key === status);
    return (option?.variant || "default") as
      | "default"
      | "secondary"
      | "destructive"
      | "outline";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Status */}
      <div className="space-y-2">
        <Label data-testid="willform-t-wills-fields-currentstatus">{t("wills.fields.currentStatus")}</Label>
        <div className="flex items-center gap-3">
          <Select
            value={watchStatus}
            onValueChange={(value) => setValue("status", value)} data-testid="willform-setvalue-status-value"
          >
            <SelectTrigger
              className={errors.status ? "border-destructive" : ""} data-testid="willform-selecttrigger"
            >
              <SelectValue data-testid="willform-selectvalue" />
            </SelectTrigger>
            <SelectContent data-testid="willform-statusoptions-map-status">
              {statusOptions.map((status) => (
                <SelectItem key={status.key} value={status.key} data-testid="willform-status-label">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant={getStatusVariant(watchStatus)} data-testid="willform-badge">
            {statusOptions.find((opt) => opt.key === watchStatus)?.label ||
              watchStatus}
          </Badge>
        </div>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {t("wills.descriptions.statusDescription")}
        </p>
      </div>

      {/* Physical Location */}
      <div className="space-y-2">
        <Label htmlFor="location" data-testid="willform-t-wills-fields-physicallocation">{t("wills.fields.physicalLocation")}</Label>
        <Input
          id="location"
          placeholder={t("wills.placeholders.physicalLocation")}
          {...register("physical_location")}
          className={errors.physical_location ? "border-destructive" : ""} data-testid="willform-input"
        />
        {errors.physical_location && (
          <p className="text-sm text-destructive">
            {errors.physical_location.message}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {t("wills.descriptions.physicalLocationDescription")}
        </p>
      </div>

      {/* Executor Contact */}
      <div className="space-y-2">
        <Label data-testid="willform-t-wills-fields-executorcontact">{t("wills.fields.executorContact")}</Label>
        <Select
          value={watch("executor_contact_id") || ""}
          onValueChange={(value) => setValue("executor_contact_id", value)} data-testid="willform-setvalue-executor-contact-id-value"
        >
          <SelectTrigger
            className={errors.executor_contact_id ? "border-destructive" : ""} data-testid="willform-selecttrigger"
          >
            <SelectValue placeholder={t("wills.placeholders.selectContact")} data-testid="willform-selectvalue" />
          </SelectTrigger>
          <SelectContent data-testid="willform-contacts-map-contact">
            <SelectItem value="" data-testid="willform-t-wills-options-nocontactselected">
              {t("wills.options.noContactSelected")}
            </SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id} data-testid="willform-selectitem">
                <div className="flex items-center gap-2">
                  <span>{contact.name}</span>
                  <Badge variant="outline" className="text-xs" data-testid="willform-contact-role">
                    {contact.role}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.executor_contact_id && (
          <p className="text-sm text-destructive">
            {errors.executor_contact_id.message}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {t("wills.descriptions.executorDescription")}
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" data-testid="willform-t-wills-fields-additionalnotes">{t("wills.fields.additionalNotes")}</Label>
        <Textarea
          id="notes"
          placeholder={t("wills.placeholders.additionalNotes")}
          {...register("notes")}
          rows={3}
          className={errors.notes ? "border-destructive" : ""} data-testid="willform-textarea"
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading} data-testid="willform-t-wills-wills-common-cancel"
          >
            {t("wills:wills.common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1" data-testid="willform-isloading">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("wills:wills.buttons.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" data-testid="willform-save" />
              {t("wills.buttons.saveWillInfo")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
