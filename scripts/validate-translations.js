#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
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

// Find backup directory
function findBackupDir() {
  const files = fs.readdirSync(path.join(__dirname, '../src/i18n'));
  const backupDirs = files.filter(f => f.startsWith('locales.backup.'));
  
  if (backupDirs.length === 0) {
    console.error('No backup directory found!');
    return null;
  }
  
  // Get the most recent backup
  backupDirs.sort().reverse();
  return path.join(__dirname, '../src/i18n', backupDirs[0]);
}

// Main validation function
async function validateTranslations() {
  console.log(`${colors.blue}🔍 Starting translation validation...${colors.reset}\n`);
  
  // Find backup directory
  const backupDir = findBackupDir();
  if (!backupDir) {
    process.exit(1);
  }
  
  console.log(`📁 Using backup: ${path.basename(backupDir)}\n`);
  
  // Get list of languages
  const languages = fs.readdirSync(LOCALES_DIR)
    .filter(dir => fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory())
    .filter(dir => !dir.includes('backup'));
  
  let hasErrors = false;
  const report = {
    languages: {},
    summary: {
      totalLanguages: languages.length,
      totalOriginalKeys: 0,
      totalNewKeys: 0,
      missingKeys: [],
      duplicateKeys: [],
      newFiles: [],
      removedFiles: []
    }
  };
  
  // Process each language
  for (const lang of languages) {
    console.log(`${colors.blue}📂 Validating language: ${lang}${colors.reset}`);
    
    const currentDir = path.join(LOCALES_DIR, lang);
    const backupLangDir = path.join(backupDir, lang);
    
    // Collect keys from backup
    const backupKeys = new Map();
    const backupFiles = fs.readdirSync(backupLangDir).filter(f => f.endsWith('.json'));
    
    for (const file of backupFiles) {
      const data = readJsonFile(path.join(backupLangDir, file));
      if (data) {
        const keys = collectAllKeys(data);
        keys.forEach(key => backupKeys.set(key, file));
      }
    }
    
    // Collect keys from current
    const currentKeys = new Map();
    const currentFiles = fs.readdirSync(currentDir).filter(f => f.endsWith('.json'));
    
    for (const file of currentFiles) {
      const data = readJsonFile(path.join(currentDir, file));
      if (data) {
        const keys = collectAllKeys(data);
        keys.forEach(key => {
          if (currentKeys.has(key)) {
            console.error(`  ${colors.red}❌ Duplicate key found: "${key}" in both ${file} and ${currentKeys.get(key)}${colors.reset}`);
            report.summary.duplicateKeys.push({ lang, key, files: [file, currentKeys.get(key)] });
            hasErrors = true;
          }
          currentKeys.set(key, file);
        });
      }
    }
    
    // Check for missing keys
    const missingKeys = [];
    for (const [key, file] of backupKeys.entries()) {
      if (!currentKeys.has(key)) {
        missingKeys.push({ key, originalFile: file });
      }
    }
    
    // Check for new keys (shouldn't happen in migration)
    const newKeys = [];
    for (const [key, file] of currentKeys.entries()) {
      if (!backupKeys.has(key)) {
        newKeys.push({ key, file });
      }
    }
    
    // Report results for this language
    report.languages[lang] = {
      originalKeyCount: backupKeys.size,
      currentKeyCount: currentKeys.size,
      missingKeys: missingKeys.length,
      newKeys: newKeys.length,
      originalFiles: backupFiles.length,
      currentFiles: currentFiles.length
    };
    
    if (lang === 'en') {
      report.summary.totalOriginalKeys = backupKeys.size;
      report.summary.totalNewKeys = currentKeys.size;
    }
    
    // Print results
    if (missingKeys.length > 0) {
      console.error(`  ${colors.red}❌ Missing ${missingKeys.length} keys:${colors.reset}`);
      missingKeys.slice(0, 10).forEach(({ key, originalFile }) => {
        console.error(`     - "${key}" (was in ${originalFile})`);
      });
      if (missingKeys.length > 10) {
        console.error(`     ... and ${missingKeys.length - 10} more`);
      }
      report.summary.missingKeys.push(...missingKeys.map(k => ({ lang, ...k })));
      hasErrors = true;
    }
    
    if (newKeys.length > 0 && lang === 'en') {
      console.warn(`  ${colors.yellow}⚠️  Found ${newKeys.length} new keys (unexpected in migration)${colors.reset}`);
      newKeys.slice(0, 5).forEach(({ key, file }) => {
        console.warn(`     - "${key}" in ${file}`);
      });
    }
    
    console.log(`  ${colors.green}✅ Keys: ${backupKeys.size} → ${currentKeys.size}${colors.reset}`);
    console.log(`  ${colors.green}✅ Files: ${backupFiles.length} → ${currentFiles.length}${colors.reset}`);
    
    // Check file changes
    const removedFiles = backupFiles.filter(f => !currentFiles.includes(f));
    const addedFiles = currentFiles.filter(f => !backupFiles.includes(f));
    
    if (removedFiles.length > 0) {
      console.log(`  ${colors.yellow}📄 Removed files: ${removedFiles.join(', ')}${colors.reset}`);
      report.summary.removedFiles.push(...removedFiles);
    }
    
    if (addedFiles.length > 0) {
      console.log(`  ${colors.blue}📄 New files: ${addedFiles.join(', ')}${colors.reset}`);
      report.summary.newFiles.push(...addedFiles);
    }
    
    console.log('');
  }
  
  // Print summary
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}📊 VALIDATION SUMMARY${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  console.log(`Languages validated: ${report.summary.totalLanguages}`);
  console.log(`Total keys (English): ${report.summary.totalOriginalKeys} → ${report.summary.totalNewKeys}`);
  
  if (report.summary.removedFiles.length > 0) {
    const uniqueRemoved = [...new Set(report.summary.removedFiles)];
    console.log(`\n${colors.yellow}Files removed:${colors.reset}`);
    uniqueRemoved.forEach(f => console.log(`  - ${f}`));
  }
  
  if (report.summary.newFiles.length > 0) {
    const uniqueNew = [...new Set(report.summary.newFiles)];
    console.log(`\n${colors.blue}Files created:${colors.reset}`);
    uniqueNew.forEach(f => console.log(`  - ${f}`));
  }
  
  // Check file sizes
  console.log(`\n${colors.blue}📏 File sizes (English):${colors.reset}`);
  const enDir = path.join(LOCALES_DIR, 'en');
  const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  
  for (const file of enFiles.sort()) {
    const filePath = path.join(enDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const data = JSON.parse(content);
    const keys = collectAllKeys(data).length;
    
    let status = colors.green + '✅';
    if (lines < 100) {
      status = colors.yellow + '⚠️  (small)';
    } else if (lines > 800) {
      status = colors.red + '❌ (too large)';
    }
    
    console.log(`  ${status} ${file.padEnd(30)} ${lines.toString().padStart(4)} lines, ${keys.toString().padStart(4)} keys${colors.reset}`);
  }
  
  // Final status
  console.log('');
  if (hasErrors) {
    console.error(`\n${colors.red}❌ VALIDATION FAILED - Some keys are missing or duplicated!${colors.reset}`);
    console.error(`${colors.red}Please check the errors above and fix them manually.${colors.reset}\n`);
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'migration-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
    
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ VALIDATION PASSED - All keys are present and unique!${colors.reset}`);
    console.log(`${colors.green}The migration was successful.${colors.reset}\n`);
  }
}

// Run validation
validateTranslations().catch(console.error);
