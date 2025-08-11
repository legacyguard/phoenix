const fs = require("fs");
const path = require("path");

// Define all the old namespaces that should NOT be used anymore
const oldNamespaces = [
  "common",
  "accessibility",
  "forms",
  "general",
  "pwa",
  "steps",
  "app",
  "security",
  "consent",
  "annual-review",
  "progress",
  "notifications",
  "alerts",
  "admin",
  "calculator",
  "recommendations",
  "reminders",
  "asset-management",
  "documents",
  "upload",
  "vault",
  "guardians",
  "guardian",
  "executor",
  "beneficiary",
  "invitations",
  "crisis",
  "playbook",
  "will",
  "legal",
  "legal-pages",
  "cookies",
  "features",
  "country",
  "plans",
  "pricing",
  "life-events",
  "emails",
  "manual",
  "onboarding",
  "contact",
  "questions",
  "debug",
];

// Current valid namespaces
const validNamespaces = [
  "ui",
  "auth",
  "dashboard",
  "assets",
  "family",
  "wills",
  "landing",
  "settings",
  "subscription",
  "time-capsule",
  "sharing",
  "help",
  "ai",
  "errors",
  "micro-copy",
];

// Function to find all TypeScript/React files
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules" &&
      !item.includes("backup")
    ) {
      files.push(...findTsxFiles(fullPath));
    } else if (
      item.endsWith(".tsx") ||
      item.endsWith(".ts") ||
      item.endsWith(".jsx") ||
      item.endsWith(".js")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to extract ALL translation calls from a file (more comprehensive)
function extractAllTranslationCalls(content) {
  const calls = [];

  // Pattern 1: useTranslation('namespace')
  const useTranslationPattern =
    /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;
  while ((match = useTranslationPattern.exec(content)) !== null) {
    calls.push({
      type: "useTranslation",
      namespace: match[1],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  // Pattern 2: t('key') or t("key") - ALL patterns
  const tCallPattern = /t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = tCallPattern.exec(content)) !== null) {
    const key = match[1];
    calls.push({
      type: "t",
      key: key,
      namespace: key.split(".")[0],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  // Pattern 3: t(`key`) - template literals
  const tTemplatePattern = /t\s*\(\s*`([^`]+)`\s*\)/g;
  while ((match = tTemplatePattern.exec(content)) !== null) {
    const key = match[1];
    calls.push({
      type: "t",
      key: key,
      namespace: key.split(".")[0],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  return calls;
}

// Function to validate translation calls in a file
function validateTranslationCalls(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const calls = extractAllTranslationCalls(content);
  const violations = [];

  for (const call of calls) {
    if (call.type === "useTranslation") {
      if (oldNamespaces.includes(call.namespace)) {
        violations.push({
          type: "useTranslation",
          namespace: call.namespace,
          line: call.line,
          message: `useTranslation('${call.namespace}') - This old namespace should not be used`,
        });
      }
    } else if (call.type === "t") {
      // Check if key starts with old namespace
      for (const oldNamespace of oldNamespaces) {
        if (call.key.startsWith(`${oldNamespace}.`)) {
          violations.push({
            type: "t",
            namespace: oldNamespace,
            key: call.key,
            line: call.line,
            message: `t('${call.key}') - Key from old namespace '${oldNamespace}' should not be used`,
          });
          break;
        }
      }
    }
  }

  return violations;
}

// Function to check if old translation files still exist
function checkOldTranslationFiles() {
  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const existingFiles = fs
    .readdirSync(localesPath)
    .filter((file) => file.endsWith(".json") && !file.includes("backup"))
    .map((file) => file.replace(".json", ""));

  const oldFilesFound = existingFiles.filter((file) =>
    oldNamespaces.includes(file),
  );
  const missingValidFiles = validNamespaces.filter(
    (file) => !existingFiles.includes(file),
  );

  return { oldFilesFound, missingValidFiles, existingFiles };
}

// Function to check for common.json specifically
function checkCommonJson() {
  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const commonJsonPath = path.join(localesPath, "common.json");

  if (fs.existsSync(commonJsonPath)) {
    return {
      exists: true,
      size: fs.statSync(commonJsonPath).size,
      path: commonJsonPath,
    };
  }

  return { exists: false };
}

// Function to validate translation file structure
function validateTranslationFiles() {
  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const issues = [];

  for (const namespace of validNamespaces) {
    const filePath = path.join(localesPath, `${namespace}.json`);

    if (!fs.existsSync(filePath)) {
      issues.push({
        type: "missing_file",
        namespace: namespace,
        message: `Translation file ${namespace}.json is missing`,
      });
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);

      if (typeof data !== "object" || data === null) {
        issues.push({
          type: "invalid_json",
          namespace: namespace,
          message: `${namespace}.json is not a valid JSON object`,
        });
      }
    } catch (error) {
      issues.push({
        type: "parse_error",
        namespace: namespace,
        message: `Failed to parse ${namespace}.json: ${error.message}`,
      });
    }
  }

  return issues;
}

// Function to check for any remaining old namespace references in translation files
function checkTranslationFilesForOldNamespaces() {
  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const issues = [];

  for (const namespace of validNamespaces) {
    const filePath = path.join(localesPath, `${namespace}.json`);

    if (!fs.existsSync(filePath)) continue;

    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Check if the file content contains references to old namespaces
      for (const oldNamespace of oldNamespaces) {
        if (content.includes(`"${oldNamespace}.`)) {
          issues.push({
            type: "old_namespace_in_file",
            namespace: namespace,
            oldNamespace: oldNamespace,
            message: `${namespace}.json contains references to old namespace '${oldNamespace}'`,
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  return issues;
}

// Main comprehensive validation function
function comprehensiveValidation() {
  console.log("🔍 COMPREHENSIVE I18N VALIDATION\n");
  console.log("================================\n");

  const srcPath = path.join(__dirname, "../src");
  const tsxFiles = findTsxFiles(srcPath);

  console.log(`📁 Found ${tsxFiles.length} files to validate\n`);

  let totalViolations = 0;
  let filesWithViolations = 0;
  const allViolations = [];

  // 1. Validate translation calls in all files
  console.log("🔍 Step 1: Validating translation calls in components...");
  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    const violations = validateTranslationCalls(filePath);

    if (violations.length > 0) {
      console.log(`❌ ${relativePath}:`);
      violations.forEach((violation) => {
        console.log(`   Line ${violation.line}: ${violation.message}`);
      });
      totalViolations += violations.length;
      filesWithViolations++;
      allViolations.push({ file: relativePath, violations });
    }
  }

  // 2. Check for old translation files
  console.log("\n📁 Step 2: Checking for old translation files...");
  const fileCheck = checkOldTranslationFiles();

  if (fileCheck.oldFilesFound.length > 0) {
    console.log(
      `❌ Old translation files found: ${fileCheck.oldFilesFound.join(", ")}`,
    );
  } else {
    console.log("✅ No old translation files found");
  }

  if (fileCheck.missingValidFiles.length > 0) {
    console.log(
      `❌ Missing valid translation files: ${fileCheck.missingValidFiles.join(", ")}`,
    );
  } else {
    console.log("✅ All valid translation files present");
  }

  // 3. Check for common.json specifically
  console.log("\n📄 Step 3: Checking for common.json...");
  const commonCheck = checkCommonJson();

  if (commonCheck.exists) {
    console.log(`❌ common.json still exists (${commonCheck.size} bytes)`);
  } else {
    console.log("✅ common.json has been properly removed");
  }

  // 4. Validate translation file structure
  console.log("\n📋 Step 4: Validating translation file structure...");
  const fileStructureIssues = validateTranslationFiles();

  if (fileStructureIssues.length > 0) {
    console.log("❌ Translation file structure issues:");
    fileStructureIssues.forEach((issue) => {
      console.log(`   ${issue.message}`);
    });
  } else {
    console.log("✅ All translation files have valid structure");
  }

  // 5. Check for old namespace references in translation files
  console.log(
    "\n🔍 Step 5: Checking for old namespace references in translation files...",
  );
  const oldNamespaceIssues = checkTranslationFilesForOldNamespaces();

  if (oldNamespaceIssues.length > 0) {
    console.log("❌ Old namespace references found in translation files:");
    oldNamespaceIssues.forEach((issue) => {
      console.log(`   ${issue.message}`);
    });
  } else {
    console.log("✅ No old namespace references found in translation files");
  }

  // Generate comprehensive validation report
  console.log("\n📊 COMPREHENSIVE VALIDATION REPORT");
  console.log("==================================\n");

  console.log(`📁 Files processed: ${tsxFiles.length}`);
  console.log(`❌ Files with violations: ${filesWithViolations}`);
  console.log(`🚫 Total violations found: ${totalViolations}`);

  console.log("\n📁 Translation Files:");
  console.log(`   Old files found: ${fileCheck.oldFilesFound.length}`);
  console.log(`   Missing valid files: ${fileCheck.missingValidFiles.length}`);
  console.log(`   common.json exists: ${commonCheck.exists ? "YES" : "NO"}`);
  console.log(`   File structure issues: ${fileStructureIssues.length}`);
  console.log(`   Old namespace references: ${oldNamespaceIssues.length}`);

  // Summary of violations by type
  const violationsByType = {};
  allViolations.forEach(({ violations }) => {
    violations.forEach((violation) => {
      violationsByType[violation.type] =
        (violationsByType[violation.type] || 0) + 1;
    });
  });

  if (Object.keys(violationsByType).length > 0) {
    console.log("\n🚫 Violations by type:");
    Object.entries(violationsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }

  // Final status
  const hasViolations =
    totalViolations > 0 ||
    fileCheck.oldFilesFound.length > 0 ||
    commonCheck.exists ||
    fileStructureIssues.length > 0 ||
    oldNamespaceIssues.length > 0;

  if (hasViolations) {
    console.log("\n❌ VALIDATION FAILED - Issues found!");
    console.log("\n🔧 Required Actions:");
    console.log("   1. Remove any old translation files");
    console.log(
      "   2. Update any useTranslation() calls to use new namespaces",
    );
    console.log("   3. Update any t() calls that reference old namespaces");
    console.log("   4. Ensure common.json is completely removed");
    console.log("   5. Fix any translation file structure issues");
    console.log("   6. Remove old namespace references from translation files");
    return false;
  } else {
    console.log("\n✅ VALIDATION PASSED - No issues found!");
    console.log(
      "\n🎉 The i18n system is completely clean and properly consolidated.",
    );
    console.log(
      "\n✨ All translation calls use the new consolidated namespaces.",
    );
    console.log("✨ No old translation files remain.");
    console.log("✨ Translation files have valid structure.");
    console.log("✨ No old namespace references found.");
    return true;
  }
}

// Run the comprehensive validation
if (require.main === module) {
  comprehensiveValidation();
}

module.exports = { comprehensiveValidation };
