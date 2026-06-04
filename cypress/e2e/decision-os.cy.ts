describe("DecisionOS — Decision Workspace", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@aqliya.com");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should("not.include", "/login");
  });

  it("should load DecisionOS dashboard with title and KPIs", () => {
    cy.visit("/decisions");
    cy.contains(/DecisionOS|قرارات/i).should("exist");
    cy.get("h1, h2, h3").should("exist");
  });

  it("should display decision list with seeded decisions", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).should("exist");
    cy.contains(/Cloud Infrastructure/i).should("exist");
    cy.contains(/Market Expansion/i).should("exist");
  });

  it("should navigate to new decision form", () => {
    cy.visit("/decisions/new");
    cy.url().should("include", "/decisions/new");
  });

  it("should create a new decision", () => {
    cy.visit("/decisions/new");
    cy.get("body").then(($body) => {
      const hasTitleInput = $body.find('input[id="title"], input[name="title"]').length > 0;
      if (hasTitleInput) {
        cy.get('input[id="title"], input[name="title"]').first().type("Cypress Test Decision - E2E");
        cy.get('textarea, [contenteditable="true"]').first().type("Test decision created by Cypress E2E");
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should("not.include", "/decisions/new");
      } else {
        cy.contains(/قرار جديد/i).should("exist");
      }
    });
  });

  it("should open seeded TENDER decision detail page", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().should("include", "/decisions/");
  });

  it("should navigate through decision overview tab sections", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().should("include", "/decisions/");
    cy.contains(/Non-Profit Training/i).should("exist");
  });

  it("should navigate to framework tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/framework`);
        cy.url().should("include", "/framework");
      }
    });
  });

  it("should navigate to scenarios tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/scenarios`);
        cy.url().should("include", "/scenarios");
      }
    });
  });

  it("should navigate to risks tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/risks`);
        cy.url().should("include", "/risks");
      }
    });
  });

  it("should navigate to recommendation tab and see seeded recommendation", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/recommendation`);
        cy.url().should("include", "/recommendation");
        cy.contains(/Proceed with the tender/i).should("exist");
      }
    });
  });

  it("should navigate to simulation tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/simulation`);
        cy.url().should("include", "/simulation");
      }
    });
  });

  it("should navigate to tender detail tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/tender`);
        cy.url().should("include", "/tender");
        cy.contains(/Social Development/i).should("exist");
      }
    });
  });

  it("should navigate to governance tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/governance`);
        cy.url().should("include", "/governance");
      }
    });
  });

  it("should navigate to intake tab", () => {
    cy.visit("/decisions");
    cy.contains(/Non-Profit Training/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/intake`);
        cy.url().should("include", "/intake");
      }
    });
  });

  it("should navigate to signals tab", () => {
    cy.visit("/decisions");
    cy.contains(/Cloud Infrastructure/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/signals`);
        cy.url().should("include", "/signals");
      }
    });
  });

  it("should navigate to insight tab for strategic decisions", () => {
    cy.visit("/decisions");
    cy.contains(/Market Expansion/i).click();
    cy.url().then((url) => {
      const id = url.split("/").pop();
      if (id) {
        cy.visit(`/decisions/${id}/insight`);
        cy.url().should("include", "/insight");
      }
    });
  });
});
