#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const localesDir = path.join(projectRoot, 'src', 'i18n', 'locales', 'en');

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function getAllKeys(obj, prefix = '') {
  const keys = new Set();
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  
  return keys;
}

function loadTranslationKeys() {
  const keyToNamespace = new Map();
  const namespaceToKeys = new Map();
  
  const files = fs.readdirSync(localesDir).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const namespace = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const keys = getAllKeys(data);
      
      namespaceToKeys.set(namespace, keys);
      
      keys.forEach(key => {
        if (!keyToNamespace.has(key)) {
          keyToNamespace.set(key, []);
        }
        keyToNamespace.get(key).push(namespace);
      });
    } catch (error) {
      console.error(`${colors.red}Error loading ${file}: ${error.message}${colors.reset}`);
    }
  }
  
  return { keyToNamespace, namespaceToKeys };
}

function fixNamespaceReferences() {
  console.log(`${colors.bold}${colors.blue}=== Fixing Namespace References ===${colors.reset}\n`);
  
  const { keyToNamespace, namespaceToKeys } = loadTranslationKeys();
  
  // Load the verification report to get the issues
  const reportPath = path.join(__dirname, 'namespace-verification-report.json');
  let report;
  
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    report = JSON.parse(reportContent);
  } catch (error) {
    console.error(`${colors.red}Error loading verification report: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Please run 'node scripts/verify-all-namespaces.mjs' first${colors.reset}`);
    return;
  }
  
  const filesToFix = new Map(); // file path -> list of fixes
  
  // Process wrong namespace references
  for (const issue of report.issues.wrongNamespace) {
    const filePath = path.join(projectRoot, issue.file);
    
    if (!filesToFix.has(filePath)) {
      filesToFix.set(filePath, []);
    }
    
    filesToFix.get(filePath).push({
      type: 'wrong-namespace',
      wrongReference: `${issue.usedNamespace}:${issue.key}`,
      correctReference: `${issue.correctNamespaces[0]}:${issue.key}`,
      line: issue.line
    });
  }
  
  // Process non-existent keys (remove them or comment them out)
  for (const issue of report.issues.keyNotFound) {
    const filePath = path.join(projectRoot, issue.file);
    
    // Skip test files for non-existent keys (they might be testing error cases)
    if (filePath.includes('__tests__') || filePath.includes('.test.')) {
      continue;
    }
    
    if (!filesToFix.has(filePath)) {
      filesToFix.set(filePath, []);
    }
    
    filesToFix.get(filePath).push({
      type: 'non-existent',
      reference: `${issue.namespace}:${issue.key}`,
      line: issue.line
    });
  }
  
  // Process invalid namespace references
  for (const issue of report.issues.namespaceNotFound) {
    const filePath = path.join(projectRoot, issue.file);
    
    if (!filesToFix.has(filePath)) {
      filesToFix.set(filePath, []);
    }
    
    // Try to find the correct namespace for the key
    const correctNamespaces = keyToNamespace.get(issue.key) || [];
    
    if (correctNamespaces.length > 0) {
      filesToFix.get(filePath).push({
        type: 'invalid-namespace',
        wrongReference: `${issue.namespace}:${issue.key}`,
        correctReference: `${correctNamespaces[0]}:${issue.key}`,
        line: issue.line
      });
    } else {
      filesToFix.get(filePath).push({
        type: 'non-existent',
        reference: `${issue.namespace}:${issue.key}`,
        line: issue.line
      });
    }
  }
  
  let totalFixed = 0;
  let filesFixed = 0;
  
  // Apply fixes to each file
  for (const [filePath, fixes] of filesToFix.entries()) {
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}Skipping non-existent file: ${path.relative(projectRoot, filePath)}${colors.reset}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedCount = 0;
    
    // Sort fixes by type and reference to ensure consistent replacements
    fixes.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.type === 'wrong-namespace' || a.type === 'invalid-namespace') {
        return b.wrongReference.length - a.wrongReference.length; // Longer references first
      }
      return b.reference.length - a.reference.length;
    });
    
    for (const fix of fixes) {
      if (fix.type === 'wrong-namespace' || fix.type === 'invalid-namespace') {
        // Replace wrong namespace with correct one
        const regex = new RegExp(
          `(['"\`])${fix.wrongReference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`,
          'g'
        );
        
        const newContent = content.replace(regex, `$1${fix.correctReference}$2`);
        
        if (newContent !== content) {
          content = newContent;
          fixedCount++;
        }
      } else if (fix.type === 'non-existent') {
        // For non-existent keys, we'll comment them out with a TODO
        const regex = new RegExp(
          `(\\s*)(.*)(['"\`])${fix.reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])(.*)`,
          'gm'
        );
        
        const newContent = content.replace(regex, (match, indent, before, q1, q2, after) => {
          // If it's already commented, leave it
          if (before.trim().startsWith('//') || before.trim().startsWith('/*')) {
            return match;
          }
          
          // Add a TODO comment and comment out the line
          return `${indent}// TODO: Fix missing translation key - ${fix.reference}\n${indent}// ${before}${q1}${fix.reference}${q2}${after}`;
        });
        
        if (newContent !== content) {
          content = newContent;
          fixedCount++;
        }
      }
    }
    
    if (fixedCount > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`${colors.green}Fixed ${fixedCount} references in: ${path.relative(projectRoot, filePath)}${colors.reset}`);
      totalFixed += fixedCount;
      filesFixed++;
    }
  }
  
  console.log(`\n${colors.bold}${colors.green}=== Fixes Applied ===${colors.reset}`);
  console.log(`Total references fixed: ${colors.cyan}${totalFixed}${colors.reset}`);
  console.log(`Files modified: ${colors.cyan}${filesFixed}${colors.reset}`);
  
  // Create a summary of remaining issues
  const remainingIssues = [];
  
  if (report.issues.keyNotFound.length > 0) {
    const nonTestKeys = report.issues.keyNotFound.filter(
      issue => !issue.file.includes('__tests__') && !issue.file.includes('.test.')
    );
    
    if (nonTestKeys.length > 0) {
      remainingIssues.push(
        `${colors.yellow}${nonTestKeys.length} non-existent keys were commented out and need manual review${colors.reset}`
      );
    }
  }
  
  if (remainingIssues.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}⚠️  Manual Review Needed:${colors.reset}`);
    remainingIssues.forEach(issue => console.log(`  - ${issue}`));
    console.log(`\n${colors.yellow}Search for "TODO: Fix missing translation key" in the codebase to find them.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ All namespace references have been fixed!${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Next step: Run 'node scripts/verify-all-namespaces.mjs' again to confirm all issues are resolved.${colors.reset}`);
}

// Run the fix
fixNamespaceReferences();
