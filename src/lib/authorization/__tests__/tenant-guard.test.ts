/**
 * Tests for tenant isolation guard.
 */

import { checkTenantAccess, assertTenantAccess } from "../tenant-guard";
import type { CurrentUser } from "../types";

describe("checkTenantAccess", () => {
  const user: CurrentUser = {
    id: "user-1",
    email: "user@test.com",
    name: "User",
    role: "OPERATOR" as const,
    organizationId: "org-1",
    organization: { id: "org-1", name: "My Org" },
  };

  it("allows access when user belongs to target org", async () => {
    const result = await checkTenantAccess(
      user,
      { type: "engagement", id: "e-1" },
      { tenantId: "org-1" },
    );
    expect(result.allowed).toBe(true);
    expect(result.resolvedTenantId).toBe("org-1");
  });

  it("denies access when user is in different org (non-admin)", async () => {
    const result = await checkTenantAccess(
      user,
      { type: "engagement", id: "e-1" },
      { tenantId: "other-org" },
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Tenant access denied");
  });

  it("denies tenant admin cross-tenant access", async () => {
    const adminUser: CurrentUser = {
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      role: "ADMIN" as const,
      organizationId: "org-1",
      organization: { id: "org-1", name: "Admin Org" },
    };
    const result = await checkTenantAccess(
      adminUser,
      { type: "engagement", id: "e-1" },
      { tenantId: "other-org" },
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Tenant access denied");
  });

  it("allows platform admin cross-tenant access", async () => {
    const previous = process.env.PLATFORM_ADMIN_EMAILS;
    process.env.PLATFORM_ADMIN_EMAILS = "platform@aqliya.com";
    const adminUser: CurrentUser = {
      id: "platform-1",
      email: "platform@aqliya.com",
      name: "Platform Admin",
      role: "ADMIN" as const,
      organizationId: "org-1",
      organization: { id: "org-1", name: "Admin Org" },
    };
    try {
      const result = await checkTenantAccess(
        adminUser,
        { type: "engagement", id: "e-1" },
        { tenantId: "other-org" },
      );
      expect(result.allowed).toBe(true);
      expect(result.resolvedTenantId).toBe("other-org");
    } finally {
      process.env.PLATFORM_ADMIN_EMAILS = previous;
    }
  });

  it("falls back to resource.tenantId when options.tenantId not provided", async () => {
    const result = await checkTenantAccess(
      user,
      { type: "engagement", id: "e-1", tenantId: "org-1" },
    );
    expect(result.allowed).toBe(true);
  });

  it("treats organization resource.id as the target tenant", async () => {
    const adminUser: CurrentUser = {
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      role: "ADMIN" as const,
      organizationId: "org-a",
      organization: { id: "org-a", name: "Org A" },
    };
    const result = await checkTenantAccess(
      adminUser,
      { type: "organization", id: "org-b" },
    );
    expect(result.allowed).toBe(false);
    expect(result.resolvedTenantId).toBe("org-b");
  });

  it("denies tenant admin from accessing another organization settings", async () => {
    const adminUser: CurrentUser = {
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      role: "ADMIN" as const,
      organizationId: "org-a",
      organization: { id: "org-a", name: "Org A" },
    };
    const result = await checkTenantAccess(
      adminUser,
      { type: "settings", id: "org-b" },
    );
    expect(result.allowed).toBe(false);
  });
});

describe("assertTenantAccess", () => {
  const user: CurrentUser = {
    id: "user-1",
    email: "user@test.com",
    name: "User",
    role: "OPERATOR" as const,
    organizationId: "org-1",
    organization: { id: "org-1", name: "My Org" },
  };

  it("returns resolved tenant ID on success", async () => {
    const result = await assertTenantAccess(
      user,
      { type: "engagement", id: "e-1" },
      { tenantId: "org-1" },
    );
    expect(result).toBe("org-1");
  });

  it("throws on denial", async () => {
    await expect(
      assertTenantAccess(
        user,
        { type: "engagement", id: "e-1" },
        { tenantId: "other-org" },
      ),
    ).rejects.toThrow("Tenant access denied");
  });
});
