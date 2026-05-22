// @ts-nocheck
jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
  requireUserContext: jest.fn(),
  isExpectedAccessDeniedError: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContentProject: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

import { describe, expect, it } from "@jest/globals";
import { canPerformAction } from "../guards";
import type { CurrentUser } from "@/lib/auth";

const VIEWER: CurrentUser = {
  id: "test-viewer",
  email: "viewer@test.local",
  name: "Viewer",
  role: "VIEWER",
  organizationId: "org-1",
  organization: { id: "org-1", name: "Test Org" },
};

const OPERATOR: CurrentUser = {
  id: "test-operator",
  email: "operator@test.local",
  name: "Operator",
  role: "OPERATOR",
  organizationId: "org-1",
  organization: { id: "org-1", name: "Test Org" },
};

const ADMIN: CurrentUser = {
  id: "test-admin",
  email: "admin@test.local",
  name: "Admin",
  role: "ADMIN",
  organizationId: "org-1",
  organization: { id: "org-1", name: "Test Org" },
};

describe("LocalContentOS guards", () => {
  describe("canPerformAction", () => {
    it("allows viewer to view only", () => {
      expect(canPerformAction(VIEWER, "view")).toBe(true);
      expect(canPerformAction(VIEWER, "create_supplier")).toBe(false);
      expect(canPerformAction(VIEWER, "approve")).toBe(false);
    });

    it("allows operator to perform operational actions", () => {
      expect(canPerformAction(OPERATOR, "view")).toBe(true);
      expect(canPerformAction(OPERATOR, "create_supplier")).toBe(true);
      expect(canPerformAction(OPERATOR, "create_spend")).toBe(true);
      expect(canPerformAction(OPERATOR, "classify")).toBe(true);
      expect(canPerformAction(OPERATOR, "review")).toBe(true);
      expect(canPerformAction(OPERATOR, "manage_findings")).toBe(true);
      expect(canPerformAction(OPERATOR, "approve")).toBe(false);
      expect(canPerformAction(OPERATOR, "admin")).toBe(false);
    });

    it("allows admin to perform all actions", () => {
      expect(canPerformAction(ADMIN, "view")).toBe(true);
      expect(canPerformAction(ADMIN, "create_supplier")).toBe(true);
      expect(canPerformAction(ADMIN, "approve")).toBe(true);
      expect(canPerformAction(ADMIN, "admin")).toBe(true);
    });
  });
});
