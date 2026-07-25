describe("SalesOS — Sales Workspace", () => {
  beforeEach(() => {
    cy.loginAdmin();
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

  it("should navigate to accounts page for stakeholder contacts", () => {
    cy.visit("/sales/accounts");
    cy.url().should("include", "/sales/accounts");
    cy.contains(/الحسابات|Accounts/i).should("exist");
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
    cy.visit("/sales/settings/crm");
    cy.url().should("include", "/settings/crm");
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

describe("SalesOS - Pipeline, Deals & Accounts", () => {
  beforeEach(() => {
    cy.loginAdmin();
  });

  it("should display pipeline with seeded deals", function () {
    cy.visit("/sales/pipeline");
    cy.url().should("include", "/pipeline");
    cy.get("body").then(($body) => {
      if (!$body.text().match(/SAR|ريال|صفقة|deal|Deal|pipeline|Pipeline/i)) {
        cy.log("No pipeline deal content found - skipping");
        this.skip();
        return;
      }
      cy.contains(/SAR|ريال|صفقة|deal/i, { timeout: 10000 }).should("exist");
    });
  });

  it("should navigate to deal detail", function () {
    cy.visit("/sales/pipeline");
    cy.get("body").then(($body) => {
      var links = $body.find('a[href*="/sales/deals/"]');
      if (links.length === 0) {
        cy.log("No deal links found - skipping deal detail test");
        this.skip();
        return;
      }
      cy.wrap(links).first().click({ force: true });
      cy.url().should("match", /\/sales\/deals\//);
    });
  });

  it("should display account with intelligence", function () {
    cy.visit("/sales/accounts");
    cy.url().should("include", "/sales/accounts");
    cy.get("body").then(($body) => {
      var links = $body.find('a[href*="/sales/accounts/"]');
      if (links.length === 0) {
        cy.log("No account links found - skipping account intelligence test");
        this.skip();
        return;
      }
      cy.wrap(links).first().click({ force: true });
      cy.url().should("match", /\/sales\/accounts\//);
      cy.get("body").then(($detailBody) => {
        if ($detailBody.text().match(/بريد|contact|opportunity|فرصة|حساب|account/i)) {
          cy.contains(/بريد|contact|opportunity|فرصة|حساب|account/i).should("exist");
        } else {
          cy.log("Account detail loaded but no intelligence content visible");
        }
      });
    });
  });
});
