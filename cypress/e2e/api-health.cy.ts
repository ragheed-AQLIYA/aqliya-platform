describe("API Health — Endpoint Validation", () => {
  it("should return 200 from /api/health with valid JSON structure", () => {
    cy.request("/api/health").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("status", "ok");
      expect(response.body).to.have.property("version");
      expect(response.body).to.have.property("checks");
      expect(response.body).to.have.property("uptime");
      expect(response.body.checks).to.have.property("database");
      expect(response.body.checks.database.ok).to.eq(true);
    });
  });

  it("should return 200 or 503 from /api/platform/health with proper structure", () => {
    cy.request({ url: "/api/platform/health", failOnStatusCode: false }).then((response) => {
      expect(response.status).to.be.oneOf([200, 503]);
      expect(response.body).to.have.property("status");
      expect(response.body).to.have.property("timestamp");
      expect(response.body).to.have.property("checks");
      expect(response.body).to.have.property("version", "0.1.0");
      expect(response.body.status).to.be.oneOf(["healthy", "degraded"]);
    });
  });

  it("should return health readiness check from /api/health/ready", () => {
    cy.request({ url: "/api/health/ready", failOnStatusCode: false }).then((response) => {
      expect(response.status).to.be.oneOf([200, 503]);
      expect(response.body).to.have.property("status");
      expect(response.body).to.have.property("checks");
      expect(response.body).to.have.property("uptime");
      expect(response.body.checks).to.have.property("database");
    });
  });

  it("should return 401 from protected API endpoints without auth", () => {
    const protectedEndpoints = [
      "/api/decisions",
      "/api/agent-memory",
    ];
    protectedEndpoints.forEach((endpoint) => {
      cy.request({ url: endpoint, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 404]);
      });
    });
  });

  it("should return 401 from audit evidence download without auth", () => {
    cy.request({
      url: "/api/audit/evidence/fake-evidence-id/download",
      failOnStatusCode: false,
    }).then((response) => {
      // Protected endpoint should return 401 or 404
      expect(response.status).to.be.oneOf([401, 403, 404]);
    });
  });

  it("should return valid JSON from health endpoints", () => {
    cy.request("/api/health").then((response) => {
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.body).to.be.an("object");
    });
  });

  it("should return correct response format with uptime field", () => {
    cy.request("/api/health").then((response) => {
      expect(response.body.uptime).to.be.a("number");
      expect(response.body.uptime).to.be.greaterThan(0);
      expect(response.body.responseTimeMs).to.be.a("number");
      expect(response.body.responseTimeMs).to.be.greaterThan(-1);
    });
  });
});
