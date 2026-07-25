describe("Auth — Session Lifecycle & Validation", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should login with valid admin credentials and establish session", () => {
    cy.get('input[type="email"]').type("admin@aqliya.com");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 20000 }).should("not.include", "/login");
    cy.get("html").should("have.attr", "dir", "rtl");
    // Session cookie should be set
    cy.getCookie("authjs.session-token").should("exist");
  });

  it("should reject login with invalid email", () => {
    cy.get('input[type="email"]').type("nonexistent@aqliya.com");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.contains("بريد إلكتروني أو كلمة مرور غير صحيحة", { timeout: 10000 }).should("exist");
    cy.url().should("include", "/login");
  });

  it("should reject login with invalid password", () => {
    cy.get('input[type="email"]').type("admin@aqliya.com");
    cy.get('input[type="password"]').type("wrongpassword123");
    cy.get('button[type="submit"]').click();
    cy.contains("بريد إلكتروني أو كلمة مرور غير صحيحة", { timeout: 10000 }).should("exist");
  });

  it("should show validation errors for empty form submission", () => {
    cy.get('button[type="submit"]').click();
    // Browser should enforce required fields
    cy.get('input[type="email"]:invalid, input:invalid').should("exist");
  });

  it("should redirect authenticated user away from login page", () => {
    cy.loginAdmin();
    cy.visit("/login");
    // Should redirect to dashboard or overview
    cy.url({ timeout: 15000 }).should("not.include", "/login");
  });

  it("should logout and invalidate session", () => {
    cy.loginAdmin();
    cy.visit("/audit", { failOnStatusCode: false });
    cy.url({ timeout: 15000 }).should("not.include", "/login");
    // Clear session
    cy.clearAuthCookies();
    cy.visit("/audit", { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  it("should preserve callbackUrl through login flow", () => {
    cy.visit("/audit", { failOnStatusCode: false });
    cy.url().should("include", "/login");
    cy.url().should("include", "callbackUrl");
    // Login from the redirect
    cy.get('input[type="email"]').type("admin@aqliya.com");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 20000 }).should("include", "/audit");
  });

  it("should display login page with correct Arabic labels", () => {
    cy.contains("البريد الإلكتروني").should("exist");
    cy.contains("كلمة المرور").should("exist");
    cy.contains("تسجيل الدخول").should("exist");
    cy.get("html").should("have.attr", "dir", "rtl");
  });
});
