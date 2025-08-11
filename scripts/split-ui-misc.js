#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, "..", "src", "i18n", "locales");

// Helper functions from improved-migration.js
function countKeys(obj, prefix = "") {
  let count = 0;
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      count += countKeys(obj[key], fullKey);
    } else {
      count++;
    }
  }
  return count;
}

function extractAllKeys(obj, prefix = "") {
  const keys = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(keys, extractAllKeys(obj[key], fullKey));
    } else {
      keys[fullKey] = obj[key];
    }
  }
  return keys;
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

function reconstructObject(flatKeys) {
  const result = {};
  for (const [path, value] of Object.entries(flatKeys)) {
    setNestedValue(result, path, value);
  }
  return result;
}

// Analyze ui-misc.json
function analyzeUiMisc() {
  const enPath = path.join(LOCALES_DIR, "en", "ui-misc.json");
  const content = JSON.parse(fs.readFileSync(enPath, "utf8"));

  const categories = {};
  const flatKeys = extractAllKeys(content);

  for (const key of Object.keys(flatKeys)) {
    const topLevel = key.split(".")[0];
    if (!categories[topLevel]) {
      categories[topLevel] = [];
    }
    categories[topLevel].push(key);
  }

  console.log("\n📊 Analysis of ui-misc.json:");
  console.log("================================\n");

  const sorted = Object.entries(categories)
    .map(([key, keys]) => ({ name: key, count: keys.length, keys }))
    .sort((a, b) => b.count - a.count);

  sorted.forEach(({ name, count }) => {
    console.log(`  ${name.padEnd(25)} ${count} keys`);
  });

  console.log(`\n  Total: ${Object.keys(flatKeys).length} keys`);

  // Group categories for splitting
  const group1Categories = [];
  const group2Categories = [];
  let group1Count = 0;
  let group2Count = 0;

  // Try to balance the two groups
  for (const { name, count } of sorted) {
    if (group1Count <= group2Count) {
      group1Categories.push(name);
      group1Count += count;
    } else {
      group2Categories.push(name);
      group2Count += count;
    }
  }

  console.log("\n📦 Proposed split:");
  console.log("==================\n");
  console.log(`  ui-components.json (${group1Count} keys):`);
  group1Categories.forEach((cat) => {
    const count = categories[cat].length;
    console.log(`    - ${cat} (${count} keys)`);
  });

  console.log(`\n  ui-elements.json (${group2Count} keys):`);
  group2Categories.forEach((cat) => {
    const count = categories[cat].length;
    console.log(`    - ${cat} (${count} keys)`);
  });

  return { categories, flatKeys, group1Categories, group2Categories };
}

// Split ui-misc.json into two files
function splitUiMisc(lang) {
  const sourcePath = path.join(LOCALES_DIR, lang, "ui-misc.json");

  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  const content = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const flatKeys = extractAllKeys(content);

  // Determine split based on English analysis
  const enPath = path.join(LOCALES_DIR, "en", "ui-misc.json");
  const enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const enCategories = {};
  const enFlatKeys = extractAllKeys(enContent);

  for (const key of Object.keys(enFlatKeys)) {
    const topLevel = key.split(".")[0];
    if (!enCategories[topLevel]) {
      enCategories[topLevel] = [];
    }
    enCategories[topLevel].push(key);
  }

  const sorted = Object.entries(enCategories)
    .map(([key, keys]) => ({ name: key, count: keys.length }))
    .sort((a, b) => b.count - a.count);

  const group1Categories = [];
  const group2Categories = [];
  let group1Count = 0;
  let group2Count = 0;

  for (const { name, count } of sorted) {
    if (group1Count <= group2Count) {
      group1Categories.push(name);
      group1Count += count;
    } else {
      group2Categories.push(name);
      group2Count += count;
    }
  }

  // Split the keys
  const componentsKeys = {};
  const elementsKeys = {};

  for (const [key, value] of Object.entries(flatKeys)) {
    const topLevel = key.split(".")[0];
    if (group1Categories.includes(topLevel)) {
      componentsKeys[key] = value;
    } else {
      elementsKeys[key] = value;
    }
  }

  // Write new files
  const componentsPath = path.join(LOCALES_DIR, lang, "ui-components.json");
  const elementsPath = path.join(LOCALES_DIR, lang, "ui-elements.json");

  fs.writeFileSync(
    componentsPath,
    JSON.stringify(reconstructObject(componentsKeys), null, 2),
  );

  fs.writeFileSync(
    elementsPath,
    JSON.stringify(reconstructObject(elementsKeys), null, 2),
  );

  // Remove original file
  fs.unlinkSync(sourcePath);

  return {
    components: Object.keys(componentsKeys).length,
    elements: Object.keys(elementsKeys).length,
  };
}

// Main execution
async function main() {
  console.log("🚀 Starting ui-misc.json split...\n");

  // First analyze
  const analysis = analyzeUiMisc();

  console.log("\n🔄 Proceed with splitting? (y/n): ");

  // For automation, we'll proceed
  console.log("y (auto-proceeding)\n");

  // Get all languages
  const languages = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());

  console.log("📝 Splitting files across all languages...\n");

  for (const lang of languages) {
    const result = splitUiMisc(lang);
    if (result) {
      console.log(
        `  ✅ ${lang}: ui-components.json (${result.components} keys), ui-elements.json (${result.elements} keys)`,
      );
    } else {
      console.log(`  ⚠️  ${lang}: ui-misc.json not found`);
    }
  }

  console.log("\n✅ Split complete!");
  console.log("\n📝 Next step: Update namespace references in code");
}

main().catch(console.error);
