import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { geolocationService } from "@/services/geolocation";
import { languageDetectionService } from "@/services/languageDetection";
import { SUPPORTED_COUNTRIES, COUNTRY_LANGUAGES } from "@/config/countries";
import { CountryContext } from "./CountryContextContext";

interface CountryContextType {
  selectedCountryCode: string;
  setSelectedCountryCode: (countryCode: string) => void;
  isDetecting: boolean;
}

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({
  children,
}) => {
  const { i18n } = useTranslation("ui-common");
  const [selectedCountryCode, setSelectedCountryCode] = useState("GB"); // Default to UK
  const [isDetecting, setIsDetecting] = useState(true);

  // Auto-detect country and language based on IP
  useEffect(() => {
    const detectCountryAndLanguage = async () => {
      try {
        setIsDetecting(true);

        // Get geolocation data
        const geoData = await geolocationService.detectCountry();

        let detectedCountry = geoData.countryCode;

        // If detected country is not supported, fallback to UK
        if (
          !detectedCountry ||
          !SUPPORTED_COUNTRIES.includes(detectedCountry)
        ) {
          detectedCountry = "GB";
        }

        // Set the country
        setSelectedCountryCode(detectedCountry);

        // Detect and set language
        const browserLangData =
          languageDetectionService.detectBrowserLanguage();
        const countryLangData =
          languageDetectionService.detectLanguageForCountry(
            detectedCountry,
            browserLangData.browserLanguages,
          );

        // Use detected language or fallback to primary language of country
        const languageToUse =
          countryLangData.detectedLanguage ||
          COUNTRY_LANGUAGES[detectedCountry]?.[0] ||
          "en";

        // Change language if different from current
        if (i18n.language !== languageToUse) {
          await i18n.changeLanguage(languageToUse);
        }

        console.log("[CountryContext] Auto-detected:", {
          country: detectedCountry,
          language: languageToUse,
          geoData: geoData,
        });
      } catch (error: unknown) {
        console.error(
          "[CountryContext] Error detecting country/language:",
          error,
        );

        // Fallback to UK/English
        setSelectedCountryCode("GB");
        if (i18n.language !== "en") {
          await i18n.changeLanguage("en");
        }

        // Show user-friendly error message
        let userMessage =
          "Unable to detect your location. Using default settings.";

        if (error instanceof Error && error.message?.includes("network")) {
          userMessage = "Network error. Using default settings.";
        } else if (
          error instanceof Error &&
          error.message?.includes("timeout")
        ) {
          userMessage = "Location detection timed out. Using default settings.";
        }

        toast.error(userMessage);
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountryAndLanguage();
  }, [i18n]);

  // Handle manual country change
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);

    // Update language if current language is not supported in new country
    const countryLanguages = COUNTRY_LANGUAGES[countryCode] || [];
    if (!countryLanguages.includes(i18n.language)) {
      i18n.changeLanguage(countryLanguages[0] || "en");
    }
  };

  return (
    <CountryContext.Provider
      value={{
        selectedCountryCode,
        setSelectedCountryCode: handleCountryChange,
        isDetecting,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};
