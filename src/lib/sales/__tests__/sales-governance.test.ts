// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), update: jest.fn() },
    salesEvidenceLink: { count: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import {
  requiresApprovalForStageChange,
  assertStageChangeGovernance,
  readReviewDecisions,
  appendReviewDecisionMetadata,
  dealNeedsGovernanceAttention,
  canGovernanceOverride,
  recordReviewDecision,
} from "../governance";
import { SalesAuditActions } from "../audit-events";
import { updateSalesDeal } from "../services";

describe("SalesOS governance (PR-10)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requiresApprovalForStageChange", () => {
    it("flags proposal, pilot, and won stage slugs", () => {
      expect(requiresApprovalForStageChange("proposal_commercial_review")).toBe(
        true,
      );
      expect(requiresApprovalForStageChange("pilot_active")).toBe(true);
      expect(requiresApprovalForStageChange("won")).toBe(true);
      expect(requiresApprovalForStageChange("discovery")).toBe(false);
    });
  });

  describe("assertStageChangeGovernance", () => {
    it("allows governed stage when evidence is linked", () => {
      expect(() =>
        assertStageChangeGovernance({
          dealId: "d1",
          toStageSlug: "pilot_active",
          evidenceLinkCount: 1,
        }),
      ).not.toThrow();
    });

    it("allows OPERATOR override with reason when no evidence", () => {
      const result = assertStageChangeGovernance({
        dealId: "d1",
        toStageSlug: "won",
        evidenceLinkCount: 0,
        governanceOverrideReason: "Executive sign-off pending upload",
        actorRole: "OPERATOR",
      });
      expect(result.usedOverride).toBe(true);
      expect(result.overrideReason).toContain("Executive");
    });

    it("blocks governed stage without evidence or override", () => {
      expect(() =>
        assertStageChangeGovernance({
          dealId: "d1",
          toStageSlug: "proposal_commercial_review",
          evidenceLinkCount: 0,
          actorRole: "OPERATOR",
        }),
      ).toThrow(/governance/i);
    });

    it("blocks VIEWER override even with reason", () => {
      expect(() =>
        assertStageChangeGovernance({
          dealId: "d1",
          toStageSlug: "won",
          evidenceLinkCount: 0,
          governanceOverrideReason: "Should not apply",
          actorRole: "VIEWER",
        }),
      ).toThrow(/governance/i);
    });
  });

  describe("review decision metadata", () => {
    it("reads and appends reviewDecisions on deal metadata", () => {
      const base = appendReviewDecisionMetadata(
        {},
        {
          id: "rd-1",
          decision: "approved",
          actorId: "u1",
          actorName: "Tester",
          reason: "Evidence reviewed",
          createdAt: "2026-06-01T10:00:00.000Z",
          stageSlug: "pilot_active",
        },
      );
      const list = readReviewDecisions(base);
      expect(list).toHaveLength(1);
      expect(list[0].decision).toBe("approved");
    });

    it("dealNeedsGovernanceAttention when governed stage lacks evidence and approval", () => {
      expect(
        dealNeedsGovernanceAttention({
          stageSlug: "pilot_proposed",
          evidenceLinkCount: 0,
          metadata: {},
        }),
      ).toBe(true);
      expect(
        dealNeedsGovernanceAttention({
          stageSlug: "pilot_proposed",
          evidenceLinkCount: 0,
          metadata: {
            reviewDecisions: [
              {
                id: "rd-2",
                decision: "approved",
                actorId: "u1",
                reason: "OK",
                createdAt: "2026-06-01T11:00:00.000Z",
              },
            ],
          },
        }),
      ).toBe(false);
    });
  });

  describe("canGovernanceOverride", () => {
    it("allows OPERATOR and ADMIN only", () => {
      expect(canGovernanceOverride("OPERATOR")).toBe(true);
      expect(canGovernanceOverride("ADMIN")).toBe(true);
      expect(canGovernanceOverride("VIEWER")).toBe(false);
    });
  });

  describe("recordReviewDecision", () => {
    it("persists decision to metadata and audit event", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        title: "Deal",
        metadata: {},
        stage: { slug: "pilot_active" },
      });
      prisma.salesDeal.update.mockResolvedValue({ id: "deal-1" });
      prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });

      const record = await recordReviewDecision(
        { organizationId: "org-a", platformOrganizationId: "plat-1" },
        {
          dealId: "deal-1",
          decision: "approved",
          reason: "Pilot scope confirmed",
          actor: { id: "user-1", name: "Reviewer" },
        },
      );

      expect(record.decision).toBe("approved");
      expect(prisma.salesDeal.update).toHaveBeenCalled();
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.GOVERNANCE_REVIEW_DECISION,
          }),
        }),
      );
    });
  });

  describe("updateSalesDeal governance gate", () => {
    it("records governance override audit when moving to won without evidence", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        title: "Deal",
        status: "open",
        stageId: "stage-a",
        amount: null,
        metadata: {},
      });
      prisma.salesPipelineStage.findFirst.mockResolvedValue({
        id: "stage-won",
        slug: "won",
      });
      prisma.salesEvidenceLink.count.mockResolvedValue(0);
      prisma.salesDeal.update.mockResolvedValue({
        id: "deal-1",
        title: "Deal",
        status: "open",
        stageId: "stage-won",
        accountId: "acc-1",
        amount: null,
        currency: "SAR",
        account: { id: "acc-1", name: "Acct" },
        stage: { id: "stage-won", name: "Won", slug: "won", sortOrder: 8 },
      });
      prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-gov" });

      await updateSalesDeal(
        "deal-1",
        { organizationId: "org-a", platformOrganizationId: "plat-1" },
        {
          stageId: "stage-won",
          governanceOverrideReason: "Contract signed — evidence upload tomorrow",
        },
        { id: "user-1", role: "OPERATOR" },
      );

      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.GOVERNANCE_OVERRIDE,
          }),
        }),
      );
    });

    it("rejects governed stage change without evidence or override", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        title: "Deal",
        status: "open",
        stageId: "stage-a",
        amount: null,
        metadata: {},
      });
      prisma.salesPipelineStage.findFirst.mockResolvedValue({
        id: "stage-pilot",
        slug: "pilot_active",
      });
      prisma.salesEvidenceLink.count.mockResolvedValue(0);

      await expect(
        updateSalesDeal(
          "deal-1",
          { organizationId: "org-a", platformOrganizationId: "plat-1" },
          { stageId: "stage-pilot" },
          { id: "user-1", role: "OPERATOR" },
        ),
      ).rejects.toThrow(/governance/i);
    });
  });
});
