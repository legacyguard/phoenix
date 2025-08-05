#!/usr/bin/env node

import { writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const localesDir = join(rootDir, 'src/i18n/locales');

// Get all language directories (excluding backup directories)
const languages = readdirSync(localesDir).filter(lang => 
  statSync(join(localesDir, lang)).isDirectory() && 
  !lang.startsWith('_')
);

// Define all namespaces based on existing structure
const namespaces = [
  'assets',
  'auth', 
  'dashboard',
  'documents',
  'emails',
  'errors',
  'family',
  'guardians',
  'help',
  'onboarding',
  'settings',
  'subscription',
  'ui',
  'wills'
];

console.log('Resetting all translation files...\n');
console.log(`Languages found: ${languages.join(', ')}`);
console.log(`Namespaces: ${namespaces.join(', ')}\n`);

let totalFiles = 0;

// Process each language
languages.forEach(lang => {
  console.log(`Processing language: ${lang}`);
  const langDir = join(localesDir, lang);
  
  // Create empty JSON file for each namespace
  namespaces.forEach(namespace => {
    const filePath = join(langDir, `${namespace}.json`);
    
    // Write empty JSON object
    writeFileSync(filePath, '{}');
    totalFiles++;
    
    console.log(`  ✓ Reset ${namespace}.json`);
  });
  
  console.log('');
});

console.log('='.repeat(50));
console.log(`Reset complete!`);
console.log(`Total files reset: ${totalFiles}`);
console.log(`All translation files now contain empty objects.`);
console.log('='.repeat(50));
