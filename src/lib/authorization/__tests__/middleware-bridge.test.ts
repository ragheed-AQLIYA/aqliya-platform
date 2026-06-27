/**
 * Tests for middleware bridge (edge-compatible auth utilities).
 */

import { checkRouteRole, getRouteMinRole } from "../middleware-bridge";

describe("checkRouteRole", () => {
  it("allows admin to access admin routes", () => {
    expect(checkRouteRole("admin", "admin")).toBe(true);
  });

  it("allows admin to access viewer routes", () => {
    expect(checkRouteRole("admin", "viewer")).toBe(true);
  });

  it("allows manager to access manager routes", () => {
    expect(checkRouteRole("manager", "manager")).toBe(true);
  });

  it("allows manager to access viewer routes", () => {
    expect(checkRouteRole("manager", "viewer")).toBe(true);
  });

  it("denies viewer to access admin routes", () => {
    expect(checkRouteRole("viewer", "admin")).toBe(false);
  });

  it("denies viewer to access manager routes", () => {
    expect(checkRouteRole("viewer", "manager")).toBe(false);
  });

  it("denies operator to access admin routes", () => {
    expect(checkRouteRole("operator", "admin")).toBe(false);
  });

  it("allows operator to access operator routes", () => {
    expect(checkRouteRole("operator", "operator")).toBe(true);
  });

  it("allows operator to access viewer routes", () => {
    expect(checkRouteRole("operator", "viewer")).toBe(true);
  });

  it("returns false for undefined user role", () => {
    expect(checkRouteRole(undefined, "viewer")).toBe(false);
  });

  it("empty required role maps to viewer (admin >= viewer)", () => {
    // normalizeRole("") returns "viewer" (level 0), admin (level 3) >= viewer (level 0)
    expect(checkRouteRole("admin", "")).toBe(true);
  });

  it("handles uppercase and mixed case", () => {
    expect(checkRouteRole("ADMIN", "admin")).toBe(true);
    expect(checkRouteRole("Manager", "manager")).toBe(true);
  });
});

describe("getRouteMinRole", () => {
  const routeMap: Record<string, string> = {
    "/admin": "admin",
    "/workspace": "manager",
    "/projects": "operator",
    "/public": "viewer",
  };

  it("returns matching role for exact prefix", () => {
    expect(getRouteMinRole("/admin", routeMap)).toBe("admin");
    expect(getRouteMinRole("/admin/users", routeMap)).toBe("admin");
  });

  it("returns matching role for /workspace routes", () => {
    expect(getRouteMinRole("/workspace/123", routeMap)).toBe("manager");
  });

  it("returns null for unknown route", () => {
    expect(getRouteMinRole("/unknown", routeMap)).toBeNull();
  });

  it("returns null for empty route map", () => {
    expect(getRouteMinRole("/admin", {})).toBeNull();
  });

  it("matches first matching prefix in order", () => {
    const map = { "/": "viewer", "/admin": "admin" };
    // "/" matches first because it is first in insertion order and "/admin" starts with "/"
    expect(getRouteMinRole("/admin", map)).toBe("viewer");
  });

  it("matching more specific prefix when listed first", () => {
    const map = { "/admin": "admin", "/": "viewer" };
    // "/admin" matches first because it's first in insertion order
    expect(getRouteMinRole("/admin", map)).toBe("admin");
  });
});
