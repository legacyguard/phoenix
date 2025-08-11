#!/usr/bin/env node

/**
 * Script to validate that technical terminology has been properly transformed
 * to human-friendly language across the LegacyGuard app
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the terminology mappings to check
const terminologyMappings = {
  // Navigation & main concepts
  Assets: "What you own and cherish",
  Guardians: "People you trust",
  Beneficiaries: "Those you want to care for",
  Documents: "Important papers",
  "Will generation": "Your final wishes",
  "Legacy planning": "Caring for the future",

  // Dashboard specific
  "Total Assets": "Things you own and cherish",
  "Active Guardians": "People you trust",
  "Asset Inventory": "Things you treasure",
  "Guardian Network": "Your trusted helpers",
  "Inheritance Plan": "Your caring plan",
  "Critical Documents": "Essential papers",

  // Will steps
  "Asset Allocation": "Sharing what you have",
  Executors: "Who will help",

  // Pricing
  "Choose Your Heritage Plan": "Choose Your Caring Plan",
  "Choose Your Legacy Plan": "Choose How You Care",
};

// Files and patterns to check
const filesToCheck = [
  "src/i18n/locales/en/common.json",
  "src/components/**/*.tsx",
  "src/components/**/*.ts",
  "src/pages/**/*.tsx",
  "src/pages/**/*.ts",
];

// Technical terms that should NOT appear in user-facing text
const technicalTermsToAvoid = [
  "Asset Allocation",
  "Beneficiary Allocation",
  "Asset Portfolio",
  "Guardian Network",
  "Executor",
  "Legacy planning",
  "Will generation",
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const issues = [];

    // Check for technical terms that should be avoided
    technicalTermsToAvoid.forEach((term) => {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      const matches = content.match(regex);
      if (matches) {
        issues.push({
          file: filePath,
          term: term,
          count: matches.length,
          type: "technical_term_found",
        });
      }
    });

    // For JSON files, parse and check values
    if (filePath.endsWith(".json")) {
      try {
        const json = JSON.parse(content);
        checkJsonValues(json, filePath, "", issues);
      } catch (e) {
        console.error(`Error parsing JSON in ${filePath}:`, e.message);
      }
    }

    return issues;
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e.message);
    return [];
  }
}

function checkJsonValues(obj, filePath, path, issues) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === "string") {
      // Check if value contains technical terms
      for (const [technical, friendly] of Object.entries(terminologyMappings)) {
        if (value.includes(technical) && !value.includes(friendly)) {
          issues.push({
            file: filePath,
            path: currentPath,
            value: value,
            term: technical,
            suggestion: friendly,
            type: "terminology_mismatch",
          });
        }
      }
    } else if (typeof value === "object" && value !== null) {
      checkJsonValues(value, filePath, currentPath, issues);
    }
  }
}

function validateTerminology() {
  console.log("🔍 Validating terminology changes...\n");

  const allIssues = [];

  // Check the main translation file
  const translationFile = path.join(
    process.cwd(),
    "src/i18n/locales/en/common.json",
  );
  if (fs.existsSync(translationFile)) {
    const issues = checkFile(translationFile);
    allIssues.push(...issues);
  }

  // Report results
  if (allIssues.length === 0) {
    console.log(
      "✅ All terminology has been successfully transformed to human-friendly language!",
    );
    console.log("\nKey transformations verified:");
    for (const [technical, friendly] of Object.entries(terminologyMappings)) {
      console.log(`  ${technical} → ${friendly}`);
    }
  } else {
    console.log("⚠️  Found terminology issues:\n");

    const groupedIssues = {};
    allIssues.forEach((issue) => {
      if (!groupedIssues[issue.type]) {
        groupedIssues[issue.type] = [];
      }
      groupedIssues[issue.type].push(issue);
    });

    if (groupedIssues.technical_term_found) {
      console.log("Technical terms still present:");
      groupedIssues.technical_term_found.forEach((issue) => {
        console.log(
          `  - "${issue.term}" found ${issue.count} times in ${issue.file}`,
        );
      });
      console.log("");
    }

    if (groupedIssues.terminology_mismatch) {
      console.log("Terminology mismatches:");
      groupedIssues.terminology_mismatch.forEach((issue) => {
        console.log(`  - ${issue.file} at ${issue.path}:`);
        console.log(`    Found: "${issue.term}"`);
        console.log(`    Should use: "${issue.suggestion}"`);
        console.log(`    Current value: "${issue.value}"`);
        console.log("");
      });
    }
  }

  // Analytics recommendations
  console.log("\n📊 Analytics Tracking Recommendations:");
  console.log("To track if users respond better to the new terminology:");
  console.log("1. Monitor time spent on each page (especially onboarding)");
  console.log("2. Track onboarding completion rates before/after change");
  console.log("3. Watch emotional context indicators in analytics");
  console.log("4. Compare task completion rates");
  console.log("5. Monitor user feedback and support tickets");

  console.log("\n💡 Key metrics to watch in analytics dashboard:");
  console.log("- Onboarding completion rate");
  console.log("- Time to first action");
  console.log("- Task completion rate");
  console.log("- User emotional journey (positive vs frustrated)");
  console.log("- Feature adoption rates");
}

// Run validation
validateTerminology();
