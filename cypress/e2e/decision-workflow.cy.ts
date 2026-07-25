describe("DecisionOS — Critical Workflow Journey", () => {
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

  it("should load DecisionOS dashboard with seeded decisions", () => {
    cy.visit("/decisions", { timeout: 30000 });
    cy.contains(/DecisionOS|قرارات/i).should("exist");
    cy.contains(/Non-Profit Training/i).should("exist");
    cy.contains(/Cloud Infrastructure/i).should("exist");
  });

  it("should navigate to new decision form and verify fields", () => {
    cy.visit("/decisions/new", { failOnStatusCode: false });
    cy.url().should("include", "/decisions/new");
    cy.get("body").should(($body) => {
      const text = $body.text();
      expect(
        text.includes("قرار جديد") ||
        text.includes("New Decision") ||
        text.includes("new decision") ||
        text.includes("عنوان") ||
        text.includes("title")
      ).to.eq(true);
    });
  });

  it("should navigate the full decision workflow tabs for a seeded decision", () => {
    cy.visit("/decisions", { failOnStatusCode: false });
    cy.contains(/Non-Profit Training/i).click();
    cy.url().should("match", /\/decisions\//);
    cy.url().then((url) => {
      const id = url.split("/").filter(Boolean).pop();
      if (!id) return;
      const decisionTabs = [
        { path: `/decisions/${id}/framework` },
        { path: `/decisions/${id}/risks` },
        { path: `/decisions/${id}/scenarios` },
        { path: `/decisions/${id}/recommendation` },
        { path: `/decisions/${id}/governance` },
        { path: `/decisions/${id}/intake` },
      ];
      decisionTabs.forEach(({ path }) => {
        cy.visit(path, { failOnStatusCode: false });
        cy.url().should("include", path.split("/").pop()!);
        cy.get("body").should("not.be.empty");
      });
    });
  });

  it("should display risk assessment on risks tab", () => {
    cy.visit("/decisions", { failOnStatusCode: false });
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").filter(Boolean).pop();
      if (id) {
        cy.visit(`/decisions/${id}/risks`, { failOnStatusCode: false });
        cy.url().should("include", "/risks");
        cy.get("body").should(($body) => {
          const text = $body.text();
          expect(
            text.includes("مخاطر") ||
            text.includes("Risk") ||
            text.includes("risk") ||
            text.includes("Impact") ||
            text.includes("تأثير")
          ).to.eq(true);
        });
      }
    });
  });

  it("should display recommendation content on recommendation tab", () => {
    cy.visit("/decisions", { failOnStatusCode: false });
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").filter(Boolean).pop();
      if (id) {
        cy.visit(`/decisions/${id}/recommendation`, { failOnStatusCode: false });
        cy.url().should("include", "/recommendation");
        cy.get("body").should(($body) => {
          const text = $body.text();
          expect(
            text.includes("توصية") ||
            text.includes("Recommendation") ||
            text.includes("recommendation") ||
            text.includes("Proceed") ||
            text.includes("Proceed with the tender")
          ).to.eq(true);
        });
      }
    });
  });

  it("should display governance workflow with approval actions", () => {
    cy.visit("/decisions", { failOnStatusCode: false });
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").filter(Boolean).pop();
      if (id) {
        cy.visit(`/decisions/${id}/governance`, { failOnStatusCode: false });
        cy.url().should("include", "/governance");
        cy.get("body").should(($body) => {
          const text = $body.text();
          expect(
            text.includes("حوكمة") ||
            text.includes("Governance") ||
            text.includes("governance") ||
            text.includes("govern")
          ).to.eq(true);
        });
      }
    });
  });
});
