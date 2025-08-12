import { ids, routeMap } from '../support/ids';

describe('Upload/Scan → Categorize → Vault (mock)', () => {
  it('uploads or simulates scan and shows in Vault', () => {
    // Default API stubs to prevent blocking
    cy.intercept({url:'**/api/**',method:/GET|POST|PUT|PATCH|DELETE/}, (req)=>{ req.reply((res)=>{ res.send(200, res.body||{}); }); }); // default ok stub
    
    cy.visit(routeMap.upload);
    
    // Mock OCR API
    cy.intercept('**/api/**/ocr**', { fixture: 'scan_result.json' });
    cy.intercept('**/api/**/vault**', { fixture: 'vault_list.json' });
    
    // Upload file
    if (ids.uploadButton) {
      cy.byTestId(ids.uploadButton).safeClick();
    } else {
      cy.get('input[type=file],button,[role=button]').first().click({ force: true });
    }
    
    // Wait for OCR processing
    cy.wait(1000);
    
    // Verify scan result
    cy.contains('Bank Statement').should('be.visible');
    cy.contains('93%').should('be.visible');
    
    // Navigate to vault
    cy.visit('/vault');
    
    // Verify document appears in vault
    cy.contains('Bank Statement.pdf').should('be.visible');
  });
});
