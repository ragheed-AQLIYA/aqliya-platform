/**
 * AuditOS v0.1 closure regression — Trial Balance import through the browser.
 *
 * Exercises the real 4-step import wizard (upload -> column mapping ->
 * validation -> confirm) against the pilot engagement and asserts the imported
 * data is persisted and still visible after a reload.
 *
 *   npx cypress run --spec cypress/e2e/auditos-v01-trial-balance-import.cy.ts \
 *     --env pilotEngagementId=<id>
 */

const engagementId = Cypress.env("pilotEngagementId") as string;
const base = `/audit/engagements/${engagementId}`;

function loginPilotAdmin() {
  cy.session(
    "pilot-admin-tb",
    () => {
      cy.request("/api/auth/csrf").then((csrfRes) => {
        cy.request({
          method: "POST",
          url: "/api/auth/callback/credentials",
          form: true,
          body: {
            csrfToken: csrfRes.body.csrfToken,
            email: "admin.pilot@aqliya.com",
            password: "pilot123",
            redirect: "false",
            json: "true",
          },
        }).then((res) => expect(res.status).to.be.oneOf([200, 302]));
      });
    },
    {
      validate() {
        cy.request("/api/auth/session")
          .its("body.user.email")
          .should("eq", "admin.pilot@aqliya.com");
      },
    },
  );
}

describe("AuditOS v0.1 — Trial Balance import", () => {
  beforeEach(() => {
    expect(engagementId, "pilotEngagementId env var").to.be.a("string").and.not.be.empty;
    loginPilotAdmin();
  });

  it("rejects an unsupported file type", () => {
    cy.visit(`${base}/trial-balance`, { timeout: 60000 });
    // "رفع ميزان المراجعة" in the empty state, "رفع" once a TB exists.
    cy.contains("button", /^\s*رفع(\s+ميزان المراجعة)?\s*$/, { timeout: 60000 }).click();
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("not a trial balance"),
        fileName: "notes.txt",
        mimeType: "text/plain",
      },
      { force: true },
    );
    cy.contains("صيغة ملف غير مدعومة").should("exist");
  });

  it("imports a CSV trial balance and persists the accounts", () => {
    cy.visit(`${base}/trial-balance`, { timeout: 60000 });
    // "رفع ميزان المراجعة" in the empty state, "رفع" once a TB exists.
    cy.contains("button", /^\s*رفع(\s+ميزان المراجعة)?\s*$/, { timeout: 60000 }).click();

    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/v01-trial-balance.csv",
      { force: true },
    );
    cy.contains("v01-trial-balance.csv").should("exist");
    cy.contains("6 rows").should("exist");

    // Step 1 -> 2 (column mapping, auto-detected) -> 3 (validation)
    cy.contains("button", "التالي").click();
    cy.contains("button", "التالي").click();

    // Step 3 — validation: every check green, balanced debits/credits.
    cy.contains("التوازن", { timeout: 20000 }).should("exist");
    cy.contains("جميع الصفوف تحتوي على رموز").should("exist");
    cy.contains("جميع الصفوف تحتوي على أسماء").should("exist");
    cy.contains("لا توجد صفوف فارغة").should("exist");
    cy.contains("لا توجد مكررات").should("exist");
    cy.contains("المدين (750,000) = الدائن (750,000)").should("exist");
    cy.contains("خطأ").should("not.exist");
    cy.contains("button", "التالي").click();

    // Step 4 — confirm summary reports the validation as fully passed.
    cy.contains("جميع الفحوصات ناجحة", { timeout: 20000 }).should("exist");

    // Step 4 -> import
    cy.contains("button", "استيراد ميزان المراجعة", { timeout: 60000 }).click();
    cy.contains("تم استيراد ميزان المراجعة بنجاح", { timeout: 120000 }).should("exist");
    // The wizard closes itself once the import completes.
    cy.get('[role="dialog"]', { timeout: 60000 }).should("not.exist");

    // Imported rows visible, and still there after a full reload.
    cy.contains("Accounts Receivable", { timeout: 30000 }).should("exist");
    cy.reload();
    cy.contains("Accounts Receivable", { timeout: 60000 }).should("exist");
    cy.contains("Share Capital").should("exist");
  });

  it("blocks trial balance access for an actor from another audit organization", () => {
    cy.session("org-aqliya-admin-tb", () => {
      cy.request("/api/auth/csrf").then((csrfRes) => {
        cy.request({
          method: "POST",
          url: "/api/auth/callback/credentials",
          form: true,
          body: {
            csrfToken: csrfRes.body.csrfToken,
            email: "admin@aqliya.com",
            password: "admin123",
            redirect: "false",
            json: "true",
          },
        }).then((res) => expect(res.status).to.be.oneOf([200, 302]));
      });
    });
    cy.visit(`${base}/trial-balance`, { failOnStatusCode: false, timeout: 60000 });
    cy.contains("Accounts Receivable", { timeout: 10000 }).should("not.exist");
  });
});

export {};
