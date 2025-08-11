import { z } from "zod";

// Function to create guardian form schema with translations
export const createGuardianFormSchema = (
  t: (key: string, params?: Record<string, unknown>) => string,
) =>
  z.object({
    full_name: z
      .string()
      .min(2, { message: t("validation.errors.nameMinLength", { min: 2 }) })
      .max(100, { message: t("validation.errors.nameMaxLength", { max: 100 }) })
      .trim(),

    relationship: z
      .string()
      .min(1, { message: t("validation.errors.relationshipRequired") }),

    country_code: z
      .string()
      .min(2, { message: t("validation.errors.countryRequired") })
      .max(2, { message: t("validation.errors.countryCodeLength") }),

    roles: z
      .array(z.string())
      .min(1, {
        message: t("validation.errors.selectAtLeastOne", { field: "role" }),
      })
      .max(6, {
        message: t("validation.errors.selectUpTo", { max: 6, field: "roles" }),
      }),

    email: z
      .string()
      .email({ message: t("validation.errors.invalidEmail") })
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .regex(
        /^(\+\d{1,3})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/,
        {
          message: t("validation.errors.invalidPhone"),
        },
      )
      .optional()
      .or(z.literal("")),
  });

export type GuardianFormData = z.infer<
  ReturnType<typeof createGuardianFormSchema>
>;
