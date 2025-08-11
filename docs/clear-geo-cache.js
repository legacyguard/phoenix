/**
 * Script to clear geolocation cache
 * Run this in your browser console to force re-detection of location
 */

// Clear geolocation cache
localStorage.removeItem("geolocation_data");
localStorage.removeItem("user_country_language_preferences");

console.log("✅ Geolocation cache cleared!");
console.log("🔄 Please refresh the page to trigger new location detection.");

// Optional: Display current cached data before clearing
const geoData = localStorage.getItem("geolocation_data");
const prefs = localStorage.getItem("user_country_language_preferences");

if (geoData || prefs) {
  console.log("📍 Previous data:");
  if (geoData) {
    console.log("Geolocation:", JSON.parse(geoData));
  }
  if (prefs) {
    console.log("Preferences:", JSON.parse(prefs));
  }
}
