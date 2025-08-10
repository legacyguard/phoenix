#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const BACKUP_DIR = path.join(__dirname, '../src/i18n/locales.backup.' + new Date().toISOString().replace(/[:.]/g, '-'));

// Track all keys for validation
const originalKeys = new Map();
const newKeys = new Map();

// Migration plan
const MIGRATION_PLAN = {
  // Files to split
  splits: {
    'ui.json': [
      {
        file: 'ui-common.json',
        keys: ['actions', 'buttons', 'labels', 'status', 'validation', 'placeholders']
      },
      {
        file: 'ui-navigation.json',
        keys: ['navigation', 'menu', 'breadcrumb', 'sidebar', 'header', 'footer']
      },
      {
        file: 'ui-forms.json',
        keys: ['form', 'fields', 'inputs', 'selects', 'checkboxes', 'radio']
      },
      {
        file: 'ui-professional.json',
        keys: ['respectful', 'professional', 'tone', 'formal']
      },
      {
        file: 'ui-misc.json',
        keys: ['*'] // Catch all remaining keys
      }
    ],
    'family.json': [
      {
        file: 'family-core.json',
        keys: ['access', 'actions', 'beneficiaryCommunications', 'common', 'roles', 'relationships']
      },
      {
        file: 'family-emergency.json',
        keys: ['emergency', 'crisis', 'crisisAssessment', 'crisisSituations', 'crisisPrevention', 'protocols']
      },
      {
        file: 'family-communication.json',
        keys: ['communication', 'messages', 'sharing', 'notifications', 'executor', 'dashboard', 'errors', 'success', 'validation', 'status', 'guardian', 'trustee', 'beneficiary']
      }
    ],
    'dashboard.json': [
      {
        file: 'dashboard-main.json',
        keys: ['dashboard', 'welcome', 'metadata', 'documentCard', 'guardianCard', 'firstTimeGuide', 'notifications', 'complexProfile', 'progress']
      },
      {
        file: 'dashboard-review.json',
        keys: ['annualReview', 'review', 'status', 'planning', 'assessment']
      }
    ]
  },
  // Files to merge
  merges: [
    {
      sources: ['ai.json', 'assistant.json'],
      target: 'ai-assistant.json'
    },
    {
      sources: ['documents.json', 'upload.json'],
      target: 'documents.json'
    }
  ]
};

// Helper functions
function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

function collectAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...collectAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

function splitJsonFile(sourceData, splitConfig) {
  const results = {};
  const usedKeys = new Set();
  
  // Initialize result objects
  for (const config of splitConfig) {
    results[config.file] = {};
  }
  
  // Process each split configuration
  for (const config of splitConfig) {
    if (config.keys.includes('*')) {
      // Catch-all: get all remaining keys
      for (const key in sourceData) {
        if (!usedKeys.has(key)) {
          results[config.file][key] = sourceData[key];
          usedKeys.add(key);
        }
      }
    } else {
      // Get specific keys
      for (const keyPattern of config.keys) {
        for (const key in sourceData) {
          if (key === keyPattern || key.startsWith(keyPattern + '.') || key.startsWith(keyPattern)) {
            if (!usedKeys.has(key)) {
              results[config.file][key] = sourceData[key];
              usedKeys.add(key);
            }
          }
        }
      }
    }
  }
  
  return results;
}

function mergeJsonFiles(sourceDataArray) {
  const result = {};
  
  for (const sourceData of sourceDataArray) {
    if (sourceData) {
      Object.assign(result, sourceData);
    }
  }
  
  return result;
}

// Main migration function
async function migrateTranslations() {
  console.log('🚀 Starting translation migration...\n');
  
  // Get list of language directories
  const languages = fs.readdirSync(LOCALES_DIR)
    .filter(dir => fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory())
    .filter(dir => !dir.includes('backup'));
  
  console.log(`📂 Found ${languages.length} languages: ${languages.join(', ')}\n`);
  
  // Process English first for validation
  console.log('🔧 Processing English translations (en)...\n');
  
  const enDir = path.join(LOCALES_DIR, 'en');
  
  // Collect original keys from English files
  console.log('📊 Collecting original keys for validation...');
  const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  for (const file of enFiles) {
    const data = readJsonFile(path.join(enDir, file));
    if (data) {
      const keys = collectAllKeys(data);
      keys.forEach(key => originalKeys.set(`${file}:${key}`, true));
    }
  }
  console.log(`✅ Collected ${originalKeys.size} original keys\n`);
  
  // Process splits for all languages
  for (const lang of languages) {
    console.log(`\n🌍 Processing language: ${lang}`);
    const langDir = path.join(LOCALES_DIR, lang);
    
    // Process splits
    for (const [sourceFile, splitConfigs] of Object.entries(MIGRATION_PLAN.splits)) {
      const sourcePath = path.join(langDir, sourceFile);
      
      if (fs.existsSync(sourcePath)) {
        console.log(`  📄 Splitting ${sourceFile}...`);
        const sourceData = readJsonFile(sourcePath);
        
        if (sourceData) {
          const splitResults = splitJsonFile(sourceData, splitConfigs);
          
          for (const [targetFile, targetData] of Object.entries(splitResults)) {
            const targetPath = path.join(langDir, targetFile);
            
            if (Object.keys(targetData).length > 0) {
              writeJsonFile(targetPath, targetData);
              
              // Track new keys for validation (only for English)
              if (lang === 'en') {
                const keys = collectAllKeys(targetData);
                keys.forEach(key => newKeys.set(`${targetFile}:${key}`, true));
              }
              
              console.log(`    ✅ Created ${targetFile} with ${Object.keys(targetData).length} top-level keys`);
            }
          }
          
          // Remove original file after successful split
          fs.unlinkSync(sourcePath);
          console.log(`    🗑️  Removed original ${sourceFile}`);
        }
      }
    }
    
    // Process merges
    for (const merge of MIGRATION_PLAN.merges) {
      console.log(`  📄 Merging ${merge.sources.join(' + ')} -> ${merge.target}...`);
      
      const sourceDataArray = merge.sources.map(source => 
        readJsonFile(path.join(langDir, source))
      );
      
      if (sourceDataArray.every(data => data !== null)) {
        const mergedData = mergeJsonFiles(sourceDataArray);
        const targetPath = path.join(langDir, merge.target);
        
        writeJsonFile(targetPath, mergedData);
        
        // Track new keys for validation (only for English)
        if (lang === 'en') {
          const keys = collectAllKeys(mergedData);
          keys.forEach(key => newKeys.set(`${merge.target}:${key}`, true));
        }
        
        console.log(`    ✅ Created ${merge.target} with ${Object.keys(mergedData).length} top-level keys`);
        
        // Remove source files after successful merge
        for (const source of merge.sources) {
          const sourcePath = path.join(langDir, source);
          if (fs.existsSync(sourcePath)) {
            fs.unlinkSync(sourcePath);
            console.log(`    🗑️  Removed ${source}`);
          }
        }
      }
    }
  }
  
  console.log('\n✅ Migration completed!\n');
}

// Run migration
migrateTranslations().catch(console.error);
