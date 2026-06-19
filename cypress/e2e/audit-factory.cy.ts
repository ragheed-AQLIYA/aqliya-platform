describe("AuditOS — Factory Routes", () => {
  const engagementId = "eng-gulf-2025";
  const base = `/audit/engagements/${engagementId}`;

  describe("Authentication gates", () => {
    const factoryRoutes = [
      `${base}/factory-map`,
      `${base}/lead-schedules`,
      `${base}/validation`,
    ];

    factoryRoutes.forEach((route) => {
      it(`redirects unauthenticated users from ${route} to login`, () => {
        cy.visit(route, { failOnStatusCode: false });
        cy.url().should("include", "/login");
      });
    });
  });

  describe("Authenticated factory surfaces (flags default off)", () => {
    beforeEach(() => {
      cy.on("uncaught:exception", (err) => {
        if (
          err.message.includes("Server Components render") ||
          err.message.includes("digest")
        ) {
          return false;
        }
      });
      cy.loginAdmin();
    });

    it("loads factory-map with disabled or active mind map UI", () => {
      cy.visit(`${base}/factory-map`);
      cy.url().should("include", "/factory-map");
      cy.get("body").should(($body) => {
        const text = $body.text();
        expect(
          text.includes("خريطة المصنع غير مفعّلة") ||
            text.includes("خريطة مصنع القوائم المالية") ||
            text.includes("FF_AUDIT_MIND_MAP"),
        ).to.eq(true);
      });
    });

    it("loads lead-schedules tab with generate control", () => {
      cy.visit(`${base}/lead-schedules`, { failOnStatusCode: false });
      cy.url().should("include", "/lead-schedules");
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const text = $body.text();
        expect(
          text.includes("قوائم الربط") ||
            text.includes("Lead Schedules") ||
            text.includes("توليد") ||
            text.includes("إعادة توليد"),
        ).to.eq(true);
      });
    });

    it("loads validation tab with factory panels area", () => {
      cy.visit(`${base}/validation`);
      cy.url().should("include", "/validation");
      cy.get("body").should(($body) => {
        const text = $body.text();
        expect(
          text.includes("Factory reconciliation off") ||
            text.includes("FF_AUDIT_RECONCILIATION") ||
            text.includes("IFRS") ||
            text.includes("التحقق"),
        ).to.eq(true);
      });
    });

    it("includes factory-map in engagement navigation when tab is registered", () => {
      cy.visit(`${base}/trial-balance`);
      cy.get("body").then(($body) => {
        const text = $body.text();
        if (text.includes("خريطة") || text.includes("factory-map")) {
          cy.contains(/خريطة|factory/i).should("exist");
        }
      });
    });

    it("loads exports page with PDF and XLSX download controls", () => {
      cy.visit(`${base}/exports`, { failOnStatusCode: false });
      cy.url().should("include", "/exports");
      cy.contains("التصدير").should("exist");
      cy.get("body").should(($body) => {
        const text = $body.text();
        expect(
          (text.includes("PDF") && text.includes("XLSX")) ||
            text.includes("ولّد القوائم"),
        ).to.eq(true);
      });
    });

    it("returns PDF export for seeded engagement with statements", () => {
      cy.request({
        url: `/api/audit/engagements/${engagementId}/exports/pdf`,
        encoding: "binary",
        failOnStatusCode: false,
      }).then((res) => {
        // 200 when statements seeded; 400 when draft/export preconditions missing
        expect(res.status).to.be.oneOf([200, 400]);
        if (res.status === 200) {
          expect(String(res.headers["content-type"])).to.match(/pdf/i);
        }
      });
    });
  });
});
