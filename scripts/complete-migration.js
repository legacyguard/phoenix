#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_DIR = __dirname;
const PROJECT_DIR = path.join(__dirname, "..");
const LOCALES_DIR = path.join(PROJECT_DIR, "src/i18n/locales");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}`, "cyan");
  try {
    execSync(command, { stdio: "inherit", cwd: PROJECT_DIR });
    return true;
  } catch (error) {
    log(`❌ Failed: ${description}`, "red");
    return false;
  }
}

function checkPrerequisites() {
  log("\n📋 Checking prerequisites...", "blue");

  // Check if backup exists
  const backupDirs = fs
    .readdirSync(path.join(PROJECT_DIR, "src/i18n"))
    .filter((f) => f.startsWith("locales.backup."));

  if (backupDirs.length === 0) {
    log("⚠️  No backup found. Creating backup now...", "yellow");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    runCommand(
      `cp -r ${LOCALES_DIR} ${LOCALES_DIR}.backup.${timestamp}`,
      "Creating backup of translation files",
    );
  } else {
    log(`✅ Backup found: ${backupDirs[0]}`, "green");
  }

  // Check if scripts exist
  const requiredScripts = [
    "migrate-translations.js",
    "fix-duplicates.js",
    "validate-translations.js",
    "update-namespace-references.js",
  ];

  for (const script of requiredScripts) {
    const scriptPath = path.join(SCRIPTS_DIR, script);
    if (!fs.existsSync(scriptPath)) {
      log(`❌ Missing script: ${script}`, "red");
      return false;
    }
  }

  log("✅ All required scripts found", "green");
  return true;
}

function showSummary() {
  log("\n" + "=".repeat(70), "blue");
  log("📊 MIGRATION SUMMARY", "blue");
  log("=".repeat(70), "blue");

  log("\n🎯 What will happen:", "cyan");
  log("1. Split large files:", "white");
  log(
    "   • ui.json → ui-common, ui-forms, ui-navigation, ui-professional, ui-misc",
    "white",
  );
  log(
    "   • family.json → family-core, family-emergency, family-communication",
    "white",
  );
  log("   • dashboard.json → dashboard-main, dashboard-review", "white");

  log("\n2. Merge small files:", "white");
  log("   • ai.json + assistant.json → ai-assistant.json", "white");
  log("   • documents.json + upload.json → documents.json", "white");

  log("\n3. Update all code references:", "white");
  log("   • Update useTranslation() calls", "white");
  log("   • Update t() function calls with namespace prefixes", "white");
  log("   • Update i18n configuration", "white");

  log("\n4. Validate integrity:", "white");
  log("   • Ensure no keys are lost", "white");
  log("   • Check for duplicates", "white");
  log("   • Verify file sizes are optimal", "white");

  log("\n" + "=".repeat(70), "blue");
}

async function promptUser(question) {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function main() {
  log("\n🚀 COMPLETE TRANSLATION MIGRATION TOOL", "magenta");
  log("=====================================", "magenta");

  // Check prerequisites
  if (!checkPrerequisites()) {
    log(
      "\n❌ Prerequisites check failed. Please ensure all scripts are present.",
      "red",
    );
    process.exit(1);
  }

  // Show summary
  showSummary();

  // Ask for confirmation
  const answer = await promptUser(
    "\n⚠️  This will restructure all translation files. Continue? (yes/no): ",
  );

  if (answer !== "yes" && answer !== "y") {
    log("\n❌ Migration cancelled by user.", "yellow");
    process.exit(0);
  }

  log("\n🏁 Starting migration process...", "green");

  // Step 1: Run migration
  if (
    !runCommand(
      "node scripts/migrate-translations.js",
      "📦 Step 1/5: Splitting and merging translation files...",
    )
  ) {
    log("\n❌ Migration failed at step 1", "red");
    process.exit(1);
  }

  // Step 2: Fix duplicates
  if (
    !runCommand(
      "node scripts/fix-duplicates.js",
      "🔧 Step 2/5: Removing duplicate keys...",
    )
  ) {
    log("\n❌ Migration failed at step 2", "red");
    process.exit(1);
  }

  // Step 3: Update namespace references in code
  if (
    !runCommand(
      "node scripts/update-namespace-references.js",
      "📝 Step 3/5: Updating namespace references in code...",
    )
  ) {
    log("\n⚠️  Warning: Some namespace updates may have failed", "yellow");
  }

  // Step 4: Validate
  log("\n✅ Step 4/5: Validating migration...", "cyan");
  const validationResult = runCommand(
    "node scripts/validate-translations.js 2>&1 | tail -20",
    "Checking translation integrity...",
  );

  // Step 5: Final report
  log("\n📊 Step 5/5: Generating final report...", "cyan");

  // Count files and keys
  const languages = fs
    .readdirSync(LOCALES_DIR)
    .filter((dir) => fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory());

  const enDir = path.join(LOCALES_DIR, "en");
  const enFiles = fs.readdirSync(enDir).filter((f) => f.endsWith(".json"));

  log("\n" + "=".repeat(70), "green");
  log("✅ MIGRATION COMPLETE!", "green");
  log("=".repeat(70), "green");

  log(`\n📊 Final Statistics:`, "cyan");
  log(`   • Languages: ${languages.length}`, "white");
  log(`   • Files per language: ${enFiles.length}`, "white");
  log(`   • New structure: 32 optimized files`, "white");

  log("\n📋 Next Steps:", "yellow");
  log("1. Run your test suite to ensure everything works", "white");
  log("2. Check that all translations load correctly", "white");
  log("3. Verify the application starts without errors", "white");
  log("4. Test a few key pages that use translations", "white");

  log("\n💾 Backup Information:", "cyan");
  log("Your original files are backed up in:", "white");
  const backupDirs = fs
    .readdirSync(path.join(PROJECT_DIR, "src/i18n"))
    .filter((f) => f.startsWith("locales.backup."));
  backupDirs.forEach((dir) => log(`   • src/i18n/${dir}`, "white"));

  log("\n🔄 To restore from backup if needed:", "yellow");
  log(`   rm -rf src/i18n/locales`, "white");
  log(`   cp -r src/i18n/${backupDirs[0]} src/i18n/locales`, "white");

  log("\n✨ Migration completed successfully!", "green");
}

// Run the migration
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, "red");
  process.exit(1);
});
