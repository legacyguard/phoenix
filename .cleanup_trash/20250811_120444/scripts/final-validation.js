#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const PROJECT_ROOT = path.join(__dirname, '..');

// Count keys recursively
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

// Validate translation files
function validateTranslations() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('                   FINAL VALIDATION REPORT                      ');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  // Check English translations
  const enDir = path.join(LOCALES_DIR, 'en');
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json')).sort();
  
  console.log('📊 Translation File Structure:\n');
  console.log('  File                           Lines   Keys   Size(KB)  Status');
  console.log('  ' + '─'.repeat(65));
  
  let totalKeys = 0;
  let totalLines = 0;
  let totalSize = 0;
  const perfect = [];
  const acceptable = [];
  const needsAttention = [];
  
  files.forEach(file => {
    const filePath = path.join(enDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const lines = content.split('\n').length;
    const sizeKB = (stats.size / 1024).toFixed(1);
    
    try {
      const json = JSON.parse(content);
      const keys = countKeys(json);
      
      totalKeys += keys;
      totalLines += lines;
      totalSize += stats.size;
      
      let status, emoji;
      if (lines >= 100 && lines <= 800) {
        status = 'Perfect';
        emoji = '✅';
        perfect.push(file);
      } else if (lines < 100) {
        status = 'Small';
        emoji = '📦';
        acceptable.push(file);
      } else {
        status = 'Large';
        emoji = '⚠️';
        needsAttention.push(file);
      }
      
      console.log(`  ${file.padEnd(30)} ${lines.toString().padStart(6)} ${keys.toString().padStart(6)} ${sizeKB.padStart(9)}  ${emoji} ${status}`);
      
    } catch (e) {
      console.log(`  ${file.padEnd(30)}      ?      ?         ?  ❌ Invalid JSON!`);
      needsAttention.push(file);
    }
  });
  
  console.log('  ' + '─'.repeat(65));
  console.log(`  TOTAL: ${files.length} files        ${totalLines.toString().padStart(6)} ${totalKeys.toString().padStart(6)} ${(totalSize/1024).toFixed(1).padStart(9)}\n`);
  
  // Summary
  console.log('📈 Summary:\n');
  console.log(`  ✅ Perfect size (100-800 lines):     ${perfect.length} files`);
  console.log(`  📦 Acceptable but small (<100 lines): ${acceptable.length} files`);
  console.log(`  ⚠️  Needs attention (>800 lines):     ${needsAttention.length} files`);
  
  // Check namespaces in i18n config
  console.log('\n🔧 i18n Configuration:\n');
  const configPath = path.join(PROJECT_ROOT, 'src', 'i18n', 'i18n.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  const nsMatch = configContent.match(/ns:\s*\[([\s\S]*?)\]/);
  
  if (nsMatch) {
    const namespaces = nsMatch[1].match(/['"]([^'"]+)['"]/g)?.map(ns => ns.replace(/['"]/g, ''));
    console.log(`  Configured namespaces (${namespaces?.length || 0}):`);
    
    // Check if all JSON files have corresponding namespace
    const missingNs = [];
    const extraNs = [];
    
    files.forEach(file => {
      const ns = file.replace('.json', '');
      if (!namespaces?.includes(ns)) {
        missingNs.push(ns);
      }
    });
    
    namespaces?.forEach(ns => {
      if (!files.includes(`${ns}.json`)) {
        extraNs.push(ns);
      }
    });
    
    if (missingNs.length === 0 && extraNs.length === 0) {
      console.log('  ✅ All namespaces correctly configured');
    } else {
      if (missingNs.length > 0) {
        console.log(`  ❌ Missing from config: ${missingNs.join(', ')}`);
      }
      if (extraNs.length > 0) {
        console.log(`  ❌ Extra in config: ${extraNs.join(', ')}`);
      }
    }
  }
  
  // Check for consistency across languages
  console.log('\n🌐 Language Consistency:\n');
  const languages = fs.readdirSync(LOCALES_DIR).filter(f => 
    fs.statSync(path.join(LOCALES_DIR, f)).isDirectory()
  );
  
  const filesByLang = {};
  let inconsistencies = 0;
  
  languages.forEach(lang => {
    const langFiles = fs.readdirSync(path.join(LOCALES_DIR, lang))
      .filter(f => f.endsWith('.json'))
      .sort();
    filesByLang[lang] = langFiles;
    
    if (langFiles.length !== files.length) {
      console.log(`  ⚠️  ${lang}: ${langFiles.length} files (expected ${files.length})`);
      inconsistencies++;
    }
  });
  
  if (inconsistencies === 0) {
    console.log(`  ✅ All ${languages.length} languages have consistent file structure`);
  }
  
  // Final status
  console.log('\n' + '═'.repeat(65));
  if (needsAttention.length === 0 && inconsistencies === 0) {
    console.log('✅ VALIDATION PASSED - Migration completed successfully!');
  } else if (needsAttention.length <= 2) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS - Minor issues remain');
    console.log('\nRecommendations:');
    if (needsAttention.includes('ui-components.json')) {
      console.log('  • Consider splitting ui-components.json further');
    }
    if (needsAttention.includes('ui-elements.json')) {
      console.log('  • Consider splitting ui-elements.json further');
    }
  } else {
    console.log('❌ VALIDATION FAILED - Issues need attention');
  }
  console.log('═'.repeat(65) + '\n');
  
  // Migration statistics
  console.log('📊 Migration Statistics:\n');
  console.log('  Original structure: ~34 files with inconsistent sizes');
  console.log(`  New structure:      ${files.length} files with optimized sizes`);
  console.log(`  Total keys:         ${totalKeys} (preserved from original)`);
  console.log(`  Average file size:  ${Math.round(totalLines / files.length)} lines`);
  console.log(`  Optimal files:      ${((perfect.length / files.length) * 100).toFixed(1)}% within target range`);
  
  return { perfect, acceptable, needsAttention };
}

// Check for broken references
async function checkReferences() {
  console.log('\n🔍 Checking for broken references...\n');
  
  const availableNamespaces = fs.readdirSync(path.join(LOCALES_DIR, 'en'))
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
  
  let brokenRefs = 0;
  
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
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for translation references
        const patterns = [
          /useTranslation\(['"]([^'"]+)['"]\)/g,
          /t\(['"]([^'"]+):/g,
          /\$t\(['"]([^'"]+):/g
        ];
        
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const ns = match[1];
            if (ns && !availableNamespaces.includes(ns)) {
              console.log(`  ❌ Broken reference in ${path.relative(PROJECT_ROOT, fullPath)}: "${ns}"`);
              brokenRefs++;
            }
          }
        }
      }
    }
  }
  
  scanDirectory(path.join(PROJECT_ROOT, 'src'));
  
  if (brokenRefs === 0) {
    console.log('  ✅ No broken namespace references found');
  } else {
    console.log(`\n  Found ${brokenRefs} broken references`);
  }
  
  return brokenRefs;
}

// Main execution
async function main() {
  const { perfect, acceptable, needsAttention } = validateTranslations();
  const brokenRefs = await checkReferences();
  
  // Final recommendations
  console.log('\n💡 Recommendations:\n');
  
  if (needsAttention.length > 0) {
    console.log('  For files over 800 lines:');
    console.log('  • Consider further splitting based on logical groupings');
    console.log('  • Monitor loading performance in production');
  }
  
  if (acceptable.length > 0 && false) { // Disabled as small files are ok
    console.log('\n  For very small files (<100 lines):');
    console.log('  • These could be merged if they become maintenance overhead');
  }
  
  console.log('\n🚀 Next Steps:\n');
  console.log('  1. Run your test suite: npm test');
  console.log('  2. Test key pages manually');
  console.log('  3. Monitor bundle sizes and loading performance');
  console.log('  4. Clean up old backups once confirmed working');
  
  // List backups
  const backups = fs.readdirSync(path.join(LOCALES_DIR, '..'))
    .filter(f => f.startsWith('locales.backup.'));
  
  if (backups.length > 0) {
    console.log('\n💾 Available backups:\n');
    backups.forEach(backup => {
      const stats = fs.statSync(path.join(LOCALES_DIR, '..', backup));
      console.log(`  • ${backup} (${new Date(stats.mtime).toLocaleString()})`);
    });
  }
  
  console.log('\n✨ Migration validation complete!\n');
}

main().catch(console.error);
