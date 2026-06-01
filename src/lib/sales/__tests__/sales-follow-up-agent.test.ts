// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), update: jest.fn() },
    salesInteraction: { findFirst: jest.fn(), findMany: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  assertNoFollowUpSend,
  approveFollowUpDraft,
  draftFollowUpStub,
  listFollowUpDraftsForDeal,
  readFollowUpDrafts,
  rejectFollowUpDraft,
} from "../agents/follow-up";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_DEAL = {
  id: "deal-1",
  title: "Enterprise deal",
  organizationId: "org-a",
  metadata: { followUpDrafts: [] },
};

const BASE_INTERACTION = {
  id: "int-1",
  type: "meeting",
  subject: "Discovery call",
  summary: "Discussed pilot scope and timeline",
  occurredAt: new Date("2026-06-01T10:00:00.000Z"),
  metadata: {},
};

describe("SalesOS follow-up agent stub (PR-18)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesDeal.update.mockResolvedValue(BASE_DEAL);
  });

  describe("readFollowUpDrafts", () => {
    it("parses followUpDrafts from deal metadata", () => {
      const drafts = readFollowUpDrafts({
        followUpDrafts: [
          {
            id: "f-1",
            subject: "Follow up",
            body: "Body text",
            suggestedNextAction: "Call client",
            status: "draft",
            createdById: "user-1",
            createdAt: "2026-06-01T10:00:00.000Z",
          },
        ],
      });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].suggestedNextAction).toBe("Call client");
    });
  });

  describe("draftFollowUpStub", () => {
    it("builds template from last interaction and records audit", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
      prisma.salesInteraction.findMany.mockResolvedValue([BASE_INTERACTION]);

      const draft = await draftFollowUpStub(SCOPE, "deal-1", {}, ACTOR);

      expect(draft.status).toBe("draft");
      expect(draft.sourceInteractionId).toBe("int-1");
      expect(draft.body).toContain("Discovery call");
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.FOLLOWUP_DRAFTED,
            organizationId: "org-a",
          }),
        }),
      );
    });

    it("uses existing nextAction when present", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: { nextAction: "Send proposal", followUpDrafts: [] },
      });
      prisma.salesInteraction.findMany.mockResolvedValue([BASE_INTERACTION]);

      const draft = await draftFollowUpStub(SCOPE, "deal-1", {}, ACTOR);

      expect(draft.suggestedNextAction).toBe("Send proposal");
    });

    it("rejects when no interactions exist", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
      prisma.salesInteraction.findMany.mockResolvedValue([]);

      await expect(
        draftFollowUpStub(SCOPE, "deal-1", {}, ACTOR),
      ).rejects.toThrow(/no interactions/);
    });
  });

  describe("approveFollowUpDraft", () => {
    it("copies suggestedNextAction to deal metadata on human approve", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          followUpDrafts: [
            {
              id: "f-1",
              subject: "Follow up",
              body: "Body",
              suggestedNextAction: "Schedule demo",
              sourceInteractionId: "int-1",
              sourceInteractionType: "meeting",
              sourceInteractionSummary: "Notes",
              status: "draft",
              createdById: "user-1",
              createdAt: "2026-06-01T10:00:00.000Z",
              reviewedById: null,
              reviewedByName: null,
              reviewedAt: null,
              reviewNote: null,
            },
          ],
        },
      });

      const result = await approveFollowUpDraft(
        SCOPE,
        "deal-1",
        "f-1",
        ACTOR,
      );

      expect(result.draft.status).toBe("approved");
      expect(result.nextAction).toBe("Schedule demo");
      expect(prisma.salesDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              nextAction: "Schedule demo",
            }),
          }),
        }),
      );
    });
  });

  describe("assertNoFollowUpSend", () => {
    it("documents that send is intentionally unavailable", () => {
      expect(() => assertNoFollowUpSend()).toThrow(/send is not implemented/);
    });
  });

  describe("listFollowUpDraftsForDeal", () => {
    it("rejects cross-org deal", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(null);

      await expect(
        listFollowUpDraftsForDeal(SCOPE, "deal-foreign"),
      ).rejects.toThrow(/deal not found/);
    });
  });

  describe("rejectFollowUpDraft", () => {
    it("marks draft rejected", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          followUpDrafts: [
            {
              id: "f-1",
              subject: "Follow up",
              body: "Body",
              suggestedNextAction: "Call",
              status: "draft",
              createdById: "user-1",
              createdAt: "2026-06-01T10:00:00.000Z",
              reviewedById: null,
              reviewedByName: null,
              reviewedAt: null,
              reviewNote: null,
            },
          ],
        },
      });

      const updated = await rejectFollowUpDraft(
        SCOPE,
        "deal-1",
        "f-1",
        ACTOR,
      );

      expect(updated.status).toBe("rejected");
    });
  });
});
