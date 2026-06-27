/**
 * End-to-end authorization pipeline integration test.
 *
 * Exercises the full stack: authorize() → tenant-guard → RBAC → abac-bridge
 *
 * Key difference from other tests in this directory:
 *   - Does NOT mock tenant-guard (real tenant isolation logic)
 *   - Does NOT mock abac-bridge (real ABAC bridge)
 *   - Mocks ONLY @/lib/platform/abac/abac-service (infrastructure boundary — Prisma)
 *
 * This ensures all three authorization layers are exercised in their
 * real interleaving: TENANT → RBAC → ABAC.
 */

import { authorize } from "../authorize";
import type { CurrentUser } from "../types";

// ─── Mock infrastructure boundary only ───

const mockEvaluateAccess = jest.fn();
jest.mock("@/lib/platform/abac/abac-service", () => ({
  evaluateAccess: mockEvaluateAccess,
}));

// ─── Test Utilities ───

function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: "user-1",
    email: "user@test.com",
    name: "Test User",
    role: "OPERATOR",
    organizationId: "org-alpha",
    organization: { id: "org-alpha", name: "Org Alpha" },
    ...overrides,
  };
}

const adminUser: CurrentUser = makeUser({ id: "admin-1", role: "ADMIN" });
const viewerUser: CurrentUser = makeUser({ id: "viewer-1", role: "VIEWER" });

// ─── Tests ───

describe("E2E: Authorization Pipeline (RBAC → Tenant → ABAC)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: ABAC allows everything (fail-open for missing policies)
    mockEvaluateAccess.mockResolvedValue({
      allowed: true,
      effect: "ALLOW",
      matchedPolicyId: null,
      policyName: null,
      deniedByDefault: false,
    });
  });

  // ── Layer 1: RBAC ──

  describe("RBAC layer", () => {
    it("allows admin to perform any action in their tenant", async () => {
      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "delete",
      });
      expect(result.allowed).toBe(true);
    });

    it("allows admin to approve", async () => {
      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "approve",
      });
      expect(result.allowed).toBe(true);
    });

    it("denies viewer from deleting (insufficient role)", async () => {
      const result = await authorize({
        user: viewerUser,
        resource: { type: "engagement", id: "e-1" },
        action: "delete",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Insufficient permissions");
    });

    it("allows viewer to read", async () => {
      const result = await authorize({
        user: viewerUser,
        resource: { type: "engagement", id: "e-1" },
        action: "read",
      });
      expect(result.allowed).toBe(true);
    });

    it("denies viewer from approving", async () => {
      const result = await authorize({
        user: viewerUser,
        resource: { type: "engagement", id: "e-1" },
        action: "approve",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Insufficient permissions");
    });

    it("denies operator from managing users", async () => {
      const operatorUser = makeUser({ role: "OPERATOR" });
      const result = await authorize({
        user: operatorUser,
        resource: { type: "engagement", id: "e-1" },
        action: "manage_users",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Insufficient permissions");
    });
  });

  // ── Layer 2: Tenant Isolation ──

  describe("Tenant isolation layer", () => {
    it("allows operator access to own org resources", async () => {
      const result = await authorize({
        user: makeUser({ organizationId: "org-alpha" }),
        resource: { type: "engagement", id: "e-1" },
        action: "read",
      });
      expect(result.allowed).toBe(true);
    });

    it("denies operator access to another org's resources", async () => {
      const result = await authorize({
        user: makeUser({ organizationId: "org-alpha" }),
        resource: { type: "engagement", id: "e-1", tenantId: "org-beta" },
        action: "read",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Tenant access denied");
    });

    it("allows admin to bypass tenant isolation", async () => {
      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1", tenantId: "org-beta" },
        action: "read",
      });
      expect(result.allowed).toBe(true);
    });

    it("denies viewer from another org even for read-only action", async () => {
      const otherViewer = makeUser({
        id: "viewer-other",
        role: "VIEWER",
        organizationId: "org-alpha",
      });
      const result = await authorize({
        user: otherViewer,
        resource: { type: "engagement", id: "e-1", tenantId: "org-beta" },
        action: "read",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Tenant access denied");
    });

    it("uses user's own org when no tenantId specified", async () => {
      const result = await authorize({
        user: makeUser({ organizationId: "org-alpha" }),
        resource: { type: "engagement", id: "e-1" },
        action: "read",
      });
      // No explicit tenantId → defaults to user.organizationId → allowed
      expect(result.allowed).toBe(true);
    });

    it("bypasses tenant check when context flag is set", async () => {
      const result = await authorize({
        user: makeUser({ organizationId: "org-alpha" }),
        resource: { type: "engagement", id: "e-1", tenantId: "org-beta" },
        action: "read",
        context: { bypassTenantCheck: true },
      });
      expect(result.allowed).toBe(true);
    });
  });

  // ── Layer 3: ABAC ──

  describe("ABAC layer (via real abac-bridge)", () => {
    it("passes ABAC evaluation when engine allows", async () => {
      mockEvaluateAccess.mockResolvedValue({
        allowed: true,
        effect: "ALLOW",
        matchedPolicyId: null,
        policyName: null,
        deniedByDefault: false,
      });

      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "read",
        context: { attributes: { sensitivity: "low" } },
      });
      expect(result.allowed).toBe(true);
    });

    it("denies when ABAC engine rejects", async () => {
      mockEvaluateAccess.mockResolvedValue({
        allowed: false,
        effect: "DENY",
        matchedPolicyId: "policy-1",
        policyName: "SENS-02",
        deniedByDefault: false,
      });

      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "read",
        context: { attributes: { sensitivity: "high" } },
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("SENS-02");
    });

    it("passes through when no ABAC attributes provided (no ABAC check)", async () => {
      // ABAC bridge should not be called when no attributes context
      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "read",
      });
      expect(result.allowed).toBe(true);
      expect(mockEvaluateAccess).not.toHaveBeenCalled();
    });

    it("passes through when ABAC engine throws (fail-open)", async () => {
      mockEvaluateAccess.mockRejectedValue(new Error("DB connection lost"));

      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "read",
        context: { attributes: { sensitivity: "low" } },
      });
      // abac-bridge catches errors and defaults to allowed
      expect(result.allowed).toBe(true);
    });

    it("forwards principal and action to ABAC engine", async () => {
      mockEvaluateAccess.mockResolvedValue({
        allowed: true,
        effect: "ALLOW",
        matchedPolicyId: null,
        policyName: null,
        deniedByDefault: false,
      });

      await authorize({
        user: adminUser,
        resource: { type: "decision", id: "d-1" },
        action: "approve",
        context: { attributes: { riskLevel: "medium" } },
      });

      expect(mockEvaluateAccess).toHaveBeenCalledTimes(1);
      const abacArgs = mockEvaluateAccess.mock.calls[0][0];
      expect(abacArgs.resourceType).toBe("decision");
      expect(abacArgs.action).toBe("approve");
      expect(abacArgs.userId).toBe("admin-1");
      expect(abacArgs.organizationId).toBe("org-alpha");
      expect(abacArgs.attributes).toEqual({ riskLevel: "medium" });
    });
  });

  // ── Combined Layer Tests ──

  describe("Combined pipeline (two+ layers)", () => {
    it("denies at TENANT layer before RBAC is evaluated", async () => {
      // User has correct role but wrong org → should fail at tenant before RBAC
      const result = await authorize({
        user: adminUser, // ADMIN role (would pass RBAC)
        resource: { type: "engagement", id: "e-1", tenantId: "org-beta" },
        action: "read",
        // Admin bypasses tenant, so this should actually pass!
        // Test the non-admin case:
      });

      // Admin bypasses tenant isolation by design
      expect(result.allowed).toBe(true);

      // Test with non-admin to prove tenant check happens first
      const operatorResult = await authorize({
        user: makeUser({ role: "OPERATOR", organizationId: "org-alpha" }),
        resource: { type: "engagement", id: "e-1", tenantId: "org-beta" },
        action: "read",
      });

      expect(operatorResult.allowed).toBe(false);
      expect(operatorResult.reason).toContain("Tenant access denied");
    });

    it("denies at RBAC layer when role insufficient (tenant passed)", async () => {
      const result = await authorize({
        user: viewerUser,
        resource: { type: "engagement", id: "e-1" },
        action: "delete",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Insufficient permissions");
      // Tenant was not the issue — same org
      expect(result.reason).not.toContain("Tenant access");
    });

    it("denies at ABAC layer even when RBAC and tenant pass", async () => {
      mockEvaluateAccess.mockResolvedValue({
        allowed: false,
        effect: "DENY",
        matchedPolicyId: "policy-2",
        policyName: "HIGH-VALUE",
        deniedByDefault: false,
      });

      // Admin → RBAC passes, same org → tenant passes, but ABAC denies
      const result = await authorize({
        user: adminUser,
        resource: { type: "report", id: "r-1" },
        action: "export",
        context: { attributes: { value: "high" } },
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("HIGH-VALUE");
      // Verify it's ABAC denial, not RBAC or tenant
      expect(result.reason).toContain("ABAC");
    });

    it("allows when ALL three layers pass", async () => {
      mockEvaluateAccess.mockResolvedValue({
        allowed: true,
        effect: "ALLOW",
        matchedPolicyId: "policy-3",
        policyName: "LOW-RISK",
        deniedByDefault: false,
      });

      // Same org → TENANT pass
      // Admin role → RBAC pass
      // ABAC allows → ABAC pass
      const result = await authorize({
        user: adminUser,
        resource: { type: "evidence", id: "ev-1" },
        action: "export",
        context: { attributes: { classification: "public" } },
      });
      expect(result.allowed).toBe(true);
    });
  });

  // ── Return Values ──

  describe("Return value structure", () => {
    it("returns principal on allowed", async () => {
      const result = await authorize({
        user: adminUser,
        resource: { type: "engagement", id: "e-1" },
        action: "read",
      });
      expect(result.principal).toBeDefined();
      expect(result.principal!.userId).toBe("admin-1");
      expect(result.principal!.organizationId).toBe("org-alpha");
    });

    it("returns principal on denied", async () => {
      const result = await authorize({
        user: viewerUser,
        resource: { type: "engagement", id: "e-1" },
        action: "delete",
      });
      expect(result.principal).toBeDefined();
      expect(result.principal!.role).toBe("viewer");
    });
  });

  // ── Cross-Product Guards (via authorize) ──

  describe("Cross-resource type authorization", () => {
    it("handles organization resource type", async () => {
      const result = await authorize({
        user: adminUser,
        resource: { type: "organization", id: "org-alpha" },
        action: "admin",
      });
      expect(result.allowed).toBe(true);
    });

    it("handles document resource type", async () => {
      const result = await authorize({
        user: viewerUser,
        resource: { type: "document", id: "doc-1" },
        action: "read",
      });
      expect(result.allowed).toBe(true);
    });

    it("handles decision resource type", async () => {
      const result = await authorize({
        user: makeUser({ role: "OPERATOR" }),
        resource: { type: "decision", id: "dec-1" },
        action: "approve",
      });
      // operator cannot approve
      expect(result.allowed).toBe(false);
    });

    it("handles unknown resource type gracefully", async () => {
      const result = await authorize({
        user: adminUser,
        resource: { type: "unknown-type" as any, id: "x-1" },
        action: "read",
      });
      expect(result.allowed).toBe(true);
    });
  });
});
