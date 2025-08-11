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
  const keyParts = key.split('.');
  const lastPart = keyParts[keyParts.length - 1];
  const sentence = lastPart
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
  return sentence;
}

// Process translation keys
async function processTranslations(keysMapping, stats) {
  for (const file in keysMapping) {
    const { keys, namespaces } = keysMapping[file];
    for (const namespace of namespaces) {
      console.log(`\nProcessing namespace: ${namespace}`);
      const enFilePath = path.join(localesDir, 'en', `${namespace}.json`);
      const currentTranslations = await readJsonFile(enFilePath);
      const currentKeys = new Set(extractKeys(currentTranslations).map(item => item.key));

      const missingKeys = keys.filter(key => !currentKeys.has(key));

      stats.namespaces[namespace] = stats.namespaces[namespace] || {
        existing: 0,
        missing: 0,
        total: 0
      };
      stats.namespaces[namespace].missing += missingKeys.length;

      if (missingKeys.length === 0) {
        console.log(`  ✓ All keys present in ${namespace}`);
        continue;
      }

      console.log(`  ⚠ Found ${missingKeys.length} missing keys in ${namespace}`);
      for (const lang of languages) {
        const filePath = path.join(localesDir, lang, `${namespace}.json`);
        const translations = await readJsonFile(filePath);
        for (const key of missingKeys) {
          const value = lang === 'en' 
            ? generateTranslationValue(key, namespace)
            : `[${lang.toUpperCase()}] ${generateTranslationValue(key, namespace)}`;
          setNestedValue(translations, key, value);
        }
        const sorted = sortObjectKeys(translations);
        await writeJsonFile(filePath, sorted);
      }
      console.log(`  ✓ Updated ${languages.length} language files for ${namespace}`);
    }
  }
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
  const keysMappingPath = path.join(extractedDir, 'file-translation-mapping.json');
  const keysMapping = await readJsonFile(keysMappingPath);

  if (!keysMapping) {
    console.error('No keys mapping found. Please run extract-used-translations.js first.');
    process.exit(1);
  }

  const stats = {
    namespaces: {},
    totalMissing: 0,
    totalExisting: 0,
    totalKeys: 0
  };

  await processTranslations(keysMapping, stats);

  for (const ns of Object.values(stats.namespaces)) {
    stats.totalExisting += ns.existing;
    stats.totalMissing += ns.missing;
    stats.totalKeys += ns.total;
  }

  const report = `# Translation Update Report\n\n## Summary\n- Total namespaces processed: ${Object.keys(stats.namespaces).length}\n- Total existing keys: ${stats.totalExisting}\n- Total missing keys added: ${stats.totalMissing}\n- Total keys after update: ${stats.totalKeys}\n\n## Namespace Details\n${Object.entries(stats.namespaces).map(([ns, data]) => `### ${ns}\n- Existing: ${data.existing}\n- Added: ${data.missing}\n- Total: ${data.total}`).join('\n\n')}\n\n## Languages Updated\n${languages.map(lang => `- ${lang}`).join('\n')}\n\n## Next Steps\n1. Review the generated translations in the English (en) files\n2. Send non-English files to translators or use a translation service\n3. Test the application to ensure all keys are working correctly\n`;

  await fs.writeFile(path.join(extractedDir, 'translation-update-report.md'), report);
  console.log('\n' + '='.repeat(50));
  console.log('Translation update complete!');
  console.log('='.repeat(50));
  console.log(`\nAdded ${stats.totalMissing} missing keys across ${Object.keys(stats.namespaces).length} namespaces`);
  console.log(`\nReport saved to: ${path.join(extractedDir, 'translation-update-report.md')}`);
}

main().catch(console.error);
