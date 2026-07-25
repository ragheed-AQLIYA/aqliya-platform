describe("WorkflowOS — Critical Workflow Journey", () => {
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

  it("should load WorkflowOS dashboard", () => {
    cy.visit("/workflowos", { timeout: 30000 });
    cy.get("html").should("have.attr", "dir", "rtl");
    cy.get("h1, h2").should("exist");
    cy.get("body").should("not.be.empty");
  });

  it("should navigate to templates list page", () => {
    cy.visit("/workflowos/templates", { failOnStatusCode: false });
    cy.url().should("include", "/workflowos/templates");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("قوالب") ||
        text.includes("Templates") ||
        text.includes("templates") ||
        text.includes("قالب") ||
        text.includes("template")
      ).to.eq(true);
    });
  });

  it("should navigate to new template creation page", () => {
    cy.visit("/workflowos/templates/new", { failOnStatusCode: false });
    cy.url().should("include", "/workflowos/templates/new");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("قالب جديد") ||
        text.includes("New Template") ||
        text.includes("new template") ||
        text.includes("إنشاء") ||
        text.includes("create")
      ).to.eq(true);
    });
  });

  it("should navigate to workflow records page", () => {
    cy.visit("/workflowos/records", { failOnStatusCode: false });
    cy.url().should("include", "/workflowos/records");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("سجلات") ||
        text.includes("Records") ||
        text.includes("records") ||
        text.includes("التدفقات") ||
        text.includes("workflows")
      ).to.eq(true);
    });
  });

  it("should navigate to admin panel", () => {
    cy.visit("/workflowos/admin", { failOnStatusCode: false });
    cy.url().should("include", "/workflowos/admin");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("إدارة") ||
        text.includes("Admin") ||
        text.includes("admin") ||
        text.includes("Administrative")
      ).to.eq(true);
    });
  });

  it("should have RTL direction across all WorkflowOS pages", () => {
    const workflowRoutes = [
      "/workflowos",
      "/workflowos/templates",
      "/workflowos/records",
      "/workflowos/admin",
    ];
    workflowRoutes.forEach((route) => {
      cy.visit(route, { failOnStatusCode: false });
      cy.get("html").should("have.attr", "dir", "rtl");
    });
  });
});
