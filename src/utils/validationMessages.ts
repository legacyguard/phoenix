import i18n from "@/i18n";

// Centralized validation messages that can be translated
export const getValidationMessage = (
  key: string,
  params?: Record<string, unknown>,
) => {
  const t = i18n.t;

  const messages: Record<string, string> = {
    // Name validations
    "name.min": t("validation:validation.errors.nameMinLength"),
    "name.max": t("validation.errors.nameMaxLength", {
      max: params?.max || 100,
    }),

    // Required fields
    "field.required": t("validation.errors.fieldRequired", {
      field: params?.field,
    }),
    "country.required": t("validation:validation.errors.countryRequired"),

    // Country code
    "countryCode.length": t("validation:validation.errors.countryCodeLength"),

    // Selections
    "select.min": t("validation.errors.selectAtLeastOne", {
      field: params?.field,
    }),
    "select.max": t("validation.errors.selectUpTo", {
      max: params?.max,
      field: params?.field,
    }),

    // Email & Phone
    "email.invalid": t("validation:validation.errors.invalidEmail"),
    "phone.invalid": t("validation:validation.errors.invalidPhone"),

    // Numbers
    "value.number": t("validation:validation.errors.valueMustBeNumber"),
    "value.positive": t("validation:validation.errors.valueMustBePositive"),

    // Currency
    "currency.length": t("validation:validation.errors.currencyCodeLength"),

    // Character limits
    "field.maxLength": t("validation.errors.maxCharacters", {
      field: params?.field,
      max: params?.max,
    }),

    // Allocation
    "allocation.required": t("validation:validation.errors.allocationRequired"),
    "allocation.number": t(
      "validation:validation.errors.allocationMustBeNumber",
    ),
    "allocation.range": t("validation:validation.errors.allocationRange"),

    // Dates
    "expiration.future": t("validation:validation.errors.expirationDateFuture"),

    // Tags
    "tags.max": t("validation.errors.maxTags", { max: params?.max }),

    // Files
    "file.size": t("validation.errors.fileSizeTooLarge", {
      maxSize: params?.maxSize,
    }),
    "file.type": t("validation.errors.invalidFileType", {
      types: params?.types,
    }),

    // General errors
    "error.unknown": t("validation:validation.errors.unknownError"),
    "error.dataNotFound": t("validation:validation.errors.dataNotFound"),
    "error.connection": t("validation:validation.errors.connectionError"),
    "error.permission": t("validation:validation.errors.permissionDenied"),
    "error.duplicate": t("validation:validation.errors.duplicateRecord"),
  };

  return messages[key] || key;
};
