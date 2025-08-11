#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllKeys(obj, prefix = "") {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Load backup dashboard.json
const backupPath = path.join(
  __dirname,
  "..",
  "src",
  "i18n",
  "locales.backup.20250810_182743",
  "en",
  "dashboard.json",
);
const backupData = JSON.parse(fs.readFileSync(backupPath, "utf8"));
const backupKeys = getAllKeys(backupData);

// Load current dashboard files
const currentFiles = ["dashboard-main.json", "dashboard-review.json"];

let allCurrentKeys = [];

console.log("=== Current Dashboard Files Analysis ===\n");

for (const file of currentFiles) {
  const filePath = path.join(
    __dirname,
    "..",
    "src",
    "i18n",
    "locales",
    "en",
    file,
  );
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const keys = getAllKeys(data);
    allCurrentKeys.push(...keys);

    console.log(`${file}: ${keys.length} keys`);
    console.log("Sample keys:");
    keys.slice(0, 5).forEach((k) => console.log(`  - ${k}`));
    console.log();
  }
}

console.log(`\nBackup dashboard.json: ${backupKeys.length} keys`);
console.log(`Current dashboard files combined: ${allCurrentKeys.length} keys`);
console.log(`Difference: ${backupKeys.length - allCurrentKeys.length} keys\n`);

// Find missing keys
const currentKeySet = new Set(allCurrentKeys);
const missingKeys = backupKeys.filter((key) => !currentKeySet.has(key));

if (missingKeys.length > 0) {
  console.log(
    `Missing keys from dashboard.json (${missingKeys.length} total):`,
  );

  // Group by top-level category
  const grouped = {};
  missingKeys.forEach((key) => {
    const category = key.split(".")[0];
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(key);
  });

  for (const [category, keys] of Object.entries(grouped)) {
    console.log(`\n${category} (${keys.length} keys):`);
    keys.slice(0, 5).forEach((k) => console.log(`  - ${k}`));
    if (keys.length > 5) {
      console.log(`  ... and ${keys.length - 5} more`);
    }
  }
}
