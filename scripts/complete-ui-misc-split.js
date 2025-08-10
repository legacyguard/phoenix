#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

// Helper functions
function extractAllKeys(obj, prefix = '') {
  const keys = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(keys, extractAllKeys(obj[key], fullKey));
    } else {
      keys[fullKey] = obj[key];
    }
  }
  return keys;
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

function reconstructObject(flatKeys) {
  const result = {};
  for (const [path, value] of Object.entries(flatKeys)) {
    setNestedValue(result, path, value);
  }
  return result;
}

// Read the split categories from English (already split)
function getSplitCategories() {
  const enComponentsPath = path.join(LOCALES_DIR, 'en', 'ui-components.json');
  const enComponentsContent = JSON.parse(fs.readFileSync(enComponentsPath, 'utf8'));
  const componentsKeys = extractAllKeys(enComponentsContent);
  
  const group1Categories = new Set();
  for (const key of Object.keys(componentsKeys)) {
    group1Categories.add(key.split('.')[0]);
  }
  
  return group1Categories;
}

// Split ui-misc.json for a language
function splitUiMisc(lang, group1Categories) {
  const sourcePath = path.join(LOCALES_DIR, lang, 'ui-misc.json');
  
  if (!fs.existsSync(sourcePath)) {
    return false;
  }
  
  const content = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const flatKeys = extractAllKeys(content);
  
  // Split the keys based on the categories
  const componentsKeys = {};
  const elementsKeys = {};
  
  for (const [key, value] of Object.entries(flatKeys)) {
    const topLevel = key.split('.')[0];
    if (group1Categories.has(topLevel)) {
      componentsKeys[key] = value;
    } else {
      elementsKeys[key] = value;
    }
  }
  
  // Write new files
  const componentsPath = path.join(LOCALES_DIR, lang, 'ui-components.json');
  const elementsPath = path.join(LOCALES_DIR, lang, 'ui-elements.json');
  
  fs.writeFileSync(
    componentsPath,
    JSON.stringify(reconstructObject(componentsKeys), null, 2)
  );
  
  fs.writeFileSync(
    elementsPath,
    JSON.stringify(reconstructObject(elementsKeys), null, 2)
  );
  
  // Remove original file
  fs.unlinkSync(sourcePath);
  
  return {
    components: Object.keys(componentsKeys).length,
    elements: Object.keys(elementsKeys).length
  };
}

// Main execution
async function main() {
  console.log('🚀 Completing ui-misc.json split...\n');
  
  // Get the split categories from English files
  const group1Categories = getSplitCategories();
  console.log(`📊 Using split pattern from English files (${group1Categories.size} categories for ui-components.json)\n`);
  
  // Get all languages
  const languages = fs.readdirSync(LOCALES_DIR).filter(f => 
    fs.statSync(path.join(LOCALES_DIR, f)).isDirectory()
  );
  
  console.log('📝 Processing remaining languages...\n');
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const lang of languages) {
    const result = splitUiMisc(lang, group1Categories);
    if (result) {
      console.log(`  ✅ ${lang}: ui-components.json (${result.components} keys), ui-elements.json (${result.elements} keys)`);
      processedCount++;
    } else {
      // Check if already split
      const componentsPath = path.join(LOCALES_DIR, lang, 'ui-components.json');
      const elementsPath = path.join(LOCALES_DIR, lang, 'ui-elements.json');
      if (fs.existsSync(componentsPath) && fs.existsSync(elementsPath)) {
        console.log(`  ⏭️  ${lang}: Already split`);
      } else {
        console.log(`  ⚠️  ${lang}: ui-misc.json not found`);
      }
      skippedCount++;
    }
  }
  
  console.log(`\n✅ Split complete! Processed ${processedCount} languages, skipped ${skippedCount}`);
}

main().catch(console.error);
