// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: { findFirst: jest.fn(), update: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import { readAccountIcpScore } from "../icp-types";
import {
  computeIcpFitStub,
  recalculateAccountIcpFit,
  setAccountIcpReviewed,
} from "../agents/icp-fit";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

describe("SalesOS ICP Fit Agent stub (PR-15)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
  });

  describe("computeIcpFitStub", () => {
    it("scores audit industry + ICP-1 segment as strong fit", () => {
      const result = computeIcpFitStub({
        industry: "Audit & Accounting",
        metadata: {
          segment: "ICP-1 — Audit firms",
        },
      });

      expect(result.score.fitScore).toBeGreaterThanOrEqual(75);
      expect(result.score.band).toBe("strong");
      expect(result.score.agentGenerated).toBe(true);
      expect(result.score.reviewed).toBe(false);
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it("returns weak fit for unknown industry without segment", () => {
      const result = computeIcpFitStub({
        industry: "Retail",
        metadata: {},
      });

      expect(result.score.fitScore).toBeLessThan(50);
      expect(result.score.band).toBe("weak");
      expect(result.confidence).toBeLessThan(70);
      expect(result.reasoning.some((r) => r.includes("شريحة"))).toBe(true);
    });

    it("uses icpScore.segment from existing metadata", () => {
      const result = computeIcpFitStub({
        industry: "Financial Services",
        metadata: {
          icpScore: { segment: "Enterprise SaaS" },
        },
      });

      expect(result.score.segment).toBe("Enterprise SaaS");
      expect(result.score.fitScore).toBeGreaterThan(50);
    });

    it("never calls LLM — pure rules output", () => {
      const result = computeIcpFitStub({
        industry: "Technology",
        metadata: { segment: "mid-market" },
      });

      expect(result.score.source).toBe("rules-agent");
      expect(result.score.agentGenerated).toBe(true);
      expect(Array.isArray(result.reasoning)).toBe(true);
    });
  });

  describe("recalculateAccountIcpFit", () => {
    it("writes icpScore with agentGenerated and records audit", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        id: "acc-1",
        name: "Acme Audit",
        industry: "Audit",
        metadata: { segment: "ICP-1" },
      });
      prisma.salesAccount.update.mockImplementation(({ data }) =>
        Promise.resolve({
          id: "acc-1",
          name: "Acme Audit",
          industry: "Audit",
          metadata: data.metadata,
          status: "active",
          isDemo: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const { result } = await recalculateAccountIcpFit("acc-1", SCOPE, ACTOR);

      expect(result.score.agentGenerated).toBe(true);
      expect(result.score.reviewed).toBe(false);
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.AGENT_ICP_SCORED,
            targetType: "SalesAccount",
            targetId: "acc-1",
          }),
        }),
      );

      const meta = prisma.salesAccount.update.mock.calls[0][0].data.metadata;
      const parsed = readAccountIcpScore(meta);
      expect(parsed.configured).toBe(true);
      expect(parsed.score?.agentGenerated).toBe(true);
      expect(parsed.score?.reviewed).toBe(false);
    });
  });

  describe("setAccountIcpReviewed", () => {
    it("toggles reviewed flag on existing icpScore", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        id: "acc-1",
        name: "Acme",
        metadata: {
          icpScore: {
            fitScore: 80,
            band: "strong",
            agentGenerated: true,
            reviewed: false,
          },
        },
      });
      prisma.salesAccount.update.mockImplementation(({ data }) =>
        Promise.resolve({
          id: "acc-1",
          metadata: data.metadata,
        }),
      );

      await setAccountIcpReviewed("acc-1", SCOPE, ACTOR, true);

      const meta = prisma.salesAccount.update.mock.calls[0][0].data.metadata;
      const parsed = readAccountIcpScore(meta);
      expect(parsed.score?.reviewed).toBe(true);
      expect(parsed.score?.reviewedById).toBe("user-1");
    });

    it("rejects when no icpScore exists", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        id: "acc-1",
        name: "Acme",
        metadata: {},
      });

      await expect(
        setAccountIcpReviewed("acc-1", SCOPE, ACTOR, true),
      ).rejects.toThrow(/no ICP score to review/);
    });
  });
});
