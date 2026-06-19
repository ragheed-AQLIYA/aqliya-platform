describe("Sprint 3-5 Routes", () => {
  describe("Authentication gates", () => {
    const protectedRoutes: string[] = [
      // Sprint 3
      "/decisions/gov",
      "/sampling",
      "/risk",
      "/settings/audit-bridge",
      // Sprint 4-5
      "/content-studio",
      "/sales/intelligence",
      "/sales/intelligence/forecasts",
      "/office-ai/advanced",
      "/office-ai/advanced/templates",
      "/office-ai/advanced/schedules",
      "/office-ai/advanced/role-config",
      "/settings/organization/advanced",
      "/settings/organization/advanced/events",
    ];

    protectedRoutes.forEach((route) => {
      it(`should redirect unauthenticated users from ${route} to /login`, () => {
        cy.visit(route, { failOnStatusCode: false });
        cy.url().should("include", "/login");
      });
    });
  });

  describe("Authenticated route loading", () => {
    before(() => {
      cy.loginAdmin();
    });

    // Decision Gov Routes
    describe("/decisions/gov", () => {
      it("should load the governance dashboard", () => {
        cy.visit("/decisions/gov");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/حوكمة|governance|تصعيد|escalation/i).should("exist");
      });
    });

    // Sampling Routes
    describe("/sampling", () => {
      it("should load the sampling dashboard", () => {
        cy.visit("/sampling");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/عينات|sampling|خطة|plan/i).should("exist");
      });
    });

    // Risk Routes
    describe("/risk", () => {
      it("should load the risk assessment dashboard", () => {
        cy.visit("/risk");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains("مخاطر المنشأة", { timeout: 15000 }).should("exist");
      });
    });

    // Audit Bridge Routes
    describe("/settings/audit-bridge", () => {
      it("should load the audit bridge page", () => {
        cy.visit("/settings/audit-bridge");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/جسر|bridge|ربط|rule/i).should("exist");
      });

      it("should load audit bridge logs", () => {
        cy.visit("/settings/audit-bridge/logs");
        cy.get("html").should("have.attr", "dir", "rtl");
      });
    });

    // Content Studio Routes
    describe("/content-studio", () => {
      it("should load the content studio page", () => {
        cy.visit("/content-studio");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/استوديو|content|محتوى/i).should("exist");
      });

      it("should load content templates", () => {
        cy.visit("/content-studio/templates");
        cy.get("html").should("have.attr", "dir", "rtl");
      });
    });

    // Sales Intelligence Routes
    describe("/sales/intelligence", () => {
      it("should load the sales intelligence page", () => {
        cy.visit("/sales/intelligence");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/ذكاء|intelligence|مبيعات/i).should("exist");
      });

      it("should load sales forecasts", () => {
        cy.visit("/sales/intelligence/forecasts");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/توقعات|forecast/i).should("exist");
      });
    });

    // Office AI Advanced Routes
    describe("/office-ai/advanced", () => {
      it("should load the office AI advanced page", () => {
        cy.visit("/office-ai/advanced");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/ذكاء مكتبي|advanced/i).should("exist");
      });

      it("should load templates sub-page", () => {
        cy.visit("/office-ai/advanced/templates");
        cy.get("html").should("have.attr", "dir", "rtl");
      });

      it("should load schedules sub-page", () => {
        cy.visit("/office-ai/advanced/schedules");
        cy.get("html").should("have.attr", "dir", "rtl");
      });

      it("should load role config sub-page", () => {
        cy.visit("/office-ai/advanced/role-config");
        cy.get("html").should("have.attr", "dir", "rtl");
      });
    });

    // Organization Advanced Routes
    describe("/settings/organization/advanced", () => {
      it("should load the org advanced page", () => {
        cy.visit("/settings/organization/advanced");
        cy.get("html").should("have.attr", "dir", "rtl");
        cy.contains(/إعدادات|advanced|هيكل|hierarchy/i).should("exist");
      });

      it("should load lifecycle events page", () => {
        cy.visit("/settings/organization/advanced/events");
        cy.get("html").should("have.attr", "dir", "rtl");
      });
    });
  });
});