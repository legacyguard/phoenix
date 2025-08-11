#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Configuration
const srcDir = join(rootDir, "src");
const localesDir = join(rootDir, "src/i18n/locales");
const languages = readdirSync(localesDir).filter(
  (lang) =>
    statSync(join(localesDir, lang)).isDirectory() && !lang.startsWith("_"),
);
const namespaces = [
  "assets",
  "auth",
  "dashboard",
  "documents",
  "emails",
  "errors",
  "family",
  "guardians",
  "help",
  "onboarding",
  "settings",
  "subscription",
  "ui",
  "wills",
];

// Patterns to match translation key usage
const patterns = [
  /\bt\(['"`]([^'"`]+)['"`]/g, // t('key')
  /\bt\(['"`]([^'"`]+)['"`]\s*,/g, // t('key', ...)
  /\{t\(['"`]([^'"`]+)['"`]\)\}/g, // {t('key')}
  /useTranslation\(['"`]([^'"`]+)['"`]\)/g, // useTranslation('namespace')
  /withTranslation\(['"`]([^'"`]+)['"`]\)/g, // withTranslation('namespace')
  /\bt\(['"`]([^'"`]+):([^'"`]+)['"`]/g, // t('namespace:key')
  /i18n\.t\(['"`]([^'"`]+)['"`]/g, // i18n.t('key')
  /i18next\.t\(['"`]([^'"`]+)['"`]/g, // i18next.t('key')
];

// Find all TypeScript/JavaScript files
function findSourceFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (
        !entry.includes("node_modules") &&
        !entry.startsWith(".") &&
        !entry.includes("dist") &&
        !entry.includes("build")
      ) {
        findSourceFiles(fullPath, files);
      }
    } else if (
      entry.match(/\.(ts|tsx|js|jsx)$/) &&
      !entry.includes(".test.") &&
      !entry.includes(".spec.")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Extract translation keys from source files
function extractUsedKeys() {
  const usedKeys = new Map(); // namespace -> Set of keys
  const namespacesInUse = new Set();

  // Initialize map for all namespaces
  namespaces.forEach((ns) => usedKeys.set(ns, new Set()));

  const sourceFiles = findSourceFiles(srcDir);
  console.log(`Found ${sourceFiles.length} source files to scan`);

  sourceFiles.forEach((file) => {
    const content = readFileSync(file, "utf8");

    // Check for namespace usage
    const nsPattern = /useTranslation\(['"`]([^'"`]+)['"`]\)/g;
    let nsMatch;
    while ((nsMatch = nsPattern.exec(content)) !== null) {
      if (namespaces.includes(nsMatch[1])) {
        namespacesInUse.add(nsMatch[1]);
      }
    }

    // Extract translation keys
    patterns.forEach((pattern) => {
      let match;
      pattern.lastIndex = 0; // Reset regex state

      while ((match = pattern.exec(content)) !== null) {
        const fullKey = match[1];

        // Handle namespace:key format
        if (fullKey.includes(":")) {
          const [ns, key] = fullKey.split(":", 2);
          if (namespaces.includes(ns) && key) {
            usedKeys.get(ns).add(key);
            namespacesInUse.add(ns);
          }
        } else {
          // For keys without namespace, add to all possible namespaces
          // This is conservative to avoid deleting keys that might be used
          namespaces.forEach((ns) => {
            usedKeys.get(ns).add(fullKey);
          });
        }
      }
    });
  });

  // Also scan for dynamic key patterns
  const dynamicPatterns = [
    /\bt\(`[^`]*\$\{[^}]+\}[^`]*`/g, // Template literals with variables
    /\bt\([^'"`]+\)/g, // Variables as keys
  ];

  sourceFiles.forEach((file) => {
    const content = readFileSync(file, "utf8");
    dynamicPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        console.log(
          `Warning: Found dynamic translation keys in ${file}. Manual review recommended.`,
        );
      }
    });
  });

  return { usedKeys, namespacesInUse };
}

// Get all keys from a translation file
function getTranslationKeys(obj, prefix = "") {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getTranslationKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Remove unused keys from translation object
function removeUnusedKeys(obj, usedKeys, prefix = "") {
  const cleaned = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const cleanedNested = removeUnusedKeys(value, usedKeys, fullKey);
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    } else {
      // Check if this key or any parent key is used
      const keyParts = fullKey.split(".");
      let isUsed = false;

      // Check full key and all parent keys
      for (let i = keyParts.length; i > 0; i--) {
        const checkKey = keyParts.slice(0, i).join(".");
        if (usedKeys.has(checkKey)) {
          isUsed = true;
          break;
        }
      }

      // Also check if any child key is used (for nested objects)
      if (!isUsed) {
        for (const usedKey of usedKeys) {
          if (usedKey.startsWith(fullKey + ".")) {
            isUsed = true;
            break;
          }
        }
      }

      if (isUsed) {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}

// Main cleanup function
async function cleanupTranslations() {
  console.log("Starting i18n cleanup...\n");

  const { usedKeys, namespacesInUse } = extractUsedKeys();

  // Create backup directory
  const backupDir = join(
    localesDir,
    "_backup_" + new Date().toISOString().replace(/:/g, "-"),
  );
  mkdirSync(backupDir, { recursive: true });

  let totalOriginalKeys = 0;
  let totalRemainingKeys = 0;
  let totalRemovedKeys = 0;

  // Process each language
  for (const lang of languages) {
    console.log(`\nProcessing language: ${lang}`);
    const langDir = join(localesDir, lang);
    const langBackupDir = join(backupDir, lang);
    mkdirSync(langBackupDir, { recursive: true });

    // Process each namespace
    for (const namespace of namespaces) {
      const filePath = join(langDir, `${namespace}.json`);

      if (!existsSync(filePath)) {
        continue;
      }

      try {
        const content = readFileSync(filePath, "utf8");
        const translations = JSON.parse(content);

        // Backup original file
        writeFileSync(join(langBackupDir, `${namespace}.json`), content);

        // Get all keys in the file
        const allKeys = getTranslationKeys(translations);
        const usedKeysInNamespace = usedKeys.get(namespace);

        // Clean the translations
        const cleanedTranslations = removeUnusedKeys(
          translations,
          usedKeysInNamespace,
        );

        // Count keys
        const originalKeyCount = allKeys.length;
        const remainingKeyCount =
          getTranslationKeys(cleanedTranslations).length;
        const removedKeyCount = originalKeyCount - remainingKeyCount;

        totalOriginalKeys += originalKeyCount;
        totalRemainingKeys += remainingKeyCount;
        totalRemovedKeys += removedKeyCount;

        // Write cleaned file
        writeFileSync(
          filePath,
          JSON.stringify(cleanedTranslations, null, 2) + "\n",
        );

        console.log(
          `  ${namespace}: ${originalKeyCount} → ${remainingKeyCount} keys (removed ${removedKeyCount})`,
        );
      } catch (error) {
        console.error(`  Error processing ${namespace}: ${error.message}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Cleanup Summary:");
  console.log(`Total original keys: ${totalOriginalKeys}`);
  console.log(`Total remaining keys: ${totalRemainingKeys}`);
  console.log(`Total removed keys: ${totalRemovedKeys}`);
  console.log(
    `Reduction: ${((totalRemovedKeys / totalOriginalKeys) * 100).toFixed(1)}%`,
  );
  console.log(`\nBackup saved to: ${backupDir}`);
  console.log("=".repeat(50));
}

// Run the cleanup
cleanupTranslations().catch(console.error);
