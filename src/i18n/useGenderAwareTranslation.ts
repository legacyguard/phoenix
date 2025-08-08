import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';
import {
  Gender,
  GenderContext,
  useGenderContext,
  getGenderedKey,
  getGenderedTranslation
} from './gender-context';

/**
 * Custom hook for gender-aware translations
 * Extends the standard useTranslation hook with gender context support
 */
export const useGenderAwareTranslation = (namespace?: string) => {
  const { t, i18n, ready } = useTranslation(namespace);
  const { user } = useUser();
  const genderContext = useGenderContext();
  
  // Enhanced translation function with gender awareness
  const tg = useCallback((
    key: string,
    options?: any
  ): string => {
    // Get the gendered key
    const genderedKey = getGenderedKey(key);
    
    // Try to get translation with gender-specific key first
    let translation = t(genderedKey, options);
    
    // If no translation found, use the base key
    if (translation === genderedKey) {
      translation = t(key, options);
    }
    
    return translation;
  }, [t, genderContext]);
  
  // Helper function to get gender-aware translation with specific reference gender
  const tgRef = useCallback((
    key: string,
    referenceGender: Gender,
    options?: any
  ): string => {
    // Temporarily set gender context for this translation
    const originalGender = genderContext.gender;
    genderContext.setGender(referenceGender);
    
    const translation = tg(key, options);
    
    // Restore original gender
    genderContext.setGender(originalGender);
    
    return translation;
  }, [tg, genderContext]);
  
  return {
    t: tg, // Replace standard t with gender-aware version
    tg, // Explicit gender-aware translation
    tgRef, // Translation with reference gender
    i18n,
    ready,
    userGenderContext: genderContext.gender,
    needsGenderContext: true // Simplified for now
  };
};
