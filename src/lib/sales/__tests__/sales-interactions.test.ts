// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn() },
    salesAccount: { findFirst: jest.fn() },
    salesInteraction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  createSalesInteraction,
  deleteSalesInteraction,
  listInteractionsForAccount,
  listInteractionsForDeal,
  updateSalesInteraction,
} from "../interactions";
import {
  validateUpdateSalesInteractionInput,
  validateInteractionType,
} from "../validation";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_ROW = {
  id: "int-1",
  type: "call",
  subject: "Follow-up",
  summary: "Discussed pricing",
  occurredAt: new Date("2026-06-01T10:00:00Z"),
  dealId: "deal-1",
  accountId: "acc-1",
  createdById: "user-1",
  createdAt: new Date("2026-06-01T10:00:00Z"),
  metadata: null,
};

describe("SalesOS interactions CRUD", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
  });

  describe("validateUpdateSalesInteractionInput", () => {
    it("requires at least one field", () => {
      expect(() => validateUpdateSalesInteractionInput({})).toThrow(
        /at least one field/,
      );
    });

    it("validates interaction type on update", () => {
      expect(() =>
        validateUpdateSalesInteractionInput({ type: "invalid" }),
      ).toThrow(/interaction type/);
      expect(
        validateUpdateSalesInteractionInput({ type: "Meeting" }).type,
      ).toBe("meeting");
    });

    it("normalizes optional text fields", () => {
      expect(
        validateUpdateSalesInteractionInput({
          subject: "  Updated  ",
          summary: "",
        }),
      ).toEqual({
        subject: "Updated",
        summary: null,
      });
    });
  });

  describe("updateSalesInteraction", () => {
    it("updates interaction scoped to org and records audit", async () => {
      prisma.salesInteraction.findFirst.mockResolvedValue(BASE_ROW);
      prisma.salesInteraction.update.mockResolvedValue({
        ...BASE_ROW,
        subject: "Updated subject",
        metadata: undefined,
      });

      const result = await updateSalesInteraction(
        "int-1",
        SCOPE,
        { subject: "Updated subject" },
        ACTOR,
      );

      expect(result.subject).toBe("Updated subject");
      expect(prisma.salesInteraction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "int-1" },
          data: expect.objectContaining({ subject: "Updated subject" }),
        }),
      );
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.INTERACTION_UPDATED,
            organizationId: "org-a",
          }),
        }),
      );
    });

    it("rejects cross-org update", async () => {
      prisma.salesInteraction.findFirst.mockResolvedValue(null);

      await expect(
        updateSalesInteraction("int-foreign", SCOPE, { type: "note" }, ACTOR),
      ).rejects.toThrow(/interaction not found/);

      expect(prisma.salesInteraction.update).not.toHaveBeenCalled();
    });

    it("rejects update on soft-deleted interaction", async () => {
      prisma.salesInteraction.findFirst.mockResolvedValue({
        ...BASE_ROW,
        metadata: { deletedAt: "2026-06-01T12:00:00.000Z" },
      });

      await expect(
        updateSalesInteraction("int-1", SCOPE, { type: "note" }, ACTOR),
      ).rejects.toThrow(/interaction not found/);
    });
  });

  describe("deleteSalesInteraction", () => {
    it("soft-deletes via metadata.deletedAt", async () => {
      prisma.salesInteraction.findFirst.mockResolvedValue(BASE_ROW);
      prisma.salesInteraction.update.mockResolvedValue(BASE_ROW);

      await deleteSalesInteraction("int-1", SCOPE, ACTOR);

      expect(prisma.salesInteraction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "int-1" },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              deletedAt: expect.any(String),
              deletedById: "user-1",
            }),
          }),
        }),
      );
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.INTERACTION_DELETED,
          }),
        }),
      );
    });
  });

  describe("listInteractionsForDeal", () => {
    it("excludes soft-deleted rows and filters by type", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        accountId: "acc-1",
      });
      prisma.salesInteraction.findMany.mockResolvedValue([
        BASE_ROW,
        {
          ...BASE_ROW,
          id: "int-2",
          type: "note",
        },
        {
          ...BASE_ROW,
          id: "int-deleted",
          metadata: { deletedAt: "2026-06-01T12:00:00.000Z" },
        },
      ]);

      const all = await listInteractionsForDeal(SCOPE, "deal-1");
      expect(all).toHaveLength(2);
      expect(all.map((r) => r.id)).toEqual(["int-1", "int-2"]);

      const notes = await listInteractionsForDeal(SCOPE, "deal-1", {
        type: "note",
      });
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe("int-2");
    });

    it("validates type filter values", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        accountId: "acc-1",
      });
      prisma.salesInteraction.findMany.mockResolvedValue([]);

      await expect(
        listInteractionsForDeal(SCOPE, "deal-1", { type: "sms" }),
      ).rejects.toThrow(/interaction type/);
    });
  });

  describe("listInteractionsForAccount", () => {
    it("lists account interactions org-scoped without deleted rows", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({ id: "acc-1" });
      prisma.salesInteraction.findMany.mockResolvedValue([
        BASE_ROW,
        {
          ...BASE_ROW,
          id: "int-deleted",
          metadata: { deletedAt: "2026-06-01T12:00:00.000Z" },
        },
      ]);

      const rows = await listInteractionsForAccount(SCOPE, "acc-1");
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe("int-1");
      expect(prisma.salesInteraction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org-a",
            accountId: "acc-1",
          }),
        }),
      );
    });
  });

  describe("validateInteractionType", () => {
    it("accepts known types only", () => {
      expect(validateInteractionType("call")).toBe("call");
      expect(() => validateInteractionType("fax")).toThrow(/interaction type/);
    });
  });

  describe("createSalesInteraction (regression)", () => {
    it("still creates with org scope", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({ id: "acc-1" });
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        accountId: "acc-1",
      });
      prisma.salesInteraction.create.mockResolvedValue({
        id: "int-new",
        type: "call",
        subject: null,
        summary: null,
        occurredAt: new Date(),
        dealId: "deal-1",
        accountId: "acc-1",
        createdById: "user-1",
        createdAt: new Date(),
      });

      await createSalesInteraction(
        SCOPE,
        {
          accountId: "acc-1",
          dealId: "deal-1",
          type: "call",
        },
        ACTOR,
      );

      expect(prisma.salesInteraction.create).toHaveBeenCalled();
    });
  });
});
