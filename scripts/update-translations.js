#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const localesDir = path.join(__dirname, '../src/i18n/locales');
const extractedDir = path.join(__dirname, '../src/i18n/extracted');

// Languages to update
const languages = ['en', 'cs', 'sk', 'de', 'es', 'fr', 'it', 'pl', 'pt', 'ru', 'uk', 'nl', 'sv', 'no', 'da', 'fi', 'et', 'lv', 'lt', 'hr', 'sl', 'sr', 'me', 'mk', 'bg', 'ro', 'el', 'tr', 'hu', 'sq', 'mt', 'is', 'ga', 'cy'];

// Read JSON file safely
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// Write JSON file with proper formatting
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

// Extract all keys from nested object
function extractKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(extractKeys(value, fullKey));
    } else {
      keys.push({ key: fullKey, value: value });
    }
  }
  
  return keys;
}

// Set nested value in object
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Generate translation value from key
function generateTranslationValue(key, namespace) {
  // Get the last part of the key
  const keyParts = key.split('.');
  const lastPart = keyParts[keyParts.length - 1];
  
  // Convert snake_case or camelCase to sentence
  const sentence = lastPart
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
  
  return sentence;
}

// Process a single namespace
async function processNamespace(namespace, usedKeys, stats) {
  console.log(`\nProcessing namespace: ${namespace}`);
  
  // Read current English translations for this namespace
  const enFilePath = path.join(localesDir, 'en', `${namespace}.json`);
  const currentTranslations = await readJsonFile(enFilePath);
  
  // Extract current keys
  const currentKeys = new Set(extractKeys(currentTranslations).map(item => item.key));
  
  // Find missing keys
  const missingKeys = [];
  
  function findMissingKeys(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        findMissingKeys(value, fullKey);
      } else {
        if (!currentKeys.has(fullKey)) {
          missingKeys.push(fullKey);
        }
      }
    }
  }
  
  if (usedKeys[namespace]) {
    findMissingKeys(usedKeys[namespace]);
  }
  
  stats.namespaces[namespace] = {
    existing: currentKeys.size,
    missing: missingKeys.length,
    total: currentKeys.size + missingKeys.length
  };
  
  if (missingKeys.length === 0) {
    console.log(`  ✓ All keys present in ${namespace}`);
    return;
  }
  
  console.log(`  ⚠ Found ${missingKeys.length} missing keys in ${namespace}`);
  
  // Update translations for all languages
  for (const lang of languages) {
    const filePath = path.join(localesDir, lang, `${namespace}.json`);
    const translations = await readJsonFile(filePath);
    
    // Add missing keys
    for (const key of missingKeys) {
      const value = lang === 'en' 
        ? generateTranslationValue(key, namespace)
        : `[${lang.toUpperCase()}] ${generateTranslationValue(key, namespace)}`;
      
      setNestedValue(translations, key, value);
    }
    
    // Sort keys alphabetically
    const sorted = sortObjectKeys(translations);
    
    // Write updated file
    await writeJsonFile(filePath, sorted);
  }
  
  console.log(`  ✓ Updated ${languages.length} language files for ${namespace}`);
}

// Sort object keys recursively
function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  
  return sorted;
}

// Main function
async function main() {
  console.log('Starting translation update process...\n');
  
  // Read extracted keys
  const usedKeysPath = path.join(extractedDir, 'used-translation-keys.json');
  const usedKeys = await readJsonFile(usedKeysPath);
  
  if (Object.keys(usedKeys).length === 0) {
    console.error('No extracted keys found. Please run extract-used-translations.js first.');
    process.exit(1);
  }
  
  // Statistics
  const stats = {
    namespaces: {},
    totalMissing: 0,
    totalExisting: 0,
    totalKeys: 0
  };
  
  // Process each namespace
  for (const namespace of Object.keys(usedKeys)) {
    await processNamespace(namespace, usedKeys, stats);
  }
  
  // Calculate totals
  for (const ns of Object.values(stats.namespaces)) {
    stats.totalExisting += ns.existing;
    stats.totalMissing += ns.missing;
    stats.totalKeys += ns.total;
  }
  
  // Generate report
  const report = `# Translation Update Report

## Summary
- Total namespaces processed: ${Object.keys(stats.namespaces).length}
- Total existing keys: ${stats.totalExisting}
- Total missing keys added: ${stats.totalMissing}
- Total keys after update: ${stats.totalKeys}

## Namespace Details
${Object.entries(stats.namespaces)
  .map(([ns, data]) => `### ${ns}
- Existing: ${data.existing}
- Added: ${data.missing}
- Total: ${data.total}`)
  .join('\n\n')}

## Languages Updated
${languages.map(lang => `- ${lang}`).join('\n')}

## Next Steps
1. Review the generated translations in the English (en) files
2. Send non-English files to translators or use a translation service
3. Test the application to ensure all keys are working correctly
`;
  
  await fs.writeFile(
    path.join(extractedDir, 'translation-update-report.md'),
    report
  );
  
  console.log('\n' + '='.repeat(50));
  console.log('Translation update complete!');
  console.log('='.repeat(50));
  console.log(`\nAdded ${stats.totalMissing} missing keys across ${Object.keys(stats.namespaces).length} namespaces`);
  console.log(`\nReport saved to: ${path.join(extractedDir, 'translation-update-report.md')}`);
  
  if (stats.totalMissing > 0) {
    console.log('\n⚠️  Important: The non-English translations have been prefixed with language codes.');
    console.log('   You should send these files to translators for proper translation.');
  }
}

// Run the script
main().catch(console.error);
