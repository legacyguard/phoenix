import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodObject, ZodRawShape } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

// Type for a dynamic field
export type AssetField = {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>; // for select fields in the future
};

export type AssetFormData = Record<string, string | number | boolean>;

export interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
  onCancel: () => void;
  initialData?: AssetFormData;
  isEditing?: boolean;
  fields?: AssetField[]; // If not provided, use default fields
  schema?: ZodObject<ZodRawShape>; // If not provided, use default schema
}

// Default fields for simple asset form
const defaultFields: AssetField[] = [
  {
    name: "name",
    label: "dashboard.assetName",
    type: "text",
    required: true,
    placeholder: "dashboard.placeholders.assetName",
  },
  {
    name: "type",
    label: "dashboard.assetType",
    type: "text",
    required: true,
    placeholder: "dashboard.placeholders.assetType",
  },
];

export const AssetForm: React.FC<AssetFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
  fields = defaultFields,
  schema,
}) => {
  const { t } = useTranslation("errors");

  // Build a zod schema dynamically if not provided
  const assetFormSchema = React.useMemo(() => {
    if (schema) return schema;
    const shape: ZodRawShape = {};
    fields.forEach((field) => {
      if (field.type === "number") {
        if (field.required) {
          shape[field.name] = z.preprocess(
            (val) => (val === "" ? undefined : Number(val)),
            z.number({
              required_error: t("common:validation.errors.requiredField"),
              invalid_type_error: t("common:validation.errors.mustBeNumber"),
            }),
          );
        } else {
          shape[field.name] = z.preprocess(
            (val) => (val === "" ? undefined : Number(val)),
            z
              .number({
                invalid_type_error: t("common:validation.errors.mustBeNumber"),
              })
              .optional(),
          );
        }
      } else {
        let zodField = z.string();
        if (field.required) {
          zodField = zodField.min(1, {
            message: t("common:validation.errors.requiredField"),
          });
        }
        shape[field.name] = zodField;
      }
    });
    return z.object(shape);
  }, [fields, schema, t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.name] = initialData[field.name] || "";
      return acc;
    }, {} as AssetFormData),
  });

  const onFormSubmit = async (data: AssetFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting asset form:", error);
      toast.error(t("dashboard-main:dashboard.errors.failedToSaveAsset"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          label={t(field.label)}
          error={errors[field.name]?.message as string}
          required={field.required}
        >
          <Input
            id={field.name}
            type={field.type}
            placeholder={t(field.placeholder || "")}
            {...register(field.name)}
            className={errors[field.name] ? "border-red-500" : ""}
          />
        </FormField>
      ))}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? t("common:ui.saving")
            : isEditing
              ? t("dashboard-main:dashboard.updateAsset")
              : t("dashboard-main:dashboard.saveAsset")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("ui.cancel")}
        </Button>
      </div>
    </form>
  );
};
