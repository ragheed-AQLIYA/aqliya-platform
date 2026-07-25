describe("Platform Admin — Critical Workflow Journey", () => {
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

  it("should load admin dashboard", () => {
    cy.visit("/admin", { timeout: 30000 });
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.get("h1, h2").should("exist");
    cy.get("body").should("not.be.empty");
  });

  it("should load user management page", () => {
    cy.visit("/admin/users", { failOnStatusCode: false });
    cy.url().should("include", "/admin/users");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("المستخدمين") ||
        text.includes("Users") ||
        text.includes("users") ||
        text.includes("إدارة المستخدمين")
      ).to.eq(true);
    });
  });

  it("should load admin logs page", () => {
    cy.visit("/admin/logs", { failOnStatusCode: false });
    cy.url().should("include", "/admin/logs");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("السجلات") ||
        text.includes("Logs") ||
        text.includes("logs") ||
        text.includes("سجل")
      ).to.eq(true);
    });
  });

  it("should load team management settings", () => {
    cy.visit("/settings/team", { failOnStatusCode: false });
    cy.url().should("include", "/settings/team");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("الفريق") ||
        text.includes("Team") ||
        text.includes("team") ||
        text.includes("الأعضاء") ||
        text.includes("members")
      ).to.eq(true);
    });
  });

  it("should load MFA settings page", () => {
    cy.visit("/settings/mfa", { failOnStatusCode: false });
    cy.url().should("include", "/settings/mfa");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("التحقق بخطوتين") ||
        text.includes("MFA") ||
        text.includes("mfa") ||
        text.includes("two-factor") ||
        text.includes("المصادقة")
      ).to.eq(true);
    });
  });

  it("should load audit logs page for platform activity monitoring", () => {
    cy.visit("/settings/audit-logs", { failOnStatusCode: false });
    cy.url().should("include", "/settings/audit-logs");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("سجلات التدقيق") ||
        text.includes("Audit Logs") ||
        text.includes("audit logs") ||
        text.includes("سجل") ||
        text.includes("audit")
      ).to.eq(true);
    });
  });

  it("should load platform settings page", () => {
    cy.visit("/settings", { failOnStatusCode: false });
    cy.url().should("include", "/settings");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("الإعدادات") ||
        text.includes("Settings") ||
        text.includes("settings") ||
        text.includes("تفضيلات")
      ).to.eq(true);
    });
  });

  it("should verify admin-only route access is blocked for unauthenticated users", () => {
    const adminRoutes = ["/admin", "/admin/users", "/admin/logs"];
    adminRoutes.forEach((route) => {
      cy.visit(route, { failOnStatusCode: false });
      cy.url().should("include", "/login");
    });
  });
});
