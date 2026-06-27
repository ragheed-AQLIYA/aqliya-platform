/**
 * Tests for the authorize() entry point and related pure functions.
 */

import { authorize, hasPermission, hasSufficientRoleLevel } from "../authorize";
import type { CurrentUser } from "../types";

// We mock tenant-guard and abac-bridge to test authorize() in isolation
jest.mock("../tenant-guard", () => ({
  checkTenantAccess: jest.fn().mockResolvedValue({ allowed: true }),
}));

jest.mock("../abac-bridge", () => ({
  evaluateAbac: jest.fn().mockResolvedValue({ allowed: true }),
}));

describe("hasPermission", () => {
  it("admin has all permissions", () => {
    expect(hasPermission("admin", "delete")).toBe(true);
    expect(hasPermission("admin", "approve")).toBe(true);
    expect(hasPermission("admin", "manage_users")).toBe(true);
  });

  it("manager cannot delete", () => {
    expect(hasPermission("manager", "delete")).toBe(false);
    expect(hasPermission("manager", "manage_users")).toBe(false);
  });

  it("operator cannot approve", () => {
    expect(hasPermission("operator", "approve")).toBe(false);
    expect(hasPermission("operator", "export")).toBe(true);
  });

  it("viewer can read and export", () => {
    expect(hasPermission("viewer", "read")).toBe(true);
    expect(hasPermission("viewer", "export")).toBe(true);
    expect(hasPermission("viewer", "create")).toBe(false);
  });

  it("unknown role has no permissions", () => {
    expect(hasPermission("unknown" as any, "read")).toBe(false);
  });
});

describe("hasSufficientRoleLevel", () => {
  it("admin passes all thresholds", () => {
    expect(hasSufficientRoleLevel("admin", "admin")).toBe(true);
    expect(hasSufficientRoleLevel("admin", "manager")).toBe(true);
    expect(hasSufficientRoleLevel("admin", "viewer")).toBe(true);
  });

  it("manager does not pass admin threshold", () => {
    expect(hasSufficientRoleLevel("manager", "admin")).toBe(false);
  });

  it("viewer does not pass manager threshold", () => {
    expect(hasSufficientRoleLevel("viewer", "manager")).toBe(false);
  });

  it("viewer passes viewer threshold", () => {
    expect(hasSufficientRoleLevel("viewer", "viewer")).toBe(true);
  });

  it("unknown role maps to viewer level", () => {
    // unknown -> normalizeRole -> viewer (level 0)
    expect(hasSufficientRoleLevel("unknown", "viewer")).toBe(true);
    expect(hasSufficientRoleLevel("unknown", "operator")).toBe(false);
  });
});

describe("authorize", () => {
  const adminUser: CurrentUser = {
    id: "admin-1",
    email: "admin@test.com",
    name: "Admin",
    role: "ADMIN" as const,
    organizationId: "org-1",
    organization: { id: "org-1", name: "Admin Org" },
  };

  const viewerUser: CurrentUser = {
    id: "viewer-1",
    email: "viewer@test.com",
    name: "Viewer",
    role: "VIEWER" as const,
    organizationId: "org-1",
    organization: { id: "org-1", name: "Viewer Org" },
  };

  it("allows admin to perform any action", async () => {
    const result = await authorize({
      user: adminUser,
      resource: { type: "engagement", id: "e-1" },
      action: "delete",
    });
    expect(result.allowed).toBe(true);
  });

  it("denies viewer to perform admin-only actions", async () => {
    const result = await authorize({
      user: viewerUser,
      resource: { type: "engagement", id: "e-1" },
      action: "delete",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Insufficient permissions");
  });

  it("denies viewer to approve", async () => {
    const result = await authorize({
      user: viewerUser,
      resource: { type: "engagement", id: "e-1" },
      action: "approve",
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

  it("bypasses tenant check when context says so", async () => {
    const result = await authorize({
      user: viewerUser,
      resource: { type: "engagement", id: "e-1", tenantId: "other-org" },
      action: "read",
      context: { bypassTenantCheck: true },
    });
    expect(result.allowed).toBe(true);
  });

  it("returns principal when allowed", async () => {
    const result = await authorize({
      user: adminUser,
      resource: { type: "engagement", id: "e-1" },
      action: "read",
    });
    expect(result.principal).toBeDefined();
    expect(result.principal!.userId).toBe("admin-1");
  });
});
