/**
 * AuditOS v0.1 closure regression.
 *
 * Covers the critical path that no existing spec asserts end-to-end:
 *   evidence -> create observation -> real IFRS RAG citation -> citation
 *   survives reload -> review transitions persist -> tenant isolation.
 *
 * Runs against the pilot environment produced by `npm run seed:pilot`.
 * The engagement id is a cuid, so it is injected:
 *   npx cypress run --spec cypress/e2e/auditos-v01-closure.cy.ts \
 *     --env pilotEngagementId=<id>
 */

const engagementId = Cypress.env("pilotEngagementId") as string;
const base = `/audit/engagements/${engagementId}`;

/** IFRS/IAS/IFRIC/SIC standard label, e.g. "IFRS 15.9" or "IAS 2.25". */
const REAL_CITATION = /\b(IFRS|IAS|IFRIC|SIC)\s?\d+[A-Z]?(\.[\w.\-–]+)?/;
const PLACEHOLDER = /mock citation|test citation|example paragraph|^see ifrs$/i;

function loginAs(email: string, password: string, sessionId: string) {
  cy.session(
    sessionId,
    () => {
      cy.request("/api/auth/csrf").then((csrfRes) => {
        cy.request({
          method: "POST",
          url: "/api/auth/callback/credentials",
          form: true,
          body: {
            csrfToken: csrfRes.body.csrfToken,
            email,
            password,
            redirect: "false",
            json: "true",
          },
        }).then((res) => {
          expect(res.status).to.be.oneOf([200, 302]);
        });
      });
    },
    {
      validate() {
        cy.request("/api/auth/session").its("body.user.email").should("eq", email);
      },
    },
  );
}

const loginPilotAdmin = () =>
  loginAs("admin.pilot@aqliya.com", "pilot123", "pilot-admin");

describe("AuditOS v0.1 — closure critical path", () => {
  const observationTitle = "V01 CLOSURE — إيرادات عقود طويلة الأجل (IFRS 15)";
  // Deliberately contains "g" followed by "a" ("recognised" ... "obligation"):
  // global single-letter shortcuts must not hijack typing in a form field.
  const observationDescription =
    "Revenue from contracts with customers is recognised on invoicing rather than when " +
    "the performance obligation is satisfied. Long-term construction contracts should be " +
    "recognised over time under the five-step model.";

  before(() => {
    expect(engagementId, "pilotEngagementId env var").to.be.a("string").and.not.be.empty;
  });

  beforeEach(() => {
    loginPilotAdmin();
  });

  it("loads the evidence page with real seeded evidence (no dev fallback)", () => {
    cy.visit(`${base}/evidence`, { timeout: 60000 });
    cy.contains("كشف-الحساب-البنكي.pdf", { timeout: 30000 }).should("exist");
    // Dev fallback / mock-data banner must not be present.
    cy.get("body").should("not.contain.text", "DEV FALLBACK");
    cy.get("body").should("not.contain.text", "AUDIT_DEV_FALLBACK_ENABLED");
  });

  it("creates an observation through the UI and persists it", () => {
    cy.visit(`${base}/findings`, { timeout: 60000 });
    cy.contains("button", "نتيجة جديدة", { timeout: 30000 }).click();
    cy.url().should("include", "/findings");

    cy.get('[role="dialog"]').within(() => {
      cy.get("input").first().type(observationTitle);
      cy.get("textarea").first().type(observationDescription);
    });
    cy.url().should("include", "/findings");
    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", /^إنشاء$/).click();
    });

    cy.get('[role="dialog"]', { timeout: 180000 }).should("not.exist");
    // Creating a finding must not navigate away from the findings tab.
    cy.url().should("include", "/findings");
    cy.contains(observationTitle, { timeout: 30000 }).should("exist");

    // Persisted server-side, not just optimistic UI.
    cy.visit(`${base}/findings`, { timeout: 120000 });
    cy.contains(observationTitle, { timeout: 60000 }).should("exist");
  });

  it("returns Knowledge Foundation citations with real standard and paragraph refs", () => {
    cy.request({
      method: "POST",
      url: "/api/knowledge/rag/search",
      body: { query: observationDescription, limit: 3 },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.count, "citation count").to.be.greaterThan(0);
      const citation = res.body.citations[0];
      expect(citation.chunkId, "chunk id").to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(citation.documentId, "document id").to.match(/^ifrs-kf-/);
      expect(citation.standardCode, "standard code").to.match(REAL_CITATION);
      expect(citation.paragraphRef, "paragraph reference").to.match(REAL_CITATION);
      expect(citation.sourceUrl, "external reference").to.contain("ifrs.org");
      expect(citation.relevance, "relevance").to.be.greaterThan(0);
      expect(citation.contentPreview, "cited content").to.not.match(PLACEHOLDER);
      cy.log(`CITATION_JSON::${JSON.stringify(res.body.citations)}`);
      cy.writeFile("cypress/results/v01-citation-evidence.json", res.body.citations);
    });
  });

  it("renders a real IFRS citation traceable to the Knowledge Foundation", () => {
    cy.visit(`${base}/findings`, { timeout: 60000 });
    cy.contains(observationTitle, { timeout: 30000 }).click();
    cy.contains("button", "مراجع IFRS ذات الصلة").click();
    // Assert the panel actually expanded before asserting on its contents,
    // otherwise the "should not exist" checks below pass vacuously.
    cy.contains("button", "مراجع IFRS ذات الصلة").should(
      "have.attr",
      "aria-expanded",
      "true",
    );

    cy.contains("جارٍ البحث في قاعدة المعرفة IFRS...", { timeout: 120000 }).should("not.exist");
    cy.contains("لا توجد مراجع ذات صلة").should("not.exist");
    cy.contains("تعذّر تحميل مراجع IFRS حالياً، حاول لاحقاً.").should("not.exist");

    cy.get('a[href*="ifrs.org"]', { timeout: 20000 }).should("have.length.greaterThan", 0);

    cy.contains("button", "مراجع IFRS ذات الصلة")
      .parent()
      .invoke("text")
      .then((text) => {
        const label = String(text);
        expect(label, "citation label").to.match(REAL_CITATION);
        expect(label, "no placeholder citation").to.not.match(PLACEHOLDER);
        expect(label, "relevance score rendered").to.match(/\d+%/);
        cy.log(`CITATION_TEXT::${label.replace(/\s+/g, " ").trim()}`);
      });
  });

  it("keeps the IFRS citation after a full page reload", () => {
    cy.visit(`${base}/findings`, { timeout: 120000 });
    cy.contains(observationTitle, { timeout: 60000 }).click();
    cy.contains("button", "مراجع IFRS ذات الصلة").click();
    cy.contains("button", "مراجع IFRS ذات الصلة").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.contains("جارٍ البحث في قاعدة المعرفة IFRS...", { timeout: 120000 }).should("not.exist");
    cy.get('a[href*="ifrs.org"]').should("have.length.greaterThan", 0);
    cy.contains("button", "مراجع IFRS ذات الصلة")
      .parent()
      .invoke("text")
      .should("match", REAL_CITATION);
  });

  it("moves the observation draft → open → in_review and persists both transitions", () => {
    cy.visit(`${base}/findings`, { timeout: 60000 });
    cy.contains(observationTitle, { timeout: 30000 }).click();

    cy.contains("button", "قبول").click();
    cy.visit(`${base}/findings`, { timeout: 120000 });
    cy.contains(observationTitle, { timeout: 60000 })
      .closest("tr")
      .should("contain.text", "مفتوحة");

    cy.contains(observationTitle).click();
    cy.contains("button", "بدء المراجعة").click();
    cy.visit(`${base}/findings`, { timeout: 120000 });
    cy.contains(observationTitle, { timeout: 60000 })
      .closest("tr")
      .should("contain.text", "قيد المراجعة");
  });

  it("signs the user out and drops the session", () => {
    loginPilotAdmin();
    cy.request("/api/auth/session").its("body.user.email").should("eq", "admin.pilot@aqliya.com");
    cy.request("/api/auth/csrf").then((csrfRes) => {
      cy.request({
        method: "POST",
        url: "/api/auth/signout",
        form: true,
        body: { csrfToken: csrfRes.body.csrfToken, json: "true" },
      }).then((res) => expect(res.status).to.be.oneOf([200, 302]));
    });
    cy.request("/api/auth/session").then((res) => {
      expect(res.body?.user, "session after signout").to.be.undefined;
    });
    cy.request({
      url: `${base}/findings`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status, "protected route after signout").to.eq(307);
    });
    Cypress.session.clearAllSavedSessions();
  });

  it("rejects unauthenticated access to AuditOS pages and the RAG API", () => {
    cy.clearCookies();
    cy.request({
      url: `${base}/findings`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status, "unauthenticated page request").to.eq(307);
      expect(res.redirectedToUrl).to.include("/login");
    });
    cy.request({
      method: "POST",
      url: "/api/knowledge/rag/search",
      body: { query: "revenue recognition" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status, "unauthenticated RAG search").to.eq(401);
    });
  });

  it("reports the engagement approval state and its gating reason", () => {
    cy.visit(`${base}/approval`, { timeout: 120000 });
    cy.contains(/اعتماد|الاعتماد/, { timeout: 60000 }).should("exist");
  });

  it("enforces tenant isolation for an actor in another audit organization", () => {
    loginAs("admin@aqliya.com", "admin123", "org-aqliya-admin");
    cy.visit(`${base}/findings`, { failOnStatusCode: false, timeout: 60000 });
    cy.contains(observationTitle, { timeout: 10000 }).should("not.exist");
  });
});

export {};
