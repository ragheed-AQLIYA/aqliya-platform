// @ts-nocheck
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
