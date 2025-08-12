import { ids, routeMap } from '../support/ids';

describe('Time Capsule → create/schedule/list (mock)', () => {
  it('creates a capsule and lists it', () => {
    // Default API stubs to prevent blocking
    cy.intercept({url:'**/api/**',method:/GET|POST|PUT|PATCH|DELETE/}, (req)=>{ req.reply((res)=>{ res.send(200, res.body||{}); }); }); // default ok stub
    
    cy.visit(routeMap.capsule);
    
    // Create new time capsule
    if (ids.tcNew) {
      cy.byTestId(ids.tcNew).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/new|create|compose|nová|vytvoriť/i).first().click({ force: true });
    }
    
    // Fill message
    if (ids.tcTextarea) {
      cy.byTestId(ids.tcTextarea).type('For my family', { delay: 0 });
    } else {
      cy.get('textarea, [contenteditable=true]').first().type('For my family', { delay: 0 });
    }
    
    // Schedule unlock
    if (ids.tcSchedule) {
      cy.byTestId(ids.tcSchedule).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/lock|schedule|uzamknúť|naplánovať/i).first().click({ force: true });
    }
    
    // Verify creation
    cy.contains(/created|scheduled|locked/i).should('be.visible');
    
    // Check list view
    cy.visit(routeMap.capsule);
    cy.contains('For my family').should('be.visible');
  });
});
