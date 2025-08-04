#!/usr/bin/env node

/**
 * Visual Regression Testing Helper Script
 * 
 * Usage:
 * - npm run test:visual              - Run visual regression tests
 * - npm run test:visual:update       - Update baseline screenshots
 * - npm run test:visual:report       - Open the HTML report
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const command = process.argv[2] || 'test';

switch (command) {
  case 'test':
    console.log('🎨 Running visual regression tests...');
    runTests();
    break;
    
  case 'update':
    console.log('📸 Updating baseline screenshots...');
    updateSnapshots();
    break;
    
  case 'report':
    console.log('📊 Opening visual regression report...');
    openReport();
    break;
    
  case 'clean':
    console.log('🧹 Cleaning visual regression artifacts...');
    cleanArtifacts();
    break;
    
  default:
    console.log('Unknown command:', command);
    showHelp();
}

function runTests() {
  const playwright = spawn('npx', [
    'playwright', 
    'test', 
    'visual-regression.spec.ts',
    '--project=chromium' // Run only on chromium for consistency
  ], {
    stdio: 'inherit',
    shell: true
  });
  
  playwright.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Visual regression tests passed!');
    } else {
      console.log('❌ Visual regression tests failed. Check the report for details.');
      console.log('💡 To update snapshots, run: npm run test:visual:update');
    }
    process.exit(code);
  });
}

function updateSnapshots() {
  const playwright = spawn('npx', [
    'playwright', 
    'test', 
    'visual-regression.spec.ts',
    '--project=chromium',
    '--update-snapshots'
  ], {
    stdio: 'inherit',
    shell: true
  });
  
  playwright.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Baseline screenshots updated successfully!');
      console.log('⚠️  Remember to review and commit the updated snapshots.');
    } else {
      console.log('❌ Failed to update snapshots.');
    }
    process.exit(code);
  });
}

function openReport() {
  const report = spawn('npx', ['playwright', 'show-report'], {
    stdio: 'inherit',
    shell: true
  });
  
  report.on('error', () => {
    console.log('❌ Could not open report. Make sure you have run the tests first.');
  });
}

function cleanArtifacts() {
  const artifactDirs = [
    'test-results',
    'playwright-report',
    'tests/e2e/visual-regression.spec.ts-snapshots'
  ];
  
  artifactDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️  Removed ${dir}`);
    }
  });
  
  console.log('✅ Visual regression artifacts cleaned!');
}

function showHelp() {
  console.log(`
Visual Regression Testing Helper

Usage:
  node scripts/visual-regression-helper.js [command]

Commands:
  test      Run visual regression tests (default)
  update    Update baseline screenshots
  report    Open the HTML report
  clean     Clean visual regression artifacts

Examples:
  npm run test:visual              # Run tests
  npm run test:visual:update       # Update snapshots
  npm run test:visual:report       # View report
  `);
}
