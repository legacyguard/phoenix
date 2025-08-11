const fs = require('fs');
const path = require('path');

// Load the remaining common.json
const commonPath = path.join(__dirname, '../src/i18n/locales/en/common.json');
const commonData = JSON.parse(fs.readFileSync(commonPath, 'utf8'));

console.log('🧹 Final cleanup of common.json...\n');

// Merge actions into ui.json
console.log('📝 Merging actions into ui.json...');
const uiPath = path.join(__dirname, '../src/i18n/locales/en/ui.json');
const uiData = JSON.parse(fs.readFileSync(uiPath, 'utf8'));

if (commonData.actions) {
  // Merge actions, keeping ui.json actions as priority
  uiData.actions = { ...commonData.actions, ...uiData.actions };
  console.log(`✅ Merged ${Object.keys(commonData.actions).length} actions into ui.json`);
}

// Merge component into ui.json
if (commonData.component) {
  uiData.component = { ...uiData.component, ...commonData.component };
  console.log(`✅ Merged component keys into ui.json`);
}

// Merge dashboard content into dashboard.json
console.log('📊 Merging dashboard content...');
const dashboardPath = path.join(__dirname, '../src/i18n/locales/en/dashboard.json');
const dashboardData = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));

if (commonData.dashboard) {
  dashboardData.dashboard = { ...dashboardData.dashboard, ...commonData.dashboard };
  console.log(`✅ Merged dashboard keys into dashboard.json`);
}

// Move theme toggle keys to accessibility.json
console.log('🎨 Moving theme toggle keys...');
const accessibilityPath = path.join(__dirname, '../src/i18n/locales/en/accessibility.json');
const accessibilityData = JSON.parse(fs.readFileSync(accessibilityPath, 'utf8'));

// Extract theme toggle keys from common.json
const themeToggleKeys = {};
Object.keys(commonData).forEach(key => {
  if (key.startsWith('common.ThemeToggle.')) {
    const newKey = key.replace('common.ThemeToggle.', '');
    themeToggleKeys[newKey] = commonData[key];
  }
});

if (Object.keys(themeToggleKeys).length > 0) {
  accessibilityData.themeToggle = { ...accessibilityData.themeToggle, ...themeToggleKeys };
  console.log(`✅ Moved ${Object.keys(themeToggleKeys).length} theme toggle keys to accessibility.json`);
}

// Move retry status to micro-copy.json
console.log('🔄 Moving retry status...');
const microCopyPath = path.join(__dirname, '../src/i18n/locales/en/micro-copy.json');
const microCopyData = JSON.parse(fs.readFileSync(microCopyPath, 'utf8'));

Object.keys(commonData).forEach(key => {
  if (key.startsWith('common.RetryStatus.')) {
    const newKey = key.replace('common.RetryStatus.', '');
    if (!microCopyData.statusMessages) {
      microCopyData.statusMessages = {};
    }
    if (!microCopyData.statusMessages.retry) {
      microCopyData.statusMessages.retry = {};
    }
    microCopyData.statusMessages.retry[newKey] = commonData[key];
  }
});

// Save updated files
fs.writeFileSync(uiPath, JSON.stringify(uiData, null, 2));
fs.writeFileSync(dashboardPath, JSON.stringify(dashboardData, null, 2));
fs.writeFileSync(accessibilityPath, JSON.stringify(accessibilityData, null, 2));
fs.writeFileSync(microCopyPath, JSON.stringify(microCopyData, null, 2));

// Remove common.json entirely
const backupPath = path.join(__dirname, '../src/i18n/locales/en/common.json.final-backup');
fs.writeFileSync(backupPath, JSON.stringify(commonData, null, 2));
fs.unlinkSync(commonPath);

console.log('\n✅ Final cleanup completed!');
console.log(`📁 Removed common.json (${Object.keys(commonData).length} keys)`);
console.log(`💾 Final backup saved to: common.json.final-backup`);
console.log('\n🎉 common.json has been completely eliminated!');
console.log('📊 The i18n system is now fully modular with proper separation of concerns.'); 