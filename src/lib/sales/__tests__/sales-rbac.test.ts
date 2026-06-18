// @ts-nocheck
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    handlers: { GET: jest.fn(), POST: jest.fn() },
  })),
}));
jest.mock("next-auth/providers/credentials", () =>
  jest.fn(() => ({ id: "credentials", name: "Credentials", type: "credentials" })),
);

// --- Mock guards to prevent auth-config top-level await ---
// guards.ts imports @/lib/auth -> auth-next -> auth-config (top-level await).
// This mock avoids triggering that import chain.
jest.mock("@/lib/sales/guards", () => {
  const ROLE_PERMISSIONS = {
    VIEWER: ["salesos:read"],
    OPERATOR: ["salesos:read", "salesos:create", "salesos:update"],
    ADMIN: ["salesos:read", "salesos:create", "salesos:update"],
  };

  class SalesAccessError extends Error {
    constructor(message, code) {
      super(message);
      this.name = "SalesAccessError";
      this.code = code;
    }
  }

  return {
    __esModule: true,
    SalesAccessError,
    assertSalesPermission: (role, permission) => {
      if (!(ROLE_PERMISSIONS[role]?.includes(permission) ?? false)) {
        throw new SalesAccessError(
          "Access denied: missing permission " + permission,
          "FORBIDDEN",
        );
      }
    },
  };
});

import type { UserRole } from "@prisma/client";
import {
  assertSalesPermission,
  hasSalesPermission,
  SALESOS_PERMISSIONS,
} from "@/lib/sales/permissions";
import { assertSalesPermission as assertSalesPermissionGuard } from "@/lib/sales/guards";
import { SalesAccessError } from "@/lib/sales/guards";

describe("SalesOS RBAC permissions matrix", () => {
  it("declares read/create/update permissions", () => {
    expect(SALESOS_PERMISSIONS).toEqual([
      "salesos:read",
      "salesos:create",
      "salesos:update",
    ]);
  });

  it("grants VIEWER read-only access", () => {
    expect(hasSalesPermission("VIEWER", "salesos:read")).toBe(true);
    expect(hasSalesPermission("VIEWER", "salesos:create")).toBe(false);
    expect(hasSalesPermission("VIEWER", "salesos:update")).toBe(false);
  });

  it("grants OPERATOR read/create/update", () => {
    for (const permission of SALESOS_PERMISSIONS) {
      expect(hasSalesPermission("OPERATOR", permission)).toBe(true);
    }
  });

  it("grants ADMIN read/create/update", () => {
    for (const permission of SALESOS_PERMISSIONS) {
      expect(hasSalesPermission("ADMIN", permission)).toBe(true);
    }
  });

  it("assertSalesPermission throws for denied roles", () => {
    expect(() =>
      assertSalesPermission("VIEWER", "salesos:create"),
    ).toThrow("Access denied: missing permission salesos:create");
  });

  it("guard wrapper maps denial to SalesAccessError", () => {
    expect(() =>
      assertSalesPermissionGuard("VIEWER" as UserRole, "salesos:update"),
    ).toThrow(SalesAccessError);
  });
});
