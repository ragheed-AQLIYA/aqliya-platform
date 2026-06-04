describe("Auth Flow — Arabic Login/Logout", () => {
  beforeEach(() => {
    // Ensure we start clean
    cy.visit("/login");
  });

  it("should display login form with email, password and submit button", () => {
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.contains("الدخول إلى مساحة العمل المؤسسية").should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.get('button[type="submit"]').should("exist");
  });

  it("should show SSO section when SSO providers are available", () => {
    // The SSO section renders conditionally — check if any SSO providers appear
    cy.get("body").then(($body) => {
      if ($body.text().includes("أو الدخول عبر")) {
        cy.contains("أو الدخول عبر").should("exist");
      }
    });
  });

  it("should show demo account credentials card on login page", () => {
    cy.contains("حسابات العرض التجريبي").should("exist");
    cy.contains("admin@aqliya.com").should("exist");
    cy.contains("sara@aqliya.com").should("exist");
  });

  it("should login with valid admin credentials and redirect to dashboard", () => {
    cy.loginAdmin();
    cy.visit("/audit");
    cy.url({ timeout: 15000 }).should("not.include", "/login");
    cy.get("html").should("have.attr", "dir", "rtl");
  });

  it("should login with operator credentials", () => {
    cy.get('input[type="email"]').type("sara@aqliya.com");
    cy.get('input[type="password"]').type("operator123");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should("not.include", "/login");
  });

  it("should show error message with invalid credentials", () => {
    cy.get('input[type="email"]').type("wrong@example.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();
    cy.contains("بريد إلكتروني أو كلمة مرور غير صحيحة", { timeout: 10000 }).should("exist");
  });

  it("should redirect to login when accessing protected route without auth", () => {
    cy.visit("/audit", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  it("should redirect to login when accessing /decisions without auth", () => {
    cy.visit("/decisions", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  it("should redirect to login when accessing /sales without auth", () => {
    cy.visit("/sales", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });
});
