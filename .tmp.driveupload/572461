import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/nextjs';
import { useCallback, useMemo } from 'react';
import {
  GenderContext,
  GenderAwareTranslationOptions,
  getUserGenderContext,
  getGenderAwareTranslationKey,
  formatWithGenderContext,
  requiresGenderContext
} from './gender-context';

/**
 * Custom hook for gender-aware translations
 * Extends the standard useTranslation hook with gender context support
 */
export const useGenderAwareTranslation = (namespace?: string) => {
  const { t, i18n, ready } = useTranslation(namespace);
  const { user } = useUser();
  
  // Get user's gender context from their profile
  const userGenderContext = useMemo(() => {
    return getUserGenderContext(user?.publicMetadata);
  }, [user]);
  
  // Enhanced translation function with gender awareness
  const tg = useCallback((
    key: string,
    options?: GenderAwareTranslationOptions
  ): string => {
    // Merge user gender context with provided options
    const mergedOptions: GenderAwareTranslationOptions = {
      userGender: userGenderContext,
      ...options
    };
    
    // Get the current language
    const currentLanguage = i18n.language;
    
    // Determine which gender context to use for key selection
    // Priority: referenceGender > userGender
    const genderForKey = mergedOptions.referenceGender || mergedOptions.userGender || GenderContext.NEUTRAL;
    
    // Get possible translation keys (with fallback)
    const translationKeys = getGenderAwareTranslationKey(key, genderForKey, currentLanguage);
    
    // Try to get translation with gender-specific key first
    let translation: string | undefined;
    for (const tryKey of translationKeys) {
      const result = t(tryKey, mergedOptions);
      if (result && result !== tryKey) {
        translation = result;
        break;
      }
    }
    
    // If no translation found, use the base key
    if (!translation) {
      translation = t(key, mergedOptions);
    }
    
    // Apply gender-specific formatting
    if (requiresGenderContext(currentLanguage)) {
      translation = formatWithGenderContext(translation, mergedOptions);
    }
    
    return translation;
  }, [t, i18n.language, userGenderContext]);
  
  // Helper function to get gender-aware translation with specific reference gender
  const tgRef = useCallback((
    key: string,
    referenceGender: GenderContext,
    options?: Omit<GenderAwareTranslationOptions, 'referenceGender'>
  ): string => {
    return tg(key, { ...options, referenceGender });
  }, [tg]);
  
  // Helper to check if current language requires gender context
  const needsGenderContext = useMemo(() => {
    return requiresGenderContext(i18n.language);
  }, [i18n.language]);
  
  return {
    t: tg, // Replace standard t with gender-aware version
    tg, // Explicit gender-aware translation
    tgRef, // Translation with reference gender
    i18n,
    ready,
    userGenderContext,
    needsGenderContext
  };
};
