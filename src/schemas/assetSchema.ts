import { z } from "zod";

// Function to create asset form schema with translations
export const createAssetFormSchema = (
  t: (key: string, params?: Record<string, unknown>) => string,
) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t("common:validation.errors.assetNameRequired") })
      .max(200, {
        message: t("common:validation.errors.nameMaxLength", { max: 200 }),
      })
      .trim(),

    type: z
      .string()
      .min(1, { message: t("common:validation.errors.assetTypeRequired") }),

    country_code: z
      .string()
      .min(2, { message: t("common:validation.errors.countryRequired") })
      .max(2, { message: t("common:validation.errors.countryCodeLength") })
      .optional(),

    estimated_value: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: t("common:validation.errors.valueMustBeNumber"),
      })
      .refine((val) => !val || Number(val) >= 0, {
        message: t("common:validation.errors.valueMustBePositive"),
      }),

    currency_code: z
      .string()
      .length(3, { message: t("common:validation.errors.currencyCodeLength") })
      .optional(),

    // Specific fields for real estate
    address: z
      .string()
      .max(500, {
        message: t("common:validation.errors.addressMaxLength", { max: 500 }),
      })
      .optional(),

    property_registry_number: z
      .string()
      .max(100, {
        message: t("common:validation.errors.registryNumberMaxLength", {
          max: 100,
        }),
      })
      .optional(),

    // Specific fields for financial accounts
    account_type: z.string().optional(),
    financial_institution: z
      .string()
      .max(200, {
        message: t("common:validation.errors.institutionNameMaxLength", {
          max: 200,
        }),
      })
      .optional(),
    account_number: z
      .string()
      .max(50, {
        message: t("common:validation.errors.accountNumberMaxLength", {
          max: 50,
        }),
      })
      .optional(),
    login_credentials: z
      .string()
      .max(1000, {
        message: t("common:validation.errors.credentialsMaxLength", {
          max: 1000,
        }),
      })
      .optional(),
  });

export type AssetFormData = z.infer<ReturnType<typeof createAssetFormSchema>>;
