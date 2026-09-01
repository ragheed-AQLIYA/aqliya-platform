import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { authenticateScimRequest } from "@/app/api/scim/v2/auth";

describe("authenticateScimRequest", () => {
  const prevKey = process.env.SCIM_API_KEY;
  const prevOrg = process.env.SCIM_DEFAULT_ORG_ID;
  const prevMap = process.env.SCIM_ORG_KEYS;

  beforeEach(() => {
    process.env.SCIM_API_KEY = "test-scim-key";
    process.env.SCIM_DEFAULT_ORG_ID = "org-test-1";
    delete process.env.SCIM_ORG_KEYS;
  });

  afterEach(() => {
    process.env.SCIM_API_KEY = prevKey;
    process.env.SCIM_DEFAULT_ORG_ID = prevOrg;
    process.env.SCIM_ORG_KEYS = prevMap;
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

  it("maps SCIM_ORG_KEYS to the matching organization", () => {
    process.env.SCIM_ORG_KEYS = JSON.stringify({
      "org-a": "tenant-a-key",
      "org-b": "tenant-b-key",
    });
    const result = authenticateScimRequest(
      new Request("http://localhost/api/scim/v2/Users", {
        headers: { Authorization: "Bearer tenant-b-key" },
      }),
    );
    expect(result.authenticated).toBe(true);
    expect(result.organizationId).toBe("org-b");
  });
});
