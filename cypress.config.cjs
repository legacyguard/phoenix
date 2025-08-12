const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/smoke/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
  },
});
