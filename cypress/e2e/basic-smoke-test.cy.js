describe('Heritage Vault Basic Smoke Tests', () => {
  it('should load the homepage', () => {
    // Visit the homepage
    cy.visit('/');
    
    // Check that the page loads
    cy.contains('Heritage Vault').should('be.visible');
    
    // Check for key elements
    cy.get('body').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/');
    
    // Look for login link or button
    cy.contains('Sign In').click();
    
    // Should be on login page
    cy.url().should('include', '/login');
    
    // Check for login form elements
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should have proper styling', () => {
    cy.visit('/');
    
    // Check that the background color matches our design
    cy.get('body').should('have.css', 'background-color')
      .and('match', /rgb\(249, 246, 242\)/); // #F9F6F2
  });
});
