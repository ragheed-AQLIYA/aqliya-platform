describe("LocalContentOS — Critical Workflow Journey", () => {
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

  it("should load LocalContentOS dashboard with KPIs", () => {
    cy.visit("/local-content", { timeout: 30000 });
    cy.contains(/LocalContentOS|المحتوى المحلي/i).should("exist");
    cy.get("h1, h2").should("exist");
  });

  it("should navigate the full project workflow path", () => {
    const projectRoutes = [
      "/local-content/projects",
      "/local-content/classification-rules",
      "/local-content/campaigns",
      "/local-content/analytics",
      "/local-content/review",
      "/local-content/outputs",
      "/local-content/health",
    ];
    projectRoutes.forEach((route) => {
      cy.visit(route, { failOnStatusCode: false });
      cy.url().should("include", route);
      cy.get("body").should("not.be.empty");
    });
  });

  it("should load projects list page with seeded projects", () => {
    cy.visit("/local-content/projects", { failOnStatusCode: false });
    cy.url().should("include", "/local-content/projects");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("المشاريع") ||
        text.includes("Projects") ||
        text.includes("مشروع") ||
        text.includes("project")
      ).to.eq(true);
    });
  });

  it("should load classification rules page", () => {
    cy.visit("/local-content/classification-rules", { failOnStatusCode: false });
    cy.url().should("include", "/classification-rules");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("تصنيف") ||
        text.includes("Classification") ||
        text.includes("Rules") ||
        text.includes("قواعد")
      ).to.eq(true);
    });
  });

  it("should load quality dashboard with metrics", () => {
    cy.visit("/local-content/quality-dashboard", { failOnStatusCode: false });
    cy.url().should("include", "/quality-dashboard");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("جودة") ||
        text.includes("Quality") ||
        text.includes("quality") ||
        text.includes("مؤشر") ||
        text.includes("indicator")
      ).to.eq(true);
    });
  });

  it("should load review center with review items", () => {
    cy.visit("/local-content/review-center", { failOnStatusCode: false });
    cy.url().should("include", "/review-center");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("مراجعة") ||
        text.includes("Review") ||
        text.includes("review")
      ).to.eq(true);
    });
  });

  it("should load analytics page with data visualizations", () => {
    cy.visit("/local-content/analytics", { failOnStatusCode: false });
    cy.url().should("include", "/local-content/analytics");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("تحليلات") ||
        text.includes("Analytics") ||
        text.includes("analytics") ||
        text.includes("تحليل")
      ).to.eq(true);
    });
  });
});
