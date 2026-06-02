// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  assertNoOutreachSend,
  createOutreachDraft,
  listDraftsForDeal,
  listPendingReviewOutreachDrafts,
  readOutreachDrafts,
  reviewOutreachDraft,
  submitOutreachDraftForReview,
  validateCreateOutreachDraftInput,
  validateReviewOutreachDraftInput,
} from "../outreach";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_DEAL = {
  id: "deal-1",
  title: "Enterprise deal",
  organizationId: "org-a",
  metadata: { outreachDrafts: [] },
  account: { id: "acc-1", name: "Acme" },
};

describe("SalesOS governed outreach (PR-9)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesDeal.update.mockResolvedValue(BASE_DEAL);
  });

  describe("validateCreateOutreachDraftInput", () => {
    it("requires subject and body", () => {
      expect(() =>
        validateCreateOutreachDraftInput({ subject: "", body: "hi" }),
      ).toThrow(/subject is required/);
      expect(() =>
        validateCreateOutreachDraftInput({ subject: "Hi", body: "  " }),
      ).toThrow(/body is required/);
    });

    it("validates channel values", () => {
      expect(() =>
        validateCreateOutreachDraftInput({
          subject: "Hi",
          body: "Body",
          channel: "fax",
        }),
      ).toThrow(/channel must be one of/);
    });
  });

  describe("validateReviewOutreachDraftInput", () => {
    it("accepts approved or rejected only", () => {
      expect(
        validateReviewOutreachDraftInput({ decision: "approved" }).decision,
      ).toBe("approved");
      expect(() =>
        validateReviewOutreachDraftInput({ decision: "sent" as "approved" }),
      ).toThrow(/review decision/);
    });
  });

  describe("readOutreachDrafts", () => {
    it("parses outreachDrafts from deal metadata", () => {
      const drafts = readOutreachDrafts({
        outreachDrafts: [
          {
            id: "d-1",
            subject: "Hello",
            body: "World",
            channel: "email",
            status: "draft",
            createdById: "user-1",
            createdAt: "2026-06-01T10:00:00.000Z",
          },
        ],
      });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].subject).toBe("Hello");
    });
  });

  describe("createOutreachDraft", () => {
    it("stores draft on deal metadata and records audit", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      const draft = await createOutreachDraft(
        SCOPE,
        "deal-1",
        { subject: "Intro", body: "Message body", channel: "email" },
        ACTOR,
      );

      expect(draft.status).toBe("draft");
      expect(prisma.salesDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "deal-1" },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              outreachDrafts: expect.arrayContaining([
                expect.objectContaining({
                  subject: "Intro",
                  status: "draft",
                }),
              ]),
            }),
          }),
        }),
      );
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.OUTREACH_DRAFT_CREATED,
            organizationId: "org-a",
          }),
        }),
      );
    });

    it("can create directly as pending_review", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      const draft = await createOutreachDraft(
        SCOPE,
        "deal-1",
        {
          subject: "Intro",
          body: "Message",
          submitForReview: true,
        },
        ACTOR,
      );

      expect(draft.status).toBe("pending_review");
      expect(draft.submittedAt).toBeTruthy();
    });
  });

  describe("submitOutreachDraftForReview", () => {
    it("moves draft to pending_review", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          outreachDrafts: [
            {
              id: "d-1",
              subject: "Hi",
              body: "Body",
              channel: null,
              status: "draft",
              createdById: "user-1",
              createdAt: "2026-06-01T10:00:00.000Z",
              submittedAt: null,
              reviewedById: null,
              reviewedByName: null,
              reviewedAt: null,
              reviewNote: null,
            },
          ],
        },
      });

      const updated = await submitOutreachDraftForReview(
        SCOPE,
        "deal-1",
        "d-1",
        ACTOR,
      );

      expect(updated.status).toBe("pending_review");
      expect(updated.submittedAt).toBeTruthy();
    });
  });

  describe("reviewOutreachDraft", () => {
    it("approves pending_review and records audit — no send", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          outreachDrafts: [
            {
              id: "d-1",
              subject: "Hi",
              body: "Body",
              channel: null,
              status: "pending_review",
              createdById: "user-1",
              createdAt: "2026-06-01T10:00:00.000Z",
              submittedAt: "2026-06-01T11:00:00.000Z",
              reviewedById: null,
              reviewedByName: null,
              reviewedAt: null,
              reviewNote: null,
            },
          ],
        },
      });

      const updated = await reviewOutreachDraft(
        SCOPE,
        "deal-1",
        "d-1",
        { decision: "approved", reviewNote: "Looks good" },
        ACTOR,
      );

      expect(updated.status).toBe("approved");
      expect(updated.reviewedById).toBe("user-1");
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.OUTREACH_REVIEWED,
            metadata: expect.objectContaining({ decision: "approved" }),
          }),
        }),
      );
    });

    it("rejects non-pending drafts", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          outreachDrafts: [
            {
              id: "d-1",
              subject: "Hi",
              body: "Body",
              channel: null,
              status: "draft",
              createdById: "user-1",
              createdAt: "2026-06-01T10:00:00.000Z",
              submittedAt: null,
              reviewedById: null,
              reviewedByName: null,
              reviewedAt: null,
              reviewNote: null,
            },
          ],
        },
      });

      await expect(
        reviewOutreachDraft(
          SCOPE,
          "deal-1",
          "d-1",
          { decision: "approved" },
          ACTOR,
        ),
      ).rejects.toThrow(/pending_review/);
    });
  });

  describe("listPendingReviewOutreachDrafts", () => {
    it("returns org-scoped pending queue", async () => {
      prisma.salesDeal.findMany.mockResolvedValue([
        {
          id: "deal-1",
          title: "Deal A",
          account: { id: "acc-1", name: "Acme" },
          metadata: {
            outreachDrafts: [
              {
                id: "d-1",
                subject: "Pending",
                body: "Body",
                channel: null,
                status: "pending_review",
                createdById: "user-1",
                createdAt: "2026-06-01T10:00:00.000Z",
                submittedAt: "2026-06-01T11:00:00.000Z",
                reviewedById: null,
                reviewedByName: null,
                reviewedAt: null,
                reviewNote: null,
              },
              {
                id: "d-2",
                subject: "Draft only",
                body: "Body",
                channel: null,
                status: "draft",
                createdById: "user-1",
                createdAt: "2026-06-01T09:00:00.000Z",
                submittedAt: null,
                reviewedById: null,
                reviewedByName: null,
                reviewedAt: null,
                reviewNote: null,
              },
            ],
          },
        },
      ]);

      const queue = await listPendingReviewOutreachDrafts(SCOPE);
      expect(queue).toHaveLength(1);
      expect(queue[0].dealTitle).toBe("Deal A");
      expect(queue[0].accountName).toBe("Acme");
    });
  });

  describe("listDraftsForDeal", () => {
    it("rejects cross-org deal", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(null);

      await expect(listDraftsForDeal(SCOPE, "deal-foreign")).rejects.toThrow(
        /deal not found/,
      );
    });
  });

  describe("assertNoOutreachSend", () => {
    it("documents that send is intentionally unavailable", () => {
      expect(() => assertNoOutreachSend()).toThrow(/send is not implemented/);
    });
  });
});
