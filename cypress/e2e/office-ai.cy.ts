describe("Office AI — Critical Workflow Journey", () => {
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

  it("should load the assistant workspace", () => {
    cy.visit("/assistant", { timeout: 30000 });
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.get("h1, h2").should("exist");
    cy.get("body").should("not.be.empty");
  });

  it("should load assistant statistics page", () => {
    cy.visit("/assistant/stats", { failOnStatusCode: false });
    cy.url().should("include", "/assistant/stats");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("إحصائيات المساعد") ||
        text.includes("Assistant Stats") ||
        text.includes("statistics") ||
        text.includes("الإحصائيات")
      ).to.eq(true);
    });
  });

  it("should load advanced Office AI workspace", () => {
    cy.visit("/office-ai/advanced", { timeout: 30000, failOnStatusCode: false });
    cy.url().should("include", "/office-ai/advanced");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("الذكاء المكتبي المتقدم") ||
        text.includes("Advanced") ||
        text.includes("advanced") ||
        text.includes("Office AI")
      ).to.eq(true);
    });
  });

  it("should load advanced templates page", () => {
    cy.visit("/office-ai/advanced/templates", { failOnStatusCode: false });
    cy.url().should("include", "/office-ai/advanced/templates");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("قوالب") ||
        text.includes("Templates") ||
        text.includes("templates")
      ).to.eq(true);
    });
  });

  it("should load advanced schedules page", () => {
    cy.visit("/office-ai/advanced/schedules", { failOnStatusCode: false });
    cy.url().should("include", "/office-ai/advanced/schedules");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("جداول") ||
        text.includes("Schedules") ||
        text.includes("schedules") ||
        text.includes("مواعيد")
      ).to.eq(true);
    });
  });

  it("should load role configuration page", () => {
    cy.visit("/office-ai/advanced/role-config", { failOnStatusCode: false });
    cy.url().should("include", "/office-ai/advanced/role-config");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("إعداد") ||
        text.includes("Config") ||
        text.includes("config") ||
        text.includes("الأدوار") ||
        text.includes("role")
      ).to.eq(true);
    });
  });

  it("should maintain RTL direction across all Office AI pages", () => {
    const officeAIRoutes = [
      "/assistant",
      "/assistant/stats",
      "/office-ai/advanced",
      "/office-ai/advanced/templates",
      "/office-ai/advanced/schedules",
      "/office-ai/advanced/role-config",
    ];
    officeAIRoutes.forEach((route) => {
      cy.visit(route, { failOnStatusCode: false });
      cy.get("html").should("have.attr", "dir", "rtl");
    });
  });
});
