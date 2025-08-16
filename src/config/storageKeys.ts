/**
 * Centralized storage keys for localStorage
 * All services should use these constants to avoid typos and maintain consistency
 */

export const storageKeys = {
  // Core application data
  assets: 'phoenix-assets',
  people: 'phoenix-people',
  documents: 'phoenix-documents',
  wills: 'phoenix-wills',
  willDraft: 'phoenix-will-draft',
  
  // User preferences and settings
  preferences: 'phoenix-preferences',
  uploadPreferences: 'phoenix-upload-preferences',
  featureFlags: 'phoenix-feature-flags',
  
  // Onboarding and user flow
  onboardingCompleted: 'phoenix-onboarding-completed',
  onboardingData: 'phoenix-onboarding-data',
  onboardingVersion: 'phoenix-onboarding-version',
  firstTimeGuideShown: 'phoenix-first-time-guide-shown',
  firstTimeGuideCompleted: 'phoenix-first-time-guide-completed',
  onboardingSkipped: 'phoenix-onboarding-skipped',
  
  // User progress tracking
  taskProgress: 'phoenix-task-progress',
  lifeInventoryTasks: 'phoenix-life-inventory-tasks',
  lifeInventoryTaskStatus: 'phoenix-life-inventory-task-status',
  professionalProgress: 'phoenix-professional-progress',
  lastVisit: 'phoenix-last-visit',
  
  // UI state and preferences
  hideUrgentExpirationBanner: 'phoenix-hide-urgent-expiration-banner',
  closedBanners: 'phoenix-closed-banners',
  
  // Authentication and security
  deviceId: 'phoenix-device-id',
  wrappedDekKey: 'phoenix-wrapped-dek-key',
  kekSalt: 'phoenix-kek-salt',
  iterCount: 'phoenix-iter-count',
  
  // Geolocation and localization
  geolocationData: 'phoenix-geolocation-data',
  userCountryLanguagePreferences: 'phoenix-user-country-language-preferences',
  
  // Error logging and debugging
  appErrors: 'phoenix-app-errors',
  
  // Migration and legacy support
  migrationFlag: 'phoenix-migration-flag',
  legacyReminders: 'phoenix-legacy-reminders',
  legacyPreferences: 'phoenix-legacy-preferences',
  
  // E2E testing
  legacyguardAuth: 'legacyguard_auth',
  
  // Feature flags (individual)
  respectfulOnboarding: 'phoenix-feature-respectfulOnboarding',
  
  // Legacy keys (for backward compatibility)
  legacy: {
    assets: 'legacyguard_assets',
    people: 'legacyguard_people',
    documents: 'legacyguard_documents',
    wills: 'legacyguard_wills',
    willDraft: 'legacyguard_will_draft',
    preferences: 'legacyguard_preferences',
    reminders: 'legacyguard_reminders',
  }
} as const;

// Type for storage keys to ensure type safety
export type StorageKey = typeof storageKeys[keyof typeof storageKeys] | typeof storageKeys.legacy[keyof typeof storageKeys.legacy];

// Helper function to get legacy key if needed
export const getLegacyKey = (key: keyof typeof storageKeys.legacy): string => {
  return storageKeys.legacy[key];
};

// Helper function to migrate from legacy key to new key
export const migrateStorageKey = (legacyKey: string, newKey: string): void => {
  try {
    const legacyData = localStorage.getItem(legacyKey);
    if (legacyData) {
      localStorage.setItem(newKey, legacyData);
      localStorage.removeItem(legacyKey);
    }
  } catch (error) {
    console.warn(`Failed to migrate storage key from ${legacyKey} to ${newKey}:`, error);
  }
};
