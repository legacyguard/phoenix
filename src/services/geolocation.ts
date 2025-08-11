import { SUPPORTED_COUNTRIES, type CountryCode } from "@/config/countries";
import type { API_URLS, CACHE } from "@/utils/constants";

interface GeolocationResponse {
  country_code: string;
  country_name: string;
  city: string;
  region: string;
  timezone: string;
  currency: string;
  languages: string;
  latitude: number;
  longitude: number;
}

interface GeolocationResult {
  countryCode: CountryCode | null;
  countryName: string;
  city: string;
  region: string;
  timezone: string;
  detectedLanguages: string[];
  isEU: boolean;
}

class GeolocationService {
  private static readonly API_URL = API_URLS.geolocation;
  private static readonly CACHE_KEY = "geolocation_data";
  private static readonly CACHE_DURATION = CACHE.geolocation;

  async detectCountry(): Promise<GeolocationResult> {
    try {
      // Check cache first
      const cached = this.getCachedData();
      if (cached) {
        return cached;
      }

      // Fetch from API
      const response = await fetch(GeolocationService.API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Geolocation API error: ${response.status}`);
      }

      const data: GeolocationResponse = await response.json();

      // Map to our result format
      const result: GeolocationResult = {
        countryCode: this.mapToSupportedCountry(data.country_code),
        countryName: data.country_name || "",
        city: data.city || "",
        region: data.region || "",
        timezone: data.timezone || "",
        detectedLanguages: data.languages ? data.languages.split(",") : [],
        isEU: this.isEUCountry(data.country_code),
      };

      // Cache the result
      this.cacheData(result);

      return result;
    } catch (error) {
      console.error("Geolocation detection failed:", error);
      return this.getFallbackResult();
    }
  }

  private mapToSupportedCountry(code: string): CountryCode | null {
    const upperCode = code?.toUpperCase();
    return (
      (SUPPORTED_COUNTRIES.find((c) => c === upperCode) as CountryCode) || null
    );
  }

  private isEUCountry(code: string): boolean {
    const euCountries = [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
    ];
    return euCountries.includes(code?.toUpperCase());
  }

  private getCachedData(): GeolocationResult | null {
    try {
      const cached = localStorage.getItem(GeolocationService.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired =
        Date.now() - timestamp > GeolocationService.CACHE_DURATION;

      if (isExpired) {
        localStorage.removeItem(GeolocationService.CACHE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private cacheData(data: GeolocationResult): void {
    try {
      localStorage.setItem(
        GeolocationService.CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Failed to cache geolocation data:", error);
    }
  }

  private getFallbackResult(): GeolocationResult {
    return {
      countryCode: null,
      countryName: "Unknown",
      city: "",
      region: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      detectedLanguages: [],
      isEU: false,
    };
  }

  clearCache(): void {
    localStorage.removeItem(GeolocationService.CACHE_KEY);
  }
}

export const geolocationService = new GeolocationService();
