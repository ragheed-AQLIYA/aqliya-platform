/**
 * Tests for action guard utilities (pure functions only).
 * Integrated authorize() tests are in authorize.test.ts.
 */

import { guardRoleLevel } from "../action-guard";

describe("guardRoleLevel", () => {
  it("admin meets admin minimum", () => {
    expect(guardRoleLevel("admin", "admin")).toBe(true);
  });

  it("admin meets any minimum", () => {
    expect(guardRoleLevel("admin", "viewer")).toBe(true);
    expect(guardRoleLevel("ADMIN", "manager")).toBe(true);
  });

  it("operator does not meet admin minimum", () => {
    expect(guardRoleLevel("operator", "admin")).toBe(false);
  });

  it("viewer does not meet operator minimum", () => {
    expect(guardRoleLevel("viewer", "operator")).toBe(false);
  });

  it("viewer meets viewer minimum", () => {
    expect(guardRoleLevel("viewer", "viewer")).toBe(true);
  });

  it("case-insensitive role matching", () => {
    expect(guardRoleLevel("Manager", "manager")).toBe(true);
    expect(guardRoleLevel("ADMIN", "viewer")).toBe(true);
  });

  it("returns false for unknown role", () => {
    expect(guardRoleLevel("unknown", "viewer")).toBe(false);
  });
});
