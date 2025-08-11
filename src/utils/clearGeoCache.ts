/**
 * Utility to clear geolocation cache
 * This can be used to force re-detection of the user's location
 */
export function clearGeolocationCache(): void {
  try {
    // Clear geolocation cache
    localStorage.removeItem("geolocation_data");

    // Clear user preferences
    localStorage.removeItem("user_country_language_preferences");

    console.log("Geolocation cache cleared successfully");
  } catch (error) {
    console.error("Failed to clear geolocation cache:", error);
  }
}

/**
 * Check if geolocation cache exists
 */
export function hasGeolocationCache(): boolean {
  return localStorage.getItem("geolocation_data") !== null;
}

/**
 * Get cached geolocation data (for debugging)
 */
export function getCachedGeolocationData(): Record<string, unknown> {
  try {
    const cached = localStorage.getItem("geolocation_data");
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error("Failed to get cached geolocation data:", error);
    return null;
  }
}
