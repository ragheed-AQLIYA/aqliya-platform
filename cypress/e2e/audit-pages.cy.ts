describe("Audit Pages - Accessibility", () => {
  it("should redirect to login when not authenticated", () => {
    cy.visit("/audit", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  it("should have Arabic text on login page", () => {
    cy.visit("/login");
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.contains(/تسجيل|دخول|login/i);
  });
});
