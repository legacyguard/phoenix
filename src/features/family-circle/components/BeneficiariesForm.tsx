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
          <Label data-testid="beneficiariesform-t-dashboard-beneficiaryname">{t("dashboard.beneficiaryName")}</Label>
          <Input
            {...register("name")}
            className={formErrors.name ? "border-red-500" : ""} data-testid="beneficiariesform-input"
          />
          {formErrors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" data-testid="beneficiariesform-alertcircle" />
              {formErrors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label data-testid="beneficiariesform-t-dashboard-main-dashboard-allocation">{t("dashboard-main:dashboard.allocation")}</Label>
          <Input
            type="number"
            min={1}
            max={100}
            {...register("allocation")}
            className={formErrors.allocation ? "border-red-500" : ""} data-testid="beneficiariesform-input"
          />
          {formErrors.allocation && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" data-testid="beneficiariesform-alertcircle" />
              {formErrors.allocation.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1" data-testid="beneficiariesform-button">
            {isEditingSingle
              ? t("dashboard.updateBeneficiary")
              : t("dashboard.saveBeneficiary")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancelSingle}
            disabled={isSubmitting} data-testid="beneficiariesform-t-ui-elements-ui-cancel"
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
    <FormProvider {...methods} data-testid="beneficiariesform-formprovider">
      <form className="space-y-6">
        <Card data-testid="beneficiariesform-card">
          <CardHeader data-testid="beneficiariesform-cardheader">
            <CardTitle className="flex items-center gap-2" data-testid="beneficiariesform-cardtitle">
              <Users className="h-5 w-5" data-testid="beneficiariesform-users" />
              {t("wills:wills.beneficiaries.title")}
            </CardTitle>
            <CardDescription data-testid="beneficiariesform-t-wills-wills-beneficiaries-description">
              {t("wills:wills.beneficiaries.description")}
            </CardDescription>
          </CardHeader>
          <CardContent data-testid="beneficiariesform-fields-length-0">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" data-testid="beneficiariesform-users" />
                <p>{t("wills.beneficiaries.noBeneficiaries")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id} data-testid="beneficiariesform-card">
                    <CardContent className="pt-6" data-testid="beneficiariesform-cardcontent">
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          {t("will.beneficiaries.beneficiaryNumber", {
                            number: index + 1,
                          })}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`beneficiaries.${index}.name`} data-testid="beneficiariesform-label">
                              {t("wills:wills.beneficiaries.name")}
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
                              } data-testid="beneficiariesform-input"
                            />
                            {methods.formState.errors.beneficiaries?.[index]
                              ?.name && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" data-testid="beneficiariesform-alertcircle" />
                                {
                                  methods.formState.errors.beneficiaries[index]
                                    ?.name?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`beneficiaries.${index}.allocation`} data-testid="beneficiariesform-label"
                            >
                              {t("wills:wills.beneficiaries.allocation")}
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
                              } data-testid="beneficiariesform-input"
                            />
                            {methods.formState.errors.beneficiaries?.[index]
                              ?.allocation && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" data-testid="beneficiariesform-alertcircle" />
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
                          onClick={() => remove(index)} data-testid="beneficiariesform-t-ui-elements-ui-remove"
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
              className="mt-4" data-testid="beneficiariesform-t-wills-beneficiaries-addbeneficiary"
            >
              {t("wills.beneficiaries.addBeneficiary")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
