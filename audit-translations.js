#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to colorize text
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Recursive function to flatten nested JSON object keys
function flattenKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively flatten nested objects
      keys.push(...flattenKeys(value, newKey));
    } else {
      // Add the current key
      keys.push(newKey);
    }
  }
  
  return keys;
}

// Function to get language name from language code
function getLanguageName(code) {
  const languageNames = {
    'en': 'English',
    'sk': 'Slovak',
    'cs': 'Czech',
    'de': 'German',
    'fr': 'French',
    'es': 'Spanish',
    'it': 'Italian',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'pl': 'Polish',
    'ru': 'Russian',
    'uk': 'Ukrainian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sl': 'Slovenian',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'el': 'Greek',
    'tr': 'Turkish',
    'ar': 'Arabic',
    'he': 'Hebrew',
    'fa': 'Persian',
    'hi': 'Hindi',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fil': 'Filipino',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'is': 'Icelandic',
    'ga': 'Irish',
    'mt': 'Maltese',
    'sq': 'Albanian',
    'mk': 'Macedonian',
    'sr': 'Serbian',
    'me': 'Montenegrin'
  };
  
  return languageNames[code] || code;
}

// Main audit function
function auditTranslations() {
  const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
  const englishFile = path.join(localesDir, 'en', 'common.json');
  
  console.log(colorize('Translation Audit Report', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));
  
  // Check if English file exists
  if (!fs.existsSync(englishFile)) {
    console.error(colorize(`❌ English master file not found at: ${englishFile}`, 'red'));
    process.exit(1);
  }
  
  // Read and parse English file
  let englishData;
  try {
    const englishContent = fs.readFileSync(englishFile, 'utf8');
    englishData = JSON.parse(englishContent);
  } catch (error) {
    console.error(colorize(`❌ Failed to parse English file: ${error.message}`, 'red'));
    process.exit(1);
  }
  
  // Get all English keys
  const englishKeys = flattenKeys(englishData);
  const totalEnglishKeys = englishKeys.length;
  
  console.log(colorize(`Source: ${englishFile} (Total Keys: ${totalEnglishKeys})`, 'blue'));
  console.log('');
  
  // Get all language directories
  let languageDirs;
  try {
    languageDirs = fs.readdirSync(localesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => name !== 'en'); // Exclude English directory
  } catch (error) {
    console.error(colorize(`❌ Failed to read locales directory: ${error.message}`, 'red'));
    process.exit(1);
  }
  
  const results = [];
  
  // Process each language
  for (const langCode of languageDirs) {
    const langFile = path.join(localesDir, langCode, 'common.json');
    const languageName = getLanguageName(langCode);
    
    if (!fs.existsSync(langFile)) {
      console.log(colorize(`Language: ${langCode} (${languageName}) Status: ❌ File not found at ${langFile}`, 'red'));
      results.push({
        code: langCode,
        name: languageName,
        status: 'missing',
        missingKeys: englishKeys,
        translatedKeys: 0,
        totalKeys: totalEnglishKeys
      });
      continue;
    }
    
    // Read and parse language file
    let langData;
    try {
      const langContent = fs.readFileSync(langFile, 'utf8');
      langData = JSON.parse(langContent);
    } catch (error) {
      console.log(colorize(`Language: ${langCode} (${languageName}) Status: ❌ Failed to parse file: ${error.message}`, 'red'));
      results.push({
        code: langCode,
        name: languageName,
        status: 'parse_error',
        missingKeys: englishKeys,
        translatedKeys: 0,
        totalKeys: totalEnglishKeys
      });
      continue;
    }
    
    // Get language keys
    const langKeys = flattenKeys(langData);
    
    // Find missing keys
    const missingKeys = englishKeys.filter(key => !langKeys.includes(key));
    const translatedKeys = totalEnglishKeys - missingKeys.length;
    
    // Determine status
    let status, statusIcon, statusColor;
    if (missingKeys.length === 0) {
      status = 'complete';
      statusIcon = '✅';
      statusColor = 'green';
    } else if (missingKeys.length <= 10) {
      status = 'warning';
      statusIcon = '⚠️';
      statusColor = 'yellow';
    } else {
      status = 'incomplete';
      statusIcon = '❌';
      statusColor = 'red';
    }
    
    console.log(colorize(`Language: ${langCode} (${languageName}) Status: ${statusIcon} ${status.toUpperCase()} (${translatedKeys}/${totalEnglishKeys} keys)`, statusColor));
    
    // Show missing keys if any
    if (missingKeys.length > 0) {
      const displayKeys = missingKeys.slice(0, 10); // Show first 10 missing keys
      displayKeys.forEach(key => {
        console.log(colorize(`  ${key}`, 'yellow'));
      });
      
      if (missingKeys.length > 10) {
        console.log(colorize(`  ... and ${missingKeys.length - 10} more`, 'yellow'));
      }
    }
    
    results.push({
      code: langCode,
      name: languageName,
      status,
      missingKeys,
      translatedKeys,
      totalKeys: totalEnglishKeys
    });
  }
  
  // Summary section
  console.log('');
  console.log(colorize('Summary:', 'bright'));
  console.log(colorize('-'.repeat(30), 'cyan'));
  
  for (const result of results) {
    const percentage = result.totalKeys > 0 ? ((result.translatedKeys / result.totalKeys) * 100).toFixed(1) : '0.0';
    const statusIcon = result.status === 'complete' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(colorize(`${result.code}: ${result.translatedKeys} / ${result.totalKeys} translated (${percentage}%) ${statusIcon}`, 
      result.status === 'complete' ? 'green' : result.status === 'warning' ? 'yellow' : 'red'));
  }
  
  // Statistics
  const complete = results.filter(r => r.status === 'complete').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const incomplete = results.filter(r => r.status === 'incomplete').length;
  const missing = results.filter(r => r.status === 'missing').length;
  const errors = results.filter(r => r.status === 'parse_error').length;
  
  console.log('');
  console.log(colorize('Statistics:', 'bright'));
  console.log(colorize('-'.repeat(30), 'cyan'));
  console.log(colorize(`Complete: ${complete}`, 'green'));
  console.log(colorize(`Needs attention (≤10 missing): ${warnings}`, 'yellow'));
  console.log(colorize(`Incomplete (>10 missing): ${incomplete}`, 'red'));
  console.log(colorize(`Missing files: ${missing}`, 'red'));
  console.log(colorize(`Parse errors: ${errors}`, 'red'));
  console.log(colorize(`Total languages: ${results.length}`, 'blue'));
  
  // Recommendations
  console.log('');
  console.log(colorize('Recommendations:', 'bright'));
  console.log(colorize('-'.repeat(30), 'cyan'));
  
  if (warnings > 0 || incomplete > 0) {
    console.log(colorize('• Prioritize languages with missing keys', 'yellow'));
  }
  
  if (missing > 0) {
    console.log(colorize('• Create missing translation files', 'red'));
  }
  
  if (errors > 0) {
    console.log(colorize('• Fix JSON syntax errors in translation files', 'red'));
  }
  
  if (complete === results.length) {
    console.log(colorize('🎉 All translations are complete!', 'green'));
  }
}

// Run the audit
try {
  auditTranslations();
} catch (error) {
  console.error(colorize(`❌ Audit failed: ${error.message}`, 'red'));
  process.exit(1);
}

export { auditTranslations, flattenKeys }; 