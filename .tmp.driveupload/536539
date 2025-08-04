#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Konfigurácia
const config = {
  srcPath: path.join(__dirname, '../src'),
  componentsToWrap: {
    // Hlavné stránky, ktoré potrebujú Error Boundary
    pages: [
      'Dashboard',
      'AssetDetail', 
      'Manual',
      'Will',
      'GuardianView',
      'InviteAcceptance'
    ],
    // Komponenty s async operáciami
    asyncComponents: [
      'DocumentUpload',
      'GuardianUpload',
      'StrategicSummary',
      'GuardianCard',
      'DocumentCard'
    ]
  },
  backupDir: path.join(__dirname, '../backup-before-error-boundaries')
};

// Funkcia na kontrolu, či súbor už má Error Boundary
function hasErrorBoundary(content) {
  return content.includes('ErrorBoundary') || 
         content.includes('AsyncErrorBoundary') ||
         content.includes('withAsyncErrorBoundary');
}

// Funkcia na pridanie importu Error Boundary
function addErrorBoundaryImport(content, isAsync = false) {
  const importStatement = isAsync
    ? "import { AsyncErrorBoundary } from '@/components/common/AsyncErrorBoundary';"
    : "import { ErrorBoundary } from '@/components/common/ErrorBoundary';";

  // Nájdi posledný import
  const importRegex = /^import.*from.*;$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    
    return content.slice(0, lastImportIndex + lastImport.length) + 
           '\n' + importStatement + 
           content.slice(lastImportIndex + lastImport.length);
  }
  
  return importStatement + '\n' + content;
}

// Funkcia na obalenie komponentu do Error Boundary
function wrapComponentInErrorBoundary(content, componentName, isAsync = false) {
  // Regex na nájdenie return statement komponentu
  const componentRegex = new RegExp(
    `export\\s+(?:const|function)\\s+${componentName}[\\s\\S]*?return\\s*\\([\\s\\S]*?\\)\\s*;`, 
    'g'
  );
  
  let modified = content;
  
  // Pre funkčné komponenty
  const functionalMatch = content.match(componentRegex);
  if (functionalMatch) {
    const originalReturn = functionalMatch[0];
    
    // Extrahuj return obsah
    const returnMatch = originalReturn.match(/return\s*\(([\s\S]*)\)\s*;/);
    if (returnMatch) {
      const returnContent = returnMatch[1].trim();
      
      const wrappedReturn = isAsync
        ? `return (
    <AsyncErrorBoundary>
      ${returnContent}
    </AsyncErrorBoundary>
  );`
        : `return (
    <ErrorBoundary>
      ${returnContent}
    </ErrorBoundary>
  );`;
      
      modified = content.replace(originalReturn, 
        originalReturn.replace(/return\s*\([\s\S]*\)\s*;/, wrappedReturn)
      );
    }
  }
  
  return modified;
}

// Funkcia na spracovanie súboru
function processFile(filePath, componentName, isAsync = false) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skontroluj, či už má Error Boundary
    if (hasErrorBoundary(content)) {
      console.log(`⏭️  Preskočené (už má Error Boundary): ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
    // Pridaj import
    content = addErrorBoundaryImport(content, isAsync);
    
    // Obal komponent
    content = wrapComponentInErrorBoundary(content, componentName, isAsync);
    
    // Vytvor backup
    const backupPath = path.join(config.backupDir, path.relative(config.srcPath, filePath));
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, backupPath);
    
    // Zapíš upravený súbor
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Pridaná ${isAsync ? 'AsyncErrorBoundary' : 'ErrorBoundary'}: ${path.relative(process.cwd(), filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Chyba pri spracovaní ${filePath}:`, error.message);
    return false;
  }
}

// Hlavná funkcia
async function main() {
  console.log('🔍 Pridávam Error Boundaries do komponentov...\n');
  
  // Vytvor backup adresár
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
  
  let processedCount = 0;
  
  // Spracuj pages komponenty
  console.log('📄 Spracovávam stránky...');
  for (const componentName of config.componentsToWrap.pages) {
    const patterns = [
      `**/pages/${componentName}.tsx`,
      `**/pages/${componentName}/index.tsx`
    ];
    
    for (const pattern of patterns) {
      const files = glob.sync(path.join(config.srcPath, pattern));
      for (const file of files) {
        if (processFile(file, componentName, false)) {
          processedCount++;
        }
      }
    }
  }
  
  console.log('\n🔄 Spracovávam async komponenty...');
  // Spracuj async komponenty
  for (const componentName of config.componentsToWrap.asyncComponents) {
    const patterns = [
      `**/components/**/${componentName}.tsx`,
      `**/components/**/${componentName}/index.tsx`
    ];
    
    for (const pattern of patterns) {
      const files = glob.sync(path.join(config.srcPath, pattern));
      for (const file of files) {
        if (processFile(file, componentName, true)) {
          processedCount++;
        }
      }
    }
  }
  
  console.log('\n📊 Súhrn:');
  console.log(`- Spracovaných komponentov: ${processedCount}`);
  
  if (processedCount > 0) {
    console.log(`\n💾 Backup pôvodných súborov: ${path.relative(process.cwd(), config.backupDir)}`);
  }
  
  console.log('\n✨ Hotovo!');
}

// Spusti skript
main().catch(console.error);
