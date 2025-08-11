#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "../src");

// Mapping of old namespaces to new namespaces
const NAMESPACE_MAPPING = {
  // Split files
  ui: ["ui-common", "ui-forms", "ui-navigation", "ui-professional", "ui-misc"],
  family: ["family-core", "family-emergency", "family-communication"],
  dashboard: ["dashboard-main", "dashboard-review"],

  // Merged files
  ai: "ai-assistant",
  assistant: "ai-assistant",
  upload: "documents",

  // Unchanged files (keep as is)
  auth: "auth",
  assets: "assets",
  documents: "documents",
  errors: "errors",
  settings: "settings",
  help: "help",
  subscription: "subscription",
  pricing: "pricing",
  emails: "emails",
  sharing: "sharing",
  landing: "landing",
  onboarding: "onboarding",
  "time-capsule": "time-capsule",
  wills: "wills",
  legal: "legal",
  "legal-pages": "legal-pages",
  "micro-copy": "micro-copy",
  notifications: "notifications",
  "loading-states": "loading-states",
  cultural: "cultural",
  lifeEvents: "lifeEvents",
  "empathetic-errors": "empathetic-errors",
};

// Key mappings for split namespaces (which keys go to which new namespace)
const KEY_MAPPINGS = {
  ui: {
    "ui-common": [
      "actions",
      "buttons",
      "labels",
      "status",
      "validation",
      "placeholders",
    ],
    "ui-navigation": [
      "navigation",
      "menu",
      "breadcrumb",
      "sidebar",
      "header",
      "footer",
    ],
    "ui-forms": ["form", "fields", "inputs", "selects", "checkboxes", "radio"],
    "ui-professional": ["respectful", "professional", "tone", "formal"],
    "ui-misc": ["*"], // Everything else
  },
  family: {
    "family-core": [
      "access",
      "actions",
      "beneficiaryCommunications",
      "common",
      "roles",
      "relationships",
    ],
    "family-emergency": [
      "emergency",
      "crisis",
      "crisisAssessment",
      "crisisSituations",
      "crisisPrevention",
      "protocols",
    ],
    "family-communication": ["*"], // Everything else
  },
  dashboard: {
    "dashboard-main": [
      "dashboard",
      "welcome",
      "metadata",
      "documentCard",
      "guardianCard",
      "firstTimeGuide",
      "notifications",
      "complexProfile",
      "progress",
    ],
    "dashboard-review": [
      "annualReview",
      "review",
      "status",
      "planning",
      "assessment",
    ],
  },
};

// Function to determine new namespace for a key
function getNewNamespace(oldNamespace, keyPath) {
  // If namespace doesn't need splitting, return mapped value
  if (typeof NAMESPACE_MAPPING[oldNamespace] === "string") {
    return NAMESPACE_MAPPING[oldNamespace];
  }

  // If namespace stays the same
  if (!NAMESPACE_MAPPING[oldNamespace]) {
    return oldNamespace;
  }

  // If namespace needs splitting
  if (Array.isArray(NAMESPACE_MAPPING[oldNamespace])) {
    const mappings = KEY_MAPPINGS[oldNamespace];
    if (!mappings) return oldNamespace;

    // Extract the first part of the key
    const firstKeyPart = keyPath.split(".")[0];

    // Find which new namespace this key belongs to
    for (const [newNs, keyPatterns] of Object.entries(mappings)) {
      if (keyPatterns.includes("*")) continue; // Skip catch-all for now

      for (const pattern of keyPatterns) {
        if (firstKeyPart === pattern || firstKeyPart.startsWith(pattern)) {
          return newNs;
        }
      }
    }

    // If no match, use the catch-all namespace
    for (const [newNs, keyPatterns] of Object.entries(mappings)) {
      if (keyPatterns.includes("*")) {
        return newNs;
      }
    }
  }

  return oldNamespace;
}

// Function to update file content
function updateFileContent(filePath, content) {
  let updated = content;
  let hasChanges = false;

  // Pattern 1: useTranslation('namespace')
  const useTranslationPattern = /useTranslation\(['"]([^'"]+)['"]\)/g;
  updated = updated.replace(useTranslationPattern, (match, namespace) => {
    const newNamespace = NAMESPACE_MAPPING[namespace];
    if (newNamespace && typeof newNamespace === "string") {
      hasChanges = true;
      console.log(
        `  Updating useTranslation('${namespace}') → useTranslation('${newNamespace}')`,
      );
      return `useTranslation('${newNamespace}')`;
    }
    return match;
  });

  // Pattern 2: t('namespace:key')
  const tFunctionPattern = /\bt\(['"]([^:'"]+):([^'"]+)['"]/g;
  updated = updated.replace(tFunctionPattern, (match, namespace, key) => {
    const newNamespace = getNewNamespace(namespace, key);
    if (newNamespace !== namespace) {
      hasChanges = true;
      console.log(
        `  Updating t('${namespace}:${key}') → t('${newNamespace}:${key}')`,
      );
      return `t('${newNamespace}:${key}'`;
    }
    return match;
  });

  // Pattern 3: $t('namespace:key') in JSON strings
  const dollarTPattern = /\$t\(([^:)]+):([^)]+)\)/g;
  updated = updated.replace(dollarTPattern, (match, namespace, key) => {
    // Remove quotes if present
    const cleanNamespace = namespace.replace(/['"]/g, "");
    const cleanKey = key.replace(/['"]/g, "");

    const newNamespace = getNewNamespace(cleanNamespace, cleanKey);
    if (newNamespace !== cleanNamespace) {
      hasChanges = true;
      console.log(
        `  Updating $t(${namespace}:${key}) → $t(${newNamespace}:${cleanKey})`,
      );
      return `$t(${newNamespace}:${cleanKey})`;
    }
    return match;
  });

  // Pattern 4: i18n.t('namespace:key')
  const i18nTPattern = /i18n\.t\(['"]([^:'"]+):([^'"]+)['"]/g;
  updated = updated.replace(i18nTPattern, (match, namespace, key) => {
    const newNamespace = getNewNamespace(namespace, key);
    if (newNamespace !== namespace) {
      hasChanges = true;
      console.log(
        `  Updating i18n.t('${namespace}:${key}') → i18n.t('${newNamespace}:${key}')`,
      );
      return `i18n.t('${newNamespace}:${key}'`;
    }
    return match;
  });

  // Pattern 5: Update namespace arrays
  const namespaceArrayPattern =
    /(['"])(ui|family|dashboard|ai|assistant|upload)(['"])/g;
  updated = updated.replace(
    namespaceArrayPattern,
    (match, quote1, namespace, quote2) => {
      // Only replace in specific contexts (namespace arrays)
      const lineContext = updated.substring(
        Math.max(0, updated.indexOf(match) - 50),
        updated.indexOf(match) + 50,
      );
      if (
        lineContext.includes("namespace") ||
        lineContext.includes("ns:") ||
        lineContext.includes("loadNamespaces")
      ) {
        const newNamespace = NAMESPACE_MAPPING[namespace];
        if (newNamespace) {
          if (typeof newNamespace === "string") {
            hasChanges = true;
            console.log(
              `  Updating namespace '${namespace}' → '${newNamespace}'`,
            );
            return `${quote1}${newNamespace}${quote2}`;
          } else if (Array.isArray(newNamespace)) {
            // For split namespaces, we'll need to handle this case specially
            console.log(
              `  Note: '${namespace}' splits into multiple namespaces: ${newNamespace.join(", ")}`,
            );
          }
        }
      }
      return match;
    },
  );

  return { updated, hasChanges };
}

// Function to update i18n configuration
function updateI18nConfig() {
  const i18nPath = path.join(SRC_DIR, "i18n/i18n.ts");

  if (fs.existsSync(i18nPath)) {
    console.log("\n📝 Updating i18n configuration...");
    let content = fs.readFileSync(i18nPath, "utf8");

    // Update namespace list
    const oldNamespaces = [
      "ai",
      "assets",
      "auth",
      "dashboard",
      "errors",
      "family",
      "help",
      "landing",
      "micro-copy",
      "onboarding",
      "settings",
      "sharing",
      "subscription",
      "time-capsule",
      "ui",
      "wills",
    ];

    const newNamespaces = [
      "ai-assistant",
      "assets",
      "auth",
      "cultural",
      "dashboard-main",
      "dashboard-review",
      "documents",
      "emails",
      "empathetic-errors",
      "errors",
      "family-communication",
      "family-core",
      "family-emergency",
      "help",
      "landing",
      "legal",
      "legal-pages",
      "lifeEvents",
      "loading-states",
      "micro-copy",
      "notifications",
      "onboarding",
      "pricing",
      "settings",
      "sharing",
      "subscription",
      "time-capsule",
      "ui-common",
      "ui-forms",
      "ui-misc",
      "ui-navigation",
      "ui-professional",
      "wills",
    ];

    // Replace namespace array
    const namespaceArrayRegex = /export const namespaces = \[[^\]]+\]/s;
    content = content.replace(
      namespaceArrayRegex,
      `export const namespaces = [\n${newNamespaces.map((ns) => `  '${ns}'`).join(",\n")}\n]`,
    );

    // Update initial namespaces
    content = content.replace(
      "const initialNamespaces: Namespace[] = ['ui', 'errors'];",
      "const initialNamespaces: Namespace[] = ['ui-common', 'errors'];",
    );

    fs.writeFileSync(i18nPath, content);
    console.log("✅ Updated i18n.ts configuration");
  }
}

// Function to process directory recursively
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!file.includes("node_modules") && !file.startsWith(".")) {
        processDirectory(filePath);
      }
    } else if (
      file.endsWith(".tsx") ||
      file.endsWith(".ts") ||
      file.endsWith(".jsx") ||
      file.endsWith(".js")
    ) {
      const content = fs.readFileSync(filePath, "utf8");
      const { updated, hasChanges } = updateFileContent(filePath, content);

      if (hasChanges) {
        console.log(`\n📄 Updating: ${path.relative(SRC_DIR, filePath)}`);
        fs.writeFileSync(filePath, updated);
      }
    }
  }
}

// Main function
function main() {
  console.log("🚀 Starting namespace reference updates...\n");

  // Update i18n configuration first
  updateI18nConfig();

  // Process all source files
  console.log("\n📂 Processing source files...\n");
  processDirectory(SRC_DIR);

  console.log("\n✅ Namespace reference update complete!");
  console.log("\n⚠️  Please review the changes and test your application.");
  console.log(
    "📌 Note: Some complex namespace splits may require manual review.",
  );
}

// Run the script
main();
