describe("AuditOS — Sampling browser smoke", () => {
  beforeEach(() => {
    cy.loginAdmin();
  });

  it("loads sampling tab with population and governance banner", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/sampling", {
      timeout: 30000,
      failOnStatusCode: false,
    });
    cy.url().should("include", "/sampling");
    cy.contains("محرك العينة").should("exist");
    cy.contains("بنود الميزان").should("exist");
    cy.contains("الذكاء الاصطناعي لا يختار العينة النهائية").should("exist");
  });

  it("generates reproducible stratified sample with seed smoke-01", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/sampling", {
      timeout: 30000,
      failOnStatusCode: false,
    });
    cy.get("#method", { timeout: 20000 }).select("stratified");
    cy.get("#sampleSize").clear().type("5");
    cy.get("#seed").clear().type("smoke-01");
    cy.contains("button", "توليد العينة").click();
    cy.contains("نتيجة العينة", { timeout: 20000 }).should("exist");
    cy.get("table tbody tr").should("have.length.at.least", 1);

    cy.get("#seed").clear().type("smoke-01");
    cy.contains("button", "توليد العينة").click();
    cy.contains("نتيجة العينة", { timeout: 20000 }).should("exist");
  });

  it("generates systematic sample with interval", () => {
    cy.visit("/audit/engagements/eng-gulf-2025/sampling", {
      timeout: 30000,
      failOnStatusCode: false,
    });
    cy.get("#method", { timeout: 20000 }).select("systematic");
    cy.get("#interval").type("2");
    cy.get("#randomStart").type("1");
    cy.get("#sampleSize").clear().type("5");
    cy.contains("button", "توليد العينة").click();
    cy.contains("نتيجة العينة", { timeout: 20000 }).should("exist");
    cy.contains("نظامي").should("exist");
  });
});
