import React from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

// Beneficiary type (can be extended)
export type Beneficiary = {
  id: string;
  name: string;
  allocation: number;
  identification?: string;
  alternativeBeneficiary?: string;
  [key: string]: string | number | boolean | undefined;
};

// Props for the consolidated form
export interface BeneficiariesFormProps {
  beneficiaries?: Beneficiary[];
  onUpdate?: (beneficiaries: Beneficiary[]) => void;
  errors?: Record<string, string>;
  // Single-edit mode
  singleMode?: boolean;
  onSubmitSingle?: (beneficiary: Beneficiary) => void;
  onCancelSingle?: () => void;
  initialDataSingle?: Beneficiary;
  isEditingSingle?: boolean;
}

// Zod schema for a single beneficiary
const beneficiarySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name is required" }),
  allocation: z.preprocess((val) => Number(val), z.number().min(1).max(100)),
  identification: z.string().optional(),
  alternativeBeneficiary: z.string().optional(),
});

const beneficiariesArraySchema = z.object({
  beneficiaries: z.array(beneficiarySchema),
});

export const BeneficiariesForm: React.FC<BeneficiariesFormProps> = ({
  beneficiaries = [],
  onUpdate,
  errors = {},
  singleMode = false,
  onSubmitSingle,
  onCancelSingle,
  initialDataSingle,
  isEditingSingle = false,
}) => {
  const { t } = useTranslation("wills");

  // Always initialize both forms to avoid conditional hook calls
  const singleForm = useForm<Beneficiary>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: initialDataSingle || { id: "", name: "", allocation: 0 },
  });

  const methods = useForm<{ beneficiaries: Beneficiary[] }>({
    resolver: zodResolver(beneficiariesArraySchema),
    defaultValues: { beneficiaries },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: methods.control,
    name: "beneficiaries",
  });

  // Single-edit mode
  if (singleMode) {
    const {
      register,
      handleSubmit,
      formState: { errors: formErrors, isSubmitting },
    } = singleForm;

    const onFormSubmit = async (data: Beneficiary) => {
      if (onSubmitSingle) await onSubmitSingle(data);
    };

    return (
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <Label>{t("dashboard.beneficiaryName")}</Label>
          <Input
            {...register("name")}
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {formErrors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label>{t("dashboard-main:dashboard.allocation")}</Label>
          <Input
            type="number"
            min={1}
            max={100}
            {...register("allocation")}
            className={formErrors.allocation ? "border-red-500" : ""}
          />
          {formErrors.allocation && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {formErrors.allocation.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isEditingSingle
              ? t("dashboard.updateBeneficiary")
              : t("dashboard.saveBeneficiary")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancelSingle}
            disabled={isSubmitting}
          >
            {t("ui-elements:ui.cancel")}
          </Button>
        </div>
      </form>
    );
  }

  // Multi-edit mode

  const handleUpdate = (index: number, updates: Partial<Beneficiary>) => {
    update(index, { ...fields[index], ...updates });
    if (onUpdate) {
      const newList = methods.getValues("beneficiaries");
      onUpdate(newList);
    }
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("wills.beneficiaries.title")}
            </CardTitle>
            <CardDescription>
              {t("wills.beneficiaries.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>{t("wills.beneficiaries.noBeneficiaries")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          {t("will.beneficiaries.beneficiaryNumber", {
                            number: index + 1,
                          })}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`beneficiaries.${index}.name`}>
                              {t("wills.beneficiaries.name")}
                            </Label>
                            <Input
                              id={`beneficiaries.${index}.name`}
                              {...methods.register(
                                `beneficiaries.${index}.name` as const,
                              )}
                              className={
                                methods.formState.errors.beneficiaries?.[index]
                                  ?.name
                                  ? "border-red-500"
                                  : ""
                              }
                              onBlur={() =>
                                handleUpdate(index, {
                                  name: methods.getValues(
                                    `beneficiaries.${index}.name`,
                                  ),
                                })
                              }
                            />
                            {methods.formState.errors.beneficiaries?.[index]
                              ?.name && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {
                                  methods.formState.errors.beneficiaries[index]
                                    ?.name?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`beneficiaries.${index}.allocation`}
                            >
                              {t("wills.beneficiaries.allocation")}
                            </Label>
                            <Input
                              id={`beneficiaries.${index}.allocation`}
                              type="number"
                              min={1}
                              max={100}
                              {...methods.register(
                                `beneficiaries.${index}.allocation` as const,
                              )}
                              className={
                                methods.formState.errors.beneficiaries?.[index]
                                  ?.allocation
                                  ? "border-red-500"
                                  : ""
                              }
                              onBlur={() =>
                                handleUpdate(index, {
                                  allocation: Number(
                                    methods.getValues(
                                      `beneficiaries.${index}.allocation`,
                                    ),
                                  ),
                                })
                              }
                            />
                            {methods.formState.errors.beneficiaries?.[index]
                              ?.allocation && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {
                                  methods.formState.errors.beneficiaries[index]
                                    ?.allocation?.message
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
                          {t("ui-elements:ui.remove")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button
              type="button"
              onClick={() =>
                append({ id: Date.now().toString(), name: "", allocation: 0 })
              }
              className="mt-4"
            >
              {t("wills.beneficiaries.addBeneficiary")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
