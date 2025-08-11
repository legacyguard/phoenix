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

// Function to extract translation calls from a file
function extractTranslationCalls(content) {
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

  // Pattern 2: t('key') or t("key")
  const tCallPattern = /t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = tCallPattern.exec(content)) !== null) {
    calls.push({
      type: "t",
      key: match[1],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  // Pattern 3: tMicro('key') or tMicro("key")
  const tMicroPattern = /tMicro\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = tMicroPattern.exec(content)) !== null) {
    calls.push({
      type: "tMicro",
      key: match[1],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  return calls;
}

// Function to verify and fix translation calls in a file
function verifyAndFixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const calls = extractTranslationCalls(content);
  let updatedContent = content;
  let updated = false;
  const issues = [];

  // Track current namespace context
  let currentNamespace = null;

  for (const call of calls) {
    if (call.type === "useTranslation") {
      const oldNamespace = call.namespace;
      const newNamespace = namespaceMapping[oldNamespace];

      if (newNamespace && newNamespace !== oldNamespace) {
        // Update the useTranslation call
        updatedContent = updatedContent.replace(
          call.fullMatch,
          `useTranslation('${newNamespace}')`,
        );
        currentNamespace = newNamespace;
        updated = true;
        issues.push(
          `Updated useTranslation: '${oldNamespace}' → '${newNamespace}'`,
        );
      } else if (newNamespace) {
        currentNamespace = newNamespace;
      }
    } else if (call.type === "t" || call.type === "tMicro") {
      // For t() and tMicro() calls, we need to verify the key exists in the current namespace
      // This is more complex and would require loading the actual translation files
      // For now, we'll just log these for manual verification
      issues.push(`Found ${call.type} call: ${call.key} (line ${call.line})`);
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, updatedContent);
  }

  return { updated, issues };
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
function generateReport(allIssues) {
  console.log("\n📊 COMPREHENSIVE VERIFICATION REPORT");
  console.log("=====================================\n");

  let totalFiles = 0;
  let totalUpdated = 0;
  let totalIssues = 0;
  let namespaceUsage = {};

  for (const [filePath, result] of Object.entries(allIssues)) {
    totalFiles++;
    if (result.updated) totalUpdated++;
    totalIssues += result.issues.length;

    // Track namespace usage
    for (const issue of result.issues) {
      if (issue.includes("useTranslation:")) {
        const match = issue.match(/→ '([^']+)'/);
        if (match) {
          const namespace = match[1];
          namespaceUsage[namespace] = (namespaceUsage[namespace] || 0) + 1;
        }
      }
    }
  }

  console.log(`📁 Files processed: ${totalFiles}`);
  console.log(`✅ Files updated: ${totalUpdated}`);
  console.log(`⚠️  Total issues found: ${totalIssues}`);

  console.log("\n📈 Namespace Usage:");
  Object.entries(namespaceUsage)
    .sort(([, a], [, b]) => b - a)
    .forEach(([namespace, count]) => {
      console.log(`   ${namespace}: ${count} files`);
    });

  console.log("\n🔍 Detailed Issues:");
  for (const [filePath, result] of Object.entries(allIssues)) {
    if (result.issues.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`\n📄 ${relativePath}:`);
      result.issues.forEach((issue) => {
        console.log(`   ${issue}`);
      });
    }
  }
}

// Main verification function
function verifyAllTranslationCalls() {
  console.log("🔍 Starting comprehensive translation call verification...\n");

  const srcPath = path.join(__dirname, "../src");
  const tsxFiles = findTsxFiles(srcPath);

  console.log(`📁 Found ${tsxFiles.length} files to verify\n`);

  const allIssues = {};

  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    console.log(`🔍 Verifying ${relativePath}...`);

    const result = verifyAndFixFile(filePath);
    allIssues[filePath] = result;

    if (result.updated) {
      console.log(`  ✅ Updated`);
    } else if (result.issues.length > 0) {
      console.log(`  ⚠️  ${result.issues.length} issues found`);
    } else {
      console.log(`  ✅ No issues`);
    }
  }

  // Generate comprehensive report
  generateReport(allIssues);

  return allIssues;
}

// Run the verification
if (require.main === module) {
  verifyAllTranslationCalls();
}

module.exports = { verifyAllTranslationCalls, namespaceMapping };
