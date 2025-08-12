import { ids, routeMap } from '../support/ids';

describe('Dead Man Switch → enable/check-in/trigger (mock)', () => {
  it('enables DMS, does a check-in and simulates trigger', () => {
    // Default API stubs to prevent blocking
    cy.intercept({url:'**/api/**',method:/GET|POST|PUT|PATCH|DELETE/}, (req)=>{ req.reply((res)=>{ res.send(200, res.body||{}); }); }); // default ok stub
    
    cy.visit(routeMap.dms);
    
    // Look for DMS content
    cy.contains(/dead man|inactivity|check[- ]?in|keep alive|heartbeat/i).should('be.visible');
    
    // Enable DMS
    if (ids.dmsEnable) {
      cy.byTestId(ids.dmsEnable).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/enable|activate|zapnúť/i).first().click({ force: true });
    }
    
    // Do check-in
    if (ids.dmsCheckin) {
      cy.byTestId(ids.dmsCheckin).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/check[- ]?in|extend/i).first().click({ force: true });
    }
    
    // Simulate trigger
    if (ids.dmsTrigger) {
      cy.byTestId(ids.dmsTrigger).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/trigger|simulate|spustiť/i).first().click({ force: true });
    }
    
    // Verify DMS status
    cy.contains(/active|enabled|activated/i).should('be.visible');
  });
});
