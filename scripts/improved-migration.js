#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, "..", "src", "i18n", "locales");

// Helper function to count all keys in nested object
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

// Helper function to extract all keys with their paths
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

// Helper function to set nested value
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

// Helper function to reconstruct nested object from flat keys
function reconstructObject(flatKeys) {
  const result = {};
  for (const [path, value] of Object.entries(flatKeys)) {
    setNestedValue(result, path, value);
  }
  return result;
}

// Configuration for how to split and merge files
const MIGRATION_CONFIG = {
  splits: {
    "ui.json": {
      "ui-common.json": [
        "common",
        "general",
        "global",
        "shared",
        "buttons",
        "labels",
        "messages",
        "placeholders",
        "tooltips",
      ],
      "ui-forms.json": [
        "forms",
        "inputs",
        "validation",
        "fields",
        "formLabels",
        "formErrors",
        "formSuccess",
        "formHelp",
      ],
      "ui-navigation.json": [
        "navigation",
        "menu",
        "breadcrumbs",
        "tabs",
        "links",
        "nav",
        "header",
        "footer",
        "sidebar",
      ],
      "ui-professional.json": [
        "professional",
        "advisor",
        "lawyer",
        "accountant",
        "expert",
        "consultation",
        "services",
      ],
      "ui-misc.json": [], // Catch-all for remaining keys
    },
    "family.json": {
      "family-core.json": [
        "members",
        "relationships",
        "roles",
        "basic",
        "core",
        "family",
        "relatives",
      ],
      "family-emergency.json": [
        "emergency",
        "urgent",
        "critical",
        "contacts",
        "crisis",
      ],
      "family-communication.json": [
        "communication",
        "messages",
        "notifications",
        "sharing",
        "updates",
        "announcements",
      ],
    },
    "dashboard.json": {
      "dashboard-main.json": [
        "main",
        "overview",
        "summary",
        "stats",
        "activity",
        "dashboard",
        "home",
        "widgets",
        "cards",
      ],
      "dashboard-review.json": [
        "review",
        "annual",
        "periodic",
        "check",
        "audit",
        "annualReview",
        "reviewProcess",
      ],
    },
  },
  merges: {
    "ai-assistant.json": ["ai.json", "assistant.json"],
    "documents.json": ["documents.json", "upload.json"],
  },
};

// Process a single language
function processLanguage(lang) {
  const langDir = path.join(LOCALES_DIR, lang);

  if (!fs.existsSync(langDir)) {
    console.log(`  ⚠️  Language directory not found: ${lang}`);
    return { success: false, error: "Directory not found" };
  }

  const results = {
    splits: [],
    merges: [],
    errors: [],
  };

  // Process splits
  for (const [sourceFile, targetFiles] of Object.entries(
    MIGRATION_CONFIG.splits,
  )) {
    const sourcePath = path.join(langDir, sourceFile);

    if (!fs.existsSync(sourcePath)) {
      console.log(`  ⚠️  Source file not found: ${sourceFile}`);
      continue;
    }

    try {
      const sourceContent = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
      const flatKeys = extractAllKeys(sourceContent);
      const keyAssignments = {};

      // Initialize target objects
      for (const targetFile of Object.keys(targetFiles)) {
        keyAssignments[targetFile] = {};
      }

      // Assign keys to target files based on patterns
      for (const [keyPath, value] of Object.entries(flatKeys)) {
        let assigned = false;

        // Check each target file's patterns
        for (const [targetFile, patterns] of Object.entries(targetFiles)) {
          if (patterns.length === 0) continue; // Skip catch-all for now

          for (const pattern of patterns) {
            if (keyPath.toLowerCase().includes(pattern.toLowerCase())) {
              keyAssignments[targetFile][keyPath] = value;
              assigned = true;
              break;
            }
          }
          if (assigned) break;
        }

        // If not assigned and there's a catch-all file
        if (!assigned) {
          const catchAllFile = Object.keys(targetFiles).find(
            (f) => targetFiles[f].length === 0,
          );
          if (catchAllFile) {
            keyAssignments[catchAllFile][keyPath] = value;
          }
        }
      }

      // Write target files
      for (const [targetFile, keys] of Object.entries(keyAssignments)) {
        if (Object.keys(keys).length > 0) {
          const targetPath = path.join(langDir, targetFile);
          const nestedObject = reconstructObject(keys);
          fs.writeFileSync(targetPath, JSON.stringify(nestedObject, null, 2));
          console.log(
            `    ✅ Created ${targetFile} with ${Object.keys(keys).length} keys`,
          );
          results.splits.push(targetFile);
        }
      }

      // Remove original file
      fs.unlinkSync(sourcePath);
      console.log(`    🗑️  Removed original ${sourceFile}`);
    } catch (error) {
      console.error(`    ❌ Error processing ${sourceFile}: ${error.message}`);
      results.errors.push({ file: sourceFile, error: error.message });
    }
  }

  // Process merges
  for (const [targetFile, sourceFiles] of Object.entries(
    MIGRATION_CONFIG.merges,
  )) {
    const mergedContent = {};
    let hasContent = false;

    for (const sourceFile of sourceFiles) {
      const sourcePath = path.join(langDir, sourceFile);

      if (!fs.existsSync(sourcePath)) {
        console.log(`    ⚠️  Source file for merge not found: ${sourceFile}`);
        continue;
      }

      try {
        const sourceContent = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
        const flatKeys = extractAllKeys(sourceContent);

        // Merge all keys
        for (const [key, value] of Object.entries(flatKeys)) {
          mergedContent[key] = value;
          hasContent = true;
        }

        // Remove source file after successful merge
        fs.unlinkSync(sourcePath);
        console.log(`    🗑️  Merged and removed ${sourceFile}`);
      } catch (error) {
        console.error(`    ❌ Error reading ${sourceFile}: ${error.message}`);
        results.errors.push({ file: sourceFile, error: error.message });
      }
    }

    // Write merged file if we have content
    if (hasContent) {
      const targetPath = path.join(langDir, targetFile);
      const nestedObject = reconstructObject(mergedContent);
      fs.writeFileSync(targetPath, JSON.stringify(nestedObject, null, 2));
      console.log(
        `    ✅ Created ${targetFile} with ${Object.keys(mergedContent).length} keys`,
      );
      results.merges.push(targetFile);
    }
  }

  return results;
}

// Validate migration
function validateMigration() {
  console.log("\n📊 Validating migration...\n");

  const languages = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());

  let allValid = true;

  for (const lang of languages) {
    const langDir = path.join(LOCALES_DIR, lang);
    const files = fs.readdirSync(langDir).filter((f) => f.endsWith(".json"));

    console.log(`📂 ${lang}:`);

    let totalKeys = 0;
    let totalLines = 0;
    const issues = [];

    for (const file of files.sort()) {
      const filePath = path.join(langDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n").length;

      try {
        const json = JSON.parse(content);
        const keys = countKeys(json);
        totalKeys += keys;
        totalLines += lines;

        const status =
          lines < 100 ? "⚠️  (small)" : lines > 800 ? "❌ (too large)" : "✅";
        console.log(
          `  ${status} ${file.padEnd(30)} ${lines.toString().padStart(4)} lines, ${keys.toString().padStart(4)} keys`,
        );

        if (lines < 100 || lines > 800) {
          issues.push(`${file}: ${lines} lines`);
          allValid = false;
        }
      } catch (error) {
        console.log(`  ❌ ${file.padEnd(30)} Invalid JSON!`);
        issues.push(`${file}: Invalid JSON`);
        allValid = false;
      }
    }

    console.log(
      `  📊 Total: ${totalKeys} keys in ${totalLines} lines across ${files.length} files`,
    );

    if (issues.length > 0) {
      console.log(`  ⚠️  Issues: ${issues.join(", ")}`);
    }

    console.log("");
  }

  return allValid;
}

// Main execution
async function main() {
  console.log("🚀 Starting improved translation migration...\n");

  // Create backup first
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = `${LOCALES_DIR}.backup.${timestamp}`;

  if (!fs.existsSync(backupDir)) {
    console.log(`📦 Creating backup at ${backupDir}...`);
    fs.cpSync(LOCALES_DIR, backupDir, { recursive: true });
    console.log("✅ Backup created\n");
  }

  // Get all languages
  const languages = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());

  console.log(
    `📂 Found ${languages.length} languages: ${languages.join(", ")}\n`,
  );

  // Process each language
  for (const lang of languages) {
    console.log(`🌍 Processing language: ${lang}`);
    const result = processLanguage(lang);

    if (result.errors && result.errors.length > 0) {
      console.log(`  ⚠️  Completed with ${result.errors.length} errors`);
    }
    console.log("");
  }

  // Validate the migration
  const isValid = validateMigration();

  if (isValid) {
    console.log("✅ Migration completed successfully!");
  } else {
    console.log(
      "⚠️  Migration completed with issues. Please review the file sizes above.",
    );
  }

  console.log(`\n💾 Your original files are backed up in: ${backupDir}`);
  console.log("\n📝 Next steps:");
  console.log("1. Run: node scripts/update-namespace-references.js");
  console.log("2. Test your application");
  console.log("3. If needed, restore from backup with:");
  console.log(`   rm -rf ${LOCALES_DIR} && cp -r ${backupDir} ${LOCALES_DIR}`);
}

main().catch(console.error);
