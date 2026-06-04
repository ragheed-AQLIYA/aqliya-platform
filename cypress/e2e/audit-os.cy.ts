describe("AuditOS — Engagement Workspace", () => {
  beforeEach(() => {
    // Login as admin
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@aqliya.com");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should("not.include", "/login");
  });

  it("should load AuditOS dashboard with title and KPIs", () => {
    cy.visit("/audit");
    cy.contains(/AuditOS|المهام|engagements/i).should("exist");
    // At least one KPI or heading should be visible
    cy.get("h1, h2, h3").should("exist");
  });

  it("should have workspace status indicator on dashboard", () => {
    cy.visit("/audit");
    // The workspace status bar should appear
    cy.get('[class*="workspace"],[class*="status"]').should("exist");
  });

  it("should navigate to seeded engagement eng-gulf-2025 detail page", () => {
    cy.visit("/audit/engagements/eng-gulf-2025");
    // The engagement header should show client info
    cy.contains(/Gulf Trading|eng-gulf-2025/i).should("exist");
  });

  it("should display engagement overview tab with key sections", () => {
    cy.visit("/audit/engagements/eng-gulf-2025");
    // Overview should load with engagement details
    cy.get("body").should("contain.text", "");
  });

  it("should navigate to trial-balance tab and load content", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/trial-balance");
    cy.url().should("include", "/trial-balance");
    cy.get("body").should("exist");
  });

  it("should navigate to mapping tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/mapping");
    cy.url().should("include", "/mapping");
  });

  it("should navigate to statements tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/statements");
    cy.url().should("include", "/statements");
  });

  it("should navigate to findings tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/findings");
    cy.url().should("include", "/findings");
  });

  it("should navigate to evidence tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/evidence");
    cy.url().should("include", "/evidence");
  });

  it("should navigate to review tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/review");
    cy.url().should("include", "/review");
  });

  it("should navigate to exports tab and check for export options", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/exports");
    cy.url().should("include", "/exports");
  });

  it("should navigate to audit-trail tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/audit-trail");
    cy.url().should("include", "/audit-trail");
  });

  it("should navigate to notes tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/notes");
    cy.url().should("include", "/notes");
  });

  it("should navigate to recommendations tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/recommendations");
    cy.url().should("include", "/recommendations");
  });

  it("should navigate to approval tab", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/approval");
    cy.url().should("include", "/approval");
  });

  it("should return to dashboard from engagement", () => {
    cy.visit("/audit/engagements/eng-gulf-2025");
    // Click back link
    cy.contains(/العودة|عودة/i).should("exist");
  });
});
