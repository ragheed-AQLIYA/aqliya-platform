describe("Sprint 3-5 Routes", () => {
  describe("Authentication gates", () => {
    const protectedRoutes: string[] = [
      "/decisions/gov",
      "/sampling",
      "/risk",
      "/settings/audit-bridge",
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
    beforeEach(() => {
      cy.loginAdmin();
    });

    it("loads /decisions/gov", () => {
      cy.visitWorkspace("/decisions/gov", "حوكمة");
    });

    it("loads /sampling", () => {
      cy.visitWorkspace("/sampling", "عينات التدقيق");
    });

    it("loads /risk", () => {
      cy.visitWorkspace("/risk", "مخاطر المنشأة");
    });

    it("loads /settings/audit-bridge", () => {
      cy.visitWorkspace("/settings/audit-bridge", "قواعد ربط التدقيق");
    });

    it("loads /settings/audit-bridge/logs", () => {
      cy.visit("/settings/audit-bridge/logs");
      cy.get("html").should("have.attr", "dir", "rtl");
    });

    it("loads /content-studio", () => {
      cy.visitWorkspace("/content-studio", "استوديو");
    });

    it("loads /content-studio/templates", () => {
      cy.visit("/content-studio/templates");
      cy.get("html").should("have.attr", "dir", "rtl");
    });

    it("loads /sales/intelligence", () => {
      cy.visitWorkspace("/sales/intelligence", "مركز الذكاء التجاري");
    });

    it("loads /sales/intelligence/forecasts", () => {
      cy.visitWorkspace("/sales/intelligence/forecasts", "التنبؤات");
    });

    it("loads /office-ai/advanced", () => {
      cy.visitWorkspace("/office-ai/advanced", "الذكاء المكتبي المتقدم");
    });

    it("loads /office-ai/advanced/templates", () => {
      cy.visit("/office-ai/advanced/templates");
      cy.get("html").should("have.attr", "dir", "rtl");
    });

    it("loads /office-ai/advanced/schedules", () => {
      cy.visit("/office-ai/advanced/schedules");
      cy.get("html").should("have.attr", "dir", "rtl");
    });

    it("loads /office-ai/advanced/role-config", () => {
      cy.visit("/office-ai/advanced/role-config");
      cy.get("html").should("have.attr", "dir", "rtl");
    });

    it("loads /settings/organization/advanced", () => {
      cy.visitWorkspace("/settings/organization/advanced", "إعدادات المنظمة المتقدمة");
    });

    it("loads /settings/organization/advanced/events", () => {
      cy.visit("/settings/organization/advanced/events");
      cy.get("html").should("have.attr", "dir", "rtl");
    });
  });
});
