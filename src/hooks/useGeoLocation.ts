import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { geolocationService } from "@/services/geolocation";
import { languageDetectionService } from "@/services/languageDetection";
import { domainRedirectService } from "@/utils/domainRedirect";
import type { type CountryCode, type LanguageCode } from "@/config/countries";

interface GeoLocationState {
  isLoading: boolean;
  showModal: boolean;
  detectedCountry: CountryCode | null;
  detectedLanguage: LanguageCode | null;
  shouldRedirect: boolean;
}

interface UserPreferences {
  country: CountryCode;
  language: LanguageCode;
  manuallySet: boolean;
  timestamp: number;
}

const PREFERENCES_KEY = "user_country_language_preferences";
const PREFERENCES_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function useGeoLocation() {
  const navigate = useNavigate();
  const { i18n } = useTranslation("ui-common");
  const [state, setState] = useState<GeoLocationState>({
    isLoading: false, // Changed to false since we don't auto-detect
    showModal: false,
    detectedCountry: null,
    detectedLanguage: null,
    shouldRedirect: false,
  });

  // Remove automatic detection on mount since it's now handled in CountryContext
  // useEffect(() => {

  //   checkLocationAndLanguage();
  // }, []);

  const checkLocationAndLanguage = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Check if user has existing preferences
      const preferences = getUserPreferences();

      if (preferences && !isPreferencesExpired(preferences)) {
        // Apply saved preferences
        await applyPreferences(preferences);
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Detect location and language
      const [geoData, browserLangData] = await Promise.all([
        geolocationService.detectCountry(),
        Promise.resolve(languageDetectionService.detectBrowserLanguage()),
      ]);

      // If we have a detected country, find best language match
      let detectedLanguage = browserLangData.detectedLanguage;
      if (geoData.countryCode) {
        const countryLangData =
          languageDetectionService.detectLanguageForCountry(
            geoData.countryCode,
            browserLangData.browserLanguages,
          );
        detectedLanguage = countryLangData.detectedLanguage;
      }

      // Check if current domain matches detected country
      const shouldShowModal =
        geoData.countryCode &&
        (!languageDetectionService.isCorrectDomain(geoData.countryCode) ||
          !detectedLanguage);

      setState({
        isLoading: false,
        showModal: shouldShowModal || !geoData.countryCode,
        detectedCountry: geoData.countryCode,
        detectedLanguage,
        shouldRedirect: false,
      });

      // If we have all info and domain is correct, save preferences
      if (geoData.countryCode && detectedLanguage && !shouldShowModal) {
        saveUserPreferences({
          country: geoData.countryCode,
          language: detectedLanguage,
          manuallySet: false,
          timestamp: Date.now(),
        });
        i18n.changeLanguage(detectedLanguage);
      }
    } catch (error) {
      console.error("Failed to detect location/language:", error);
      setState({
        isLoading: false,
        showModal: true,
        detectedCountry: null,
        detectedLanguage: null,
        shouldRedirect: false,
      });
    }
  };

  const handleModalClose = () => {
    setState((prev) => ({ ...prev, showModal: false }));
  };

  const handleModalConfirm = async (
    country: CountryCode,
    language: LanguageCode,
    redirectToDomain: boolean,
  ) => {
    // Save preferences
    const preferences: UserPreferences = {
      country,
      language,
      manuallySet: true,
      timestamp: Date.now(),
    };
    saveUserPreferences(preferences);

    // Change language
    await i18n.changeLanguage(language);

    // Handle domain redirect if needed
    if (redirectToDomain) {
      domainRedirectService.redirectToDomain(country, {
        preserveSession: true,
        preservePath: true,
      });
    } else {
      setState((prev) => ({ ...prev, showModal: false }));
      window.location.reload();
    }
  };

  const getUserPreferences = (): UserPreferences | null => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const saveUserPreferences = (preferences: UserPreferences): void => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const isPreferencesExpired = (preferences: UserPreferences): boolean => {
    return Date.now() - preferences.timestamp > PREFERENCES_DURATION;
  };

  const applyPreferences = async (
    preferences: UserPreferences,
  ): Promise<void> => {
    await i18n.changeLanguage(preferences.language);

    // Check if domain redirect is needed
    if (!languageDetectionService.isCorrectDomain(preferences.country)) {
      setState((prev) => ({
        ...prev,
        showModal: true,
        detectedCountry: preferences.country,
        detectedLanguage: preferences.language,
        shouldRedirect: true,
      }));
    }
  };

  const clearPreferences = (): void => {
    localStorage.removeItem(PREFERENCES_KEY);
    geolocationService.clearCache();
  };

  return {
    ...state,
    handleModalClose,
    handleModalConfirm,
    clearPreferences,
    refreshDetection: checkLocationAndLanguage,
  };
}
