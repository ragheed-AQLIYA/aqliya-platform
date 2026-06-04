/* eslint-disable @typescript-eslint/no-namespace */
declare namespace Cypress {
  interface Chainable {
    shouldBeRTL(): Chainable<JQuery<HTMLElement>>;
    shouldHaveArabicContent(): Chainable<JQuery<HTMLElement>>;
    loginAdmin(): Chainable<void>;
  }
}

/** Cached admin session — reduces flaky CSRF on repeated signIn. */
Cypress.Commands.add("loginAdmin", () => {
  cy.session(
    "admin-aqliya",
    () => {
      cy.visit("/login");
      cy.get('input[type="email"]').clear().type("admin@aqliya.com");
      cy.get('input[type="password"]').clear().type("admin123");
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 20000 }).should("not.include", "/login");
    },
    { cacheAcrossSpecs: false },
  );
});

Cypress.Commands.add("shouldBeRTL", () => {
  cy.get("html").should("have.attr", "dir", "rtl");
});

Cypress.Commands.add("shouldHaveArabicContent", () => {
  cy.document().its("documentElement.lang").should("eq", "ar");
});
