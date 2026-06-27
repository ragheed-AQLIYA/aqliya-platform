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

  it("allows admin cross-tenant access", async () => {
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
    expect(result.allowed).toBe(true);
    expect(result.resolvedTenantId).toBe("other-org");
  });

  it("falls back to resource.tenantId when options.tenantId not provided", async () => {
    const result = await checkTenantAccess(
      user,
      { type: "engagement", id: "e-1", tenantId: "org-1" },
    );
    expect(result.allowed).toBe(true);
  });

  it("falls back to user.organizationId when no tenant context provided", async () => {
    const result = await checkTenantAccess(
      user,
      { type: "engagement", id: "e-1" },
    );
    expect(result.allowed).toBe(true);
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
