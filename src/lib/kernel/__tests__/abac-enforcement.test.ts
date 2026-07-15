import {
  isAbacEnforceEnabledForOrg,
  listAbacEnforceOrgIds,
  getAbacEnforceDenialReason,
} from "@/lib/core/policy/access/abac-gate";

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: (key: string) => {
    if (key === "platform.abac-enforce") return true;
    return false;
  },
}));

jest.mock("@/lib/platform/abac/abac-service", () => ({
  evaluateAccess: jest.fn(async () => ({
    allowed: false,
    policyName: "data-classification",
  })),
}));

describe("ABAC Enforcement Toggle", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("isAbacEnforceEnabledForOrg", () => {
    it("returns false when ABAC_ENFORCE_ORG_IDS is empty", () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "";
      const result = isAbacEnforceEnabledForOrg("org-1");
      expect(result).toBe(false);
    });

    it("returns true for allowlisted org", () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "org-1,org-2";
      const result = isAbacEnforceEnabledForOrg("org-1");
      expect(result).toBe(true);
    });

    it("returns false for non-allowlisted org", () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "org-1,org-2";
      const result = isAbacEnforceEnabledForOrg("org-3");
      expect(result).toBe(false);
    });
  });

  describe("listAbacEnforceOrgIds", () => {
    it("returns empty array when env is empty", () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "";
      const result = listAbacEnforceOrgIds();
      expect(result).toEqual([]);
    });

    it("parses comma-separated org IDs", () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "org-1,org-2,org-3";
      const result = listAbacEnforceOrgIds();
      expect(result).toEqual(["org-1", "org-2", "org-3"]);
    });

    it("trims whitespace", () => {
      process.env.ABAC_ENFORCE_ORG_IDS = " org-1 , org-2 ";
      const result = listAbacEnforceOrgIds();
      expect(result).toEqual(["org-1", "org-2"]);
    });
  });

  describe("getAbacEnforceDenialReason", () => {
    it("returns null when org not in allowlist", async () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "org-1";
      const result = await getAbacEnforceDenialReason({
        userId: "user-1",
        organizationId: "org-2",
        action: "read",
        resource: "engagement",
      });
      expect(result).toBeNull();
    });

    it("returns denial reason when ABAC policy denies", async () => {
      process.env.ABAC_ENFORCE_ORG_IDS = "org-1";
      const result = await getAbacEnforceDenialReason({
        userId: "user-1",
        organizationId: "org-1",
        action: "read",
        resource: "engagement",
      });
      expect(result).toContain("ABAC policy denied");
    });
  });
});
