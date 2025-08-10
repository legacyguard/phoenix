#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

// Define priority order for files (higher priority = keep the key)
const filePriority = [
  // Core functionality - highest priority
  'auth.json',
  'dashboard-main.json',
  'dashboard-review.json',
  'family-core.json',
  'family-emergency.json',
  'family-communication.json',
  'assets.json',
  'wills.json',
  
  // UI and common elements
  'ui-common.json',
  'ui-components.json',
  'ui-elements.json',
  
  // Supporting features
  'settings.json',
  'subscription.json',
  'sharing.json',
  'onboarding.json',
  'help.json',
  
  // Content and messaging
  'landing.json',
  'emails.json',
  'errors.json',
  'notifications.json',
  'micro-copy.json',
  'loading-states.json',
  
  // Specialized features
  'ai-assistant.json',
  'time-capsule.json',
  'lifeEvents.json',
  'legal.json'
];

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function getAllKeys(obj, prefix = '') {
  const keys = new Map();
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach((val, k) => keys.set(k, val));
    } else {
      keys.set(fullKey, value);
    }
  }
  
  return keys;
}

function removeKey(obj, keyPath) {
  const parts = keyPath.split('.');
  
  if (parts.length === 1) {
    delete obj[parts[0]];
    return;
  }
  
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) return;
    current = current[parts[i]];
  }
  
  delete current[parts[parts.length - 1]];
  
  // Clean up empty parent objects
  cleanEmptyObjects(obj);
}

function cleanEmptyObjects(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      cleanEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

async function fixDuplicates() {
  console.log(`${colors.bold}${colors.blue}=== Fixing Duplicate Translation Keys ===${colors.reset}\n`);
  
  // Get list of languages
  const languages = fs.readdirSync(localesDir).filter(lang => 
    fs.statSync(path.join(localesDir, lang)).isDirectory()
  );
  
  console.log(`Found ${languages.length} languages to process\n`);
  
  let totalDuplicatesRemoved = 0;
  
  for (const lang of languages) {
    console.log(`${colors.cyan}Processing ${lang}...${colors.reset}`);
    
    const langDir = path.join(localesDir, lang);
    const files = fs.readdirSync(langDir).filter(file => file.endsWith('.json'));
    
    // Load all files and their keys
    const fileData = new Map();
    const allKeys = new Map(); // key -> [files that contain it]
    
    for (const file of files) {
      const filePath = path.join(langDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      fileData.set(file, { path: filePath, data });
      
      const keys = getAllKeys(data);
      keys.forEach((value, key) => {
        if (!allKeys.has(key)) {
          allKeys.set(key, []);
        }
        allKeys.get(key).push({ file, value });
      });
    }
    
    // Find duplicates
    const duplicates = [];
    for (const [key, locations] of allKeys.entries()) {
      if (locations.length > 1) {
        duplicates.push({ key, locations });
      }
    }
    
    if (duplicates.length === 0) {
      console.log(`  No duplicates found`);
      continue;
    }
    
    console.log(`  Found ${duplicates.length} duplicate keys`);
    
    // Fix duplicates based on priority
    let removedCount = 0;
    for (const { key, locations } of duplicates) {
      // Sort locations by priority (highest priority first)
      locations.sort((a, b) => {
        const priorityA = filePriority.indexOf(a.file);
        const priorityB = filePriority.indexOf(b.file);
        
        // If file not in priority list, put it at the end
        const finalPriorityA = priorityA === -1 ? filePriority.length : priorityA;
        const finalPriorityB = priorityB === -1 ? filePriority.length : priorityB;
        
        return finalPriorityA - finalPriorityB;
      });
      
      // Keep the first (highest priority) and remove from others
      const keepIn = locations[0].file;
      
      for (let i = 1; i < locations.length; i++) {
        const removeFrom = locations[i].file;
        const fileInfo = fileData.get(removeFrom);
        
        removeKey(fileInfo.data, key);
        removedCount++;
      }
    }
    
    // Save all modified files
    for (const [file, { path: filePath, data }] of fileData.entries()) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    
    console.log(`  Removed ${removedCount} duplicate key occurrences`);
    totalDuplicatesRemoved += removedCount;
  }
  
  console.log(`\n${colors.bold}${colors.green}=== Deduplication Complete ===${colors.reset}`);
  console.log(`Total duplicate occurrences removed: ${colors.cyan}${totalDuplicatesRemoved}${colors.reset}`);
  console.log(`\n${colors.green}✅ All duplicate keys have been resolved!${colors.reset}`);
}

// Run the fix
fixDuplicates();
