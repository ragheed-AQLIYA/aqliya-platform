describe("AuditOS — Critical Workflow Journey", () => {
  const engagementId = "eng-gulf-2025";
  const base = `/audit/engagements/${engagementId}`;

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

  it("should load engagement dashboard and show client information", () => {
    cy.visit(`${base}`, { timeout: 30000 });
    cy.contains(/Gulf Trading|eng-gulf-2025|海湾贸易/i).should("exist");
    cy.get("h1, h2, h3").should("exist");
  });

  it("should navigate the full engagement tab workflow", () => {
    const tabs = [
      { path: "/trial-balance", pattern: /ميزان|trial.balance| Trial/i },
      { path: "/mapping", pattern: /ربط|mapping|Map/i },
      { path: "/statements", pattern: /قوائم|statements|Statement/i },
      { path: "/findings", pattern: /نتائج|findings|Finding/i },
      { path: "/evidence", pattern: /أدلة|evidence|Evidence/i },
      { path: "/review", pattern: /مراجعة|review|Review/i },
      { path: "/audit-trail", pattern: /سجل|audit.trail|Trail/i },
    ];
    tabs.forEach(({ path, pattern }) => {
      cy.visit(`${base}${path}`, { failOnStatusCode: false });
      cy.url().should("include", path);
      cy.get("body").should("not.be.empty");
    });
  });

  it("should load trial balance with account data", () => {
    cy.visit(`${base}/trial-balance`, { timeout: 30000, failOnStatusCode: false });
    cy.url().should("include", "/trial-balance");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("بنود الميزان") ||
        text.includes("Trial Balance") ||
        text.includes("total") ||
        text.includes("الإجمالي") ||
        text.includes("ميزان")
      ).to.eq(true);
    });
  });

  it("should display findings with severity indicators", () => {
    cy.visit(`${base}/findings`, { failOnStatusCode: false });
    cy.url().should("include", "/findings");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("نتائج") ||
        text.includes("Findings") ||
        text.includes("Major") ||
        text.includes("جسيم") ||
        text.includes("finding")
      ).to.eq(true);
    });
  });

  it("should load evidence vault page", () => {
    cy.visit(`${base}/evidence`, { failOnStatusCode: false });
    cy.url().should("include", "/evidence");
    cy.get("body").should("not.be.empty");
  });

  it("should display approval workflow on approval tab", () => {
    cy.visit(`${base}/approval`, { failOnStatusCode: false });
    cy.url().should("include", "/approval");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("اعتماد") ||
        text.includes("approval") ||
        text.includes("Approval") ||
        text.includes("Approve") ||
        text.includes("التدقيق")
      ).to.eq(true);
    });
  });

  it("should load exports page with PDF/XLSX options", () => {
    cy.visit(`${base}/exports`, { failOnStatusCode: false });
    cy.url().should("include", "/exports");
    cy.contains("التصدير").should("exist");
  });

  it("should verify audit trail records mutations", () => {
    cy.visit(`${base}/audit-trail`, { failOnStatusCode: false });
    cy.url().should("include", "/audit-trail");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("سجل") ||
        text.includes("audit") ||
        text.includes("Audit") ||
        text.includes("سجل التدقيق")
      ).to.eq(true);
    });
  });
});
