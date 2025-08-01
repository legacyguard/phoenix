import { COUNTRY_LANGUAGES, type CountryCode, type LanguageCode } from '@/config/countries';
import { domainRedirectService } from '@/utils/domainRedirect';

interface LanguageDetectionResult {
  detectedLanguage: LanguageCode | null;
  browserLanguages: string[];
  matchedCountryLanguage: boolean;
}

class LanguageDetectionService {
  /**
   * Detect user's preferred language based on browser settings
   */
  detectBrowserLanguage(): LanguageDetectionResult {
    // Get all browser languages
    const browserLanguages = this.getBrowserLanguages();
    
    return {
      detectedLanguage: this.parseLanguageCode(browserLanguages[0]),
      browserLanguages,
      matchedCountryLanguage: false,
    };
  }

  /**
   * Find the best language match for a given country
   */
  detectLanguageForCountry(
    countryCode: CountryCode,
    browserLanguages?: string[]
  ): LanguageDetectionResult {
    const languages = browserLanguages || this.getBrowserLanguages();
    const countryLanguages = COUNTRY_LANGUAGES[countryCode] || [];
    
    // Try to find exact match
    for (const browserLang of languages) {
      const langCode = this.parseLanguageCode(browserLang);
      if (langCode && countryLanguages.includes(langCode)) {
        return {
          detectedLanguage: langCode,
          browserLanguages: languages,
          matchedCountryLanguage: true,
        };
      }
    }
    
    // Try to match by language family (e.g., en-US matches en)
    for (const browserLang of languages) {
      const baseLang = browserLang.split('-')[0].toLowerCase();
      const matchedLang = countryLanguages.find(cl => 
        cl.toLowerCase().startsWith(baseLang)
      );
      
      if (matchedLang) {
        return {
          detectedLanguage: matchedLang,
          browserLanguages: languages,
          matchedCountryLanguage: true,
        };
      }
    }
    
    // Fallback to country's default language
    return {
      detectedLanguage: countryLanguages[0] || null,
      browserLanguages: languages,
      matchedCountryLanguage: false,
    };
  }

  /**
   * Get all browser languages in order of preference
   */
  private getBrowserLanguages(): string[] {
    const languages: string[] = [];
    
    // Primary language
    if (navigator.language) {
      languages.push(navigator.language);
    }
    
    // Additional languages
    if (navigator.languages && navigator.languages.length > 0) {
      navigator.languages.forEach(lang => {
        if (!languages.includes(lang)) {
          languages.push(lang);
        }
      });
    }
    
    // Fallback to userLanguage for older browsers
    // @ts-ignore - userLanguage is not in TypeScript definitions
    if (navigator.userLanguage && !languages.includes(navigator.userLanguage)) {
      // @ts-ignore
      languages.push(navigator.userLanguage);
    }
    
    return languages;
  }

  /**
   * Parse and validate language code
   */
  private parseLanguageCode(langString: string): LanguageCode | null {
    if (!langString) return null;
    
    // Extract language code (e.g., "en" from "en-US")
    const langCode = langString.split('-')[0].toLowerCase();
    
    // Check if it's a supported language
    const supportedLanguages = Object.values(COUNTRY_LANGUAGES)
      .flat()
      .map(lang => lang.toLowerCase());
    
    if (supportedLanguages.includes(langCode)) {
      return langCode as LanguageCode;
    }
    
    // Try full language code (e.g., "en-US")
    const fullLangCode = langString.toLowerCase().replace('_', '-');
    if (supportedLanguages.includes(fullLangCode)) {
      return fullLangCode as LanguageCode;
    }
    
    return null;
  }

  /**
   * Get suggested domain based on country
   */
  getSuggestedDomain(countryCode: CountryCode): string {
    return domainRedirectService.getTargetDomain(countryCode);
  }

  /**
   * Check if current domain matches suggested domain
   */
  isCorrectDomain(countryCode: CountryCode): boolean {
    return domainRedirectService.isCorrectDomain(countryCode);
  }
}

export const languageDetectionService = new LanguageDetectionService();
