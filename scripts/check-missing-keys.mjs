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
  "en",
);
const currentDir = path.join(__dirname, "..", "src", "i18n", "locales", "en");

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
  const keys = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(
      `${colors.red}Error loading ${filePath}: ${error.message}${colors.reset}`,
    );
    return null;
  }
}

function compareTranslations() {
  console.log(
    `${colors.bold}${colors.blue}=== Checking for Missing English Translation Keys ===${colors.reset}\n`,
  );

  // Get all backup files
  const backupFiles = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith(".json"));
  console.log(
    `${colors.cyan}Found ${backupFiles.length} backup files${colors.reset}`,
  );

  // Get all current files
  const currentFiles = fs
    .readdirSync(currentDir)
    .filter((file) => file.endsWith(".json"));
  console.log(
    `${colors.cyan}Found ${currentFiles.length} current files${colors.reset}\n`,
  );

  // Collect all keys from backup
  const backupKeys = new Map(); // Map of key -> source file
  let totalBackupKeys = 0;

  console.log(`${colors.bold}Loading backup keys...${colors.reset}`);
  for (const file of backupFiles) {
    const filePath = path.join(backupDir, file);
    const data = loadJsonFile(filePath);

    if (data) {
      const keys = getAllKeys(data);
      console.log(`  ${file}: ${keys.size} keys`);
      keys.forEach((key) => {
        if (!backupKeys.has(key)) {
          backupKeys.set(key, []);
        }
        backupKeys.get(key).push(file);
      });
      totalBackupKeys += keys.size;
    }
  }

  // Collect all keys from current files
  const currentKeys = new Map(); // Map of key -> source file
  let totalCurrentKeys = 0;

  console.log(`\n${colors.bold}Loading current keys...${colors.reset}`);
  for (const file of currentFiles) {
    const filePath = path.join(currentDir, file);
    const data = loadJsonFile(filePath);

    if (data) {
      const keys = getAllKeys(data);
      console.log(`  ${file}: ${keys.size} keys`);
      keys.forEach((key) => {
        if (!currentKeys.has(key)) {
          currentKeys.set(key, []);
        }
        currentKeys.get(key).push(file);
      });
      totalCurrentKeys += keys.size;
    }
  }

  // Find missing keys
  const missingKeys = [];
  const foundInDifferentFile = [];

  for (const [key, sourceFiles] of backupKeys.entries()) {
    if (!currentKeys.has(key)) {
      missingKeys.push({ key, sourceFiles });
    } else {
      // Check if the key moved to a different file
      const currentFiles = currentKeys.get(key);
      const moved = !sourceFiles.some((sf) =>
        currentFiles.some((cf) => cf === sf),
      );
      if (moved) {
        foundInDifferentFile.push({
          key,
          from: sourceFiles,
          to: currentFiles,
        });
      }
    }
  }

  // Find new keys (keys in current but not in backup)
  const newKeys = [];
  for (const [key, sourceFiles] of currentKeys.entries()) {
    if (!backupKeys.has(key)) {
      newKeys.push({ key, sourceFiles });
    }
  }

  // Report results
  console.log(`\n${colors.bold}${colors.yellow}=== SUMMARY ===${colors.reset}`);
  console.log(
    `Total unique keys in backup: ${colors.cyan}${backupKeys.size}${colors.reset}`,
  );
  console.log(
    `Total unique keys in current: ${colors.cyan}${currentKeys.size}${colors.reset}`,
  );
  console.log(
    `Total key occurrences in backup files: ${colors.cyan}${totalBackupKeys}${colors.reset}`,
  );
  console.log(
    `Total key occurrences in current files: ${colors.cyan}${totalCurrentKeys}${colors.reset}`,
  );

  if (missingKeys.length > 0) {
    console.log(
      `\n${colors.bold}${colors.red}⚠️  MISSING KEYS: ${missingKeys.length}${colors.reset}`,
    );
    console.log(
      `${colors.red}The following keys exist in backup but are missing from current files:${colors.reset}\n`,
    );

    // Group missing keys by source file
    const missingByFile = {};
    missingKeys.forEach(({ key, sourceFiles }) => {
      sourceFiles.forEach((file) => {
        if (!missingByFile[file]) {
          missingByFile[file] = [];
        }
        missingByFile[file].push(key);
      });
    });

    for (const [file, keys] of Object.entries(missingByFile)) {
      console.log(
        `${colors.yellow}From ${file} (${keys.length} keys):${colors.reset}`,
      );
      keys.slice(0, 10).forEach((key) => {
        console.log(`  - ${key}`);
      });
      if (keys.length > 10) {
        console.log(`  ... and ${keys.length - 10} more`);
      }
      console.log();
    }

    // Save missing keys to file for reference
    const missingKeysReport = {
      timestamp: new Date().toISOString(),
      totalMissing: missingKeys.length,
      missingKeys: missingKeys.map(({ key, sourceFiles }) => ({
        key,
        originalFiles: sourceFiles,
      })),
    };

    const reportPath = path.join(__dirname, "missing-keys-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(missingKeysReport, null, 2));
    console.log(
      `${colors.yellow}Full report saved to: ${reportPath}${colors.reset}`,
    );
  } else {
    console.log(
      `\n${colors.green}✅ No missing keys found! All keys from backup are present in current files.${colors.reset}`,
    );
  }

  if (foundInDifferentFile.length > 0) {
    console.log(
      `\n${colors.blue}📦 Keys moved to different files: ${foundInDifferentFile.length}${colors.reset}`,
    );
    console.log("(This is expected after restructuring)\n");

    // Show a sample of moved keys
    foundInDifferentFile.slice(0, 5).forEach(({ key, from, to }) => {
      console.log(`  ${key}`);
      console.log(`    From: ${from.join(", ")}`);
      console.log(`    To:   ${to.join(", ")}\n`);
    });

    if (foundInDifferentFile.length > 5) {
      console.log(
        `  ... and ${foundInDifferentFile.length - 5} more moved keys`,
      );
    }
  }

  if (newKeys.length > 0) {
    console.log(
      `\n${colors.cyan}🆕 New keys added: ${newKeys.length}${colors.reset}`,
    );
    console.log("(Keys that exist in current but not in backup)\n");

    newKeys.slice(0, 5).forEach(({ key, sourceFiles }) => {
      console.log(`  ${key} (in ${sourceFiles.join(", ")})`);
    });

    if (newKeys.length > 5) {
      console.log(`  ... and ${newKeys.length - 5} more new keys`);
    }
  }

  // Check for duplicate keys across files
  const duplicatesAcrossFiles = [];
  for (const [key, files] of currentKeys.entries()) {
    if (files.length > 1) {
      duplicatesAcrossFiles.push({ key, files });
    }
  }

  if (duplicatesAcrossFiles.length > 0) {
    console.log(
      `\n${colors.red}⚠️  Duplicate keys across files: ${duplicatesAcrossFiles.length}${colors.reset}`,
    );
    duplicatesAcrossFiles.slice(0, 5).forEach(({ key, files }) => {
      console.log(`  ${key} appears in: ${files.join(", ")}`);
    });
    if (duplicatesAcrossFiles.length > 5) {
      console.log(
        `  ... and ${duplicatesAcrossFiles.length - 5} more duplicates`,
      );
    }
  }

  // Final status
  console.log(`\n${colors.bold}=== FINAL STATUS ===${colors.reset}`);
  if (missingKeys.length === 0 && duplicatesAcrossFiles.length === 0) {
    console.log(
      `${colors.green}✅ Migration successful! No keys lost and no duplicates found.${colors.reset}`,
    );
  } else if (missingKeys.length > 0) {
    console.log(
      `${colors.red}❌ Migration has issues: ${missingKeys.length} keys are missing.${colors.reset}`,
    );
    console.log(
      `${colors.yellow}Action needed: Review the missing-keys-report.json file and restore missing keys.${colors.reset}`,
    );
  } else if (duplicatesAcrossFiles.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Migration complete but duplicates found across files.${colors.reset}`,
    );
    console.log(
      `${colors.yellow}Action needed: Review and remove duplicate keys.${colors.reset}`,
    );
  }
}

// Run the comparison
compareTranslations();
