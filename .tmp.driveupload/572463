/**
 * Gender Context System for Internationalization
 * Supports grammatical gender in multiple languages while maintaining inclusivity
 */

export enum GenderContext {
  MASCULINE = 'masculine',
  FEMININE = 'feminine',
  NEUTRAL = 'neutral',
  UNKNOWN = 'unknown'
}

export interface GenderAwareTranslationOptions {
  // The gender of the current user (for self-referential text)
  userGender?: GenderContext;
  // The gender of the person being referenced
  referenceGender?: GenderContext;
  // Other standard translation parameters
  [key: string]: any;
}

/**
 * Languages that require gender-specific grammar
 */
export const GENDERED_LANGUAGES = [
  'fr', // French
  'es', // Spanish
  'it', // Italian
  'pt', // Portuguese
  'de', // German
  'pl', // Polish
  'cs', // Czech
  'sk', // Slovak
  'ru', // Russian
  'uk', // Ukrainian
  'ro', // Romanian
  'hr', // Croatian
  'sr', // Serbian
  'sl', // Slovenian
  'bg', // Bulgarian
  'el', // Greek
  'he', // Hebrew (if added)
  'ar', // Arabic (if added)
];

/**
 * Helper to determine if a language requires gender context
 */
export const requiresGenderContext = (languageCode: string): boolean => {
  return GENDERED_LANGUAGES.includes(languageCode.split('-')[0]);
};

/**
 * Get gender context from user profile or preferences
 * This would typically come from user settings or profile
 */
export const getUserGenderContext = (userProfile?: any): GenderContext => {
  if (!userProfile?.gender) return GenderContext.NEUTRAL;
  
  switch (userProfile.gender.toLowerCase()) {
    case 'male':
    case 'masculine':
    case 'm':
      return GenderContext.MASCULINE;
    case 'female':
    case 'feminine':
    case 'f':
      return GenderContext.FEMININE;
    case 'neutral':
    case 'non-binary':
    case 'other':
    case 'x':
      return GenderContext.NEUTRAL;
    default:
      return GenderContext.UNKNOWN;
  }
};

/**
 * Build translation key with gender context
 * Example: "welcome" -> "welcome_masculine" or "welcome_feminine"
 */
export const buildGenderAwareKey = (
  baseKey: string,
  gender: GenderContext,
  languageCode: string
): string => {
  // Only append gender context for languages that need it
  if (!requiresGenderContext(languageCode)) {
    return baseKey;
  }
  
  // Return base key for neutral/unknown gender
  if (gender === GenderContext.NEUTRAL || gender === GenderContext.UNKNOWN) {
    return baseKey;
  }
  
  return `${baseKey}_${gender}`;
};

/**
 * Fallback chain for gender-aware translations
 * Tries: gendered key -> base key -> fallback message
 */
export const getGenderAwareTranslationKey = (
  baseKey: string,
  gender: GenderContext,
  languageCode: string
): string[] => {
  const keys: string[] = [];
  
  if (requiresGenderContext(languageCode) && gender !== GenderContext.NEUTRAL) {
    // Try gendered key first
    keys.push(buildGenderAwareKey(baseKey, gender, languageCode));
  }
  
  // Always include base key as fallback
  keys.push(baseKey);
  
  return keys;
};

/**
 * Format translation with proper gender context
 * This handles complex cases like possessives, articles, etc.
 */
export const formatWithGenderContext = (
  translation: string,
  options: GenderAwareTranslationOptions
): string => {
  let result = translation;
  
  // Handle gender-specific placeholders
  // {{his/her}} -> his or her based on referenceGender
  result = result.replace(/\{\{his\/her\}\}/g, () => {
    switch (options.referenceGender) {
      case GenderContext.MASCULINE:
        return 'his';
      case GenderContext.FEMININE:
        return 'her';
      default:
        return 'their';
    }
  });
  
  // {{he/she}} -> he or she based on referenceGender
  result = result.replace(/\{\{he\/she\}\}/g, () => {
    switch (options.referenceGender) {
      case GenderContext.MASCULINE:
        return 'he';
      case GenderContext.FEMININE:
        return 'she';
      default:
        return 'they';
    }
  });
  
  // {{him/her}} -> him or her based on referenceGender
  result = result.replace(/\{\{him\/her\}\}/g, () => {
    switch (options.referenceGender) {
      case GenderContext.MASCULINE:
        return 'him';
      case GenderContext.FEMININE:
        return 'her';
      default:
        return 'them';
    }
  });
  
  return result;
};
