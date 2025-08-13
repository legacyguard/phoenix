#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// List of all supported languages
const LANGUAGES = [
  'bg', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 
  'fr', 'ga', 'hr', 'hu', 'is', 'it', 'lt', 'lv', 'me', 'mk', 
  'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 
  'sr', 'sv', 'tr', 'uk'
];

// Critical namespaces that should have content
const CRITICAL_NAMESPACES = [
  'landing', 'assets', 'dashboard-main', 'ui-components', 
  'ui-elements', 'family-core', 'time-capsule', 'sharing'
];

// Function to find the best backup for a file
function findBestBackup(langDir, namespace) {
  const backupDirs = fs.readdirSync(langDir)
    .filter(d => d.startsWith('.backup-'))
    .sort((a, b) => b.localeCompare(a)); // Latest first

  for (const backupDir of backupDirs) {
    const backupPath = path.join(langDir, backupDir, `${namespace}.json`);
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, 'utf8');
      try {
        const parsed = JSON.parse(content);
        // Check if backup has actual content
        if (Object.keys(parsed).length > 0) {
          return backupPath;
        }
      } catch (e) {
        console.error(`Invalid JSON in ${backupPath}`);
      }
    }
  }
  return null;
}

// Function to check if a file is empty or nearly empty
function isEmptyFile(filePath) {
  if (!fs.existsSync(filePath)) return true;
  
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (content === '{}' || content === '{\n}' || content.length < 10) return true;
  
  try {
    const parsed = JSON.parse(content);
    return Object.keys(parsed).length === 0;
  } catch (e) {
    return true;
  }
}

// Function to copy English translations as fallback
function copyEnglishAsFallback(namespace, targetLang) {
  const enPath = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
  const targetPath = path.join(LOCALES_DIR, targetLang, `${namespace}.json`);
  
  if (fs.existsSync(enPath) && !isEmptyFile(enPath)) {
    const enContent = fs.readFileSync(enPath, 'utf8');
    try {
      const enData = JSON.parse(enContent);
      if (Object.keys(enData).length > 0) {
        // Add a marker to indicate this needs translation
        const markedData = {
          "_needs_translation": true,
          "_copied_from": "en",
          "_date": new Date().toISOString(),
          ...enData
        };
        fs.writeFileSync(targetPath, JSON.stringify(markedData, null, 2), 'utf8');
        return true;
      }
    } catch (e) {
      console.error(`Error parsing English file ${enPath}:`, e.message);
    }
  }
  return false;
}

// Main restoration process
async function restoreTranslations() {
  console.log('🔧 Starting i18n restoration process...\n');
  
  let totalRestored = 0;
  let totalFallbacks = 0;
  let totalEmpty = 0;
  const report = {};

  for (const lang of LANGUAGES) {
    const langDir = path.join(LOCALES_DIR, lang);
    if (!fs.existsSync(langDir)) {
      console.log(`⚠️  Language directory missing: ${lang}`);
      continue;
    }

    report[lang] = {
      restored: [],
      fallback: [],
      empty: [],
      ok: []
    };

    console.log(`\n📂 Processing ${lang}...`);

    // Get all JSON files in the language directory
    const files = fs.readdirSync(langDir)
      .filter(f => f.endsWith('.json'));

    for (const file of files) {
      const namespace = file.replace('.json', '');
      const filePath = path.join(langDir, file);

      // Skip if file is not empty
      if (!isEmptyFile(filePath)) {
        report[lang].ok.push(namespace);
        continue;
      }

      // Try to restore from backup
      const backupPath = findBestBackup(langDir, namespace);
      if (backupPath) {
        const backupContent = fs.readFileSync(backupPath, 'utf8');
        fs.writeFileSync(filePath, backupContent, 'utf8');
        console.log(`  ✅ Restored ${namespace} from backup`);
        report[lang].restored.push(namespace);
        totalRestored++;
      } 
      // For critical namespaces, copy English as fallback if no backup found
      else if (CRITICAL_NAMESPACES.includes(namespace) && lang !== 'en') {
        if (copyEnglishAsFallback(namespace, lang)) {
          console.log(`  📝 Copied ${namespace} from English (needs translation)`);
          report[lang].fallback.push(namespace);
          totalFallbacks++;
        } else {
          console.log(`  ❌ Empty: ${namespace} (no backup, no English fallback)`);
          report[lang].empty.push(namespace);
          totalEmpty++;
        }
      } else {
        console.log(`  ⚠️  Empty: ${namespace} (no backup found)`);
        report[lang].empty.push(namespace);
        totalEmpty++;
      }
    }

    // Check for missing critical namespaces
    for (const namespace of CRITICAL_NAMESPACES) {
      const filePath = path.join(langDir, `${namespace}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`  🆕 Creating missing ${namespace}`);
        if (copyEnglishAsFallback(namespace, lang)) {
          report[lang].fallback.push(namespace);
          totalFallbacks++;
        }
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESTORATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Files restored from backup: ${totalRestored}`);
  console.log(`📝 Files copied from English: ${totalFallbacks}`);
  console.log(`❌ Files still empty: ${totalEmpty}`);

  // Detailed report
  console.log('\n📋 DETAILED REPORT BY LANGUAGE:');
  for (const [lang, data] of Object.entries(report)) {
    if (data.restored.length > 0 || data.fallback.length > 0 || data.empty.length > 0) {
      console.log(`\n${lang.toUpperCase()}:`);
      if (data.restored.length > 0) {
        console.log(`  Restored: ${data.restored.join(', ')}`);
      }
      if (data.fallback.length > 0) {
        console.log(`  Fallback: ${data.fallback.join(', ')}`);
      }
      if (data.empty.length > 0) {
        console.log(`  Still empty: ${data.empty.join(', ')}`);
      }
    }
  }

  // Save report to file
  const reportPath = path.join(__dirname, 'i18n-restoration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  console.log('\n✨ Restoration complete!');
  
  // Provide next steps
  console.log('\n📌 NEXT STEPS:');
  console.log('1. Review files marked with "_needs_translation" flag');
  console.log('2. Use translation service to translate English fallbacks');
  console.log('3. Remove "_needs_translation", "_copied_from", and "_date" fields after translation');
  console.log('4. Test the application with different language settings');
}

// Run the restoration
restoreTranslations().catch(console.error);
