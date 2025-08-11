#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(
  __dirname,
  "..",
  "src",
  "i18n",
  "locales.backup.20250810_182743",
);
const currentDir = path.join(__dirname, "..", "src", "i18n", "locales");

// Color codes for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function getAllKeys(obj, prefix = "") {
  const keys = new Map();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach((val, k) => keys.set(k, val));
    } else {
      keys.set(fullKey, value);
    }
  }

  return keys;
}

function setNestedValue(obj, path, value) {
  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
}

function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Define where missing keys should be restored to
const keyMappings = {
  "dashboard.json": {
    complexProfile: "dashboard-main.json",
    deepDive: "dashboard-main.json",
    development: "dashboard-main.json",
    empty: "dashboard-main.json",
    errors: "dashboard-main.json",
    guardian: "dashboard-main.json",
    header: "dashboard-main.json",
    help: "dashboard-main.json",
    nextStep: "dashboard-main.json",
    notifications: "dashboard-main.json",
    playbook: "dashboard-main.json",
    preservationMode: "dashboard-main.json",
    progressTracking: "dashboard-main.json",
    quickTasks: "dashboard-main.json",
    recommendations: "dashboard-review.json",
    sections: "dashboard-main.json",
    subscription: "dashboard-main.json",
    subtitle: "dashboard-main.json",
    tasks: "dashboard-main.json",
    title: "dashboard-main.json",
    progress: "dashboard-main.json",
    completion: "dashboard-main.json",
    push: "dashboard-main.json",
    sms: "dashboard-main.json",
    inApp: "dashboard-main.json",
    alerts: "dashboard-main.json",
    admin: "dashboard-main.json",
    analytics: "dashboard-review.json",
    analysis: "dashboard-review.json",
    calculator: "dashboard-review.json",
    benefits: "dashboard-review.json",
    complexityReduction: "dashboard-review.json",
    reminders: "dashboard-main.json",
  },
  "family.json": {
    // Group family keys by logical areas
    guardian: "family-core.json",
    playbook: "family-core.json",
    emergencyProtocol: "family-emergency.json",
    communication: "family-communication.json",
    permissions: "family-core.json",
    members: "family-core.json",
    relationships: "family-core.json",
    digitalVault: "family-core.json",
    timeCapsule: "family-communication.json",
    messages: "family-communication.json",
    contacts: "family-emergency.json",
    medicalInfo: "family-emergency.json",
    instructions: "family-emergency.json",
    // Default fallback
    _default: "family-core.json",
  },
};

async function restoreMissingKeys() {
  console.log(
    `${colors.bold}${colors.blue}=== Restoring Missing Translation Keys ===${colors.reset}\n`,
  );

  // Get list of languages
  const languages = fs
    .readdirSync(backupDir)
    .filter((lang) => fs.statSync(path.join(backupDir, lang)).isDirectory());

  console.log(`Found ${languages.length} languages to process\n`);

  const stats = {
    totalRestored: 0,
    byFile: {},
    byLanguage: {},
  };

  for (const lang of languages) {
    console.log(`${colors.cyan}Processing ${lang}...${colors.reset}`);
    stats.byLanguage[lang] = 0;

    const backupLangDir = path.join(backupDir, lang);
    const currentLangDir = path.join(currentDir, lang);

    // Process dashboard.json
    const dashboardBackupPath = path.join(backupLangDir, "dashboard.json");
    if (fs.existsSync(dashboardBackupPath)) {
      const backupData = loadJsonFile(dashboardBackupPath);
      if (backupData) {
        const backupKeys = getAllKeys(backupData);

        // Collect all current dashboard keys
        const currentDashboardKeys = new Set();
        ["dashboard-main.json", "dashboard-review.json"].forEach((file) => {
          const currentPath = path.join(currentLangDir, file);
          if (fs.existsSync(currentPath)) {
            const currentData = loadJsonFile(currentPath);
            if (currentData) {
              getAllKeys(currentData).forEach((val, key) =>
                currentDashboardKeys.add(key),
              );
            }
          }
        });

        // Find missing keys and restore them
        const filesToUpdate = {};

        backupKeys.forEach((value, key) => {
          if (!currentDashboardKeys.has(key)) {
            const topLevel = key.split(".")[0];
            const targetFile =
              keyMappings["dashboard.json"][topLevel] || "dashboard-main.json";

            if (!filesToUpdate[targetFile]) {
              filesToUpdate[targetFile] = {};
            }

            setNestedValue(filesToUpdate[targetFile], key, value);
            stats.totalRestored++;
            stats.byLanguage[lang]++;

            if (!stats.byFile[targetFile]) {
              stats.byFile[targetFile] = 0;
            }
            stats.byFile[targetFile]++;
          }
        });

        // Update the files
        for (const [file, keysToAdd] of Object.entries(filesToUpdate)) {
          const filePath = path.join(currentLangDir, file);
          let currentData = {};

          if (fs.existsSync(filePath)) {
            currentData = loadJsonFile(filePath) || {};
          }

          // Merge the missing keys
          function deepMerge(target, source) {
            for (const key in source) {
              if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
              ) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            }
          }

          deepMerge(currentData, keysToAdd);

          // Save the updated file
          fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
          console.log(`  Updated ${file} with missing dashboard keys`);
        }
      }
    }

    // Process family.json
    const familyBackupPath = path.join(backupLangDir, "family.json");
    if (fs.existsSync(familyBackupPath)) {
      const backupData = loadJsonFile(familyBackupPath);
      if (backupData) {
        const backupKeys = getAllKeys(backupData);

        // Collect all current family keys
        const currentFamilyKeys = new Set();
        [
          "family-core.json",
          "family-emergency.json",
          "family-communication.json",
        ].forEach((file) => {
          const currentPath = path.join(currentLangDir, file);
          if (fs.existsSync(currentPath)) {
            const currentData = loadJsonFile(currentPath);
            if (currentData) {
              getAllKeys(currentData).forEach((val, key) =>
                currentFamilyKeys.add(key),
              );
            }
          }
        });

        // Find missing keys and restore them
        const filesToUpdate = {};

        backupKeys.forEach((value, key) => {
          if (!currentFamilyKeys.has(key)) {
            const topLevel = key.split(".")[0];
            const targetFile =
              keyMappings["family.json"][topLevel] ||
              keyMappings["family.json"]["_default"];

            if (!filesToUpdate[targetFile]) {
              filesToUpdate[targetFile] = {};
            }

            setNestedValue(filesToUpdate[targetFile], key, value);
            stats.totalRestored++;
            stats.byLanguage[lang]++;

            if (!stats.byFile[targetFile]) {
              stats.byFile[targetFile] = 0;
            }
            stats.byFile[targetFile]++;
          }
        });

        // Update the files
        for (const [file, keysToAdd] of Object.entries(filesToUpdate)) {
          const filePath = path.join(currentLangDir, file);
          let currentData = {};

          if (fs.existsSync(filePath)) {
            currentData = loadJsonFile(filePath) || {};
          }

          // Merge the missing keys
          function deepMerge(target, source) {
            for (const key in source) {
              if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
              ) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            }
          }

          deepMerge(currentData, keysToAdd);

          // Save the updated file
          fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
          console.log(`  Updated ${file} with missing family keys`);
        }
      }
    }
  }

  // Report results
  console.log(
    `\n${colors.bold}${colors.green}=== Restoration Complete ===${colors.reset}`,
  );
  console.log(
    `Total keys restored: ${colors.cyan}${stats.totalRestored}${colors.reset}\n`,
  );

  console.log("Keys restored by file:");
  for (const [file, count] of Object.entries(stats.byFile)) {
    console.log(`  ${file}: ${count} keys`);
  }

  console.log("\nKeys restored by language:");
  for (const [lang, count] of Object.entries(stats.byLanguage)) {
    console.log(`  ${lang}: ${count} keys`);
  }

  console.log(
    `\n${colors.green}✅ Missing keys have been restored!${colors.reset}`,
  );
  console.log(
    `${colors.yellow}Next step: Run validation to ensure no duplicates were created.${colors.reset}`,
  );
}

// Run the restoration
restoreMissingKeys();
