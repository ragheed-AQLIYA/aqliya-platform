/* eslint-disable @typescript-eslint/no-namespace */
declare namespace Cypress {
  interface Chainable {
    shouldBeRTL(): Chainable<JQuery<HTMLElement>>;
    shouldHaveArabicContent(): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add("shouldBeRTL", () => {
  cy.get("html").should("have.attr", "dir", "rtl");
});

Cypress.Commands.add("shouldHaveArabicContent", () => {
  cy.document().its("documentElement.lang").should("eq", "ar");
});
