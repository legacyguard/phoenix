const fs = require('fs');
const path = require('path');

// Load the analysis results
const analysisPath = path.join(__dirname, 'common-usage-analysis.json');
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

// Load common.json
const commonPath = path.join(__dirname, '../src/i18n/locales/en/common.json');
const commonData = JSON.parse(fs.readFileSync(commonPath, 'utf8'));

// Define the reorganization mapping
const reorganizationMap = {
  'time-capsule': ['TimeCapsule', 'legacyBriefing', 'legacyLetters', 'createTimeCapsuleModal', 'editStoryModal'],
  'accessibility': ['accessibility', 'themeToggle', 'visualSettings'],
  'admin': ['admin', 'analytics', 'analysis'],
  'annual-review': ['annualReview'],
  'ai': ['ai', 'microTaskGenerator', 'generator'],
  'alerts': ['alerts'],
  'app': ['app'],
  'asset-management': ['assets', 'assetType', 'addLiabilityModal', 'dynamicAssetForm', 'myPossessions'],
  'auth': ['auth', 'login', 'register', 'passwordReset', 'passwordWall', 'verification'],
  'beneficiary': ['beneficiaryCommunications'],
  'calculator': ['calculator', 'benefits'],
  'consent': ['consent', 'privacy', 'privacyPolicy', 'localPrivacyProtection', 'dataTransparency', 'dataManagement'],
  'contact': ['contact', 'support', 'help'],
  'cookies': ['cookiePolicy', 'cookies'],
  'country': ['countryLanguage', 'languages'],
  'crisis': ['crisisAssessment', 'crisisSituations', 'emergency'],
  'debug': ['debug', 'development', 'errorTest', 'test'],
  'documents': ['documents', 'documentConfirmation', 'documentUploader', 'documentUploadFlow', 'upload', 'ocr', 'oCRProgress'],
  'errors': ['errors', 'errorBoundary', 'notfound', 'validation'],
  'executor': ['executor', 'executorDashboard', 'executorManagement'],
  'family': ['family', 'familyCapabilities', 'familyCrisisAssessment', 'familyCrisisPrevention', 'familyExecutorView', 'familyHub', 'familyPreparednessTools', 'trustedCircle', 'relationships'],
  'features': ['features', 'hero', 'howItWorks', 'testimonials', 'faq'],
  'forms': ['form', 'genderPreference', 'categories', 'types'],
  'guardian': ['guardian', 'guardianUpload', 'guardianView'],
  'invitations': ['invite', 'inviteAcceptance'],
  'legal': ['legal', 'legalConsultation', 'legalConsultationModal'],
  'life-events': ['logLifeEvent', 'scenarioPlanner', 'scenarios', 'whatIfScenarios'],
  'manual': ['manual'],
  'notifications': ['notificationPreferences', 'notifications'],
  'onboarding': ['firstTimeGuide', 'welcome', 'nextStep'],
  'plans': ['plans', 'subscriptions', 'trial', 'upgradeCard', 'cancellation'],
  'playbook': ['playbook', 'preparedness', 'preservationMode'],
  'progress': ['progress', 'progressTracking', 'tasks', 'quickTasks', 'completion'],
  'pwa': ['pwaInstallBanner'],
  'questions': ['questions', 'deepDive'],
  'recommendations': ['recommendations', 'complexityReduction', 'complexProfile'],
  'reminders': ['reminders'],
  'security': ['security', 'securityStatus', 'justInTimeAccess'],
  'settings': ['settings'],
  'steps': ['steps', 'skip'],
  'vault': ['vault', 'estateStatus'],
  'will': ['will', 'willGenerator', 'willSync', 'willSyncSettings', 'willVersion'],
  'general': ['general', 'common', 'details', 'demo', 'index', 'cta', 'emotionalContextSystem', 'solution']
};

// Function to extract keys from common.json
function extractKeys(commonData, keyList) {
  const extracted = {};
  
  for (const key of keyList) {
    if (commonData[key]) {
      extracted[key] = commonData[key];
    }
  }
  
  return extracted;
}

// Function to create new translation files
function createTranslationFiles() {
  console.log('📁 Creating new translation files...\n');
  
  const createdFiles = [];
  
  for (const [namespace, keys] of Object.entries(reorganizationMap)) {
    const extractedData = extractKeys(commonData, keys);
    
    if (Object.keys(extractedData).length > 0) {
      const filePath = path.join(__dirname, `../src/i18n/locales/en/${namespace}.json`);
      
      // Don't overwrite existing files
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(extractedData, null, 2));
        console.log(`✅ Created ${namespace}.json (${Object.keys(extractedData).length} keys)`);
        createdFiles.push(namespace);
      } else {
        console.log(`⚠️  Skipped ${namespace}.json (already exists)`);
      }
    }
  }
  
  return createdFiles;
}

// Function to update i18n configuration
function updateI18nConfig(newNamespaces) {
  console.log('\n⚙️ Updating i18n configuration...\n');
  
  const i18nPath = path.join(__dirname, '../src/i18n/i18n.ts');
  let i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  // Find the namespaces array
  const namespaceMatch = i18nContent.match(/export const namespaces = \[([\s\S]*?)\]/);
  
  if (namespaceMatch) {
    const existingNamespaces = namespaceMatch[1]
      .split(',')
      .map(ns => ns.trim().replace(/'/g, ''))
      .filter(ns => ns.length > 0);
    
    // Add new namespaces
    const allNamespaces = [...new Set([...existingNamespaces, ...newNamespaces])].sort();
    
    const newNamespacesString = allNamespaces.map(ns => `'${ns}'`).join(',\n  ');
    
    i18nContent = i18nContent.replace(
      /export const namespaces = \[([\s\S]*?)\]/,
      `export const namespaces = [\n  ${newNamespacesString}\n]`
    );
    
    fs.writeFileSync(i18nPath, i18nContent);
    console.log(`✅ Updated i18n.ts with ${newNamespaces.length} new namespaces`);
  }
}

// Function to update component imports
function updateComponentImports() {
  console.log('\n🔧 Updating component imports...\n');
  
  const updatedFiles = [];
  
  for (const { file, keys } of analysis.filesUsingCommon) {
    const filePath = path.join(__dirname, '../src', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Determine which namespace this component should use based on its keys
    const componentNamespace = determineNamespace(keys);
    
    if (componentNamespace) {
      // Update useTranslation call
      const useTranslationRegex = /useTranslation\(\)/g;
      if (useTranslationRegex.test(content)) {
        content = content.replace(useTranslationRegex, `useTranslation('${componentNamespace}')`);
        updated = true;
      }
      
      // Update useTranslation('common') calls
      const commonTranslationRegex = /useTranslation\(['"]common['"]\)/g;
      if (commonTranslationRegex.test(content)) {
        content = content.replace(commonTranslationRegex, `useTranslation('${componentNamespace}')`);
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${file} to use ${componentNamespace} namespace`);
        updatedFiles.push(file);
      }
    }
  }
  
  return updatedFiles;
}

// Function to determine which namespace a component should use
function determineNamespace(keys) {
  const keyCounts = {};
  
  for (const key of keys) {
    const topLevelKey = key.split('.')[0];
    
    for (const [namespace, keyList] of Object.entries(reorganizationMap)) {
      if (keyList.includes(topLevelKey)) {
        keyCounts[namespace] = (keyCounts[namespace] || 0) + 1;
      }
    }
  }
  
  // Return the namespace with the most matches
  if (Object.keys(keyCounts).length > 0) {
    return Object.entries(keyCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }
  
  return null;
}

// Function to remove extracted keys from common.json
function cleanupCommonJson() {
  console.log('\n🧹 Cleaning up common.json...\n');
  
  const allKeysToRemove = Object.values(reorganizationMap).flat();
  const cleanedData = {};
  
  for (const [key, value] of Object.entries(commonData)) {
    if (!allKeysToRemove.includes(key)) {
      cleanedData[key] = value;
    }
  }
  
  const backupPath = path.join(__dirname, '../src/i18n/locales/en/common.json.backup');
  fs.writeFileSync(backupPath, JSON.stringify(commonData, null, 2));
  console.log(`✅ Created backup: common.json.backup`);
  
  fs.writeFileSync(commonPath, JSON.stringify(cleanedData, null, 2));
  console.log(`✅ Cleaned common.json (removed ${Object.keys(commonData).length - Object.keys(cleanedData).length} keys)`);
  
  return Object.keys(cleanedData).length;
}

// Main execution
function main() {
  console.log('🚀 Starting common.json reorganization...\n');
  
  try {
    // Step 1: Create new translation files
    const createdFiles = createTranslationFiles();
    
    // Step 2: Update i18n configuration
    updateI18nConfig(createdFiles);
    
    // Step 3: Update component imports
    const updatedFiles = updateComponentImports();
    
    // Step 4: Clean up common.json
    const remainingKeys = cleanupCommonJson();
    
    console.log('\n🎉 Reorganization completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Created ${createdFiles.length} new translation files`);
    console.log(`   - Updated ${updatedFiles.length} component files`);
    console.log(`   - Removed ${Object.keys(commonData).length - remainingKeys} keys from common.json`);
    console.log(`   - ${remainingKeys} keys remaining in common.json`);
    
  } catch (error) {
    console.error('❌ Error during reorganization:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main }; 