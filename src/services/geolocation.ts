import { SUPPORTED_COUNTRIES, type CountryCode } from "@/config/countries";
import { API_URLS, CACHE } from "@/utils/constants";

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
  private static readonly API_URL = API_URLS.geolocation; // kept for backward-compat
  private static readonly CACHE_KEY = "geolocation_data";
  private static readonly CACHE_DURATION = CACHE.geolocation;

  // Try multiple public providers to avoid CORS issues
  // Each provider returns a normalized GeolocationResult
  private async fetchFromProviders(signal?: AbortSignal): Promise<GeolocationResult> {
    // Providers list with mappers
    const providers: Array<() => Promise<GeolocationResult>> = [
      // ipapi.co (may block CORS in some environments)
      async () => {
        const res = await fetch("https://ipapi.co/json/", { headers: { Accept: "application/json" }, signal });
        if (!res.ok) throw new Error(`ipapi.co error: ${res.status}`);
        const data = (await res.json()) as GeolocationResponse;
        return {
          countryCode: this.mapToSupportedCountry((data as any).country_code),
          countryName: (data as any).country_name || "",
          city: (data as any).city || "",
          region: (data as any).region || "",
          timezone: (data as any).timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          detectedLanguages: (data as any).languages ? String((data as any).languages).split(",") : [],
          isEU: this.isEUCountry((data as any).country_code),
        };
      },
      // ipwho.is (CORS-enabled)
      async () => {
        const res = await fetch("https://ipwho.is/", { headers: { Accept: "application/json" }, signal });
        if (!res.ok) throw new Error(`ipwho.is error: ${res.status}`);
        const d = (await res.json()) as any;
        if (d?.success === false) throw new Error(`ipwho.is failure: ${d?.message || "unknown"}`);
        return {
          countryCode: this.mapToSupportedCountry(d?.country_code),
          countryName: d?.country || "",
          city: d?.city || "",
          region: d?.region || d?.region_name || "",
          timezone: d?.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
          detectedLanguages: Array.isArray(d?.languages)
            ? d.languages.map((x: any) => x?.code).filter(Boolean)
            : [],
          isEU: Boolean(d?.is_eu),
        };
      },
      // geojs.io (CORS-enabled)
      async () => {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { headers: { Accept: "application/json" }, signal });
        if (!res.ok) throw new Error(`geojs.io error: ${res.status}`);
        const d = (await res.json()) as any;
        return {
          countryCode: this.mapToSupportedCountry(d?.country_code),
          countryName: d?.country || "",
          city: d?.city || "",
          region: d?.region || "",
          timezone: d?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          detectedLanguages: [],
          isEU: this.isEUCountry(d?.country_code),
        };
      },
    ];

    let lastErr: unknown;
    for (const p of providers) {
      try {
        return await p();
      } catch (err) {
        lastErr = err;
        // try next provider
        continue;
      }
    }
    throw lastErr ?? new Error("All geolocation providers failed");
  }

  private async withTimeout<T>(prom: Promise<T>, ms: number): Promise<T> {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort("timeout"), ms);
    try {
      // When passing a signal, consumer should add it; we only pass to our provider calls
      return await prom;
    } finally {
      clearTimeout(to);
    }
  }

  async detectCountry(): Promise<GeolocationResult> {
    try {
      // Check cache first
      const cached = this.getCachedData();
      if (cached) {
        return cached;
      }

      // Try multiple providers with a short timeout to avoid long hangs in dev
      const result = await this.fetchFromProviders();

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
