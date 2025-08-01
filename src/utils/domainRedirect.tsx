import React from 'react';
import { type CountryCode } from '@/config/countries';
import { toast } from '@/components/ui/use-toast';
import { createRoot } from 'react-dom/client';
import { RedirectSimulationModal } from '@/components/modals/RedirectSimulationModal';
import { useTranslation } from 'react-i18next';

interface RedirectOptions {
  preserveSession?: boolean;
  preservePath?: boolean;
}

// Complete domain mapping for all supported countries
const COUNTRY_DOMAIN_MAP: Record<CountryCode, string> = {
  DE: 'legacyguard.eu', // Germany
  FR: 'legacyguard.fr', // France
  ES: 'legacyguard.es', // Spain
  IT: 'legacyguard.it', // Italy
  NL: 'legacyguard.nl', // Netherlands
  BE: 'legacyguard.be', // Belgium
  LU: 'legacyguard.lu', // Luxembourg
  CH: 'legacyguard.ch', // Switzerland
  LI: 'legacyguard.li', // Liechtenstein
  AT: 'legacyguard.at', // Austria
  GB: 'legacyguard.uk', // United Kingdom
  DK: 'legacyguard.dk', // Denmark
  SE: 'legacyguard.se', // Sweden
  FI: 'legacyguard.fi', // Finland
  CZ: 'legacyguard.cz', // Czech Republic
  SK: 'legacyguard.sk', // Slovakia
  PL: 'legacyguard.pl', // Poland
  HU: 'legacyguard.hu', // Hungary
  SI: 'legacyguard.si', // Slovenia
  EE: 'legacyguard.ee', // Estonia
  LV: 'legacyguard.lv', // Latvia
  LT: 'legacyguard.lt', // Lithuania
  PT: 'legacyguard.pt', // Portugal
  GR: 'legacyguard.gr', // Greece
  MT: 'legacyguard.mt', // Malta
  CY: 'legacyguard.cy', // Cyprus
  IE: 'legacyguard.ie', // Ireland
  NO: 'legacyguard.no', // Norway
  IS: 'legacyguard.is', // Iceland
  RO: 'legacyguard.ro', // Romania
  BG: 'legacyguard.bg', // Bulgaria
  HR: 'legacyguard.hr', // Croatia
  RS: 'legacyguard.rs', // Serbia
  AL: 'legacyguard.al', // Albania
  MK: 'legacyguard.mk', // North Macedonia
  ME: 'legacyguard.me', // Montenegro
  MD: 'legacyguard.md', // Moldova
  UA: 'legacyguard.ua', // Ukraine
  BA: 'legacyguard.ba', // Bosnia and Herzegovina
};

class DomainRedirectService {
  private isProduction: boolean;

  constructor() {
    // Check if we're in production based on environment variable
    this.isProduction = import.meta.env.VITE_IS_PRODUCTION === 'true';
  }

  /**
   * Get the target domain for a given country code
   */
  getTargetDomain(countryCode: CountryCode): string {
    return COUNTRY_DOMAIN_MAP[countryCode] || 'legacyguard.eu';
  }

  /**
   * Handle domain redirect based on country code
   * In production: performs actual redirect
   * In development: shows simulation message
   */
  redirectToDomain(countryCode: CountryCode, options: RedirectOptions = {}): void {
    const targetDomain = this.getTargetDomain(countryCode);
    const currentPath = options.preservePath 
      ? window.location.pathname + window.location.search 
      : '';
    
    const targetUrl = `https://${targetDomain}${currentPath}`;

    // Handle session preservation if needed
    let finalUrl = targetUrl;
    if (options.preserveSession) {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}session=${sessionToken}`;
      }
    }

    if (this.isProduction) {
      // Production: Perform actual redirect
      window.location.href = finalUrl;
    } else {
      // Development/Staging: Show simulation message
      this.showRedirectSimulation(targetDomain);
    }
  }

  /**
   * Show redirect simulation message for testing environments
   */
  private showRedirectSimulation(targetDomain: string): void {
    // Show a toast notification with Czech text as requested
    toast({
      title: "Redirect Simulation", // This would need to be passed as a parameter since this is not a React component
      description: `V produkci by jste byli přesměrováni na: https://${targetDomain}`,
      duration: 5000,
    });

    // Also show a modal for better visibility
    this.showRedirectModal(targetDomain);

    // Also log to console for debugging
    console.log(`[REDIRECT SIMULATION] V produkci by jste byli přesměrováni na: https://${targetDomain}`);
  }

  /**
   * Show redirect simulation modal
   */
  private showRedirectModal(targetDomain: string): void {
    // Create a temporary container for the modal
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    const root = createRoot(modalContainer);
    
    const handleClose = () => {
      root.unmount();
      document.body.removeChild(modalContainer);
    };

    root.render(
      <RedirectSimulationModal
        isOpen={true}
        onClose={handleClose}
        targetDomain={targetDomain}
      />
    );
  }

  /**
   * Check if current domain matches the expected domain for a country
   */
  isCorrectDomain(countryCode: CountryCode): boolean {
    const currentDomain = window.location.hostname;
    const expectedDomain = this.getTargetDomain(countryCode);
    
    return currentDomain === expectedDomain || 
           currentDomain === `www.${expectedDomain}` ||
           currentDomain.includes('localhost') ||
           !this.isProduction;
  }

  /**
   * Get all supported domains
   */
  getAllDomains(): string[] {
    return Object.values(COUNTRY_DOMAIN_MAP);
  }
}

export const domainRedirectService = new DomainRedirectService();
