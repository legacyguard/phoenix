import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { COUNTRY_CONFIGS } from "@/config/countries";
import { supabaseWithRetry } from "@/utils/supabaseWithRetry";
import type { useRetry } from "@/utils/retry";
import type { RetryStatus } from "@/components/common/RetryStatus";
import { toast } from "@/hooks/use-toast";
import { AsyncErrorBoundary } from "@/components/common/AsyncErrorBoundary";
import {
  createGuardianFormSchema,
  type GuardianFormData,
} from "@/schemas/guardianSchema";
import type { useDebouncedCallback } from "@/hooks/useDebounce";

interface GuardianUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingGuardian?: Record<string, unknown>;
}

export const GuardianUpload: React.FC<GuardianUploadProps> = ({
  onSuccess,
  onCancel,
  editingGuardian,
}) => {
  const { t } = useTranslation("ui-common");
  const [isLoading, setIsLoading] = useState(false);

  const guardianFormSchema = createGuardianFormSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: {
      full_name: editingGuardian?.full_name || "",
      relationship: editingGuardian?.relationship || "",
      country_code: editingGuardian?.country_code || "",
      roles: editingGuardian?.roles || [],
      email: editingGuardian?.email || "",
      phone: editingGuardian?.phone || "",
    },
  });

  const watchedRoles = watch("roles");

  const relationships = [
    { key: "spouse", value: t("guardianUpload.relationships.spouse") },
    { key: "parent", value: t("guardianUpload.relationships.parent") },
    { key: "sibling", value: t("guardianUpload.relationships.sibling") },
    { key: "child", value: t("guardianUpload.relationships.child") },
    { key: "friend", value: t("guardianUpload.relationships.friend") },
    {
      key: "legalProfessional",
      value: t("guardianUpload.relationships.legalProfessional"),
    },
    { key: "other", value: t("guardianUpload.relationships.other") },
  ];

  const availableRoles = [
    {
      key: "guardianForChildren",
      value: t("guardianUpload.roles.guardianForChildren"),
    },
    { key: "executorOfWill", value: t("guardianUpload.roles.executorOfWill") },
    {
      key: "healthcareProxy",
      value: t("guardianUpload.roles.healthcareProxy"),
    },
    {
      key: "financialPowerOfAttorney",
      value: t("guardianUpload.roles.financialPowerOfAttorney"),
    },
    {
      key: "emergencyContact",
      value: t("guardianUpload.roles.emergencyContact"),
    },
    { key: "trustee", value: t("guardianUpload.roles.trustee") },
  ];

  const onSubmit = async (data: GuardianFormData) => {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabaseWithRetry.auth.getUser();

      if (!user) {
        toast({
          title: t("guardianUpload.error"),
          description: t("guardianUpload.loginToSave"),
          variant: "destructive",
        });
        return;
      }

      if (editingGuardian) {
        // Update existing guardian
        const { error } = await supabaseWithRetry
          .from("guardians")
          .update({
            full_name: data.full_name,
            relationship: data.relationship,
            country_code: data.country_code,
            roles: data.roles,
            email: data.email || null,
            phone: data.phone || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingGuardian.id);

        if (error) throw error;

        toast({
          title: t("guardianUpload.success"),
          description: t("guardianUpload.updated"),
        });
      } else {
        // Create new guardian
        const { error } = await supabaseWithRetry.from("guardians").insert({
          user_id: user.id,
          full_name: data.full_name,
          relationship: data.relationship,
          country_code: data.country_code,
          roles: data.roles,
          email: data.email || null,
          phone: data.phone || null,
        });

        if (error) throw error;

        toast({
          title: t("guardianUpload.success"),
          description: t("guardianUpload.added"),
        });
      }

      reset();
      onSuccess();
    } catch (error: Record<string, unknown>) {
      const timestamp = new Date().toISOString();
      const errorMessage =
        error?.message || t("guardianUpload.errors.unknownError");
      const errorCode = error?.code || "UNKNOWN_ERROR";

      // Detailed logging for debugging
      console.error("[Guardian Management] Error saving guardian:", {
        timestamp,
        operation: "onSubmit",
        errorCode,
        errorMessage,
        errorDetails: error,
        stack: error?.stack,
      });

      // User-friendly message
      let userMessage = t("guardianUpload.errors.saveError");

      // Specific messages based on error type
      if (error?.code === "PGRST116") {
        userMessage = t("guardianUpload.errors.requiredDataNotFound");
      } else if (error?.message?.includes("network")) {
        userMessage = t("guardianUpload.errors.connectionError");
      } else if (error?.message?.includes("permission")) {
        userMessage = t("guardianUpload.errors.permissionError");
      } else if (error?.message?.includes("duplicate")) {
        userMessage = t("guardianUpload.errors.duplicateError");
      }

      toast({
        title: t("guardianUpload.error"),
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    const currentRoles = watch("roles") || [];
    if (checked) {
      setValue("roles", [...currentRoles, role]);
    } else {
      setValue(
        "roles",
        currentRoles.filter((r) => r !== role),
      );
    }
  };

  return (
    <AsyncErrorBoundary data-testid="guardianupload-asyncerrorboundary">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            {editingGuardian
              ? t("guardianUpload.editTitle")
              : t("guardianUpload.addTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("guardianUpload.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Guardian's Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" data-testid="guardianupload-t-guardianupload-fullnamelabel">
              {t("guardianUpload.fullNameLabel")} *
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder={t("guardianUpload.fullNamePlaceholder")}
              className={errors.full_name ? "border-red-500" : ""} data-testid="guardianupload-input"
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship" data-testid="guardianupload-t-guardianupload-relationshiplabel">
              {t("guardianUpload.relationshipLabel")} *
            </Label>
            <Select
              value={watch("relationship")}
              onValueChange={(value) => setValue("relationship", value)} data-testid="guardianupload-setvalue-relationship-value"
            >
              <SelectTrigger
                className={errors.relationship ? "border-red-500" : ""} data-testid="guardianupload-selecttrigger"
              >
                <SelectValue
                  placeholder={t("guardianUpload.relationshipPlaceholder")} data-testid="guardianupload-selectvalue"
                />
              </SelectTrigger>
              <SelectContent data-testid="guardianupload-relationships-map-rel">
                {relationships.map((rel) => (
                  <SelectItem key={rel.key} value={rel.value} data-testid="guardianupload-rel-value">
                    {rel.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-sm text-red-500">
                {errors.relationship.message}
              </p>
            )}
          </div>

          {/* Country of Residence */}
          <div className="space-y-2">
            <Label htmlFor="country_code" data-testid="guardianupload-t-guardianupload-countrylabel">
              {t("guardianUpload.countryLabel")} *
            </Label>
            <Select
              value={watch("country_code")}
              onValueChange={(value) => setValue("country_code", value)} data-testid="guardianupload-setvalue-country-code-value"
            >
              <SelectTrigger
                className={errors.country_code ? "border-red-500" : ""} data-testid="guardianupload-selecttrigger"
              >
                <SelectValue
                  placeholder={t("guardianUpload.countryPlaceholder")} data-testid="guardianupload-selectvalue"
                />
              </SelectTrigger>
              <SelectContent data-testid="guardianupload-control">
                {Object.values(COUNTRY_CONFIGS)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((config) => (
                    <SelectItem key={config.code} value={config.code} data-testid="guardianupload-selectitem">
                      <div className="flex items-center space-x-2">
                        <span>{config.flag}</span>
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("guardianUpload.countryDescription")}
            </p>
            {errors.country_code && (
              <p className="text-sm text-red-500">
                {errors.country_code.message}
              </p>
            )}
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label data-testid="guardianupload-t-guardianupload-rolestitle">{t("guardianUpload.rolesTitle")} *</Label>
            <div className="grid grid-cols-1 gap-3">
              {availableRoles.map((role) => (
                <div key={role.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.key}
                    checked={watchedRoles?.includes(role.value) || false}
                    onCheckedChange={(checked) =>
                      handleRoleToggle(role.value, checked as boolean)
                    } data-testid="guardianupload-checkbox"
                  />
                  <Label htmlFor={role.key} className="text-sm font-normal" data-testid="guardianupload-role-value">
                    {role.value}
                  </Label>
                </div>
              ))}
            </div>
            {errors.roles && (
              <p className="text-sm text-red-500">{errors.roles.message}</p>
            )}
          </div>

          {/* Optional Email */}
          <div className="space-y-2">
            <Label htmlFor="email" data-testid="guardianupload-t-guardianupload-emaillabel">{t("guardianUpload.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t("guardianUpload.emailPlaceholder")}
              className={errors.email ? "border-red-500" : ""} data-testid="guardianupload-input"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Optional Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" data-testid="guardianupload-t-guardianupload-phonelabel">{t("guardianUpload.phoneLabel")}</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder={t("guardianUpload.phonePlaceholder")}
              className={errors.phone ? "border-red-500" : ""} data-testid="guardianupload-input"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} data-testid="guardianupload-button">
              {isLoading
                ? t("guardianUpload.saving")
                : editingGuardian
                  ? t("guardianUpload.updateButton")
                  : t("guardianUpload.addButton")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} data-testid="guardianupload-t-ui-elements-ui-cancel">
              {t("ui-elements:ui.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </AsyncErrorBoundary>
  );
};
