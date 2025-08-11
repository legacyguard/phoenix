const fs = require("fs");
const path = require("path");

// Define the complete mapping from old namespaces to new consolidated namespaces
const namespaceMapping = {
  // UI & Core
  ui: "ui",
  accessibility: "ui",
  forms: "ui",
  general: "ui",
  pwa: "ui",
  steps: "ui",
  app: "ui",

  // Authentication & Security
  auth: "auth",
  security: "auth",
  consent: "auth",

  // Dashboard & Navigation
  dashboard: "dashboard",
  "annual-review": "dashboard",
  progress: "dashboard",
  notifications: "dashboard",
  alerts: "dashboard",
  admin: "dashboard",
  calculator: "dashboard",
  recommendations: "dashboard",
  reminders: "dashboard",

  // Assets & Documents
  assets: "assets",
  "asset-management": "assets",
  documents: "assets",
  upload: "assets",
  vault: "assets",

  // Family & Guardians
  family: "family",
  guardians: "family",
  guardian: "family",
  executor: "family",
  beneficiary: "family",
  invitations: "family",
  crisis: "family",
  playbook: "family",

  // Wills & Legal
  wills: "wills",
  will: "wills",
  legal: "wills",
  "legal-pages": "wills",
  cookies: "wills",

  // Landing & Features
  landing: "landing",
  features: "landing",

  // Settings & Preferences
  settings: "settings",
  country: "settings",

  // Subscriptions & Plans
  subscription: "subscription",
  plans: "subscription",
  pricing: "subscription",

  // Time Capsule & Legacy
  "time-capsule": "time-capsule",
  "life-events": "time-capsule",

  // Sharing & Communication
  sharing: "sharing",
  emails: "sharing",

  // Help & Support
  help: "help",
  manual: "help",
  onboarding: "help",
  contact: "help",
  questions: "help",

  // AI & Smart Features
  ai: "ai",

  // Errors & Debug
  errors: "errors",
  debug: "errors",

  // Micro-copy
  "micro-copy": "micro-copy",
};

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

// Function to extract and fix translation calls in a file
function fixTranslationCalls(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let updatedContent = content;
  let updated = false;
  const changes = [];

  // Pattern 1: useTranslation('namespace') - fix namespace mapping
  const useTranslationPattern =
    /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;

  while ((match = useTranslationPattern.exec(content)) !== null) {
    const oldNamespace = match[1];
    const newNamespace = namespaceMapping[oldNamespace];

    if (newNamespace && newNamespace !== oldNamespace) {
      // Replace the old namespace with the new one
      updatedContent = updatedContent.replace(
        `useTranslation('${oldNamespace}')`,
        `useTranslation('${newNamespace}')`,
      );
      updatedContent = updatedContent.replace(
        `useTranslation("${oldNamespace}")`,
        `useTranslation("${newNamespace}")`,
      );
      updatedContent = updatedContent.replace(
        `useTranslation(\`${oldNamespace}\`)`,
        `useTranslation(\`${newNamespace}\`)`,
      );

      updated = true;
      changes.push(`useTranslation: '${oldNamespace}' → '${newNamespace}'`);
    }
  }

  // Pattern 2: useTranslation() without namespace - add default namespace
  const useTranslationNoNamespacePattern = /useTranslation\s*\(\s*\)/g;
  if (useTranslationNoNamespacePattern.test(updatedContent)) {
    // Replace with default namespace (usually 'ui' for general components)
    updatedContent = updatedContent.replace(
      /useTranslation\s*\(\s*\)/g,
      `useTranslation('ui')`,
    );
    updated = true;
    changes.push("useTranslation() → useTranslation('ui')");
  }

  // Pattern 3: useTranslation('common') - this should be mapped to appropriate namespace
  if (updatedContent.includes("useTranslation('common')")) {
    // Map 'common' to 'ui' as a default
    updatedContent = updatedContent.replace(
      /useTranslation\s*\(\s*['"`]common['"`]\s*\)/g,
      `useTranslation('ui')`,
    );
    updated = true;
    changes.push("useTranslation('common') → useTranslation('ui')");
  }

  if (updated) {
    fs.writeFileSync(filePath, updatedContent);
  }

  return { updated, changes };
}

// Function to verify key existence in translation files
function verifyKeyExists(key, namespace) {
  const translationPath = path.join(
    __dirname,
    "../src/i18n/locales/en",
    `${namespace}.json`,
  );

  if (!fs.existsSync(translationPath)) {
    return {
      exists: false,
      error: `Translation file not found: ${namespace}.json`,
    };
  }

  try {
    const translationData = JSON.parse(
      fs.readFileSync(translationPath, "utf8"),
    );

    // Check if key exists (supporting nested keys like 'section.subsection.key')
    const keyParts = key.split(".");
    let current = translationData;

    for (const part of keyParts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return {
          exists: false,
          error: `Key not found: ${key} in ${namespace}.json`,
        };
      }
    }

    return { exists: true, value: current };
  } catch (error) {
    return {
      exists: false,
      error: `Error reading translation file: ${error.message}`,
    };
  }
}

// Function to generate comprehensive report
function generateReport(allResults) {
  console.log("\n📊 COMPREHENSIVE TRANSLATION FIX REPORT");
  console.log("=========================================\n");

  let totalFiles = 0;
  let totalUpdated = 0;
  let totalChanges = 0;
  let namespaceUsage = {};
  let missingKeys = [];

  for (const [filePath, result] of Object.entries(allResults)) {
    totalFiles++;
    if (result.updated) {
      totalUpdated++;
      totalChanges += result.changes.length;
    }

    // Track namespace usage
    for (const change of result.changes) {
      if (change.includes("useTranslation:")) {
        const match = change.match(/→ '([^']+)'/);
        if (match) {
          const namespace = match[1];
          namespaceUsage[namespace] = (namespaceUsage[namespace] || 0) + 1;
        }
      }
    }
  }

  console.log(`📁 Files processed: ${totalFiles}`);
  console.log(`✅ Files updated: ${totalUpdated}`);
  console.log(`🔄 Total changes made: ${totalChanges}`);

  console.log("\n📈 Namespace Usage:");
  Object.entries(namespaceUsage)
    .sort(([, a], [, b]) => b - a)
    .forEach(([namespace, count]) => {
      console.log(`   ${namespace}: ${count} files`);
    });

  console.log("\n🔍 Detailed Changes:");
  for (const [filePath, result] of Object.entries(allResults)) {
    if (result.changes.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`\n📄 ${relativePath}:`);
      result.changes.forEach((change) => {
        console.log(`   ${change}`);
      });
    }
  }

  return {
    totalFiles,
    totalUpdated,
    totalChanges,
    namespaceUsage,
  };
}

// Main function to fix all translation calls
function fixAllTranslationCalls() {
  console.log("🔧 Starting comprehensive translation call fixes...\n");

  const srcPath = path.join(__dirname, "../src");
  const tsxFiles = findTsxFiles(srcPath);

  console.log(`📁 Found ${tsxFiles.length} files to process\n`);

  const allResults = {};

  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    console.log(`🔧 Processing ${relativePath}...`);

    const result = fixTranslationCalls(filePath);
    allResults[filePath] = result;

    if (result.updated) {
      console.log(`  ✅ Updated (${result.changes.length} changes)`);
    } else {
      console.log(`  ✅ No changes needed`);
    }
  }

  // Generate comprehensive report
  const report = generateReport(allResults);

  console.log("\n🎉 Translation call fixes completed!");
  console.log(`📊 Summary:`);
  console.log(`   - Files processed: ${report.totalFiles}`);
  console.log(`   - Files updated: ${report.totalUpdated}`);
  console.log(`   - Total changes: ${report.totalChanges}`);

  return allResults;
}

// Run the fix
if (require.main === module) {
  fixAllTranslationCalls();
}

module.exports = { fixAllTranslationCalls, namespaceMapping };
