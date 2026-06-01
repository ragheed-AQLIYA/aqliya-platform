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
  approveFollowUpDraft,
  assertNoFollowUpSend,
  assertNoSend,
  draftFollowUpStub,
  readFollowUpDrafts,
  rejectFollowUpDraft,
  listFollowUpDraftsForDeal,
} from "../agents/follow-up";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_DEAL = {
  id: "deal-1",
  title: "Enterprise deal",
  organizationId: "org-a",
  metadata: { followUpDrafts: [] },
};

const SAMPLE_INTERACTION = {
  id: "int-1",
  type: "meeting",
  subject: "Discovery call",
  summary: "Discussed pricing and timeline",
  occurredAt: new Date("2026-06-01T10:00:00.000Z"),
  metadata: {},
};

describe("SalesOS follow-up agent (PR-18)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesDeal.update.mockResolvedValue(BASE_DEAL);
    prisma.salesInteraction.findMany.mockResolvedValue([SAMPLE_INTERACTION]);
  });

  describe("readFollowUpDrafts", () => {
    it("parses followUpDrafts from deal metadata", () => {
      const drafts = readFollowUpDrafts({
        followUpDrafts: [
          {
            id: "f-1",
            subject: "Follow up",
            body: "Follow up body",
            suggestedNextAction: "Call client",
            sourceInteractionId: "int-1",
            sourceInteractionType: "meeting",
            sourceInteractionSummary: "Discovery",
            status: "draft",
            createdById: "user-1",
            createdAt: "2026-06-01T10:00:00.000Z",
          },
        ],
      });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].suggestedNextAction).toBe("Call client");
      expect(drafts[0].subject).toBe("Follow up");
    });
  });

  describe("draftFollowUpStub", () => {
    it("stores draft on deal metadata and records audit", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: { nextAction: "Send quote" },
      });

      const draft = await draftFollowUpStub(
        SCOPE,
        "deal-1",
        {},
        ACTOR,
      );

      expect(draft.status).toBe("draft");
      expect(draft.sourceInteractionId).toBe("int-1");
      expect(draft.suggestedNextAction).toBe("Send quote");
      expect(draft.body).toContain("لا إرسال تلقائي");
      expect(prisma.salesDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "deal-1" },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              followUpDrafts: expect.arrayContaining([
                expect.objectContaining({
                  status: "draft",
                  suggestedNextAction: "Send quote",
                }),
              ]),
            }),
          }),
        }),
      );
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.FOLLOWUP_DRAFTED,
            organizationId: "org-a",
          }),
        }),
      );
    });

    it("derives suggestedNextAction when nextAction is empty", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      const draft = await draftFollowUpStub(SCOPE, "deal-1", {}, ACTOR);

      expect(draft.suggestedNextAction).toContain("Discovery call");
    });

    it("rejects when no interactions exist", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
      prisma.salesInteraction.findMany.mockResolvedValue([]);

      await expect(
        draftFollowUpStub(SCOPE, "deal-1", {}, ACTOR),
      ).rejects.toThrow(/no interactions on deal/);
    });
  });

  describe("approveFollowUpDraft", () => {
    it("copies suggestedNextAction to deal nextAction on human approve", async () => {
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
              sourceInteractionSummary: "Call",
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
              followUpDrafts: expect.arrayContaining([
                expect.objectContaining({ status: "approved" }),
              ]),
            }),
          }),
        }),
      );
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.DEAL_NEXT_ACTION_SET,
            metadata: expect.objectContaining({
              source: "follow_up_draft_approved",
              draftId: "f-1",
            }),
          }),
        }),
      );
    });

    it("rejects non-draft follow-up", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          followUpDrafts: [
            {
              id: "f-1",
              subject: "Follow up",
              body: "Body",
              suggestedNextAction: "Call",
              sourceInteractionId: null,
              sourceInteractionType: null,
              sourceInteractionSummary: null,
              status: "approved",
              createdById: "user-1",
              createdAt: "2026-06-01T10:00:00.000Z",
              reviewedById: "user-1",
              reviewedByName: "Test",
              reviewedAt: "2026-06-01T11:00:00.000Z",
              reviewNote: null,
            },
          ],
        },
      });

      await expect(
        approveFollowUpDraft(SCOPE, "deal-1", "f-1", ACTOR),
      ).rejects.toThrow(/only draft follow-up/);
    });
  });

  describe("rejectFollowUpDraft", () => {
    it("marks draft rejected without copying nextAction", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          followUpDrafts: [
            {
              id: "f-1",
              subject: "Follow up",
              body: "Body",
              suggestedNextAction: "Call",
              sourceInteractionId: null,
              sourceInteractionType: null,
              sourceInteractionSummary: null,
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
      const updateCall = prisma.salesDeal.update.mock.calls[0][0];
      expect(updateCall.data.metadata.nextAction).toBeUndefined();
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

  describe("assertNoSend", () => {
    it("documents that send is intentionally unavailable", () => {
      expect(() => assertNoSend()).toThrow(/send is not implemented/);
      expect(() => assertNoFollowUpSend()).toThrow(/send is not implemented/);
    });
  });
});
