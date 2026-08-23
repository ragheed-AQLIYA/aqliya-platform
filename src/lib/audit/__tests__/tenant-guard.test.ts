jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEngagement: {
      findUnique: jest.fn(),
    },
    auditClient: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  assertEngagementAccess,
  assertClientAccess,
  assertOrganizationAccess,
  TenantAccessError,
} from "../tenant-guard";
import type { AuditActor } from "../actor-context";

const mockedPrisma = prisma as unknown as {
  auditEngagement: { findUnique: jest.Mock };
  auditClient: { findUnique: jest.Mock };
};

const baseActor: AuditActor = {
  actorId: "user-1",
  actorName: "Test User",
  actorRole: "operator",
  organizationId: "org-1",
};

describe("tenant-guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── assertEngagementAccess ───

  describe("assertEngagementAccess", () => {
    it("passes when org IDs match", async () => {
      mockedPrisma.auditEngagement.findUnique.mockResolvedValue({
        organizationId: "org-1",
      });

      await expect(
        assertEngagementAccess("eng-1", baseActor),
      ).resolves.toBeUndefined();

      expect(mockedPrisma.auditEngagement.findUnique).toHaveBeenCalledWith({
        where: { id: "eng-1" },
        select: { organizationId: true },
      });
    });

    it("throws TenantAccessError when org IDs differ", async () => {
      mockedPrisma.auditEngagement.findUnique.mockResolvedValue({
        organizationId: "org-other",
      });

      const error = await assertEngagementAccess("eng-1", baseActor).catch(
        (e: unknown) => e,
      );

      expect(error).toBeInstanceOf(TenantAccessError);
      expect((error as Error).message).toBe(
        "Access denied: engagement belongs to another organization",
      );
    });

    it("throws TenantAccessError when engagement not found", async () => {
      mockedPrisma.auditEngagement.findUnique.mockResolvedValue(null);

      const error = await assertEngagementAccess(
        "eng-missing",
        baseActor,
      ).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(TenantAccessError);
      expect((error as Error).message).toBe("Engagement not found: eng-missing");
    });
  });

  // ─── assertClientAccess ───

  describe("assertClientAccess", () => {
    it("passes when org IDs match", async () => {
      mockedPrisma.auditClient.findUnique.mockResolvedValue({
        organizationId: "org-1",
      });

      await expect(
        assertClientAccess("client-1", baseActor),
      ).resolves.toBeUndefined();

      expect(mockedPrisma.auditClient.findUnique).toHaveBeenCalledWith({
        where: { id: "client-1" },
        select: { organizationId: true },
      });
    });

    it("throws TenantAccessError when org IDs differ", async () => {
      mockedPrisma.auditClient.findUnique.mockResolvedValue({
        organizationId: "org-other",
      });

      const error = await assertClientAccess("client-1", baseActor).catch(
        (e: unknown) => e,
      );

      expect(error).toBeInstanceOf(TenantAccessError);
      expect((error as Error).message).toBe(
        "Access denied: client belongs to another organization",
      );
    });

    it("throws TenantAccessError when client not found", async () => {
      mockedPrisma.auditClient.findUnique.mockResolvedValue(null);

      const error = await assertClientAccess(
        "client-missing",
        baseActor,
      ).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(TenantAccessError);
      expect((error as Error).message).toBe("Client not found: client-missing");
    });
  });

  // ─── assertOrganizationAccess ───

  describe("assertOrganizationAccess", () => {
    it("passes when IDs match", async () => {
      await expect(
        assertOrganizationAccess("org-1", baseActor),
      ).resolves.toBeUndefined();
    });

    it("throws TenantAccessError when IDs differ", async () => {
      const error = await assertOrganizationAccess(
        "org-other",
        baseActor,
      ).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(TenantAccessError);
      expect((error as Error).message).toBe(
        "Access denied: organization mismatch",
      );
    });
  });
});
