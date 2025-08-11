#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Analyze duplicates and create a deduplication plan
function analyzeDuplicates() {
  const languages = fs.readdirSync(LOCALES_DIR)
    .filter(dir => fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory())
    .filter(dir => !dir.includes('backup'));
  
  const duplicates = new Map();
  
  for (const lang of languages) {
    const langDir = path.join(LOCALES_DIR, lang);
    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    const keysInFiles = new Map();
    
    for (const file of files) {
      const filePath = path.join(langDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const keys = collectAllKeys(content);
      for (const key of keys) {
        if (!keysInFiles.has(key)) {
          keysInFiles.set(key, []);
        }
        keysInFiles.get(key).push(file);
      }
    }
    
    // Find duplicates
    for (const [key, files] of keysInFiles.entries()) {
      if (files.length > 1) {
        if (!duplicates.has(key)) {
          duplicates.set(key, new Set());
        }
        files.forEach(f => duplicates.get(key).add(f));
      }
    }
  }
  
  return duplicates;
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

// Priority rules for which file should keep the key
const FILE_PRIORITY = {
  // Core files have highest priority
  'auth.json': 100,
  'assets.json': 95,
  'dashboard-main.json': 90,
  'dashboard-review.json': 89,
  'family-core.json': 88,
  'family-emergency.json': 87,
  'family-communication.json': 86,
  'errors.json': 85,
  'settings.json': 84,
  'help.json': 83,
  'subscription.json': 82,
  'pricing.json': 81,
  'emails.json': 80,
  'sharing.json': 79,
  'landing.json': 78,
  'onboarding.json': 77,
  'time-capsule.json': 76,
  'wills.json': 75,
  'ai-assistant.json': 74,
  'documents.json': 73,
  'legal.json': 72,
  'legal-pages.json': 71,
  'micro-copy.json': 70,
  'notifications.json': 69,
  'loading-states.json': 68,
  'cultural.json': 67,
  'lifeEvents.json': 66,
  'empathetic-errors.json': 65,
  
  // UI files have lower priority
  'ui-common.json': 50,
  'ui-forms.json': 49,
  'ui-navigation.json': 48,
  'ui-professional.json': 47,
  'ui-misc.json': 10, // Lowest priority - catch-all file
};

function getFilePriority(filename) {
  return FILE_PRIORITY[filename] || 30;
}

function removeDuplicates() {
  const duplicates = analyzeDuplicates();
  
  console.log(`Found ${duplicates.size} duplicate keys across files\n`);
  
  // Determine which file should keep each key
  const keyAssignments = new Map();
  
  for (const [key, files] of duplicates.entries()) {
    const filesArray = Array.from(files);
    // Sort by priority (highest first)
    filesArray.sort((a, b) => getFilePriority(b) - getFilePriority(a));
    
    // The file with highest priority keeps the key
    const keepInFile = filesArray[0];
    keyAssignments.set(key, {
      keep: keepInFile,
      removeFrom: filesArray.slice(1)
    });
  }
  
  // Now process all languages
  const languages = fs.readdirSync(LOCALES_DIR)
    .filter(dir => fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory())
    .filter(dir => !dir.includes('backup'));
  
  for (const lang of languages) {
    console.log(`Processing ${lang}...`);
    const langDir = path.join(LOCALES_DIR, lang);
    const filesToUpdate = new Set();
    
    // Collect files that need updating
    for (const [key, assignment] of keyAssignments.entries()) {
      assignment.removeFrom.forEach(file => filesToUpdate.add(file));
    }
    
    // Update each file
    for (const file of filesToUpdate) {
      const filePath = path.join(langDir, file);
      if (!fs.existsSync(filePath)) continue;
      
      let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let modified = false;
      
      // Remove duplicate keys from this file
      for (const [key, assignment] of keyAssignments.entries()) {
        if (assignment.removeFrom.includes(file)) {
          if (removeKeyFromObject(content, key)) {
            modified = true;
          }
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
        console.log(`  Updated ${file}`);
      }
    }
  }
  
  console.log('\n✅ Duplicate removal complete!');
}

function removeKeyFromObject(obj, keyPath) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  
  let current = obj;
  for (const key of keys) {
    if (!current[key]) return false;
    current = current[key];
  }
  
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

// Run the fix
removeDuplicates();
