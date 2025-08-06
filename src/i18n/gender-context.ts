/**
 * Gender Context System for Internationalization
 * Supports grammatical gender in multiple languages while maintaining inclusivity
 */

export type Gender = 'masculine' | 'feminine' | 'neutral';

export interface GenderContext {
  gender: Gender;
  setGender: (gender: Gender) => void;
  getGenderSuffix: (key: string) => string;
  getGenderedKey: (baseKey: string) => string;
  formatGenderedText: (text: string, gender: Gender) => string;
}

// Gender-specific suffixes for different languages
const GENDER_SUFFIXES = {
  en: {
    masculine: '_masculine',
    feminine: '_feminine', 
    neutral: '_neutral'
  },
  cs: {
    masculine: '_masculine',
    feminine: '_feminine',
    neutral: '_neutral'
  }
} as const;

// Default gender preference
const DEFAULT_GENDER: Gender = 'neutral';

// Gender context management
class GenderContextManager {
  private currentGender: Gender = DEFAULT_GENDER;
  private language: string = 'en';

  constructor() {
    // Load saved gender preference from localStorage
    this.loadGenderPreference();
  }

  setLanguage(language: string) {
    this.language = language;
  }

  getGender(): Gender {
    return this.currentGender;
  }

  setGender(gender: Gender) {
    this.currentGender = gender;
    this.saveGenderPreference();
  }

  getGenderSuffix(key: string): string {
    const suffixes = GENDER_SUFFIXES[this.language as keyof typeof GENDER_SUFFIXES] || GENDER_SUFFIXES.en;
    return suffixes[this.currentGender];
  }

  getGenderedKey(baseKey: string): string {
    const suffix = this.getGenderSuffix(baseKey);
    return `${baseKey}${suffix}`;
  }

  formatGenderedText(text: string, gender: Gender): string {
    // Apply gender-specific formatting rules
    switch (gender) {
      case 'masculine':
        return this.formatMasculineText(text);
      case 'feminine':
        return this.formatFeminineText(text);
      case 'neutral':
        return this.formatNeutralText(text);
      default:
        return text;
    }
  }

  private formatMasculineText(text: string): string {
    // Apply masculine-specific formatting
    return text;
  }

  private formatFeminineText(text: string): string {
    // Apply feminine-specific formatting
    return text;
  }

  private formatNeutralText(text: string): string {
    // Apply neutral/inclusive formatting
    return text;
  }

  private loadGenderPreference() {
    try {
      const saved = localStorage.getItem('gender-preference');
      if (saved && ['masculine', 'feminine', 'neutral'].includes(saved)) {
        this.currentGender = saved as Gender;
      }
    } catch (error) {
      console.warn('Failed to load gender preference:', error);
    }
  }

  private saveGenderPreference() {
    try {
      localStorage.setItem('gender-preference', this.currentGender);
    } catch (error) {
      console.warn('Failed to save gender preference:', error);
    }
  }

  // Utility methods for common gendered patterns
  getWelcomeMessage(baseKey: string): string {
    return this.getGenderedKey(baseKey);
  }

  getSuccessMessage(baseKey: string): string {
    return this.getGenderedKey(baseKey);
  }

  getNotificationMessage(baseKey: string): string {
    return this.getGenderedKey(baseKey);
  }

  getFormLabel(baseKey: string): string {
    return this.getGenderedKey(baseKey);
  }

  getButtonText(baseKey: string): string {
    return this.getGenderedKey(baseKey);
  }
}

// Create singleton instance
export const genderContext = new GenderContextManager();

// React hook for gender context
export const useGenderContext = (): GenderContext => {
  return {
    gender: genderContext.getGender(),
    setGender: (gender: Gender) => genderContext.setGender(gender),
    getGenderSuffix: (key: string) => genderContext.getGenderSuffix(key),
    getGenderedKey: (baseKey: string) => genderContext.getGenderedKey(baseKey),
    formatGenderedText: (text: string, gender: Gender) => genderContext.formatGenderedText(text, gender)
  };
};

// Utility function to get gendered translation key
export const getGenderedKey = (baseKey: string): string => {
  return genderContext.getGenderedKey(baseKey);
};

// Utility function to check if a gendered key exists
export const hasGenderedKey = (t: (key: string) => string, baseKey: string): boolean => {
  const genderedKey = getGenderedKey(baseKey);
  try {
    const result = t(genderedKey);
    return result !== genderedKey; // If translation exists, it won't return the key itself
  } catch {
    return false;
  }
};

// Utility function to get translation with fallback
export const getGenderedTranslation = (
  t: (key: string) => string, 
  baseKey: string, 
  fallbackKey?: string
): string => {
  const genderedKey = getGenderedKey(baseKey);
  
  // Try gendered key first
  const genderedResult = t(genderedKey);
  if (genderedResult !== genderedKey) {
    return genderedResult;
  }
  
  // Try fallback key if provided
  if (fallbackKey) {
    const fallbackResult = t(fallbackKey);
    if (fallbackResult !== fallbackKey) {
      return fallbackResult;
    }
  }
  
  // Fall back to base key
  const baseResult = t(baseKey);
  return baseResult !== baseKey ? baseResult : baseKey;
};

// Gender preference constants
export const GENDER_OPTIONS = [
  { value: 'neutral', label: 'Neutral/Inclusive' },
  { value: 'masculine', label: 'Masculine' },
  { value: 'feminine', label: 'Feminine' }
] as const;

// Export types for use in components
export type GenderOption = typeof GENDER_OPTIONS[number];
