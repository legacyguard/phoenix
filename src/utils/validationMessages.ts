import i18n from "@/i18n";

// Centralized validation messages that can be translated
export const getValidationMessage = (
  key: string,
  params?: Record<string, unknown>,
) => {
  const t = i18n.t;

  const messages: Record<string, string> = {
    // Name validations
    "name.min": t("common:validation.errors.nameMinLength"),
    "name.max": t("common:validation.errors.nameMaxLength", {
      max: params?.max || 100,
    }),

    // Required fields
    "field.required": t("common:validation.errors.fieldRequired", {
      field: params?.field,
    }),
    "country.required": t("common:validation.errors.countryRequired"),

    // Country code
    "countryCode.length": t("common:validation.errors.countryCodeLength"),

    // Selections
    "select.min": t("common:validation.errors.selectAtLeastOne", {
      field: params?.field,
    }),
    "select.max": t("common:validation.errors.selectUpTo", {
      max: params?.max,
      field: params?.field,
    }),

    // Email & Phone
    "email.invalid": t("common:validation.errors.invalidEmail"),
    "phone.invalid": t("common:validation.errors.invalidPhone"),

    // Numbers
    "value.number": t("common:validation.errors.valueMustBeNumber"),
    "value.positive": t("common:validation.errors.valueMustBePositive"),

    // Currency
    "currency.length": t("common:validation.errors.currencyCodeLength"),

    // Character limits
    "field.maxLength": t("common:validation.errors.maxCharacters", {
      field: params?.field,
      max: params?.max,
    }),

    // Allocation
    "allocation.required": t("common:validation.errors.allocationRequired"),
    "allocation.number": t("common:validation.errors.allocationMustBeNumber"),
    "allocation.range": t("common:validation.errors.allocationRange"),

    // Dates
    "expiration.future": t("common:validation.errors.expirationDateFuture"),

    // Tags
    "tags.max": t("common:validation.errors.maxTags", { max: params?.max }),

    // Files
    "file.size": t("common:validation.errors.fileSizeTooLarge", {
      maxSize: params?.maxSize,
    }),
    "file.type": t("common:validation.errors.invalidFileType", {
      types: params?.types,
    }),

    // General errors
    "error.unknown": t("common:validation.errors.unknownError"),
    "error.dataNotFound": t("common:validation.errors.dataNotFound"),
    "error.connection": t("common:validation.errors.connectionError"),
    "error.permission": t("common:validation.errors.permissionDenied"),
    "error.duplicate": t("common:validation.errors.duplicateRecord"),
  };

  return messages[key] || key;
};
