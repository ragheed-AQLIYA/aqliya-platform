describe("LocalContentOS — Local Content Workspace", () => {
  beforeEach(() => {
    cy.loginAdmin();
  });

  it("should load LocalContentOS dashboard with title", () => {
    cy.visit("/local-content");
    cy.contains(/LocalContentOS|المحتوى المحلي/i).should("exist");
    cy.get("h1, h2").should("exist");
  });

  it("should navigate to projects list page", () => {
    cy.visit("/local-content/projects");
    cy.url().should("include", "/local-content/projects");
    cy.contains(/المشاريع/i).should("exist");
  });

  it("should navigate to analytics page", () => {
    cy.visit("/local-content/analytics");
    cy.url().should("include", "/local-content/analytics");
    cy.contains(/تحليلات|analytics/i).should("exist");
  });

  it("should navigate to classification rules page", () => {
    cy.visit("/local-content/classification-rules");
    cy.url().should("include", "/classification-rules");
  });

  it("should navigate to campaigns page", () => {
    cy.visit("/local-content/campaigns");
    cy.url().should("include", "/campaigns");
  });

  it("should navigate to outputs page", () => {
    cy.visit("/local-content/outputs");
    cy.url().should("include", "/outputs");
  });

  it("should navigate to review page", () => {
    cy.visit("/local-content/review");
    cy.url().should("include", "/review");
  });

  it("should navigate to settings page", () => {
    cy.visit("/local-content/settings/integrations");
    cy.url().should("include", "/settings/integrations");
  });

  it("should have workspace status indicator on dashboard", () => {
    cy.visit("/local-content");
    cy.contains(/تطوير|dev|prototype/i).should("exist");
  });
});
