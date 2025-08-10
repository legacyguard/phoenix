#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const PROJECT_ROOT = path.join(__dirname, '..');

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

// Merge configuration - which small files to merge into which larger files
const MERGE_CONFIG = {
  // Merge legal files together
  'legal.json': ['legal.json', 'legal-pages.json'],
  
  // Merge UI navigation files into ui-common
  'ui-common.json': ['ui-navigation.json', 'ui-forms.json', 'ui-professional.json'],
  
  // Merge error-related files together
  'errors.json': ['empathetic-errors.json'],
  
  // Merge notification and cultural into settings (user preferences)
  'settings.json': ['notifications.json', 'cultural.json'],
  
  // Merge documents into assets (they're related to user assets)
  'assets.json': ['documents.json']
};

// Files that will be deleted after merging
const FILES_TO_DELETE = [
  'legal-pages.json',
  'ui-navigation.json', 
  'ui-forms.json',
  'ui-professional.json',
  'empathetic-errors.json',
  'notifications.json',
  'cultural.json',
  'documents.json'
];

// Process merges for a single language
function processLanguage(lang) {
  const langDir = path.join(LOCALES_DIR, lang);
  
  if (!fs.existsSync(langDir)) {
    console.log(`  ⚠️  Language directory not found: ${lang}`);
    return { success: false, error: 'Directory not found' };
  }

  const results = {
    merged: [],
    deleted: [],
    errors: []
  };

  // Process each merge target
  for (const [targetFile, sourceFiles] of Object.entries(MERGE_CONFIG)) {
    const targetPath = path.join(langDir, targetFile);
    
    // Read target file
    let targetContent = {};
    if (fs.existsSync(targetPath)) {
      try {
        targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (error) {
        console.error(`    ❌ Error reading ${targetFile}: ${error.message}`);
        results.errors.push({ file: targetFile, error: error.message });
        continue;
      }
    }
    
    // Get all keys from target
    let allKeys = extractAllKeys(targetContent);
    
    // Merge source files
    for (const sourceFile of sourceFiles) {
      if (sourceFile === targetFile) continue; // Skip self
      
      const sourcePath = path.join(langDir, sourceFile);
      if (!fs.existsSync(sourcePath)) {
        console.log(`    ⚠️  Source file not found: ${sourceFile}`);
        continue;
      }
      
      try {
        const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
        const sourceKeys = extractAllKeys(sourceContent);
        
        // Merge keys
        Object.assign(allKeys, sourceKeys);
        
      } catch (error) {
        console.error(`    ❌ Error reading ${sourceFile}: ${error.message}`);
        results.errors.push({ file: sourceFile, error: error.message });
      }
    }
    
    // Write merged content back
    const mergedObject = reconstructObject(allKeys);
    fs.writeFileSync(targetPath, JSON.stringify(mergedObject, null, 2));
    results.merged.push(targetFile);
  }
  
  // Delete source files that were merged
  for (const fileToDelete of FILES_TO_DELETE) {
    const filePath = path.join(langDir, fileToDelete);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      results.deleted.push(fileToDelete);
    }
  }
  
  return results;
}

// Update namespace references in code
function updateNamespaceReferences() {
  const namespaceMap = {
    'legal-pages': 'legal',
    'ui-navigation': 'ui-common',
    'ui-forms': 'ui-common',
    'ui-professional': 'ui-common',
    'empathetic-errors': 'errors',
    'notifications': 'settings',
    'cultural': 'settings',
    'documents': 'assets'
  };
  
  console.log('\n📝 Updating namespace references in code...\n');
  
  let filesUpdated = 0;
  let totalReplacements = 0;
  
  // Find all TypeScript/JavaScript files
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          scanDirectory(fullPath);
        }
      } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        for (const [oldNs, newNs] of Object.entries(namespaceMap)) {
          // Replace useTranslation references
          const hookPattern = new RegExp(`useTranslation\\(['"]${oldNs}['"]\\)`, 'g');
          if (hookPattern.test(content)) {
            content = content.replace(hookPattern, `useTranslation('${newNs}')`);
            modified = true;
            totalReplacements++;
          }
          
          // Replace t() references
          const tPattern = new RegExp(`(['"])?t\\(['"]${oldNs}:`, 'g');
          if (tPattern.test(content)) {
            content = content.replace(tPattern, `$1t('${newNs}:`);
            modified = true;
            totalReplacements++;
          }
          
          // Replace $t() references
          const dollarTPattern = new RegExp(`\\$t\\(['"]${oldNs}:`, 'g');
          if (dollarTPattern.test(content)) {
            content = content.replace(dollarTPattern, `$t('${newNs}:`);
            modified = true;
            totalReplacements++;
          }
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content);
          filesUpdated++;
          console.log(`  ✅ Updated: ${path.relative(PROJECT_ROOT, fullPath)}`);
        }
      }
    }
  }
  
  scanDirectory(path.join(PROJECT_ROOT, 'src'));
  
  console.log(`\n  Updated ${totalReplacements} references in ${filesUpdated} files`);
  
  return filesUpdated;
}

// Update i18n configuration
function updateI18nConfig() {
  const configPath = path.join(PROJECT_ROOT, 'src', 'i18n', 'i18n.ts');
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Remove deleted namespaces
  const toRemove = [
    'legal-pages',
    'ui-navigation',
    'ui-forms', 
    'ui-professional',
    'empathetic-errors',
    'notifications',
    'cultural',
    'documents'
  ];
  
  for (const ns of toRemove) {
    // Remove from namespace array, handling various formatting
    content = content.replace(new RegExp(`['"]${ns}['"],?\\s*`, 'g'), '');
  }
  
  // Clean up any double commas or trailing commas
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*]/g, ']');
  
  fs.writeFileSync(configPath, content);
  console.log('✅ Updated i18n.ts configuration');
}

// Validate the merge
function validateMerge() {
  console.log('\n📊 Validating merge results...\n');
  
  const enDir = path.join(LOCALES_DIR, 'en');
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  
  let totalKeys = 0;
  let totalLines = 0;
  const issues = [];
  
  console.log('  File                           Lines    Keys   Status');
  console.log('  ' + '─'.repeat(60));
  
  files.sort().forEach(file => {
    const content = fs.readFileSync(path.join(enDir, file), 'utf8');
    const lines = content.split('\n').length;
    
    try {
      const json = JSON.parse(content);
      
      function countKeys(obj) {
        let count = 0;
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            count += countKeys(obj[key]);
          } else {
            count++;
          }
        }
        return count;
      }
      
      const keys = countKeys(json);
      totalKeys += keys;
      totalLines += lines;
      
      let status = '✅';
      if (lines < 100) {
        status = '⚠️  small';
        issues.push(`${file}: ${lines} lines (too small)`);
      } else if (lines > 800) {
        status = '❌ large';
        issues.push(`${file}: ${lines} lines (too large)`);
      }
      
      console.log(`  ${file.padEnd(30)} ${lines.toString().padStart(5)} ${keys.toString().padStart(7)}   ${status}`);
    } catch (e) {
      console.log(`  ${file.padEnd(30)}     ?       ?   ❌ Invalid JSON!`);
      issues.push(`${file}: Invalid JSON`);
    }
  });
  
  console.log('  ' + '─'.repeat(60));
  console.log(`  Total: ${files.length} files              ${totalLines.toString().padStart(5)} ${totalKeys.toString().padStart(7)}\n`);
  
  if (issues.length > 0) {
    console.log('  ⚠️  Issues found:');
    issues.forEach(issue => console.log(`     - ${issue}`));
  } else {
    console.log('  ✅ All files are within the recommended size range!');
  }
  
  return issues.length === 0;
}

// Main execution
async function main() {
  console.log('🚀 Starting small files merge...\n');
  
  // Create backup first
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = `${LOCALES_DIR}.backup.${timestamp}`;
  
  console.log(`📦 Creating backup at ${backupDir}...`);
  fs.cpSync(LOCALES_DIR, backupDir, { recursive: true });
  console.log('✅ Backup created\n');
  
  // Get all languages
  const languages = fs.readdirSync(LOCALES_DIR).filter(f => 
    fs.statSync(path.join(LOCALES_DIR, f)).isDirectory()
  );
  
  console.log(`📂 Found ${languages.length} languages\n`);
  console.log('🔄 Processing merges...\n');
  
  // Process each language
  for (const lang of languages) {
    console.log(`  Processing ${lang}...`);
    const result = processLanguage(lang);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`    ⚠️  Completed with ${result.errors.length} errors`);
    } else if (result.merged.length > 0) {
      console.log(`    ✅ Merged ${result.merged.length} files, deleted ${result.deleted.length} files`);
    }
  }
  
  // Update i18n config
  console.log('\n📝 Updating i18n configuration...');
  updateI18nConfig();
  
  // Update namespace references in code
  updateNamespaceReferences();
  
  // Validate the results
  validateMerge();
  
  console.log('\n✅ Merge complete!');
  console.log(`\n💾 Your files are backed up in: ${backupDir}`);
  console.log('\n📝 Next step: Test your application to ensure all translations work correctly');
}

main().catch(console.error);
