/**
 * Tests for authorization types and pure utility functions.
 */

import {
  normalizeRole,
  principalFromUser,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from "../types";

import type { CurrentUser } from "../types";

describe("normalizeRole", () => {
  it("maps admin -> admin", () => {
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("ADMIN")).toBe("admin");
    expect(normalizeRole("Admin")).toBe("admin");
  });

  it("maps manager -> manager", () => {
    expect(normalizeRole("manager")).toBe("manager");
    expect(normalizeRole("MANAGER")).toBe("manager");
  });

  it("maps partner -> manager", () => {
    expect(normalizeRole("partner")).toBe("manager");
    expect(normalizeRole("PARTNER")).toBe("manager");
  });

  it("maps operator -> operator", () => {
    expect(normalizeRole("operator")).toBe("operator");
    expect(normalizeRole("OPERATOR")).toBe("operator");
  });

  it("maps reviewer -> operator", () => {
    expect(normalizeRole("reviewer")).toBe("operator");
  });

  it("maps unknown -> viewer", () => {
    expect(normalizeRole("unknown")).toBe("viewer");
    expect(normalizeRole("")).toBe("viewer");
  });
});

describe("principalFromUser", () => {
  const user: CurrentUser = {
    id: "user-1",
    email: "test@test.com",
    name: "Test User",
    role: "ADMIN" as const,
    organizationId: "org-1",
    organization: { id: "org-1", name: "Test Org" },
  };

  it("creates principal from user", () => {
    const principal = principalFromUser(user);
    expect(principal.userId).toBe("user-1");
    expect(principal.organizationId).toBe("org-1");
    expect(principal.role).toBe("admin");
    expect(principal.id).toBe("user-1");
  });
});

describe("ROLE_HIERARCHY", () => {
  it("ranks admin highest", () => {
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.manager);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.operator);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.viewer);
  });

  it("ranks manager above operator", () => {
    expect(ROLE_HIERARCHY.manager).toBeGreaterThan(ROLE_HIERARCHY.operator);
  });

  it("ranks operator above viewer", () => {
    expect(ROLE_HIERARCHY.operator).toBeGreaterThan(ROLE_HIERARCHY.viewer);
  });

  it("ranks viewer lowest", () => {
    expect(ROLE_HIERARCHY.viewer).toBe(0);
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("admin has all permissions", () => {
    const perms = ROLE_PERMISSIONS.admin;
    expect(perms).toContain("read");
    expect(perms).toContain("create");
    expect(perms).toContain("update");
    expect(perms).toContain("delete");
    expect(perms).toContain("admin");
    expect(perms).toContain("approve");
    expect(perms).toContain("reject");
    expect(perms).toContain("export");
    expect(perms).toContain("review");
    expect(perms).toContain("manage_users");
  });

  it("manager can read, create, update, export, approve, reject, review", () => {
    const perms = ROLE_PERMISSIONS.manager;
    expect(perms).toContain("read");
    expect(perms).toContain("create");
    expect(perms).toContain("update");
    expect(perms).toContain("export");
    expect(perms).toContain("approve");
    expect(perms).toContain("reject");
    expect(perms).toContain("review");
    expect(perms).not.toContain("delete");
    expect(perms).not.toContain("admin");
    expect(perms).not.toContain("manage_users");
  });

  it("operator can read, create, update, export, review", () => {
    const perms = ROLE_PERMISSIONS.operator;
    expect(perms).toContain("read");
    expect(perms).toContain("create");
    expect(perms).toContain("update");
    expect(perms).toContain("export");
    expect(perms).toContain("review");
    expect(perms).not.toContain("delete");
    expect(perms).not.toContain("approve");
    expect(perms).not.toContain("reject");
  });

  it("viewer can read, export", () => {
    const perms = ROLE_PERMISSIONS.viewer;
    expect(perms).toContain("read");
    expect(perms).toContain("export");
    expect(perms).not.toContain("create");
    expect(perms).not.toContain("update");
    expect(perms).not.toContain("delete");
  });
});
