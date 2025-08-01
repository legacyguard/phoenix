// ***********************************************************
// This file is processed and loaded automatically before test files.
// Add global configuration and behavior that modifies Cypress here.
// ***********************************************************

import './commands';

// Disable uncaught exception handling to prevent test failures from app errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Configure viewport for consistent testing
beforeEach(() => {
  cy.viewport(1280, 720);
});
