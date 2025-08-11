// Type definitions for country and language codes
export type CountryCode =
  | "DE"
  | "GB"
  | "FR"
  | "CZ"
  | "SK"
  | "PL"
  | "AT"
  | "CH"
  | "IT"
  | "ES"
  | "NL"
  | "BE"
  | "LU"
  | "LI"
  | "DK"
  | "SE"
  | "FI"
  | "NO"
  | "IS"
  | "IE"
  | "PT"
  | "GR"
  | "HU"
  | "RO"
  | "BG"
  | "HR"
  | "SI"
  | "EE"
  | "LV"
  | "LT"
  | "MT"
  | "CY"
  | "MD"
  | "UA"
  | "RS"
  | "AL"
  | "MK"
  | "ME"
  | "BA";

export type LanguageCode =
  | "en"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "pl"
  | "cs"
  | "sk"
  | "hu"
  | "ro"
  | "bg"
  | "hr"
  | "sl"
  | "et"
  | "lv"
  | "lt"
  | "el"
  | "nl"
  | "da"
  | "sv"
  | "fi"
  | "no"
  | "is"
  | "pt"
  | "mt"
  | "sq"
  | "mk"
  | "sr"
  | "uk"
  | "ru"
  | "tr"
  | "ga"
  | "bs"
  | "cy";

export const SUPPORTED_COUNTRIES: CountryCode[] = [
  "DE",
  "GB",
  "FR",
  "CZ",
  "SK",
  "PL",
  "AT",
  "CH",
  "IT",
  "ES",
  "NL",
  "BE",
  "LU",
  "LI",
  "DK",
  "SE",
  "FI",
  "NO",
  "IS",
  "IE",
  "PT",
  "GR",
  "HU",
  "RO",
  "BG",
  "HR",
  "SI",
  "EE",
  "LV",
  "LT",
  "MT",
  "CY",
  "MD",
  "UA",
  "RS",
  "AL",
  "MK",
  "ME",
  "BA",
];

// Map of countries to their supported languages
export const COUNTRY_LANGUAGES: Record<CountryCode, LanguageCode[]> = {
  DE: ["de", "en", "pl", "uk"],
  GB: ["en", "cy", "pl", "fr", "de", "uk"],
  FR: ["fr", "en", "de", "es", "uk"],
  CZ: ["cs", "sk", "en", "de", "uk"],
  SK: ["sk", "cs", "en", "de", "uk"],
  PL: ["pl", "en", "de", "cs", "uk"],
  AT: ["de", "en", "it", "cs", "uk"],
  CH: ["de", "fr", "it", "en", "uk"],
  IT: ["it", "en", "de", "fr", "uk"],
  ES: ["es", "en", "fr", "de", "uk"],
  NL: ["nl", "en", "de", "fr", "uk"],
  BE: ["nl", "fr", "en", "de", "uk"],
  LU: ["fr", "de", "en", "pt", "uk"],
  LI: ["de", "en", "fr", "it"],
  DK: ["da", "en", "de", "sv", "uk"],
  SE: ["sv", "en", "de", "fi", "uk"],
  FI: ["fi", "sv", "en", "de", "uk"],
  NO: ["no", "en", "sv", "da", "uk"],
  IS: ["is", "en", "da", "no"],
  IE: ["en", "ga", "pl", "fr", "uk"],
  PT: ["pt", "en", "es", "fr", "uk"],
  GR: ["el", "en", "de", "fr", "uk"],
  HU: ["hu", "en", "de", "sk", "ro"],
  RO: ["ro", "en", "de", "hu", "uk"],
  BG: ["bg", "en", "de", "ru", "uk"],
  HR: ["hr", "en", "de", "it", "sr"],
  SI: ["sl", "en", "de", "hr", "it"],
  EE: ["et", "ru", "en", "fi", "uk"],
  LV: ["lv", "ru", "en", "de", "uk"],
  LT: ["lt", "en", "ru", "pl", "uk"],
  MT: ["mt", "en", "it", "de", "fr"],
  CY: ["el", "en", "tr", "ru", "uk"],
  MD: ["ro", "ru", "en", "uk", "bg"],
  UA: ["uk", "ru", "en", "pl", "ro"],
  RS: ["sr", "en", "de", "ru", "hr"],
  AL: ["sq", "en", "it", "de", "el"],
  MK: ["mk", "sq", "en", "de", "bg"],
  ME: ["sr", "en", "de", "ru"],
  BA: ["bs", "hr", "sr", "en", "de"],
};

export interface CountryConfig {
  code: string;
  name: string;
  domain: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  currency: string;
  flag: string;
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  "legacyguard.eu": {
    code: "DE",
    name: "Germany",
    domain: "legacyguard.eu",
    primaryLanguage: "de",
    supportedLanguages: ["de", "en", "pl", "uk"],
    currency: "EUR",
    flag: "🇩🇪",
  },
  "legacyguard.uk": {
    code: "GB",
    name: "United Kingdom",
    domain: "legacyguard.uk",
    primaryLanguage: "en",
    supportedLanguages: ["en", "cy", "pl", "fr", "de", "uk"],
    currency: "GBP",
    flag: "🇬🇧",
  },
  "legacyguard.fr": {
    code: "FR",
    name: "France",
    domain: "legacyguard.fr",
    primaryLanguage: "fr",
    supportedLanguages: ["fr", "en", "de", "es", "uk"],
    currency: "EUR",
    flag: "🇫🇷",
  },
  "legacyguard.cz": {
    code: "CZ",
    name: "Czech Republic",
    domain: "legacyguard.cz",
    primaryLanguage: "cs",
    supportedLanguages: ["cs", "sk", "en", "de", "uk"],
    currency: "CZK",
    flag: "🇨🇿",
  },
  "legacyguard.sk": {
    code: "SK",
    name: "Slovakia",
    domain: "legacyguard.sk",
    primaryLanguage: "sk",
    supportedLanguages: ["sk", "cs", "en", "de", "uk"],
    currency: "EUR",
    flag: "🇸🇰",
  },
  "legacyguard.pl": {
    code: "PL",
    name: "Poland",
    domain: "legacyguard.pl",
    primaryLanguage: "pl",
    supportedLanguages: ["pl", "en", "de", "cs", "uk"],
    currency: "PLN",
    flag: "🇵🇱",
  },
  "legacyguard.at": {
    code: "AT",
    name: "Austria",
    domain: "legacyguard.at",
    primaryLanguage: "de",
    supportedLanguages: ["de", "en", "it", "cs", "uk"],
    currency: "EUR",
    flag: "🇦🇹",
  },
  "legacyguard.ch": {
    code: "CH",
    name: "Switzerland",
    domain: "legacyguard.ch",
    primaryLanguage: "de",
    supportedLanguages: ["de", "fr", "it", "en", "uk"],
    currency: "CHF",
    flag: "🇨🇭",
  },
  "legacyguard.it": {
    code: "IT",
    name: "Italy",
    domain: "legacyguard.it",
    primaryLanguage: "it",
    supportedLanguages: ["it", "en", "de", "fr", "uk"],
    currency: "EUR",
    flag: "🇮🇹",
  },
  "legacyguard.es": {
    code: "ES",
    name: "Spain",
    domain: "legacyguard.es",
    primaryLanguage: "es",
    supportedLanguages: ["es", "en", "fr", "de", "uk"],
    currency: "EUR",
    flag: "🇪🇸",
  },
  "legacyguard.nl": {
    code: "NL",
    name: "Netherlands",
    domain: "legacyguard.nl",
    primaryLanguage: "nl",
    supportedLanguages: ["nl", "en", "de", "fr", "uk"],
    currency: "EUR",
    flag: "🇳🇱",
  },
  "legacyguard.be": {
    code: "BE",
    name: "Belgium",
    domain: "legacyguard.be",
    primaryLanguage: "nl",
    supportedLanguages: ["nl", "fr", "en", "de", "uk"],
    currency: "EUR",
    flag: "🇧🇪",
  },
  "legacyguard.lu": {
    code: "LU",
    name: "Luxembourg",
    domain: "legacyguard.lu",
    primaryLanguage: "fr",
    supportedLanguages: ["fr", "de", "en", "pt", "uk"],
    currency: "EUR",
    flag: "🇱🇺",
  },
  "legacyguard.li": {
    code: "LI",
    name: "Liechtenstein",
    domain: "legacyguard.li",
    primaryLanguage: "de",
    supportedLanguages: ["de", "en", "fr", "it"],
    currency: "CHF",
    flag: "🇱🇮",
  },
  "legacyguard.dk": {
    code: "DK",
    name: "Denmark",
    domain: "legacyguard.dk",
    primaryLanguage: "da",
    supportedLanguages: ["da", "en", "de", "sv", "uk"],
    currency: "DKK",
    flag: "🇩🇰",
  },
  "legacyguard.se": {
    code: "SE",
    name: "Sweden",
    domain: "legacyguard.se",
    primaryLanguage: "sv",
    supportedLanguages: ["sv", "en", "de", "fi", "uk"],
    currency: "SEK",
    flag: "🇸🇪",
  },
  "legacyguard.fi": {
    code: "FI",
    name: "Finland",
    domain: "legacyguard.fi",
    primaryLanguage: "fi",
    supportedLanguages: ["fi", "sv", "en", "de", "uk"],
    currency: "EUR",
    flag: "🇫🇮",
  },
  "legacyguard.no": {
    code: "NO",
    name: "Norway",
    domain: "legacyguard.no",
    primaryLanguage: "no",
    supportedLanguages: ["no", "en", "sv", "da", "uk"],
    currency: "NOK",
    flag: "🇳🇴",
  },
  "legacyguard.is": {
    code: "IS",
    name: "Iceland",
    domain: "legacyguard.is",
    primaryLanguage: "is",
    supportedLanguages: ["is", "en", "da", "no"],
    currency: "ISK",
    flag: "🇮🇸",
  },
  "legacyguard.ie": {
    code: "IE",
    name: "Ireland",
    domain: "legacyguard.ie",
    primaryLanguage: "en",
    supportedLanguages: ["en", "ga", "pl", "fr", "uk"],
    currency: "EUR",
    flag: "🇮🇪",
  },
  "legacyguard.pt": {
    code: "PT",
    name: "Portugal",
    domain: "legacyguard.pt",
    primaryLanguage: "pt",
    supportedLanguages: ["pt", "en", "es", "fr", "uk"],
    currency: "EUR",
    flag: "🇵🇹",
  },
  "legacyguard.gr": {
    code: "GR",
    name: "Greece",
    domain: "legacyguard.gr",
    primaryLanguage: "el",
    supportedLanguages: ["el", "en", "de", "fr", "uk"],
    currency: "EUR",
    flag: "🇬🇷",
  },
  "legacyguard.hu": {
    code: "HU",
    name: "Hungary",
    domain: "legacyguard.hu",
    primaryLanguage: "hu",
    supportedLanguages: ["hu", "en", "de", "sk", "ro"],
    currency: "HUF",
    flag: "🇭🇺",
  },
  "legacyguard.ro": {
    code: "RO",
    name: "Romania",
    domain: "legacyguard.ro",
    primaryLanguage: "ro",
    supportedLanguages: ["ro", "en", "de", "hu", "uk"],
    currency: "RON",
    flag: "🇷🇴",
  },
  "legacyguard.bg": {
    code: "BG",
    name: "Bulgaria",
    domain: "legacyguard.bg",
    primaryLanguage: "bg",
    supportedLanguages: ["bg", "en", "de", "ru", "uk"],
    currency: "BGN",
    flag: "🇧🇬",
  },
  "legacyguard.hr": {
    code: "HR",
    name: "Croatia",
    domain: "legacyguard.hr",
    primaryLanguage: "hr",
    supportedLanguages: ["hr", "en", "de", "it", "sr"],
    currency: "EUR",
    flag: "🇭🇷",
  },
  "legacyguard.si": {
    code: "SI",
    name: "Slovenia",
    domain: "legacyguard.si",
    primaryLanguage: "sl",
    supportedLanguages: ["sl", "en", "de", "hr", "it"],
    currency: "EUR",
    flag: "🇸🇮",
  },
  "legacyguard.ee": {
    code: "EE",
    name: "Estonia",
    domain: "legacyguard.ee",
    primaryLanguage: "et",
    supportedLanguages: ["et", "ru", "en", "fi", "uk"],
    currency: "EUR",
    flag: "🇪🇪",
  },
  "legacyguard.lv": {
    code: "LV",
    name: "Latvia",
    domain: "legacyguard.lv",
    primaryLanguage: "lv",
    supportedLanguages: ["lv", "ru", "en", "de"],
    currency: "EUR",
    flag: "🇱🇻",
  },
  "legacyguard.lt": {
    code: "LT",
    name: "Lithuania",
    domain: "legacyguard.lt",
    primaryLanguage: "lt",
    supportedLanguages: ["lt", "ru", "en", "pl"],
    currency: "EUR",
    flag: "🇱🇹",
  },
  "legacyguard.mt": {
    code: "MT",
    name: "Malta",
    domain: "legacyguard.mt",
    primaryLanguage: "mt",
    supportedLanguages: ["mt", "en", "it", "fr"],
    currency: "EUR",
    flag: "🇲🇹",
  },
  "legacyguard.cy": {
    code: "CY",
    name: "Cyprus",
    domain: "legacyguard.cy",
    primaryLanguage: "el",
    supportedLanguages: ["el", "en", "tr", "fr"],
    currency: "EUR",
    flag: "🇨🇾",
  },
  "legacyguard.md": {
    code: "MD",
    name: "Moldova",
    domain: "legacyguard.md",
    primaryLanguage: "ro",
    supportedLanguages: ["ro", "ru", "en", "uk"],
    currency: "EUR",
    flag: "🇲🇩",
  },
  "legacyguard.ua": {
    code: "UA",
    name: "Ukraine",
    domain: "legacyguard.ua",
    primaryLanguage: "uk",
    supportedLanguages: ["uk", "ru", "en", "pl"],
    currency: "UAH",
    flag: "🇺🇦",
  },
  "legacyguard.rs": {
    code: "RS",
    name: "Serbia",
    domain: "legacyguard.rs",
    primaryLanguage: "sr",
    supportedLanguages: ["sr", "en", "de", "hr"],
    currency: "RSD",
    flag: "🇷🇸",
  },
  "legacyguard.al": {
    code: "AL",
    name: "Albania",
    domain: "legacyguard.al",
    primaryLanguage: "sq",
    supportedLanguages: ["sq", "en", "it", "de"],
    currency: "EUR",
    flag: "🇦🇱",
  },
  "legacyguard.mk": {
    code: "MK",
    name: "North Macedonia",
    domain: "legacyguard.mk",
    primaryLanguage: "mk",
    supportedLanguages: ["mk", "sq", "en", "de"],
    currency: "MKD",
    flag: "🇲🇰",
  },
  "legacyguard.me": {
    code: "ME",
    name: "Montenegro",
    domain: "legacyguard.me",
    primaryLanguage: "sr",
    supportedLanguages: ["sr", "en", "de", "ru"],
    currency: "EUR",
    flag: "🇲🇪",
  },
  "legacyguard.ba": {
    code: "BA",
    name: "Bosnia and Herzegovina",
    domain: "legacyguard.ba",
    primaryLanguage: "bs",
    supportedLanguages: ["bs", "hr", "sr", "en", "de"],
    currency: "BAM",
    flag: "🇧🇦",
  },
};

export const getCurrentCountryConfig = (): CountryConfig => {
  const hostname = window.location.hostname;

  // For development/localhost, default to Germany
  if (
    hostname === "localhost" ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1")
  ) {
    return COUNTRY_CONFIGS["legacyguard.eu"];
  }

  return COUNTRY_CONFIGS[hostname] || COUNTRY_CONFIGS["legacyguard.eu"];
};
