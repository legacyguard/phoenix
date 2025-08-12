/// <reference types="cypress" />

Cypress.Commands.add('byTestId', (id: string) => {
  return cy.get(`[data-testid="${id}"]`, { timeout: 10000 });
});

Cypress.Commands.add('safeClick', { prevSubject: 'element' }, (subject) => {
  return cy.wrap(subject).scrollIntoView().should('be.visible').click({ force: true });
});

// Voliteľné: app môže čítať tento flag a vypnúť redirecty v DEV/teste
Cypress.Commands.add('injectE2EFlag', () => {
  cy.on('window:before:load', (win) => {
    // @ts-ignore
    win.__E2E__ = true;
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      byTestId(id: string): Chainable<JQuery<HTMLElement>>;
      safeClick(): Chainable<JQuery<HTMLElement>>;
      injectE2EFlag(): Chainable<void>;
    }
  }
}
