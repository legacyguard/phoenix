#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const SRC_DIR = path.join(__dirname, "../src");
const LOCALES_DIR = path.join(__dirname, "../src/i18n/locales");
const SUPPORTED_LANGUAGES = [
  "en",
  "bg",
  "cs",
  "cy",
  "da",
  "de",
  "el",
  "es",
  "et",
  "fi",
  "fr",
  "ga",
  "hr",
  "hu",
  "is",
  "it",
  "lt",
  "lv",
  "me",
  "mk",
  "mt",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "tr",
  "uk",
];

// Namespaces mapping
const NAMESPACE_MAPPING = {
  "components/ui": "ui",
  "components/common": "ui",
  "components/layout": "ui",
  "components/auth": "auth",
  "components/dashboard": "dashboard",
  "components/assets": "assets",
  "components/documents": "documents",
  "components/guardians": "guardians",
  "components/wills": "wills",
  "components/onboarding": "onboarding",
  "components/settings": "settings",
  "components/subscriptions": "subscription",
  "components/emergency": "help",
  "components/analytics": "dashboard",
  "components/ai": "help",
  "components/ocr": "documents",
  "components/landing": "ui",
  "components/privacy": "ui",
  "components/sharing": "ui",
  pages: "ui",
  features: "ui",
};

// Patterns to extract
const PATTERNS = {
  // JSX text content
  jsxText: /<[^>]*>([^<>{}\n]+[a-zA-Z][^<>{}\n]*)<\/[^>]*>/g,

  // String literals in JSX attributes
  jsxAttributes: /(\w+)=["']([^"']{3,})["']/g,

  // Template literals
  templateLiterals: /`([^`]+)`/g,

  // String literals
  stringLiterals: /["']([^"']{3,})["']/g,

  // Object properties with string values
  objectProperties: /(\w+):\s*["']([^"']+)["']/g,
};

// Common strings to ignore
const IGNORE_PATTERNS = [
  /^[A-Z_]+$/, // Constants
  /^[a-z]+$/, // Single words
  /^\d+$/, // Numbers
  /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Symbols
  /^(true|false|null|undefined)$/, // JavaScript literals
  /^(className|id|name|type|value|placeholder|title|alt|src|href)$/, // Common attributes
  /^(onClick|onChange|onSubmit|onBlur|onFocus)$/, // Event handlers
  /^(useState|useEffect|useCallback|useMemo|useRef)$/, // React hooks
  /^(import|export|const|let|var|function|return|if|else|for|while)$/, // JavaScript keywords
  /^(div|span|p|h1|h2|h3|h4|h5|h6|button|input|form|label|select|option)$/, // HTML tags
  /^(flex|grid|block|inline|none|hidden|visible|absolute|relative|fixed)$/, // CSS classes
  /^(bg-|text-|border-|p-|m-|w-|h-|rounded-|shadow-)/, // Tailwind classes
  /^(en|sk|bg|cs|cy|da|de|el|es|et|fi|fr|ga|hr|hu|is|it|lt|lv|me|mk|mt|nl|no|pl|pt|ro|ru|sk|sl|sq|sr|sv|tr|uk)$/, // Language codes
];

// Function to determine namespace from file path
function getNamespaceFromPath(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);

  for (const [pattern, namespace] of Object.entries(NAMESPACE_MAPPING)) {
    if (relativePath.includes(pattern)) {
      return namespace;
    }
  }

  return "ui"; // Default namespace
}

// Function to generate translation key
function generateTranslationKey(text, context, namespace) {
  // Clean the text
  let cleanText = text
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .toLowerCase();

  // Truncate if too long
  if (cleanText.length > 50) {
    cleanText = cleanText.substring(0, 50);
  }

  // Add context if provided
  if (context) {
    return `${namespace}.${context}.${cleanText}`;
  }

  return `${namespace}.${cleanText}`;
}

// Function to extract strings from file
function extractStringsFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const namespace = getNamespaceFromPath(filePath);
  const fileName = path.basename(filePath, path.extname(filePath));
  const extracted = new Map();

  // Extract JSX text content
  let match;
  const jsxTextRegex = /<[^>]*>([^<>{}\n]+[a-zA-Z][^<>{}\n]*)<\/[^>]*>/g;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (
      text &&
      text.length > 2 &&
      !IGNORE_PATTERNS.some((pattern) => pattern.test(text))
    ) {
      const key = generateTranslationKey(text, fileName, namespace);
      extracted.set(key, text);
    }
  }

  // Extract string literals in JSX attributes
  const jsxAttrRegex = /(\w+)=["']([^"']{3,})["']/g;
  while ((match = jsxAttrRegex.exec(content)) !== null) {
    const [, attr, text] = match;
    if (text && !IGNORE_PATTERNS.some((pattern) => pattern.test(text))) {
      const key = generateTranslationKey(
        text,
        `${fileName}.${attr}`,
        namespace,
      );
      extracted.set(key, text);
    }
  }

  // Extract template literals
  const templateRegex = /`([^`]+)`/g;
  while ((match = templateRegex.exec(content)) !== null) {
    const text = match[1];
    if (
      text &&
      text.length > 2 &&
      !IGNORE_PATTERNS.some((pattern) => pattern.test(text))
    ) {
      const key = generateTranslationKey(text, fileName, namespace);
      extracted.set(key, text);
    }
  }

  return extracted;
}

// Function to scan directory recursively
function scanDirectory(dir, extensions = [".tsx", ".ts", ".jsx", ".js"]) {
  const files = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        scan(fullPath);
      } else if (stat.isFile() && extensions.includes(path.extname(item))) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// Function to update translation files
function updateTranslationFiles(extractedStrings) {
  // Group by namespace
  const namespaceGroups = new Map();

  for (const [key, value] of extractedStrings) {
    const namespace = key.split(".")[0];
    if (!namespaceGroups.has(namespace)) {
      namespaceGroups.set(namespace, new Map());
    }
    namespaceGroups.get(namespace).set(key, value);
  }

  // Update each namespace file
  for (const [namespace, strings] of namespaceGroups) {
    const namespaceFile = path.join(LOCALES_DIR, "en", `${namespace}.json`);

    // Read existing content
    let existingContent = {};
    if (fs.existsSync(namespaceFile)) {
      try {
        const content = fs.readFileSync(namespaceFile, "utf8");
        existingContent = JSON.parse(content);
      } catch (error) {
        console.warn(
          `Warning: Could not parse ${namespaceFile}:`,
          error.message,
        );
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
    fs.writeFileSync(namespaceFile, JSON.stringify(mergedContent, null, 2));
    console.log(`Updated ${namespaceFile} with ${strings.size} new strings`);
  }
}

// Main execution
function main() {
  console.log("🔍 Scanning for hardcoded strings...");

  const files = scanDirectory(SRC_DIR);
  console.log(`Found ${files.length} files to scan`);

  const allExtractedStrings = new Map();

  for (const file of files) {
    try {
      const extracted = extractStringsFromFile(file);
      for (const [key, value] of extracted) {
        allExtractedStrings.set(key, value);
      }
      if (extracted.size > 0) {
        console.log(
          `📄 ${path.relative(SRC_DIR, file)}: ${extracted.size} strings`,
        );
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n📊 Total unique strings found: ${allExtractedStrings.size}`);

  if (allExtractedStrings.size > 0) {
    console.log("\n🔄 Updating translation files...");
    updateTranslationFiles(allExtractedStrings);
    console.log("✅ Translation files updated successfully!");

    // Show sample of extracted strings
    console.log("\n📝 Sample extracted strings:");
    let count = 0;
    for (const [key, value] of allExtractedStrings) {
      if (count < 10) {
        console.log(`  ${key}: "${value}"`);
        count++;
      } else {
        break;
      }
    }
  } else {
    console.log("✅ No new strings found to extract");
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  extractStringsFromFile,
  generateTranslationKey,
  getNamespaceFromPath,
  scanDirectory,
  updateTranslationFiles,
};
