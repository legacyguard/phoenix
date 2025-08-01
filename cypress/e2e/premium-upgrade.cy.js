describe('Premium Upgrade & Feature Use Test', () => {
  beforeEach(() => {
    // Login as existing free user
    cy.visit('/login');
    cy.get('[data-cy=login-email]').type('freeuser@example.com');
    cy.get('[data-cy=login-password]').type('Password123');
    cy.get('[data-cy=login-submit]').click();
  });

  it('should show premium gate and allow access after developer mode activation', () => {
    // Navigate to TimeCapsule
    cy.visit('/time-capsule');
    
    // Attempt to record video as free user
    cy.get('[data-cy=record-video-button]').click();
    
    // Verify premium gate appears
    cy.get('[data-cy=premium-gate-modal]').should('be.visible');
    cy.get('[data-cy=premium-gate-message]').should('contain', 'Premium feature');
    
    // Use Developer Mode magic button
    cy.get('[data-cy=dev-mode-button]').click();
    cy.get('[data-cy=grant-premium-access]').click();
    
    // Verify premium access granted
    cy.get('[data-cy=premium-gate-modal]').should('not.exist');
    
    // Re-attempt video recording
    cy.get('[data-cy=record-video-button]').click();
    
    // Verify VideoRecorder component loads
    cy.get('[data-cy=video-recorder]').should('be.visible');
    cy.get('[data-cy=start-recording]').should('be.visible');
    cy.get('[data-cy=video-preview]').should('exist');
  });
});
