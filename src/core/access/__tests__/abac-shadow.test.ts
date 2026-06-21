/** @jest-environment node */

jest.mock("@/lib/core/audit/engine", () => ({
  AuditEngine: { write: jest.fn(async () => ({ ok: true, id: "log-1" })) },
}));

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: jest.fn((key: string) => key === "platform.abac-shadow"),
}));

jest.mock("@/lib/platform/abac/abac-service", () => ({
  evaluateAccess: jest.fn(async () => ({
    allowed: false,
    policyName: "ORG-01",
    deniedByDefault: false,
  })),
}));

import { AuditEngine } from "@/lib/core/audit/engine";
import { runAbacShadowEvaluation } from "@/core/access/abac-shadow";

describe("ABAC shadow evaluation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs mismatch when RBAC grants but ABAC denies", async () => {
    await runAbacShadowEvaluation(
      {
        userId: "user-1",
        organizationId: "org-1",
        resource: "organization",
        action: "read",
      },
      { decision: "granted" },
    );

    expect(AuditEngine.write).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.abac.shadow.mismatch" }),
    );
  });
});
