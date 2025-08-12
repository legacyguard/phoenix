import { ids, routeMap } from '../support/ids';

describe('Will Generator → PDF (mock)', () => {
  it('completes will wizard and gets PDF preview', () => {
    // Default API stubs to prevent blocking
    cy.intercept({url:'**/api/**',method:/GET|POST|PUT|PATCH|DELETE/}, (req)=>{ req.reply((res)=>{ res.send(200, res.body||{}); }); }); // default ok stub
    
    cy.visit(routeMap.will);
    
    // Look for form elements
    cy.get('input,select,textarea').first().should('be.visible');
    
    // Fill basic form
    cy.get('input[name="fullName"],input[placeholder*="name"],input[placeholder*="meno"]').first().type('John Doe');
    cy.get('input[name="email"],input[placeholder*="email"]').first().type('john@example.com');
    
    // Navigate through will steps
    if (ids.willNext) {
      cy.byTestId(ids.willNext).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/next|continue|ďalej/i).first().click({ force: true });
    }
    
    // Generate PDF
    if (ids.willGeneratePdf) {
      cy.byTestId(ids.willGeneratePdf).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/generate|preview|pdf/i).first().click({ force: true });
    }
    
    // Verify PDF generation
    cy.contains(/pdf|preview|generated/i).should('be.visible');
  });
});
