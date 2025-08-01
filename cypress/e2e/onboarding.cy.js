describe('Golden Path Onboarding Test', () => {
  it('should complete the onboarding process and increase plan strength', () => {
    // Sign up
    cy.visit('/');
    cy.get('[data-cy=sign-up-email]').type('newuser@example.com');
    cy.get('[data-cy=sign-up-password]').type('Password123');
    cy.get('[data-cy=sign-up-submit]').click();

    // Add Trusted Person
    cy.visit('/trusted-circle');
    cy.get('[data-cy=add-trusted-person]').click();
    cy.get('[data-cy=trusted-person-name]').type('Alice');
    cy.get('[data-cy=trusted-person-email]').type('alice@example.com');
    cy.get('[data-cy=save-trusted-person]').click();
    
    // Add Asset
    cy.visit('/vault');
    cy.get('[data-cy=add-asset]').click();
    cy.get('[data-cy=asset-name]').type('House');
    cy.get('[data-cy=asset-value]').type('300000');
    cy.get('[data-cy=save-asset]').click();

    // Upload Document
    cy.get('[data-cy=upload-document]').attachFile('document.pdf');
    cy.get('[data-cy=submit-document]').click();

    // Verify Dashboard
    cy.visit('/dashboard');
    cy.get('[data-cy=plan-strength]').should('contain', 'Increased');
    cy.get('[data-cy=next-recommended-step]').should('contain', 'Update');
  });
});
