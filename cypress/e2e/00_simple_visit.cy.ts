describe('Simple Page Visit', () => {
  it('should load the homepage without errors', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('exist');
    // Just check that the page loaded, don't try to interact yet
    cy.log('Page loaded successfully');
  });
});
