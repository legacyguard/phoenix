const fs = require("fs");
const path = require("path");

// Read the original common.json
const commonPath =
  "/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales/en/common.json";
const allTranslations = JSON.parse(fs.readFileSync(commonPath, "utf8"));

// Define the module mappings
const moduleMapping = {
  // Common/shared translations
  common: {
    keys: [
      "common",
      "action",
      "cta",
      "validation",
      "errors",
      "app",
      "index",
      "notfound",
      "countryLanguage",
    ],
    description: "Shared translations used across the application",
  },

  // Authentication & user management
  auth: {
    keys: [
      "consent",
      "privacyControlPanel",
      "privacy",
      "securityStatus",
      "inviteAcceptance",
      "invite",
    ],
    description: "Authentication, privacy, and user management",
  },

  // Subscription & billing
  subscription: {
    keys: ["subscription", "pricing", "upgradeCard"],
    description: "Subscription, billing, and pricing related",
  },

  // Dashboard & analytics
  dashboard: {
    keys: [
      "dashboard",
      "analytics",
      "notifications",
      "notificationSettings",
      "notificationPreferences",
    ],
    description: "Dashboard and analytics features",
  },

  // Document management
  documents: {
    keys: [
      "documentTypes",
      "documentUpload",
      "documentUploader",
      "vault",
      "upload",
      "createTimeCapsuleModal",
    ],
    description: "Document management and vault features",
  },

  // Assets & possessions
  assets: {
    keys: [
      "assets",
      "assetCard",
      "assetDetail",
      "assetType",
      "dynamicAssetForm",
      "myPossessions",
      "addLiabilityModal",
      "calculator",
    ],
    description: "Asset and possession management",
  },

  // Family features
  family: {
    keys: [
      "familyHub",
      "familyPreparedness",
      "familyPreparednessTools",
      "relationships",
      "beneficiaryCommunications",
      "emergencyAccess",
      "emotionalContextSystem",
      "lifeEvents",
      "logLifeEvent",
      "contacts",
    ],
    description: "Family hub and preparedness features",
  },

  // Guardian features
  guardians: {
    keys: [
      "guardian",
      "guardianUpload",
      "guardianView",
      "executor",
      "executorManagement",
    ],
    description: "Guardian and executor management",
  },

  // Will & planning
  wills: {
    keys: [
      "will",
      "willGenerator",
      "will_generator",
      "playbook",
      "scenarioPlanner",
      "scenarios",
      "annualReview",
      "complexityReduction",
      "microTaskGenerator",
      "editStoryModal",
    ],
    description: "Will generation and planning tools",
  },

  // Settings & configuration
  settings: {
    keys: ["settings", "dataTransparency", "cookies"],
    description: "Application settings and configuration",
  },

  // Onboarding
  onboarding: {
    keys: ["onboarding", "demo", "pillars"],
    description: "User onboarding and demo",
  },

  // Help & support
  help: {
    keys: ["help", "helpPage", "manual", "testimonials"],
    description: "Help and support content",
  },

  // UI Components & Navigation
  ui: {
    keys: ["navigation", "nav", "footer", "hero", "features", "alerts"],
    description: "UI components and navigation",
  },

  // Error handling & debugging
  errors: {
    keys: ["errorBoundary", "errorTest", "debug", "test"],
    description: "Error handling and debugging",
  },

  // Email templates (keep separate due to size)
  emails: {
    keys: ["emailTemplates"],
    description: "Email templates",
  },
};

// Function to extract keys from the main object
function extractKeys(obj, keys) {
  const result = {};
  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Create the split files
Object.entries(moduleMapping).forEach(([moduleName, config]) => {
  const moduleData = extractKeys(allTranslations, config.keys);

  if (Object.keys(moduleData).length > 0) {
    const outputPath = path.join(
      "/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales/en",
      `${moduleName}.json`,
    );

    // Add a comment at the top (will be removed by JSON.parse but useful for developers)
    const output = {
      _comment: config.description,
      ...moduleData,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
    console.log(
      `Created ${moduleName}.json with ${Object.keys(moduleData).length} top-level keys`,
    );
  }
});

// Check for any keys that weren't mapped
const allMappedKeys = new Set();
Object.values(moduleMapping).forEach((config) => {
  config.keys.forEach((key) => allMappedKeys.add(key));
});

const unmappedKeys = Object.keys(allTranslations).filter(
  (key) => !allMappedKeys.has(key),
);
if (unmappedKeys.length > 0) {
  console.log(
    "\nWarning: The following keys were not mapped to any module:",
    unmappedKeys,
  );
}

console.log("\nTranslation split complete!");
