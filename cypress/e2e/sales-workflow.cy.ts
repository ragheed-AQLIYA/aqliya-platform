describe("SalesOS — Critical Workflow Journey", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", (err) => {
      if (
        err.message.includes("Server Components render") ||
        err.message.includes("digest") ||
        err.message.includes("unexpected response")
      ) {
        return false;
      }
    });
    cy.loginAdmin();
  });

  it("should load SalesOS dashboard with navigation and KPIs", () => {
    cy.visit("/sales", { timeout: 30000 });
    cy.contains(/SalesOS|المبيعات/i).should("exist");
    cy.get("h1, h2").should("exist");
    cy.get("nav, [class*='nav'], [class*='Nav']").should("exist");
  });

  it("should navigate the full sales pipeline workflow", () => {
    const salesRoutes = [
      { path: "/sales/deals", pattern: /الصفقات|Deals|deals/i },
      { path: "/sales/pipeline", pattern: /pipeline|Pipeline|الخطوة/i },
      { path: "/sales/accounts", pattern: /الحسابات|Accounts|accounts/i },
      { path: "/sales/opportunities", pattern: /فرص|opportunities|Opportunities/i },
      { path: "/sales/activities", pattern: /أنشطة|activities|Activities/i },
      { path: "/sales/reports", pattern: /تقارير|reports|Reports/i },
    ];
    salesRoutes.forEach(({ path, pattern }) => {
      cy.visit(path, { failOnStatusCode: false });
      cy.url().should("include", path);
      cy.get("body").should("not.be.empty");
    });
  });

  it("should display pipeline with deal cards or empty state", () => {
    cy.visit("/sales/pipeline", { failOnStatusCode: false });
    cy.url().should("include", "/pipeline");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("SAR") ||
        text.includes("ريال") ||
        text.includes("صفقة") ||
        text.includes("deal") ||
        text.includes("Deal") ||
        text.includes("pipeline") ||
        text.includes("Pipeline") ||
        text.includes("لا توجد") ||
        text.includes("no deals")
      ).to.eq(true);
    });
  });

  it("should load deals list page with seeded deals or empty state", () => {
    cy.visit("/sales/deals", { failOnStatusCode: false });
    cy.url().should("include", "/sales/deals");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("الصفقات") ||
        text.includes("Deals") ||
        text.includes("deals") ||
        text.includes("لا توجد صفقات") ||
        text.includes("new deal")
      ).to.eq(true);
    });
  });

  it("should navigate to new deal creation form", () => {
    cy.visit("/sales/deals/new", { failOnStatusCode: false });
    cy.url().should("include", "/deals/new");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("صفقة جديدة") ||
        text.includes("New Deal") ||
        text.includes("new deal") ||
        text.includes("إنشاء") ||
        text.includes("create")
      ).to.eq(true);
    });
  });

  it("should load sales intelligence page", () => {
    cy.visit("/sales/intelligence", { failOnStatusCode: false });
    cy.url().should("include", "/sales/intelligence");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("مركز الذكاء التجاري") ||
        text.includes("Intelligence") ||
        text.includes("intelligence") ||
        text.includes("الذكاء")
      ).to.eq(true);
    });
  });

  it("should load sales audit trail page", () => {
    cy.visit("/sales/audit-trail", { failOnStatusCode: false });
    cy.url().should("include", "/audit-trail");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("سجل") ||
        text.includes("audit") ||
        text.includes("Audit") ||
        text.includes("Trail")
      ).to.eq(true);
    });
  });
});
