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
      cy.window().then((w:any) => {
        const diag = {
          MOUNT_OK: w.__MOUNT_OK__,
          APP_VISIBLE: w.__APP_VISIBLE__,
          APP_STAGE: w.__APP_STAGE__,
          PROBE: w.__APP_PROBE__,
          ERRORS: w.__E2E_ERRORS__
        };
        cy.writeFile('_e2e_app_probe_latest.json', JSON.stringify(diag,null,2), { log:false });
      });
      hasInteractive();
      // vizuálny artefakt
      cy.screenshot(`smoke_${path.replace(/\W+/g,'_')}`, { capture: 'viewport' });
    });
  }
});
