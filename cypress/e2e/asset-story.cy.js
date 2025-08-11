describe("Asset Story E2E Test", () => {
  beforeEach(() => {
    // Login as existing user with assets
    cy.visit("/login");
    cy.get("[data-cy=login-email]").type("user@example.com");
    cy.get("[data-cy=login-password]").type("Password123");
    cy.get("[data-cy=login-submit]").click();
  });

  it("should add and display a story for an asset", () => {
    // Navigate to Vault
    cy.visit("/vault");

    // Click on an existing asset
    cy.get("[data-cy=asset-card]").first().click();

    // Verify asset detail page loads
    cy.url().should("include", "/vault/");

    // Click "Add a Story" button
    cy.get("[data-cy=add-story-button]").click();

    // Verify story modal opens
    cy.get("[data-cy=story-modal]").should("be.visible");

    // Type story text
    const storyText =
      "This family heirloom was passed down from my grandmother. She received it as a wedding gift in 1945, and it has been in our family ever since. It represents the strength and love that has bound our family together through generations.";
    cy.get("[data-cy=story-textarea]").type(storyText);

    // Verify character counter
    cy.get("[data-cy=character-counter]").should("contain", storyText.length);

    // Save the story
    cy.get("[data-cy=save-story-button]").click();

    // Verify modal closes
    cy.get("[data-cy=story-modal]").should("not.exist");

    // Verify story is displayed on asset detail page
    cy.get("[data-cy=asset-story-section]").should("be.visible");
    cy.get("[data-cy=asset-story-text]").should("contain", storyText);
    cy.get("[data-cy=edit-story-button]").should("be.visible");

    // Test editing the story
    cy.get("[data-cy=edit-story-button]").click();

    // Verify modal opens with existing story
    cy.get("[data-cy=story-modal]").should("be.visible");
    cy.get("[data-cy=story-textarea]").should("have.value", storyText);

    // Add to the story
    const additionalText = " I hope to pass this on to my children one day.";
    cy.get("[data-cy=story-textarea]").type(additionalText);

    // Save updated story
    cy.get("[data-cy=save-story-button]").click();

    // Verify updated story is displayed
    cy.get("[data-cy=asset-story-text]").should(
      "contain",
      storyText + additionalText,
    );
  });

  it("should handle empty story state correctly", () => {
    // Navigate to Vault
    cy.visit("/vault");

    // Click on an asset without a story
    cy.get("[data-cy=asset-card]").last().click();

    // Verify empty state is displayed
    cy.get("[data-cy=empty-story-state]").should("be.visible");
    cy.get("[data-cy=empty-story-prompt]").should(
      "contain",
      "Every asset has a story",
    );
    cy.get("[data-cy=add-story-button]").should("be.visible");
  });
});
