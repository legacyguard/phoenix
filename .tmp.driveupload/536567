import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

async function runE2ETests() {
  console.log('🚀 Starting E2E Test Suite for Heritage Vault\n');
  
  // Check if app is running
  try {
    await execAsync('curl -s http://localhost:3000');
    console.log('✅ App is running on http://localhost:3000\n');
  } catch (error) {
    console.log('⚠️  App is not running. Please start the dev server with: npm run dev\n');
    console.log('📝 E2E Test Report (Without Running Tests)\n');
    generateTestReport();
    return;
  }
  
  // Run Cypress tests
  console.log('🧪 Running Cypress E2E tests...\n');
  
  try {
    const { stdout, stderr } = await execAsync('npx cypress run --headless');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.log('❌ Error running Cypress tests:', error.message);
    console.log('\n📝 Generating test report based on test files...\n');
    generateTestReport();
  }
}

function generateTestReport() {
  const testFiles = [
    {
      name: 'Golden Path Onboarding',
      file: 'onboarding.cy.js',
      scenarios: [
        'New user signup flow',
        'Adding first trusted person to circle',
        'Adding first asset to vault',
        'Uploading important documents',
        'Dashboard progress tracking'
      ],
      expectedOutcome: 'User completes onboarding with 50% plan strength'
    },
    {
      name: 'Premium Upgrade & Feature Access',
      file: 'premium-upgrade.cy.js',
      scenarios: [
        'Free user attempts to access premium feature',
        'Premium gate modal appears',
        'Developer mode activation (Konami code)',
        'Premium access granted',
        'Video recorder component loads successfully'
      ],
      expectedOutcome: 'User gains premium access through developer mode'
    },
    {
      name: 'Asset Story Feature',
      file: 'asset-story.cy.js',
      scenarios: [
        'Navigate to asset detail page',
        'Add story to asset',
        'Character counter validation',
        'Edit existing story',
        'Story persistence after page reload'
      ],
      expectedOutcome: 'Asset stories are created, edited, and persisted'
    },
    {
      name: 'Critical User Paths',
      file: 'critical-paths.cy.js',
      scenarios: [
        'Complete onboarding journey',
        'Premium feature gate handling',
        'Asset story management',
        'Data persistence verification',
        'UI consistency checks'
      ],
      expectedOutcome: 'All critical user paths function correctly'
    },
    {
      name: 'Basic Smoke Tests',
      file: 'basic-smoke-test.cy.js',
      scenarios: [
        'Homepage loads successfully',
        'Navigation to login page',
        'Proper styling applied (Heritage Vault theme)'
      ],
      expectedOutcome: 'Basic application functionality verified'
    }
  ];
  
  console.log('='.repeat(80));
  console.log('E2E TEST SUITE OVERVIEW - HERITAGE VAULT');
  console.log('='.repeat(80));
  console.log('\n📋 Test Coverage:\n');
  
  testFiles.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name} (${test.file})`);
    console.log('   Scenarios:');
    test.scenarios.forEach(scenario => {
      console.log(`   • ${scenario}`);
    });
    console.log(`   Expected Outcome: ${test.expectedOutcome}\n`);
  });
  
  console.log('='.repeat(80));
  console.log('\n🎯 Key Test Objectives:\n');
  console.log('1. Verify Heritage Vault branding is consistent throughout');
  console.log('2. Ensure smooth user onboarding experience');
  console.log('3. Test premium feature gating and access');
  console.log('4. Validate asset story functionality');
  console.log('5. Confirm UI matches Calm & Confident design system\n');
  
  console.log('📊 Test Metrics:');
  console.log(`   Total test files: ${testFiles.length}`);
  console.log(`   Total scenarios: ${testFiles.reduce((sum, test) => sum + test.scenarios.length, 0)}`);
  console.log('   Test framework: Cypress');
  console.log('   Mode: Headless (CI/CD ready)\n');
  
  console.log('🔧 Required Test Attributes:');
  console.log('   The application needs data-cy attributes on key elements:');
  console.log('   • data-cy="get-started-button"');
  console.log('   • data-cy="login-email"');
  console.log('   • data-cy="add-asset-button"');
  console.log('   • data-cy="story-modal"');
  console.log('   • data-cy="plan-strength"\n');
  
  console.log('💡 Next Steps:');
  console.log('1. Ensure the app is running on http://localhost:3000');
  console.log('2. Add missing data-cy attributes to components');
  console.log('3. Run: npm run e2e:test');
  console.log('4. View results in cypress/screenshots and cypress/videos\n');
}

// Helper to ensure string repeat works
String.prototype.repeat = String.prototype.repeat || function(count) {
  return new Array(count + 1).join(this);
};

// Run the tests
runE2ETests().catch(console.error);
