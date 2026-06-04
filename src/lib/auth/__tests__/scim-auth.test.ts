import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { authenticateScimRequest } from "@/app/api/scim/v2/auth";

describe("authenticateScimRequest", () => {
  const prevKey = process.env.SCIM_API_KEY;
  const prevOrg = process.env.SCIM_DEFAULT_ORG_ID;

  beforeEach(() => {
    process.env.SCIM_API_KEY = "test-scim-key";
    process.env.SCIM_DEFAULT_ORG_ID = "org-test-1";
  });

  afterEach(() => {
    process.env.SCIM_API_KEY = prevKey;
    process.env.SCIM_DEFAULT_ORG_ID = prevOrg;
  });

  it("rejects missing Authorization header", () => {
    const result = authenticateScimRequest(new Request("http://localhost/api/scim/v2/Users"));
    expect(result.authenticated).toBe(false);
    expect(result.response?.status).toBe(401);
  });

  it("rejects invalid bearer token", () => {
    const result = authenticateScimRequest(
      new Request("http://localhost/api/scim/v2/Users", {
        headers: { Authorization: "Bearer wrong" },
      }),
    );
    expect(result.authenticated).toBe(false);
  });

  it("accepts valid bearer and returns organizationId", () => {
    const result = authenticateScimRequest(
      new Request("http://localhost/api/scim/v2/Users", {
        headers: { Authorization: "Bearer test-scim-key" },
      }),
    );
    expect(result.authenticated).toBe(true);
    expect(result.organizationId).toBe("org-test-1");
  });
});
