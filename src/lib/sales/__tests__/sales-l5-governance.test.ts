// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), update: jest.fn() },
    salesAccount: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    salesProposal: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    salesReview: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    salesApproval: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
    salesEvidenceLink: { count: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import {
  submitOpportunityForReview,
  decideOpportunityReview,
  listPendingOpportunityReviews,
} from "../l5-governance";
import { createSalesAccount, createSalesDeal } from "../services";
import { SalesAuditActions } from "../audit-events";

const ORG_A = "org-a";
const ORG_B = "org-b";
const scopeA = { organizationId: ORG_A, platformOrganizationId: "plat-a" };
const actor = { id: "user-1", name: "Tester", role: "OPERATOR" };

describe("SalesOS L5 governance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({});
  });

  describe("submitOpportunityForReview", () => {
    it("creates review row and metadata decision when tables exist", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        title: "Deal A",
        accountId: "acc-1",
        metadata: {},
        stage: { slug: "proposal_commercial_review", name: "Proposal" },
      });
      prisma.salesProposal.create.mockResolvedValue({ id: "prop-1" });
      prisma.salesProposal.update.mockResolvedValue({ id: "prop-1", status: "submitted" });
      prisma.salesReview.create.mockResolvedValue({ id: "rev-1" });
      prisma.salesDeal.update.mockResolvedValue({ id: "deal-1" });

      const result = await submitOpportunityForReview(
        scopeA,
        { dealId: "deal-1", reason: "Ready for governance review" },
        actor,
      );

      expect(result.reviewId).toBe("rev-1");
      expect(result.proposalId).toBe("prop-1");
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.PROPOSAL_SUBMITTED,
            organizationId: ORG_A,
          }),
        }),
      );
    });
  });

  describe("decideOpportunityReview", () => {
    it("records approval with audit event", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        id: "deal-1",
        title: "Deal A",
        accountId: "acc-1",
        metadata: {},
        stage: null,
      });
      prisma.salesReview.update.mockResolvedValue({ id: "rev-1", status: "approved" });
      prisma.salesApproval.create.mockResolvedValue({ id: "appr-1" });
      prisma.salesDeal.update.mockResolvedValue({ id: "deal-1" });

      await decideOpportunityReview(
        scopeA,
        { dealId: "deal-1", reviewId: "rev-1", decision: "approved", note: "OK" },
        actor,
      );

      expect(prisma.salesApproval.create).toHaveBeenCalled();
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.GOVERNANCE_APPROVAL_GRANTED,
          }),
        }),
      );
    });
  });

  describe("tenant isolation (account CRUD)", () => {
    it("denies cross-org account read via services", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue(null);

      await expect(
        createSalesAccount(scopeA, { name: "Acme" }, actor),
      ).resolves.toBeDefined();

      prisma.salesAccount.findFirst.mockResolvedValue({
        id: "acc-b",
        name: "Other Org Account",
        platformOrganizationId: null,
      });

      await expect(
        createSalesDeal(
          scopeA,
          { title: "X", accountId: "acc-b" },
          actor,
        ),
      ).rejects.toThrow(/account not found/i);
    });
  });

  describe("listPendingOpportunityReviews", () => {
    it("scopes list to organization", async () => {
      prisma.salesReview.findMany.mockResolvedValue([
        { id: "rev-1", organizationId: ORG_A, status: "pending" },
      ]);

      const rows = await listPendingOpportunityReviews(ORG_A);
      expect(prisma.salesReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_A }),
        }),
      );
      expect(rows).toHaveLength(1);
    });

    it("returns empty when prisma model unavailable", async () => {
      prisma.salesReview.findMany.mockRejectedValue(new Error("table missing"));
      const rows = await listPendingOpportunityReviews(ORG_B);
      expect(rows).toEqual([]);
    });
  });
});
