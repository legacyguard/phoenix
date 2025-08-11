// ***********************************************
// Custom commands for Heritage Vault E2E tests
// ***********************************************

import "cypress-file-upload";

// Authentication Commands
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get("[data-cy=login-email]").type(email);
  cy.get("[data-cy=login-password]").type(password);
  cy.get("[data-cy=login-submit]").click();
  cy.url().should("not.include", "/login");
});

Cypress.Commands.add("logout", () => {
  cy.get("[data-cy=user-menu]").click();
  cy.get("[data-cy=logout-button]").click();
  cy.url().should("include", "/login");
});

// Data Setup Commands
Cypress.Commands.add("createTestUser", (userData) => {
  return cy.request("POST", "/api/test/create-user", userData);
});

Cypress.Commands.add("seedTestData", (userId) => {
  return cy.request("POST", "/api/test/seed-data", { userId });
});

// Navigation Commands
Cypress.Commands.add("navigateToVault", () => {
  cy.get("[data-cy=nav-vault]").click();
  cy.url().should("include", "/vault");
});

Cypress.Commands.add("navigateToTrustedCircle", () => {
  cy.get("[data-cy=nav-trusted-circle]").click();
  cy.url().should("include", "/trusted-circle");
});

Cypress.Commands.add("navigateToDashboard", () => {
  cy.get("[data-cy=nav-dashboard]").click();
  cy.url().should("include", "/dashboard");
});

// Asset Commands
Cypress.Commands.add("addAsset", (assetData) => {
  cy.get("[data-cy=add-asset-button]").click();
  cy.get("[data-cy=asset-name]").type(assetData.name);
  cy.get("[data-cy=asset-value]").type(assetData.value);
  if (assetData.category) {
    cy.get("[data-cy=asset-category]").select(assetData.category);
  }
  if (assetData.description) {
    cy.get("[data-cy=asset-description]").type(assetData.description);
  }
  cy.get("[data-cy=save-asset]").click();
  cy.get("[data-cy=asset-card]").should("contain", assetData.name);
});

// Trusted Person Commands
Cypress.Commands.add("addTrustedPerson", (personData) => {
  cy.get("[data-cy=add-person-button]").click();
  cy.get("[data-cy=person-name]").type(personData.name);
  cy.get("[data-cy=person-email]").type(personData.email);
  if (personData.relationship) {
    cy.get("[data-cy=person-relationship]").select(personData.relationship);
  }
  if (personData.phone) {
    cy.get("[data-cy=person-phone]").type(personData.phone);
  }
  cy.get("[data-cy=save-person]").click();
  cy.get("[data-cy=person-card]").should("contain", personData.name);
});

// Story Commands
Cypress.Commands.add("addAssetStory", (storyText) => {
  cy.get("[data-cy=add-story-button]").click();
  cy.get("[data-cy=story-textarea]").type(storyText);
  cy.get("[data-cy=save-story]").click();
  cy.get("[data-cy=story-modal]").should("not.exist");
  cy.get("[data-cy=story-text]").should("contain", storyText);
});

// Developer Mode Commands
Cypress.Commands.add("enableDeveloperMode", () => {
  // Konami code
  cy.get("body").type(
    "{upArrow}{upArrow}{downArrow}{downArrow}{leftArrow}{rightArrow}{leftArrow}{rightArrow}ba",
  );
  cy.get("[data-cy=dev-panel]").should("be.visible");
});

Cypress.Commands.add("grantPremiumAccess", () => {
  cy.enableDeveloperMode();
  cy.get("[data-cy=grant-premium]").click();
  cy.get("[data-cy=toast-message]").should("contain", "Premium access granted");
});

// Utility Commands
Cypress.Commands.add("checkPlanStrength", (expectedValue) => {
  cy.get("[data-cy=plan-strength]").should("contain", expectedValue);
});

Cypress.Commands.add("checkNextStep", (expectedText) => {
  cy.get("[data-cy=next-step]").should("contain", expectedText);
});

// File Upload Helper
Cypress.Commands.add("uploadDocument", (fileName, documentName) => {
  cy.fixture(fileName).then((fileContent) => {
    cy.get("[data-cy=document-upload]").attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName,
      mimeType: "application/pdf",
    });
  });
  cy.get("[data-cy=document-name]").type(documentName);
  cy.get("[data-cy=upload-submit]").click();
  cy.get("[data-cy=document-list]").should("contain", documentName);
});

// Toast/Notification Commands
Cypress.Commands.add("checkToastMessage", (message) => {
  cy.get("[data-cy=toast-message]")
    .should("be.visible")
    .and("contain", message);
});

Cypress.Commands.add("dismissToast", () => {
  cy.get("[data-cy=toast-close]").click();
  cy.get("[data-cy=toast-message]").should("not.exist");
});

// Modal Commands
Cypress.Commands.add("closeModal", () => {
  cy.get("[data-cy=close-modal]").click();
  cy.get("[data-cy=modal]").should("not.exist");
});

// Assertion Helpers
Cypress.Commands.add("shouldBeOnDashboard", () => {
  cy.url().should("include", "/dashboard");
  cy.get("[data-cy=dashboard-header]").should("be.visible");
});

Cypress.Commands.add("shouldHavePremiumAccess", () => {
  cy.get("[data-cy=premium-badge]").should("be.visible");
});
