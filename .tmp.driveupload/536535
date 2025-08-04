#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Konfigurácia
const config = {
  srcPath: path.join(__dirname, '../src'),
  componentsToUpdate: [
    'DocumentUpload',
    'GuardianUpload', 
    'Dashboard',
    'AssetDetail',
    'Manual',
    'Will',
    'GuardianView',
    'StrategicSummary'
  ],
  backupDir: path.join(__dirname, '../backup-before-retry')
};

// Funkcia na kontrolu, či súbor už používa retry
function hasRetryMechanism(content) {
  return content.includes('retry') || 
         content.includes('supabaseWithRetry') ||
         content.includes('useRetry');
}

// Funkcia na nahradenie supabase importu
function replaceSupabaseImport(content) {
  // Nájdi existujúci import supabase
  const supabaseImportRegex = /import\s*{\s*supabase\s*}\s*from\s*['"]@\/integrations\/supabase\/client['"];?/g;
  
  if (supabaseImportRegex.test(content)) {
    // Nahraď import
    content = content.replace(
      supabaseImportRegex,
      "import { supabaseWithRetry } from '@/utils/supabaseWithRetry';\nimport { useRetry } from '@/utils/retry';\nimport { RetryStatus } from '@/components/common/RetryStatus';"
    );
    
    // Nahraď všetky výskyty 'supabase.' na 'supabaseWithRetry.'
    content = content.replace(/\bsupabase\./g, 'supabaseWithRetry.');
  }
  
  return content;
}

// Funkcia na pridanie retry statusu do JSX
function addRetryStatusComponent(content, componentName) {
  // Nájdi return statement komponentu
  const returnRegex = /return\s*\(([\s\S]*?)\);\s*}/;
  const match = content.match(returnRegex);
  
  if (match) {
    const returnContent = match[1];
    
    // Pridaj RetryStatus komponent na začiatok
    const updatedReturn = `
      <>
        <RetryStatus 
          isRetrying={false}
          attemptCount={0}
          error={null}
          showOfflineStatus={true}
        />
        ${returnContent}
      </>`;
    
    content = content.replace(match[0], `return (${updatedReturn}\n  );\n}`);
  }
  
  return content;
}

// Funkcia na pridanie retry logiky do async funkcií
function addRetryToAsyncFunctions(content) {
  // Regex na nájdenie async funkcií s try-catch
  const asyncFunctionRegex = /const\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*{[\s\S]*?try\s*{([\s\S]*?)}[\s\S]*?catch/g;
  
  let modified = content;
  let match;
  
  while ((match = asyncFunctionRegex.exec(content)) !== null) {
    const functionName = match[1];
    const tryContent = match[2];
    
    // Ak obsahuje supabase volanie, pridaj retry wrapper
    if (tryContent.includes('supabaseWithRetry')) {
      console.log(`  - Pridávam retry logiku do funkcie: ${functionName}`);
      
      // Tu by sme mohli pridať špecifickú retry logiku
      // Pre teraz len logujeme, že funkcia už používa supabaseWithRetry
    }
  }
  
  return modified;
}

// Funkcia na spracovanie súboru
function processFile(filePath, componentName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skontroluj, či už má retry mechanizmus
    if (hasRetryMechanism(content)) {
      console.log(`⏭️  Preskočené (už má retry): ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
    // 1. Nahraď supabase import
    content = replaceSupabaseImport(content);
    
    // 2. Pridaj retry status komponent
    // content = addRetryStatusComponent(content, componentName);
    
    // 3. Pridaj retry logiku do async funkcií
    content = addRetryToAsyncFunctions(content);
    
    // Ak sa nič nezmenilo, preskoč
    if (content === originalContent) {
      console.log(`⏭️  Žiadne zmeny: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
    // Vytvor backup
    const backupPath = path.join(config.backupDir, path.relative(config.srcPath, filePath));
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, backupPath);
    
    // Zapíš upravený súbor
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Pridaný retry mechanizmus: ${path.relative(process.cwd(), filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Chyba pri spracovaní ${filePath}:`, error.message);
    return false;
  }
}

// Hlavná funkcia
async function main() {
  console.log('🔄 Pridávam retry mechanizmus do komponentov...\n');
  
  // Vytvor backup adresár
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
  
  let processedCount = 0;
  
  // Spracuj komponenty
  for (const componentName of config.componentsToUpdate) {
    const patterns = [
      `**/pages/${componentName}.tsx`,
      `**/components/**/${componentName}.tsx`
    ];
    
    for (const pattern of patterns) {
      const files = glob.sync(path.join(config.srcPath, pattern));
      for (const file of files) {
        if (processFile(file, componentName)) {
          processedCount++;
        }
      }
    }
  }
  
  console.log('\n📊 Súhrn:');
  console.log(`- Spracovaných súborov: ${processedCount}`);
  
  if (processedCount > 0) {
    console.log(`\n💾 Backup pôvodných súborov: ${path.relative(process.cwd(), config.backupDir)}`);
    console.log('\n⚠️  Nezabudnite:');
    console.log('  1. Skontrolovať a otestovať zmeny');
    console.log('  2. Pridať špecifickú retry logiku kde je to potrebné');
    console.log('  3. Nastaviť správne retry podmienky pre rôzne typy chýb');
  }
  
  console.log('\n✨ Hotovo!');
}

// Spusti skript
main().catch(console.error);
