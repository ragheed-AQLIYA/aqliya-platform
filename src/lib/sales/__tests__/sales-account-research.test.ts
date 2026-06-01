// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    salesDeal: { count: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  readAccountResearchFromMetadata,
  runAccountResearchStub,
  markAccountResearchReviewed,
} from "../agents/account-research";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const OPERATOR = { id: "user-op", name: "Operator", role: "OPERATOR" };
const ADMIN = { id: "user-admin", name: "Admin", role: "ADMIN" };

const BASE_ACCOUNT = {
  id: "acc-1",
  name: "Acme Corp",
  industry: "Technology",
  status: "active",
  metadata: {
    icpScore: {
      fitScore: 72,
      band: "moderate",
      assessedAt: "2026-06-01T08:00:00.000Z",
    },
    signals: [
      {
        id: "sig-1",
        type: "intent",
        title: "Pricing interest",
        summary: "Visited pricing",
        severity: "high",
        detectedAt: "2026-06-01T10:00:00.000Z",
        createdAt: "2026-06-01T10:00:00.000Z",
      },
    ],
  },
};

describe("SalesOS account research agent stub (PR-14)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesAccount.update.mockResolvedValue(BASE_ACCOUNT);
    prisma.salesDeal.count.mockResolvedValue(2);
    prisma.salesAccount.findFirst.mockResolvedValue(BASE_ACCOUNT);
  });

  describe("readAccountResearchFromMetadata", () => {
    it("returns null when agentRuns.accountResearch missing", () => {
      expect(readAccountResearchFromMetadata({})).toBeNull();
    });

    it("parses stored research run", () => {
      const run = readAccountResearchFromMetadata({
        agentRuns: {
          accountResearch: {
            brief: "Test brief",
            sources: [{ type: "account_field", label: "Name", value: "Acme" }],
            confidence: 55,
            status: "draft_pending_review",
            generatedAt: "2026-06-01T12:00:00.000Z",
            generatedById: "user-1",
            generatedByName: "User",
            reviewedAt: null,
            reviewedById: null,
            reviewedByName: null,
          },
        },
      });
      expect(run?.brief).toBe("Test brief");
      expect(run?.status).toBe("draft_pending_review");
      expect(run?.confidence).toBe(55);
    });
  });

  describe("runAccountResearchStub", () => {
    it("generates template brief and persists metadata", async () => {
      const result = await runAccountResearchStub(
        { scope: SCOPE, actor: OPERATOR },
        "acc-1",
      );

      expect(result.status).toBe("draft_pending_review");
      expect(result.brief).toContain("Acme Corp");
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);

      expect(prisma.salesAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "acc-1" },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              agentRuns: expect.objectContaining({
                accountResearch: expect.objectContaining({
                  status: "draft_pending_review",
                  generatedById: OPERATOR.id,
                }),
              }),
            }),
          }),
        }),
      );

      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.RESEARCH_GENERATED,
            targetId: "acc-1",
          }),
        }),
      );
    });
  });

  describe("markAccountResearchReviewed", () => {
    it("requires ADMIN role", async () => {
      await expect(
        markAccountResearchReviewed(
          { scope: SCOPE, actor: OPERATOR },
          "acc-1",
        ),
      ).rejects.toThrow(/ADMIN role/);
    });

    it("marks draft_pending_review as reviewed and audits", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        ...BASE_ACCOUNT,
        metadata: {
          agentRuns: {
            accountResearch: {
              brief: "Existing",
              sources: [],
              confidence: 40,
              status: "draft_pending_review",
              generatedAt: "2026-06-01T11:00:00.000Z",
              generatedById: "user-op",
              generatedByName: "Operator",
              reviewedAt: null,
              reviewedById: null,
              reviewedByName: null,
            },
          },
        },
      });

      const run = await markAccountResearchReviewed(
        { scope: SCOPE, actor: ADMIN },
        "acc-1",
      );

      expect(run.status).toBe("reviewed");
      expect(run.reviewedById).toBe(ADMIN.id);
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.RESEARCH_REVIEWED,
          }),
        }),
      );
    });

    it("rejects when no brief exists", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        ...BASE_ACCOUNT,
        metadata: {},
      });

      await expect(
        markAccountResearchReviewed(
          { scope: SCOPE, actor: ADMIN },
          "acc-1",
        ),
      ).rejects.toThrow(/generate first/);
    });
  });
});
