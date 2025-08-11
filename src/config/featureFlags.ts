// src/config/featureFlags.ts

export const FEATURE_FLAGS = {
  // Dashboard title experiment
  "dashboard-title-experiment": {
    defaultValue: "Your Life Inventory",
    variations: {
      control: "Your Life Inventory",
      variant: "Your Family's Protection Plan",
    },
  },

  // Onboarding message experiment
  "onboarding-message-experiment": {
    defaultValue: "Welcome to LegacyGuard",
    variations: {
      control: "Welcome to LegacyGuard",
      variant: "Protect Your Family's Future",
    },
  },

  // CTA button text experiment
  "cta-button-experiment": {
    defaultValue: "Get Started",
    variations: {
      control: "Get Started",
      variant: "Start Protecting Now",
    },
  },
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
