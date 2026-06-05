/* eslint-disable @typescript-eslint/no-namespace */
declare namespace Cypress {
  interface Chainable {
    shouldBeRTL(): Chainable<JQuery<HTMLElement>>;
    shouldHaveArabicContent(): Chainable<JQuery<HTMLElement>>;
    loginAdmin(): Chainable<void>;
    loginOperator(): Chainable<void>;
  }
}

function loginViaCredentials(email: string, password: string, sessionId: string) {
  cy.session(
    sessionId,
    () => {
      cy.request("/api/auth/csrf").then((csrfRes) => {
        const csrfToken = csrfRes.body.csrfToken as string;
        cy.request({
          method: "POST",
          url: "/api/auth/callback/credentials",
          body: {
            csrfToken,
            email,
            password,
            redirect: "false",
            json: "true",
          },
          form: true,
        });
      });
      cy.request("/api/auth/session")
        .its("body.user.email")
        .should("eq", email);
    },
    {
      validate() {
        cy.request("/api/auth/session")
          .its("body.user.email")
          .should("eq", email);
      },
    },
  );
}

/** Programmatic NextAuth login (CSRF cookie + credentials callback). */
Cypress.Commands.add("loginAdmin", () => {
  loginViaCredentials("admin@aqliya.com", "admin123", "admin-aqliya-api");
});

Cypress.Commands.add("loginOperator", () => {
  loginViaCredentials("sara@aqliya.com", "operator123", "operator-aqliya-api");
});

Cypress.Commands.add("shouldBeRTL", () => {
  cy.get("html").should("have.attr", "dir", "rtl");
});

Cypress.Commands.add("shouldHaveArabicContent", () => {
  cy.document().its("documentElement.lang").should("eq", "ar");
});
