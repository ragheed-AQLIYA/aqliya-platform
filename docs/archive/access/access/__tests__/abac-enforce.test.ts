/** @jest-environment node */

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: jest.fn((key: string) => key === "platform.abac-enforce"),
}));

jest.mock("@/lib/platform/abac/abac-service", () => ({
  evaluateAccess: jest.fn(async () => ({
    allowed: false,
    policyName: "SENS-02",
    deniedByDefault: false,
  })),
}));

import { getAbacEnforceDenialReason } from "@/core/access/abac-gate";

describe("ABAC enforce mode", () => {
  const originalEnv = process.env.ABAC_ENFORCE_ORG_IDS;

  afterEach(() => {
    process.env.ABAC_ENFORCE_ORG_IDS = originalEnv;
  });

  it("returns denial reason for allowlisted org", async () => {
    process.env.ABAC_ENFORCE_ORG_IDS = "org-pilot";
    const reason = await getAbacEnforceDenialReason({
      userId: "user-1",
      organizationId: "org-pilot",
      resource: "platform",
      action: "export",
    });
    expect(reason).toContain("SENS-02");
  });

  it("skips enforce for orgs outside allowlist", async () => {
    process.env.ABAC_ENFORCE_ORG_IDS = "org-pilot";
    const reason = await getAbacEnforceDenialReason({
      userId: "user-1",
      organizationId: "org-other",
      resource: "platform",
      action: "export",
    });
    expect(reason).toBeNull();
  });
});
