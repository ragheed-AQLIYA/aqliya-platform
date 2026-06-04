describe("SalesOS — Sales Workspace", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@aqliya.com");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should("not.include", "/login");
  });

  it("should load SalesOS dashboard with title", () => {
    cy.visit("/sales");
    cy.contains(/SalesOS|المبيعات/i).should("exist");
    cy.get("h1, h2").should("exist");
  });

  it("should navigate to deals list page", () => {
    cy.visit("/sales/deals");
    cy.url().should("include", "/sales/deals");
    cy.contains(/الصفقات/i).should("exist");
  });

  it("should navigate to pipeline page", () => {
    cy.visit("/sales/pipeline");
    cy.url().should("include", "/pipeline");
  });

  it("should navigate to accounts page (redirects to /sales)", () => {
    cy.visit("/sales/accounts");
    cy.url().should("include", "/sales");
  });

  it("should navigate to opportunities page", () => {
    cy.visit("/sales/opportunities");
    cy.url().should("include", "/opportunities");
  });

  it("should navigate to contacts page", () => {
    cy.visit("/sales/contacts");
    cy.url().should("include", "/contacts");
  });

  it("should navigate to forecast page", () => {
    cy.visit("/sales/forecast");
    cy.url().should("include", "/forecast");
  });

  it("should navigate to command-center page", () => {
    cy.visit("/sales/command-center");
    cy.url().should("include", "/command-center");
  });

  it("should navigate to reports page", () => {
    cy.visit("/sales/reports");
    cy.url().should("include", "/reports");
  });

  it("should navigate to funnel page", () => {
    cy.visit("/sales/funnel");
    cy.url().should("include", "/funnel");
  });

  it("should navigate to pipeline-depth page", () => {
    cy.visit("/sales/pipeline-depth");
    cy.url().should("include", "/pipeline-depth");
  });

  it("should navigate to signals page", () => {
    cy.visit("/sales/signals");
    cy.url().should("include", "/signals");
  });

  it("should navigate to intelligence page", () => {
    cy.visit("/sales/intelligence");
    cy.url().should("include", "/intelligence");
  });

  it("should navigate to revenue page", () => {
    cy.visit("/sales/revenue");
    cy.url().should("include", "/revenue");
  });

  it("should navigate to outreach page", () => {
    cy.visit("/sales/outreach");
    cy.url().should("include", "/outreach");
  });

  it("should navigate to activities page", () => {
    cy.visit("/sales/activities");
    cy.url().should("include", "/activities");
  });

  it("should navigate to settings page", () => {
    cy.visit("/sales/settings");
    cy.url().should("include", "/settings");
  });

  it("should navigate to icp page", () => {
    cy.visit("/sales/icp");
    cy.url().should("include", "/icp");
  });

  it("should navigate to new deal page", () => {
    cy.visit("/sales/deals/new");
    cy.url().should("include", "/deals/new");
  });

  it("should have SalesNav links visible on dashboard", () => {
    cy.visit("/sales");
    cy.get("nav, [class*='nav'], [class*='Nav']").should("exist");
  });

  it("should navigate to deal detail if deals exist", () => {
    cy.visit("/sales/deals");
    cy.get("body").then(($body) => {
      if ($body.find("a").length > 2) {
        cy.get("a").first().click({ force: true });
        cy.url().should("not.eq", "/sales/deals");
      }
    });
  });

  it("should navigate to audit-trail page", () => {
    cy.visit("/sales/audit-trail");
    cy.url().should("include", "/audit-trail");
  });

  it("should navigate to approval page", () => {
    cy.visit("/sales/approval");
    cy.url().should("include", "/approval");
  });

  it("should navigate to review page", () => {
    cy.visit("/sales/review");
    cy.url().should("include", "/review");
  });
});
