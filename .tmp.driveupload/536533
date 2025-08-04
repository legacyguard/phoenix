#!/usr/bin/env node

/**
 * Development server for E2E tests
 * Uses the test entry point with mocked Clerk provider
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're in test mode
const isTestMode = process.env.NODE_ENV === 'test' || process.argv.includes('--test');

if (!isTestMode) {
  console.log('Starting dev server in test mode with mocked authentication...');
}

// Temporarily rename main.tsx and main.test.tsx to swap them
const mainPath = path.join(__dirname, '../src/main.tsx');
const mainTestPath = path.join(__dirname, '../src/main.test.tsx');
const mainBackupPath = path.join(__dirname, '../src/main.original.tsx');

// Backup original main.tsx
if (fs.existsSync(mainPath) && !fs.existsSync(mainBackupPath)) {
  fs.renameSync(mainPath, mainBackupPath);
}

// Use test main as the main entry point
if (fs.existsSync(mainTestPath)) {
  fs.copyFileSync(mainTestPath, mainPath);
}

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_TEST_MODE: 'true',
    NODE_ENV: 'test'
  }
});

// Restore original files on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

function cleanup() {
  console.log('\nRestoring original entry point...');
  
  // Restore original main.tsx
  if (fs.existsSync(mainBackupPath)) {
    fs.renameSync(mainBackupPath, mainPath);
  }
  
  // Kill vite process if still running
  if (vite && !vite.killed) {
    vite.kill();
  }
  
  process.exit();
}

vite.on('close', (code) => {
  cleanup();
});
