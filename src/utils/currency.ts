import { getCurrentCountryConfig } from "@/config/countries";

export const formatCurrency = (amount: number, currency?: string): string => {
  const countryConfig = getCurrentCountryConfig();
  const currencyCode = currency || countryConfig.currency;

  try {
    return new Intl.NumberFormat(getLocaleFromCurrency(currencyCode), {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    console.error("[Currency] Error formatting currency:", error);
    // Fallback to simple formatting
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export const formatNumber = (value: number): string => {
  const countryConfig = getCurrentCountryConfig();
  const locale = getLocaleFromCountry(countryConfig.code);

  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch (error) {
    console.error("[Currency] Error formatting number:", error);
    // Fallback to simple formatting
    return value.toLocaleString();
  }
};

export const formatDate = (date: Date): string => {
  const countryConfig = getCurrentCountryConfig();
  const locale = getLocaleFromCountry(countryConfig.code);

  try {
    return new Intl.DateTimeFormat(locale).format(date);
  } catch (error) {
    console.error("[Currency] Error formatting date:", error);
    // Fallback to simple formatting
    return date.toLocaleDateString();
  }
};

const getLocaleFromCurrency = (currency: string): string => {
  const currencyToLocale: Record<string, string> = {
    EUR: "de-DE",
    GBP: "en-GB",
    CHF: "de-CH",
    CZK: "cs-CZ",
    PLN: "pl-PL",
    DKK: "da-DK",
    SEK: "sv-SE",
    HUF: "hu-HU",
    BGN: "bg-BG",
    RON: "ro-RO",
    NOK: "nb-NO",
    ISK: "is-IS",
  };

  return currencyToLocale[currency] || "en-US";
};

const getLocaleFromCountry = (countryCode: string): string => {
  const countryToLocale: Record<string, string> = {
    DE: "de-DE",
    GB: "en-GB",
    FR: "fr-FR",
    CZ: "cs-CZ",
    SK: "sk-SK",
    PL: "pl-PL",
    AT: "de-AT",
    CH: "de-CH",
    IT: "it-IT",
    ES: "es-ES",
    NL: "nl-NL",
    BE: "nl-BE",
    LU: "fr-LU",
    LI: "de-LI",
    DK: "da-DK",
    SE: "sv-SE",
    FI: "fi-FI",
    NO: "nb-NO",
    IS: "is-IS",
    IE: "en-IE",
    PT: "pt-PT",
    GR: "el-GR",
    HU: "hu-HU",
    RO: "ro-RO",
    BG: "bg-BG",
    HR: "hr-HR",
    SI: "sl-SI",
    EE: "et-EE",
    LV: "lv-LV",
    LT: "lt-LT",
    MT: "mt-MT",
    CY: "el-CY",
  };

  return countryToLocale[countryCode] || "en-US";
};
