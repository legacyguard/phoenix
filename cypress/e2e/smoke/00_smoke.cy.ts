import { routeMap } from '../../support/ids';

const ROUTES = [
  '/', routeMap?.onboarding ?? '/dashboard',
  routeMap?.upload ?? '/vault',
  routeMap?.will ?? '/will',
  routeMap?.capsule ?? '/legacy-letters',
  routeMap?.dms ?? '/guardian-view',
].filter(Boolean) as string[];

function hasInteractive() {
  // aspoň 1 interaktívny prvok
  cy.get('button,[role=button],input,select,textarea,a[href]')
    .its('length')
    .should('be.gte', 1);
}

describe('SMOKE / basic page health', () => {
  for (const path of ROUTES) {
    it(`loads ${path} without fatal errors and has interactive elements`, () => {
      cy.visit(path, { failOnStatusCode: false });
      cy.appReady();
      cy.dumpDom(path);
      cy.captureConsole(path);
      cy.mountOk().then(ok => {
        expect(ok, 'React mount sentinel').to.eq(true);
      });
      hasInteractive();
      // vizuálny artefakt
      cy.screenshot(`smoke_${path.replace(/\W+/g,'_')}`, { capture: 'viewport' });
    });
  }
});
