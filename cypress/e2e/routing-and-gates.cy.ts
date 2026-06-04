describe("Routing & Access Gates", () => {
  describe("Unauthenticated access to protected routes", () => {
    const protectedRoutes = [
      "/audit",
      "/audit/engagements/eng-gulf-2025",
      "/decisions",
      "/decisions/new",
      "/local-content",
      "/local-content/projects",
      "/sales",
      "/sales/deals",
      "/sales/pipeline",
      "/assistant",
      "/settings",
      "/settings/team",
      "/organizations",
      "/intelligence",
    ];

    protectedRoutes.forEach((route) => {
      it(`should redirect unauthenticated users from ${route} to /login`, () => {
        cy.visit(route, { failOnStatusCode: false });
        cy.url().should("include", "/login");
      });
    });
  });

  describe("Public marketing pages", () => {
    const publicPages = [
      { path: "/", title: "AQLIYA" },
      { path: "/about", title: /عن|about/i },
      { path: "/products", title: /منتجات|products/i },
      { path: "/how-we-work", title: /منهجية|how we work/i },
      { path: "/contact", title: /اتصل|contact/i },
      { path: "/platform", title: /منصة|platform/i },
      { path: "/security", title: /أمن|security/i },
      { path: "/privacy", title: /خصوصية|privacy/i },
      { path: "/terms", title: /شروط|terms/i },
      { path: "/governance", title: /حوكمة|governance/i },
      { path: "/deployment", title: /نشر|deployment/i },
      { path: "/use-cases", title: /حالات|use cases/i },
      { path: "/case-studies", title: /دراسات|case studies/i },
      { path: "/insights", title: /رؤى|insights/i },
      { path: "/demo", title: /تجريبي|demo/i },
      { path: "/pilot-proof", title: /pilot|اثبات/i },
      { path: "/proof-library", title: /مكتبة|proof/i },
      { path: "/executive-brief", title: /تنفيذي|executive/i },
      { path: "/buyers", title: /مشترين|buyers/i },
    ];

    publicPages.forEach(({ path, title }) => {
      it(`should load public page ${path} without authentication`, () => {
        cy.visit(path);
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(title).should("exist");
      });
    });
  });

  describe("Marketing page RTL direction", () => {
    it("should have RTL direction on all marketing pages", () => {
      cy.visit("/");
      cy.document().its("documentElement.lang").should("eq", "ar");
      cy.get("html").should("have.attr", "dir", "rtl");
    });
  });

  describe("Demo route /auditos", () => {
    it("should load /auditos without authentication", () => {
      cy.visit("/auditos", { failOnStatusCode: false });
      cy.get("html").should("have.attr", "dir", "rtl");
      cy.contains(/AuditOS|audit/i).should("exist");
    });

    it("should redirect to login for protected /audit but not for /auditos", () => {
      cy.visit("/auditos", { failOnStatusCode: false });
      cy.url().should("not.include", "/login");
      // /audit should redirect
      cy.visit("/audit", { failOnStatusCode: false });
      cy.url().should("include", "/login");
    });
  });

  describe("User registration page", () => {
    it("should load /signup without authentication", () => {
      cy.visit("/signup");
      cy.get("html").should("have.attr", "dir", "rtl");
    });
  });

  describe("Login page redirect behavior", () => {
    it("should preserve callbackUrl parameter", () => {
      cy.visit("/login?callbackUrl=%2Faudit");
      cy.url().should("include", "callbackUrl=%2Faudit");
    });

    it("should present login with proper Arabic form labels", () => {
      cy.visit("/login");
      cy.contains("البريد الإلكتروني").should("exist");
      cy.contains("كلمة المرور").should("exist");
      cy.contains("تسجيل الدخول").should("exist");
    });
  });
});
