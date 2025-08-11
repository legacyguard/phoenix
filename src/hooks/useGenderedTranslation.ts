import { useTranslation } from "react-i18next";
import {
  useGenderContext,
  getGenderedTranslation,
} from "../i18n/gender-context";

// Hook for using gendered translations in other components
export const useGenderedTranslation = () => {
  const { t } = useTranslation();
  const { getGenderedKey } = useGenderContext();

  return {
    // Welcome messages
    getWelcomeMessage: (baseKey: string) => {
      return getGenderedTranslation(t, baseKey);
    },

    // Success notifications
    getSuccessMessage: (baseKey: string) => {
      return getGenderedTranslation(t, baseKey);
    },

    // Info notifications
    getInfoMessage: (baseKey: string) => {
      return getGenderedTranslation(t, baseKey);
    },

    // Form labels
    getFormLabel: (baseKey: string) => {
      return getGenderedTranslation(t, baseKey);
    },

    // Button text
    getButtonText: (baseKey: string) => {
      return getGenderedTranslation(t, baseKey);
    },

    // Utility to get the actual key being used
    getKey: (baseKey: string) => {
      return getGenderedKey(baseKey);
    },
  };
};
