describe('Heritage Vault Critical Path E2E Tests', () => {
  // Test data
  const testUser = {
    email: 'e2e-test-' + Date.now() + '@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User'
  };

  const trustedPerson = {
    name: 'John Guardian',
    email: 'guardian@example.com',
    relationship: 'Brother',
    phone: '+1234567890'
  };

  const asset = {
    name: 'Family Home',
    value: '450000',
    description: 'Our family home in the suburbs',
    category: 'real_estate'
  };

  const assetStory = 'This home has been in our family for three generations. My grandparents built it in 1952 with their own hands. Every room holds precious memories of family gatherings, celebrations, and the everyday moments that make a house a home.';

  describe('Golden Path Onboarding', () => {
    it('should complete full onboarding journey and verify dashboard updates', () => {
      // Step 1: Sign up new user
      cy.visit('/');
      cy.get('[data-cy=get-started-button]').click();
      
      // Fill signup form
      cy.get('[data-cy=signup-email]').type(testUser.email);
      cy.get('[data-cy=signup-password]').type(testUser.password);
      cy.get('[data-cy=signup-fullname]').type(testUser.fullName);
      cy.get('[data-cy=signup-submit]').click();
      
      // Verify redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=welcome-message]').should('contain', 'Welcome to Heritage Vault');
      
      // Check initial plan strength
      cy.get('[data-cy=plan-strength]').should('contain', '0%');
      cy.get('[data-cy=next-step]').should('contain', 'Add your first trusted person');
      
      // Step 2: Add Trusted Person
      cy.get('[data-cy=next-step-button]').click();
      cy.url().should('include', '/trusted-circle');
      
      cy.get('[data-cy=add-person-button]').click();
      cy.get('[data-cy=person-name]').type(trustedPerson.name);
      cy.get('[data-cy=person-email]').type(trustedPerson.email);
      cy.get('[data-cy=person-relationship]').select(trustedPerson.relationship);
      cy.get('[data-cy=person-phone]').type(trustedPerson.phone);
      cy.get('[data-cy=save-person]').click();
      
      // Verify person added
      cy.get('[data-cy=person-card]').should('contain', trustedPerson.name);
      
      // Return to dashboard and check progress
      cy.visit('/dashboard');
      cy.get('[data-cy=plan-strength]').should('contain', '25%');
      cy.get('[data-cy=next-step]').should('contain', 'Add your first asset');
      
      // Step 3: Add Asset
      cy.get('[data-cy=next-step-button]').click();
      cy.url().should('include', '/vault');
      
      cy.get('[data-cy=add-asset-button]').click();
      cy.get('[data-cy=asset-name]').type(asset.name);
      cy.get('[data-cy=asset-value]').type(asset.value);
      cy.get('[data-cy=asset-category]').select(asset.category);
      cy.get('[data-cy=asset-description]').type(asset.description);
      cy.get('[data-cy=save-asset]').click();
      
      // Verify asset added
      cy.get('[data-cy=asset-card]').should('contain', asset.name);
      
      // Step 4: Upload Document
      cy.get('[data-cy=asset-card]').first().click();
      cy.get('[data-cy=upload-document-button]').click();
      
      // Create and upload test file
      const fileName = 'property-deed.pdf';
      cy.fixture(fileName).then(fileContent => {
        cy.get('[data-cy=document-upload]').attachFile({
          fileContent: fileContent.toString(),
          fileName: fileName,
          mimeType: 'application/pdf'
        });
      });
      
      cy.get('[data-cy=document-name]').type('Property Deed');
      cy.get('[data-cy=upload-submit]').click();
      
      // Verify document uploaded
      cy.get('[data-cy=document-list]').should('contain', 'Property Deed');
      
      // Final dashboard check
      cy.visit('/dashboard');
      cy.get('[data-cy=plan-strength]').should('contain', '50%');
      cy.get('[data-cy=pillar-security]').should('have.class', 'active');
      cy.get('[data-cy=pillar-vault]').should('have.class', 'active');
    });
  });

  describe('Premium Upgrade & Feature Access', () => {
    beforeEach(() => {
      // Login with test user
      cy.visit('/login');
      cy.get('[data-cy=login-email]').type(testUser.email);
      cy.get('[data-cy=login-password]').type(testUser.password);
      cy.get('[data-cy=login-submit]').click();
    });

    it('should handle premium gate and developer mode access', () => {
      // Navigate to Time Capsule
      cy.visit('/time-capsule');
      
      // Try to access premium feature
      cy.get('[data-cy=create-video-capsule]').click();
      
      // Premium gate should appear
      cy.get('[data-cy=premium-modal]').should('be.visible');
      cy.get('[data-cy=premium-title]').should('contain', 'Premium Feature');
      cy.get('[data-cy=upgrade-button]').should('be.visible');
      
      // Close modal
      cy.get('[data-cy=close-modal]').click();
      
      // Enable developer mode (Konami code)
      cy.get('body').type('{upArrow}{upArrow}{downArrow}{downArrow}{leftArrow}{rightArrow}{leftArrow}{rightArrow}ba');
      
      // Developer panel should appear
      cy.get('[data-cy=dev-panel]').should('be.visible');
      cy.get('[data-cy=grant-premium]').click();
      
      // Confirmation
      cy.get('[data-cy=toast-message]').should('contain', 'Premium access granted');
      
      // Try premium feature again
      cy.get('[data-cy=create-video-capsule]').click();
      
      // Video recorder should load
      cy.get('[data-cy=video-recorder]').should('be.visible');
      cy.get('[data-cy=record-button]').should('be.visible');
      cy.get('[data-cy=camera-preview]').should('exist');
      
      // Test recording
      cy.get('[data-cy=record-button]').click();
      cy.wait(3000); // Record for 3 seconds
      cy.get('[data-cy=stop-button]').click();
      
      // Preview should show
      cy.get('[data-cy=video-preview]').should('be.visible');
      cy.get('[data-cy=save-video]').should('be.visible');
    });
  });

  describe('Asset Story Feature', () => {
    beforeEach(() => {
      // Login with test user
      cy.visit('/login');
      cy.get('[data-cy=login-email]').type(testUser.email);
      cy.get('[data-cy=login-password]').type(testUser.password);
      cy.get('[data-cy=login-submit]').click();
    });

    it('should add, edit, and display asset stories', () => {
      // Navigate to Vault
      cy.visit('/vault');
      
      // Open asset detail
      cy.get('[data-cy=asset-card]').first().click();
      
      // Check empty state
      cy.get('[data-cy=story-empty-state]').should('be.visible');
      cy.get('[data-cy=story-prompt]').should('contain', 'Every asset has a story');
      cy.get('[data-cy=add-story-button]').should('be.visible');
      
      // Add story
      cy.get('[data-cy=add-story-button]').click();
      
      // Story modal opens
      cy.get('[data-cy=story-modal]').should('be.visible');
      cy.get('[data-cy=modal-title]').should('contain', 'Add Asset Story');
      
      // Type story
      cy.get('[data-cy=story-textarea]')
        .should('have.attr', 'placeholder', 'Share the story behind this asset')
        .type(assetStory);
      
      // Check character counter
      cy.get('[data-cy=char-counter]').should('contain', `${assetStory.length}/2000`);
      
      // Save story
      cy.get('[data-cy=save-story]').click();
      
      // Verify story displayed
      cy.get('[data-cy=story-modal]').should('not.exist');
      cy.get('[data-cy=asset-story]').should('be.visible');
      cy.get('[data-cy=story-text]').should('contain', assetStory);
      cy.get('[data-cy=edit-story-button]').should('be.visible');
      
      // Edit story
      cy.get('[data-cy=edit-story-button]').click();
      
      // Modal opens with existing story
      cy.get('[data-cy=story-modal]').should('be.visible');
      cy.get('[data-cy=modal-title]').should('contain', 'Edit Asset Story');
      cy.get('[data-cy=story-textarea]').should('have.value', assetStory);
      
      // Add more to story
      const additionalText = ' It is my hope that this home continues to shelter and nurture our family for generations to come.';
      cy.get('[data-cy=story-textarea]').type(additionalText);
      
      // Save updated story
      cy.get('[data-cy=save-story]').click();
      
      // Verify updated story
      cy.get('[data-cy=story-text]').should('contain', assetStory + additionalText);
      
      // Test story persistence (refresh page)
      cy.reload();
      cy.get('[data-cy=story-text]').should('contain', assetStory + additionalText);
    });

    it('should handle story character limit', () => {
      cy.visit('/vault');
      cy.get('[data-cy=asset-card]').last().click();
      cy.get('[data-cy=add-story-button]').click();
      
      // Type exactly 2000 characters
      const maxStory = 'a'.repeat(2000);
      cy.get('[data-cy=story-textarea]').type(maxStory);
      
      // Counter should show max
      cy.get('[data-cy=char-counter]').should('contain', '2000/2000');
      cy.get('[data-cy=char-counter]').should('have.class', 'text-warning');
      
      // Try to type more (should not accept)
      cy.get('[data-cy=story-textarea]').type('b');
      cy.get('[data-cy=story-textarea]').should('have.value', maxStory);
    });
  });

  // Cleanup after tests
  after(() => {
    // Delete test user data
    cy.task('deleteTestUser', testUser.email);
  });
});
