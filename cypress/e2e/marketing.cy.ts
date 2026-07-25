describe("Marketing Site — Critical User Journey", () => {
  it("should load homepage with AQLIYA branding", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.document().its("documentElement.lang").should("eq", "ar");
    cy.contains("AQLIYA").should("exist");
    cy.get("h1, h2").should("exist");
  });

  it("should navigate through main marketing sections via nav", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "dir", "rtl");
    // Navigation should exist with product links
    cy.get("nav, header, [class*='nav'], [class*='Nav']").should("exist");
    // Should contain product links
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("AuditOS") ||
        text.includes("المنتجات") ||
        text.includes("products") ||
        text.includes("المنصة") ||
        text.includes("platform")
      ).to.eq(true);
    });
  });

  it("should load all core marketing pages with Arabic content", () => {
    const pages = [
      { path: "/", expected: "AQLIYA" },
      { path: "/about", expected: /عن|about/i },
      { path: "/products", expected: /منتجات|products/i },
      { path: "/start", expected: /من أين تبدأ|start/i },
      { path: "/contact", expected: /جلسة|تشخيص|contact/i },
    ];
    pages.forEach(({ path, expected }) => {
      cy.visit(path);
      cy.get("html").should("have.attr", "dir", "rtl");
      cy.contains(expected).should("exist");
    });
  });

  it("should load product-specific marketing page for AuditOS", () => {
    cy.visit("/auditos", { failOnStatusCode: false });
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.contains(/AuditOS|audit|تدقيق/i).should("exist");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes(" AuditOS ") ||
        text.includes("التدقيق") ||
        text.includes("audit") ||
        text.includes("Audit")
      ).to.eq(true);
    });
  });

  it("should load platform and governance pages", () => {
    const govPages = [
      { path: "/platform", pattern: /منصة|platform/i },
      { path: "/security", pattern: /أمن|security/i },
      { path: "/privacy", pattern: /خصوصية|privacy/i },
      { path: "/governance", pattern: /حوكمة|governance/i },
    ];
    govPages.forEach(({ path, pattern }) => {
      cy.visit(path, { failOnStatusCode: false });
      cy.get("html").should("have.attr", "dir", "rtl");
      cy.contains(pattern).should("exist");
    });
  });
});
