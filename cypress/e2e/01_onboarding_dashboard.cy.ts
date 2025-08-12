import { ids, routeMap } from '../support/ids';

describe('Onboarding → Dashboard (mock)', () => {
  it('completes minimal onboarding and lands on dashboard', () => {
    cy.visit(routeMap.onboarding);
    
    // Look for onboarding content with fallback
    if (ids.onboardingNext) {
      cy.byTestId(ids.onboardingNext).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/next|continue|ďalej/i).first().click({ force: true });
    }
    
    // Continue through onboarding
    if (ids.onboardingFinish) {
      cy.byTestId(ids.onboardingFinish).safeClick();
    } else {
      cy.get('button,[role=button]').contains(/finish|done|complete|ukončiť|dokončiť/i).first().click({ force: true });
    }
    
    // Verify we're on dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(/dashboard|overview|prehľad/i).should('be.visible');
  });
});
