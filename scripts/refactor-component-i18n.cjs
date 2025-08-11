#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration
const SRC_DIR = path.join(__dirname, "../src");
const LOCALES_DIR = path.join(__dirname, "../src/i18n/locales");

// Component categories and their namespaces
const COMPONENT_CATEGORIES = {
  ui: ["components/ui"],
  common: ["components/common", "components/layout"],
  auth: ["components/auth"],
  dashboard: ["components/dashboard", "components/analytics"],
  assets: ["components/assets"],
  documents: ["components/documents", "components/ocr", "components/upload"],
  guardians: ["components/guardians", "components/guardian"],
  wills: ["components/wills", "components/willSync"],
  onboarding: ["components/onboarding"],
  settings: ["components/settings"],
  subscription: ["components/subscriptions"],
  help: ["components/emergency", "components/ai"],
  landing: ["components/landing", "components/privacy", "components/sharing"],
};

// Function to get namespace from component path
function getNamespaceFromPath(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  for (const [namespace, patterns] of Object.entries(COMPONENT_CATEGORIES)) {
    for (const pattern of patterns) {
      if (relativePath.includes(pattern)) {
        return namespace;
      }
    }
  }

  return "ui"; // Default namespace
}

// Function to generate meaningful translation key
function generateTranslationKey(text, context, namespace) {
  // Clean the text
  let cleanText = text
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .toLowerCase();

  // Truncate if too long
  if (cleanText.length > 40) {
    cleanText = cleanText.substring(0, 40);
  }

  // Add context if provided
  if (context) {
    return `${namespace}.${context}.${cleanText}`;
  }

  return `${namespace}.${cleanText}`;
}

// Function to extract meaningful strings from file
function extractMeaningfulStrings(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const namespace = getNamespaceFromPath(filePath);
  const fileName = path.basename(filePath, path.extname(filePath));
  const extracted = new Map();

  // Patterns to extract meaningful text
  const patterns = [
    // JSX text content (actual user-facing text)
    {
      regex: /<[^>]*>([^<>{}\n]+[a-zA-Z][^<>{}\n]*)<\/[^>]*>/g,
      type: "jsx_text",
    },
    // Button text, labels, placeholders
    {
      regex: /(children|label|placeholder|title|alt)=["']([^"']{3,})["']/g,
      type: "attribute",
    },
    // Error messages, success messages
    {
      regex: /(error|success|message|description)=["']([^"']{3,})["']/g,
      type: "message",
    },
  ];

  // Strings to ignore
  const ignorePatterns = [
    /^[A-Z_]+$/, // Constants
    /^[a-z]+$/, // Single words
    /^\d+$/, // Numbers
    /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Symbols
    /^(true|false|null|undefined)$/, // JavaScript literals
    /^(className|id|name|type|value|src|href)$/, // Common attributes
    /^(onClick|onChange|onSubmit|onBlur|onFocus)$/, // Event handlers
    /^(useState|useEffect|useCallback|useMemo|useRef)$/, // React hooks
    /^(import|export|const|let|var|function|return|if|else|for|while)$/, // JavaScript keywords
    /^(div|span|p|h1|h2|h3|h4|h5|h6|button|input|form|label|select|option)$/, // HTML tags
    /^(flex|grid|block|inline|none|hidden|visible|absolute|relative|fixed)$/, // CSS classes
    /^(bg-|text-|border-|p-|m-|w-|h-|rounded-|shadow-)/, // Tailwind classes
    /^(en|sk|bg|cs|cy|da|de|el|es|et|fi|fr|ga|hr|hu|is|it|lt|lv|me|mk|mt|nl|no|pl|pt|ro|ru|sk|sl|sq|sr|sv|tr|uk)$/, // Language codes
    /^\/[a-zA-Z0-9\/\-_]+$/, // Paths
    /^[a-zA-Z0-9\/\-_]+\.(tsx?|jsx?|json|css|svg|png|jpg|jpeg|gif|webp)$/, // File names
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const text = match[2] || match[1];
      if (
        text &&
        text.length > 2 &&
        !ignorePatterns.some((ignore) => ignore.test(text))
      ) {
        const key = generateTranslationKey(text, fileName, namespace);
        extracted.set(key, text);
      }
    }
  }

  return extracted;
}

// Function to update translation file
function updateTranslationFile(namespace, strings) {
  const filePath = path.join(LOCALES_DIR, "en", `${namespace}.json`);

  // Read existing content
  let existingContent = {};
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      existingContent = JSON.parse(content);
    } catch (error) {
      console.warn(`Warning: Could not parse ${filePath}:`, error.message);
    }
  }

  // Merge with new strings
  const mergedContent = { ...existingContent };
  for (const [key, value] of strings) {
    if (!mergedContent[key]) {
      mergedContent[key] = value;
    }
  }

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(mergedContent, null, 2));
  return (
    Object.keys(mergedContent).length - Object.keys(existingContent).length
  );
}

// Function to scan and process components
function processComponents() {
  console.log("🔍 Scanning components for meaningful strings...");

  const componentDirs = [
    "components/ui",
    "components/common",
    "components/layout",
    "components/auth",
    "components/dashboard",
    "components/assets",
    "components/documents",
    "components/guardians",
    "components/wills",
    "components/onboarding",
    "components/settings",
    "components/subscriptions",
    "components/emergency",
    "components/ai",
    "components/ocr",
    "components/upload",
    "components/guardian",
    "components/willSync",
    "components/analytics",
    "components/landing",
    "components/privacy",
    "components/sharing",
  ];

  const allStrings = new Map();
  const processedFiles = [];

  for (const dir of componentDirs) {
    const fullPath = path.join(SRC_DIR, dir);
    if (!fs.existsSync(fullPath)) continue;

    const files = fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
      .map((file) => path.join(fullPath, file));

    for (const file of files) {
      try {
        const extracted = extractMeaningfulStrings(file);
        if (extracted.size > 0) {
          processedFiles.push({
            file: path.relative(SRC_DIR, file),
            count: extracted.size,
            strings: extracted,
          });

          // Add to all strings
          for (const [key, value] of extracted) {
            allStrings.set(key, value);
          }
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }

  console.log(
    `\n📊 Found ${processedFiles.length} files with meaningful strings`,
  );
  console.log(`📝 Total unique strings: ${allStrings.size}`);

  // Group by namespace and update files
  const namespaceGroups = new Map();
  for (const [key, value] of allStrings) {
    const namespace = key.split(".")[0];
    if (!namespaceGroups.has(namespace)) {
      namespaceGroups.set(namespace, new Map());
    }
    namespaceGroups.get(namespace).set(key, value);
  }

  console.log("\n🔄 Updating translation files...");
  for (const [namespace, strings] of namespaceGroups) {
    const newCount = updateTranslationFile(namespace, strings);
    console.log(`  ${namespace}.json: ${newCount} new strings added`);
  }

  // Show sample of processed files
  console.log("\n📄 Sample processed files:");
  processedFiles.slice(0, 10).forEach(({ file, count }) => {
    console.log(`  ${file}: ${count} strings`);
  });

  return {
    processedFiles,
    totalStrings: allStrings.size,
    namespaceGroups,
  };
}

// Main execution
function main() {
  const result = processComponents();

  console.log("\n✅ Component scanning completed!");
  console.log(`📈 Processed ${result.processedFiles.length} files`);
  console.log(`🔤 Extracted ${result.totalStrings} unique strings`);

  // Show namespace breakdown
  console.log("\n📊 Namespace breakdown:");
  for (const [namespace, strings] of result.namespaceGroups) {
    console.log(`  ${namespace}: ${strings.size} strings`);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  extractMeaningfulStrings,
  generateTranslationKey,
  getNamespaceFromPath,
  processComponents,
};
