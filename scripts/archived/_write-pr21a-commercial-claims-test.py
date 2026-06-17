"""Write sales-commercial-claims.test.ts (UTF-8)."""
from pathlib import Path

TARGET = (
    Path(__file__).resolve().parents[1]
    / "src/lib/sales/__tests__/sales-commercial-claims.test.ts"
)

CONTENT = r'''// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), update: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  assertCommercialClaimReviewed,
  flagCommercialClaimIfNeeded,
  getOutreachDraftClaimState,
  markCommercialClaimReviewed,
  readCommercialClaimReviews,
  reviewCommercialClaimOnDeal,
  validateClaimText,
} from "../commercial-claims";
import { createOutreachDraft, submitOutreachDraftForReview } from "../outreach";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_DEAL = {
  id: "deal-1",
  title: "Enterprise deal",
  organizationId: "org-a",
  metadata: { outreachDrafts: [] },
  account: { id: "acc-1", name: "Acme" },
};

describe("SalesOS commercial claims (PR-21a)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesDeal.update.mockResolvedValue(BASE_DEAL);
    prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
  });

  describe("validateClaimText", () => {
    it("flags risky and marker phrases", () => {
      const result = validateClaimText(
        "AQLIYA SalesOS is production-ready with guaranteed ROI",
      );
      expect(result.requiresReview).toBe(true);
      expect(result.hasClaimMarkers).toBe(true);
      expect(result.flaggedPhrases.length).toBeGreaterThan(0);
    });

    it("allows neutral outreach copy", () => {
      const result = validateClaimText("Following up on our last conversation.");
      expect(result.requiresReview).toBe(false);
      expect(result.flaggedPhrases).toHaveLength(0);
    });
  });

  describe("flagCommercialClaimIfNeeded", () => {
    it("stores flagged review on metadata and audits once", async () => {
      const { metadata, review } = await flagCommercialClaimIfNeeded({
        scope: SCOPE,
        actor: ACTOR,
        targetType: "SalesDeal",
        targetId: "deal-1",
        existingMetadata: {},
        sourceType: "outreach_draft",
        sourceId: "d-1",
        text: "Our AuditOS pilot-ready platform",
      });

      expect(review?.status).toBe("flagged");
      expect(readCommercialClaimReviews(metadata)).toHaveLength(1);
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.CLAIM_FLAGGED,
          }),
        }),
      );
    });
  });

  describe("assertCommercialClaimReviewed", () => {
    it("blocks submit when markers exist but claim not reviewed", () => {
      expect(() =>
        assertCommercialClaimReviewed({
          metadata: {
            commercialClaimReviews: [
              {
                id: "c-1",
                sourceType: "outreach_draft",
                sourceId: "d-1",
                flaggedPhrases: ["L6"],
                status: "flagged",
                flaggedAt: "2026-06-01T10:00:00.000Z",
                reviewedAt: null,
                reviewedById: null,
                reviewedByName: null,
              },
            ],
          },
          text: "We are L6 production-ready",
          sourceType: "outreach_draft",
          sourceId: "d-1",
        }),
      ).toThrow(/claim review before submit/);
    });
  });

  describe("markCommercialClaimReviewed", () => {
    it("marks claim reviewed and records audit", async () => {
      const { review } = await markCommercialClaimReviewed({
        scope: SCOPE,
        actor: ACTOR,
        targetType: "SalesDeal",
        targetId: "deal-1",
        existingMetadata: {
          commercialClaimReviews: [
            {
              id: "c-1",
              sourceType: "outreach_draft",
              sourceId: "d-1",
              flaggedPhrases: ["SalesOS capability"],
              status: "flagged",
              flaggedAt: "2026-06-01T10:00:00.000Z",
              reviewedAt: null,
              reviewedById: null,
              reviewedByName: null,
            },
          ],
        },
        claimId: "c-1",
      });

      expect(review.status).toBe("reviewed");
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.CLAIM_REVIEWED,
          }),
        }),
      );
    });
  });

  describe("getOutreachDraftClaimState", () => {
    it("reports pending claim review for flagged drafts", () => {
      const state = getOutreachDraftClaimState(
        {
          commercialClaimReviews: [
            {
              id: "c-1",
              sourceType: "outreach_draft",
              sourceId: "d-1",
              flaggedPhrases: ["guarantee"],
              status: "flagged",
              flaggedAt: "2026-06-01T10:00:00.000Z",
              reviewedAt: null,
              reviewedById: null,
              reviewedByName: null,
            },
          ],
        },
        "d-1",
        "Update",
        "We guarantee outcomes",
      );
      expect(state.pendingClaimReview).toBe(true);
    });
  });

  describe("reviewCommercialClaimOnDeal", () => {
    it("persists reviewed claim on deal metadata", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        metadata: {
          commercialClaimReviews: [
            {
              id: "c-1",
              sourceType: "outreach_draft",
              sourceId: "d-1",
              flaggedPhrases: ["certified"],
              status: "flagged",
              flaggedAt: "2026-06-01T10:00:00.000Z",
              reviewedAt: null,
              reviewedById: null,
              reviewedByName: null,
            },
          ],
        },
      });

      const review = await reviewCommercialClaimOnDeal(
        SCOPE,
        "deal-1",
        "c-1",
        ACTOR,
      );

      expect(review.status).toBe("reviewed");
      expect(prisma.salesDeal.update).toHaveBeenCalled();
    });
  });

  describe("outreach integration", () => {
    it("blocks submitOutreachDraftForReview until claim reviewed", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          outreachDrafts: [
            {
              id: "d-1",
              subject: "Intro",
              body: "AQLIYA SalesOS is pilot-ready",
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
          commercialClaimReviews: [
            {
              id: "c-1",
              sourceType: "outreach_draft",
              sourceId: "d-1",
              flaggedPhrases: ["pilot-ready"],
              status: "flagged",
              flaggedAt: "2026-06-01T10:00:00.000Z",
              reviewedAt: null,
              reviewedById: null,
              reviewedByName: null,
            },
          ],
        },
      });

      await expect(
        submitOutreachDraftForReview(SCOPE, "deal-1", "d-1", ACTOR),
      ).rejects.toThrow(/claim review before submit/);
    });

    it("flags claim when creating outreach draft with markers", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      await createOutreachDraft(
        SCOPE,
        "deal-1",
        {
          subject: "Pilot",
          body: "DecisionOS is production-ready for your team",
        },
        ACTOR,
      );

      expect(prisma.salesDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              commercialClaimReviews: expect.arrayContaining([
                expect.objectContaining({
                  sourceType: "outreach_draft",
                  status: "flagged",
                }),
              ]),
            }),
          }),
        }),
      );
    });
  });
});
'''


def main() -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(CONTENT, encoding="utf-8", newline="\n")
    print(f"wrote {TARGET}")


if __name__ == "__main__":
    main()
