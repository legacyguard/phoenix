const fs = require('fs');
const path = require('path');

// Define the complete mapping from old namespaces to new consolidated namespaces
const namespaceMapping = {
  // UI & Core
  'ui': 'ui',
  'accessibility': 'ui',
  'forms': 'ui',
  'general': 'ui',
  'pwa': 'ui',
  'steps': 'ui',
  'app': 'ui',
  
  // Authentication & Security
  'auth': 'auth',
  'security': 'auth',
  'consent': 'auth',
  
  // Dashboard & Navigation
  'dashboard': 'dashboard',
  'annual-review': 'dashboard',
  'progress': 'dashboard',
  'notifications': 'dashboard',
  'alerts': 'dashboard',
  'admin': 'dashboard',
  'calculator': 'dashboard',
  'recommendations': 'dashboard',
  'reminders': 'dashboard',
  
  // Assets & Documents
  'assets': 'assets',
  'asset-management': 'assets',
  'documents': 'assets',
  'upload': 'assets',
  'vault': 'assets',
  
  // Family & Guardians
  'family': 'family',
  'guardians': 'family',
  'guardian': 'family',
  'executor': 'family',
  'beneficiary': 'family',
  'invitations': 'family',
  'crisis': 'family',
  'playbook': 'family',
  
  // Wills & Legal
  'wills': 'wills',
  'will': 'wills',
  'legal': 'wills',
  'legal-pages': 'wills',
  'cookies': 'wills',
  
  // Landing & Features
  'landing': 'landing',
  'features': 'landing',
  
  // Settings & Preferences
  'settings': 'settings',
  'country': 'settings',
  
  // Subscriptions & Plans
  'subscription': 'subscription',
  'plans': 'subscription',
  'pricing': 'subscription',
  
  // Time Capsule & Legacy
  'time-capsule': 'time-capsule',
  'life-events': 'time-capsule',
  
  // Sharing & Communication
  'sharing': 'sharing',
  'emails': 'sharing',
  
  // Help & Support
  'help': 'help',
  'manual': 'help',
  'onboarding': 'help',
  'contact': 'help',
  'questions': 'help',
  
  // AI & Smart Features
  'ai': 'ai',
  
  // Errors & Debug
  'errors': 'errors',
  'debug': 'errors',
  
  // Micro-copy
  'micro-copy': 'micro-copy'
};

// Function to find all TypeScript/React files
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && !item.includes('backup')) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to extract translation calls from a file
function extractTranslationCalls(content) {
  const calls = [];
  
  // Pattern 1: useTranslation('namespace')
  const useTranslationPattern = /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;
  while ((match = useTranslationPattern.exec(content)) !== null) {
    calls.push({
      type: 'useTranslation',
      namespace: match[1],
      line: content.substring(0, match.index).split('\n').length,
      fullMatch: match[0]
    });
  }
  
  // Pattern 2: useTranslation() without namespace
  const useTranslationNoNamespacePattern = /useTranslation\s*\(\s*\)/g;
  while ((match = useTranslationNoNamespacePattern.exec(content)) !== null) {
    calls.push({
      type: 'useTranslation',
      namespace: null,
      line: content.substring(0, match.index).split('\n').length,
      fullMatch: match[0]
    });
  }
  
  return calls;
}

// Function to verify translation calls in a file
function verifyTranslationCalls(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const calls = extractTranslationCalls(content);
  const issues = [];
  const namespaceUsage = {};
  
  for (const call of calls) {
    if (call.type === 'useTranslation') {
      if (call.namespace === null) {
        issues.push(`Line ${call.line}: useTranslation() without namespace`);
      } else if (!namespaceMapping[call.namespace]) {
        issues.push(`Line ${call.line}: Unknown namespace '${call.namespace}'`);
      } else {
        const mappedNamespace = namespaceMapping[call.namespace];
        namespaceUsage[mappedNamespace] = (namespaceUsage[mappedNamespace] || 0) + 1;
        
        if (mappedNamespace !== call.namespace) {
          issues.push(`Line ${call.line}: Should use '${mappedNamespace}' instead of '${call.namespace}'`);
        }
      }
    }
  }
  
  return { issues, namespaceUsage };
}

// Function to verify translation files exist
function verifyTranslationFiles() {
  const localesPath = path.join(__dirname, '../src/i18n/locales/en');
  const expectedFiles = Object.values(namespaceMapping);
  const existingFiles = fs.readdirSync(localesPath)
    .filter(file => file.endsWith('.json') && !file.includes('backup'))
    .map(file => file.replace('.json', ''));
  
  const missingFiles = expectedFiles.filter(file => !existingFiles.includes(file));
  const extraFiles = existingFiles.filter(file => !expectedFiles.includes(file));
  
  return { missingFiles, extraFiles, existingFiles };
}

// Function to verify i18n configuration
function verifyI18nConfig() {
  const i18nPath = path.join(__dirname, '../src/i18n/i18n.ts');
  const content = fs.readFileSync(i18nPath, 'utf8');
  
  // Extract namespaces from the configuration
  const namespaceMatch = content.match(/export const namespaces = \[([\s\S]*?)\]/);
  if (!namespaceMatch) {
    return { error: 'Could not find namespaces array in i18n.ts' };
  }
  
  const configuredNamespaces = namespaceMatch[1]
    .split(',')
    .map(ns => ns.trim().replace(/'/g, ''))
    .filter(ns => ns.length > 0);
  
  const expectedNamespaces = [...new Set(Object.values(namespaceMapping))].sort();
  const missingNamespaces = expectedNamespaces.filter(ns => !configuredNamespaces.includes(ns));
  const extraNamespaces = configuredNamespaces.filter(ns => !expectedNamespaces.includes(ns));
  
  return {
    configuredNamespaces,
    expectedNamespaces,
    missingNamespaces,
    extraNamespaces
  };
}

// Main verification function
function runFinalVerification() {
  console.log('🔍 Running final verification of translation system...\n');
  
  const srcPath = path.join(__dirname, '../src');
  const tsxFiles = findTsxFiles(srcPath);
  
  console.log(`📁 Found ${tsxFiles.length} files to verify\n`);
  
  let totalIssues = 0;
  let totalFilesWithIssues = 0;
  const allNamespaceUsage = {};
  
  // Verify translation calls in all files
  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    const result = verifyTranslationCalls(filePath);
    
    if (result.issues.length > 0) {
      console.log(`⚠️  ${relativePath}:`);
      result.issues.forEach(issue => {
        console.log(`   ${issue}`);
      });
      totalIssues += result.issues.length;
      totalFilesWithIssues++;
    }
    
    // Aggregate namespace usage
    for (const [namespace, count] of Object.entries(result.namespaceUsage)) {
      allNamespaceUsage[namespace] = (allNamespaceUsage[namespace] || 0) + count;
    }
  }
  
  // Verify translation files
  console.log('\n📁 Verifying translation files...');
  const fileVerification = verifyTranslationFiles();
  
  if (fileVerification.missingFiles.length > 0) {
    console.log(`❌ Missing translation files: ${fileVerification.missingFiles.join(', ')}`);
  }
  
  if (fileVerification.extraFiles.length > 0) {
    console.log(`⚠️  Extra translation files: ${fileVerification.extraFiles.join(', ')}`);
  }
  
  console.log(`✅ Found ${fileVerification.existingFiles.length} translation files`);
  
  // Verify i18n configuration
  console.log('\n⚙️ Verifying i18n configuration...');
  const configVerification = verifyI18nConfig();
  
  if (configVerification.error) {
    console.log(`❌ ${configVerification.error}`);
  } else {
    if (configVerification.missingNamespaces.length > 0) {
      console.log(`❌ Missing namespaces in config: ${configVerification.missingNamespaces.join(', ')}`);
    }
    
    if (configVerification.extraNamespaces.length > 0) {
      console.log(`⚠️  Extra namespaces in config: ${configVerification.extraNamespaces.join(', ')}`);
    }
    
    console.log(`✅ Configuration has ${configVerification.configuredNamespaces.length} namespaces`);
  }
  
  // Generate final report
  console.log('\n📊 FINAL VERIFICATION REPORT');
  console.log('=============================\n');
  
  console.log(`📁 Files processed: ${tsxFiles.length}`);
  console.log(`⚠️  Files with issues: ${totalFilesWithIssues}`);
  console.log(`❌ Total issues found: ${totalIssues}`);
  
  console.log('\n📈 Namespace Usage:');
  Object.entries(allNamespaceUsage)
    .sort(([,a], [,b]) => b - a)
    .forEach(([namespace, count]) => {
      console.log(`   ${namespace}: ${count} usages`);
    });
  
  console.log('\n📁 Translation Files:');
  console.log(`   Expected: ${Object.values(namespaceMapping).length}`);
  console.log(`   Found: ${fileVerification.existingFiles.length}`);
  console.log(`   Missing: ${fileVerification.missingFiles.length}`);
  console.log(`   Extra: ${fileVerification.extraFiles.length}`);
  
  console.log('\n⚙️ Configuration:');
  console.log(`   Configured namespaces: ${configVerification.configuredNamespaces?.length || 0}`);
  console.log(`   Expected namespaces: ${configVerification.expectedNamespaces?.length || 0}`);
  console.log(`   Missing in config: ${configVerification.missingNamespaces?.length || 0}`);
  console.log(`   Extra in config: ${configVerification.extraNamespaces?.length || 0}`);
  
  // Final status
  const hasIssues = totalIssues > 0 || 
                   fileVerification.missingFiles.length > 0 || 
                   configVerification.missingNamespaces?.length > 0;
  
  if (hasIssues) {
    console.log('\n❌ VERIFICATION FAILED - Issues found that need attention');
    return false;
  } else {
    console.log('\n✅ VERIFICATION PASSED - All translation calls are properly configured!');
    return true;
  }
}

// Run the verification
if (require.main === module) {
  runFinalVerification();
}

module.exports = { runFinalVerification }; 