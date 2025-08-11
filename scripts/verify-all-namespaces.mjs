#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..");
const localesDir = path.join(projectRoot, "src", "i18n", "locales", "en");
const srcDir = path.join(projectRoot, "src");

// Color codes for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

// Map of JSON files to their namespace (without .json extension)
const namespaceMap = new Map();

function getAllKeys(obj, prefix = "") {
  const keys = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

function loadTranslationKeys() {
  const keyToNamespace = new Map();
  const namespaceToKeys = new Map();

  const files = fs
    .readdirSync(localesDir)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const namespace = file.replace(".json", "");
    const filePath = path.join(localesDir, file);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);
      const keys = getAllKeys(data);

      namespaceMap.set(namespace, file);
      namespaceToKeys.set(namespace, keys);

      keys.forEach((key) => {
        if (!keyToNamespace.has(key)) {
          keyToNamespace.set(key, []);
        }
        keyToNamespace.get(key).push(namespace);
      });
    } catch (error) {
      console.error(
        `${colors.red}Error loading ${file}: ${error.message}${colors.reset}`,
      );
    }
  }

  return { keyToNamespace, namespaceToKeys };
}

function findAllCodeFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, dist, build, and hidden directories
    if (entry.isDirectory()) {
      if (
        !["node_modules", "dist", "build", ".git", ".next"].includes(entry.name)
      ) {
        findAllCodeFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      // Include TypeScript, JavaScript, and React files
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function extractTranslationUsages(content, filePath) {
  const usages = [];

  // Patterns to match translation usage
  const patterns = [
    // t('namespace:key') or t("namespace:key")
    /\bt\s*\(\s*['"`]([^'"`]+?)['"`]/g,
    // i18n.t('namespace:key') or i18n.t("namespace:key")
    /i18n\.t\s*\(\s*['"`]([^'"`]+?)['"`]/g,
    // useTranslation('namespace')
    /useTranslation\s*\(\s*['"`]([^'"`]+?)['"`]/g,
    // withTranslation('namespace')
    /withTranslation\s*\(\s*['"`]([^'"`]+?)['"`]/g,
    // Translation component: <Translation ns="namespace" i18nKey="key" />
    /<Translation[^>]+ns\s*=\s*['"`]([^'"`]+?)['"`][^>]*i18nKey\s*=\s*['"`]([^'"`]+?)['"`]/g,
    // Trans component: <Trans i18nKey="namespace:key" />
    /<Trans[^>]+i18nKey\s*=\s*['"`]([^'"`]+?)['"`]/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[1];

      // Handle namespace:key format
      if (fullMatch.includes(":")) {
        const [namespace, ...keyParts] = fullMatch.split(":");
        const key = keyParts.join(":"); // Handle keys that might contain colons

        if (namespace && key) {
          usages.push({
            type: "translation",
            namespace,
            key,
            fullKey: fullMatch,
            line: content.substring(0, match.index).split("\n").length,
          });
        }
      } else if (
        pattern.source.includes("useTranslation") ||
        pattern.source.includes("withTranslation")
      ) {
        // Just namespace declaration
        usages.push({
          type: "namespace",
          namespace: fullMatch,
          line: content.substring(0, match.index).split("\n").length,
        });
      } else {
        // Might be a key without namespace (using default namespace)
        usages.push({
          type: "key-only",
          key: fullMatch,
          line: content.substring(0, match.index).split("\n").length,
        });
      }
    }
  }

  return usages;
}

function analyzeNamespaceUsage() {
  console.log(
    `${colors.bold}${colors.blue}=== Verifying All Namespace References ===${colors.reset}\n`,
  );

  const { keyToNamespace, namespaceToKeys } = loadTranslationKeys();
  const codeFiles = findAllCodeFiles(srcDir);

  console.log(
    `${colors.cyan}Loaded ${keyToNamespace.size} unique translation keys from ${namespaceMap.size} namespaces${colors.reset}`,
  );
  console.log(
    `${colors.cyan}Found ${codeFiles.length} code files to analyze${colors.reset}\n`,
  );

  const issues = {
    wrongNamespace: [],
    keyNotFound: [],
    duplicateKeys: [],
    unreferencedKeys: new Set(keyToNamespace.keys()),
    namespaceNotFound: [],
  };

  const keyUsageCount = new Map();

  // Analyze each code file
  for (const filePath of codeFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const usages = extractTranslationUsages(content, filePath);

    for (const usage of usages) {
      if (usage.type === "translation") {
        const { namespace, key } = usage;

        // Check if namespace exists
        if (!namespaceToKeys.has(namespace)) {
          issues.namespaceNotFound.push({
            file: path.relative(projectRoot, filePath),
            line: usage.line,
            namespace,
            key,
          });
          continue;
        }

        // Check if key exists in the specified namespace
        const keysInNamespace = namespaceToKeys.get(namespace);
        if (!keysInNamespace.has(key)) {
          // Check if the key exists in other namespaces
          const actualNamespaces = keyToNamespace.get(key);

          if (actualNamespaces && actualNamespaces.length > 0) {
            // Key exists but in wrong namespace
            issues.wrongNamespace.push({
              file: path.relative(projectRoot, filePath),
              line: usage.line,
              key,
              usedNamespace: namespace,
              correctNamespaces: actualNamespaces,
            });
          } else {
            // Key doesn't exist at all
            issues.keyNotFound.push({
              file: path.relative(projectRoot, filePath),
              line: usage.line,
              namespace,
              key,
            });
          }
        } else {
          // Valid usage - mark key as referenced
          issues.unreferencedKeys.delete(key);

          // Track usage count
          const countKey = `${namespace}:${key}`;
          keyUsageCount.set(countKey, (keyUsageCount.get(countKey) || 0) + 1);
        }
      }
    }
  }

  // Check for duplicate keys across namespaces
  for (const [key, namespaces] of keyToNamespace.entries()) {
    if (namespaces.length > 1) {
      issues.duplicateKeys.push({
        key,
        namespaces,
      });
    }
  }

  // Generate report
  console.log(
    `${colors.bold}${colors.yellow}=== ANALYSIS RESULTS ===${colors.reset}\n`,
  );

  // Summary statistics
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(
    `  Total unique keys: ${colors.cyan}${keyToNamespace.size}${colors.reset}`,
  );
  console.log(
    `  Keys with correct references: ${colors.green}${keyToNamespace.size - issues.unreferencedKeys.size}${colors.reset}`,
  );
  console.log(
    `  Unreferenced keys: ${colors.yellow}${issues.unreferencedKeys.size}${colors.reset}`,
  );
  console.log(
    `  Wrong namespace references: ${colors.red}${issues.wrongNamespace.length}${colors.reset}`,
  );
  console.log(
    `  Non-existent key references: ${colors.red}${issues.keyNotFound.length}${colors.reset}`,
  );
  console.log(
    `  Duplicate keys across files: ${colors.yellow}${issues.duplicateKeys.length}${colors.reset}`,
  );
  console.log(
    `  Invalid namespace references: ${colors.red}${issues.namespaceNotFound.length}${colors.reset}\n`,
  );

  // Wrong namespace issues
  if (issues.wrongNamespace.length > 0) {
    console.log(
      `${colors.bold}${colors.red}❌ Wrong Namespace References (${issues.wrongNamespace.length}):${colors.reset}`,
    );
    issues.wrongNamespace.slice(0, 10).forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    Key: ${colors.yellow}${issue.key}${colors.reset}`);
      console.log(
        `    Used: ${colors.red}${issue.usedNamespace}:${issue.key}${colors.reset}`,
      );
      console.log(
        `    Should be: ${colors.green}${issue.correctNamespaces[0]}:${issue.key}${colors.reset}\n`,
      );
    });
    if (issues.wrongNamespace.length > 10) {
      console.log(`  ... and ${issues.wrongNamespace.length - 10} more\n`);
    }
  }

  // Non-existent keys
  if (issues.keyNotFound.length > 0) {
    console.log(
      `${colors.bold}${colors.red}❌ Non-existent Key References (${issues.keyNotFound.length}):${colors.reset}`,
    );
    issues.keyNotFound.slice(0, 10).forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(
        `    ${colors.red}${issue.namespace}:${issue.key}${colors.reset} - Key does not exist\n`,
      );
    });
    if (issues.keyNotFound.length > 10) {
      console.log(`  ... and ${issues.keyNotFound.length - 10} more\n`);
    }
  }

  // Invalid namespaces
  if (issues.namespaceNotFound.length > 0) {
    console.log(
      `${colors.bold}${colors.red}❌ Invalid Namespace References (${issues.namespaceNotFound.length}):${colors.reset}`,
    );
    issues.namespaceNotFound.slice(0, 10).forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(
        `    ${colors.red}${issue.namespace}${colors.reset} - Namespace does not exist\n`,
      );
    });
    if (issues.namespaceNotFound.length > 10) {
      console.log(`  ... and ${issues.namespaceNotFound.length - 10} more\n`);
    }
  }

  // Duplicate keys warning
  if (issues.duplicateKeys.length > 0) {
    console.log(
      `${colors.bold}${colors.yellow}⚠️  Duplicate Keys Across Namespaces (${issues.duplicateKeys.length}):${colors.reset}`,
    );
    issues.duplicateKeys.slice(0, 5).forEach((issue) => {
      console.log(`  Key: ${colors.cyan}${issue.key}${colors.reset}`);
      console.log(`    Found in: ${issue.namespaces.join(", ")}\n`);
    });
    if (issues.duplicateKeys.length > 5) {
      console.log(`  ... and ${issues.duplicateKeys.length - 5} more\n`);
    }
  }

  // Unreferenced keys (might be dynamically used)
  if (issues.unreferencedKeys.size > 0) {
    console.log(
      `${colors.bold}${colors.yellow}⚠️  Potentially Unreferenced Keys (${issues.unreferencedKeys.size}):${colors.reset}`,
    );
    console.log(
      `${colors.dim}  Note: These might be used dynamically or in external systems${colors.reset}\n`,
    );

    // Group by namespace
    const unreferencedByNamespace = {};
    for (const key of issues.unreferencedKeys) {
      const namespaces = keyToNamespace.get(key) || [];
      for (const ns of namespaces) {
        if (!unreferencedByNamespace[ns]) {
          unreferencedByNamespace[ns] = [];
        }
        unreferencedByNamespace[ns].push(key);
      }
    }

    for (const [ns, keys] of Object.entries(unreferencedByNamespace)) {
      if (keys.length > 0) {
        console.log(`  ${ns}: ${keys.length} unreferenced keys`);
        keys.slice(0, 3).forEach((key) => {
          console.log(`    - ${colors.dim}${key}${colors.reset}`);
        });
        if (keys.length > 3) {
          console.log(`    ... and ${keys.length - 3} more`);
        }
      }
    }
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalKeys: keyToNamespace.size,
      referencedKeys: keyToNamespace.size - issues.unreferencedKeys.size,
      unreferencedKeys: issues.unreferencedKeys.size,
      wrongNamespaceCount: issues.wrongNamespace.length,
      keyNotFoundCount: issues.keyNotFound.length,
      duplicateKeysCount: issues.duplicateKeys.length,
      namespaceNotFoundCount: issues.namespaceNotFound.length,
    },
    issues,
  };

  const reportPath = path.join(__dirname, "namespace-verification-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      report,
      (key, value) => {
        if (value instanceof Set) {
          return Array.from(value);
        }
        return value;
      },
      2,
    ),
  );

  console.log(
    `\n${colors.cyan}Full report saved to: ${reportPath}${colors.reset}`,
  );

  // Final status
  console.log(`\n${colors.bold}=== FINAL STATUS ===${colors.reset}`);
  if (
    issues.wrongNamespace.length === 0 &&
    issues.keyNotFound.length === 0 &&
    issues.namespaceNotFound.length === 0
  ) {
    console.log(
      `${colors.green}✅ All namespace references are correct!${colors.reset}`,
    );
    console.log(
      `${colors.green}   ${keyToNamespace.size - issues.unreferencedKeys.size} keys are properly referenced.${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.red}❌ Found ${issues.wrongNamespace.length + issues.keyNotFound.length + issues.namespaceNotFound.length} namespace reference issues that need fixing.${colors.reset}`,
    );
  }

  return report;
}

// Run the analysis
analyzeNamespaceUsage();
