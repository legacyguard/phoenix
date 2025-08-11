import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

// Create beneficiary form schema
const createBeneficiaryFormSchema = (t: Record<string, unknown>) =>
  z.object({
    name: z
      .string()
      .min(2, { message: t("validation:validation.errors.nameMinLength") })
      .max(100, { message: t("validation.errors.nameMaxLength", { max: 100 }) })
      .trim(),
    allocation: z
      .string()
      .min(1, { message: t("validation:validation.errors.allocationRequired") })
      .refine((val) => !isNaN(Number(val)), {
        message: t("validation:validation.errors.allocationMustBeNumber"),
      })
      .refine(
        (val) => {
          const num = Number(val);
          return num >= 1 && num <= 100;
        },
        {
          message: t("validation:validation.errors.allocationRange"),
        },
      ),
  });

type BeneficiaryFormData = z.infer<
  ReturnType<typeof createBeneficiaryFormSchema>
>;

interface BeneficiaryFormProps {
  onSubmit: (data: BeneficiaryFormData) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    allocation: number;
  };
  isEditing?: boolean;
}

export const BeneficiaryForm: React.FC<BeneficiaryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const { t } = useTranslation("errors");

  const beneficiaryFormSchema = createBeneficiaryFormSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      allocation: initialData?.allocation?.toString() || "",
    },
  });

  const onFormSubmit = async (data: BeneficiaryFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting beneficiary form:", error);
      toast.error(t("dashboard.errors.failedToSaveBeneficiary"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <FormField
        label={t("dashboard.beneficiaryName")}
        error={errors.name?.message}
        required
      >
        <Input
          id="beneficiaryName"
          placeholder={t("dashboard.placeholders.beneficiaryName")}
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
      </FormField>

      <FormField
        label={t("dashboard-main:dashboard.allocation")}
        error={errors.allocation?.message}
        required
      >
        <Input
          id="allocation"
          type="number"
          min="1"
          max="100"
          placeholder={t("dashboard.placeholders.allocationPercentage")}
          {...register("allocation")}
          className={errors.allocation ? "border-red-500" : ""}
        />
      </FormField>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? t("ui-elements:ui.saving")
            : isEditing
              ? t("dashboard.updateBeneficiary")
              : t("dashboard.saveBeneficiary")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("ui-elements:ui.cancel")}
        </Button>
      </div>
    </form>
  );
};
