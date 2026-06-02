// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), update: jest.fn() },
    salesInteraction: { findMany: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  computeDealRiskStub,
  readDealRiskAssessment,
  recalculateDealRisk,
} from "../agents/deal-risk";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const NOW = new Date("2026-06-01T10:00:00.000Z");

const BASE_DEAL = {
  id: "deal-1",
  title: "Enterprise Pilot",
  status: "open",
  metadata: {},
  createdAt: new Date("2026-05-01T10:00:00.000Z"),
  updatedAt: new Date("2026-05-01T10:00:00.000Z"),
};

describe("SalesOS Deal Risk Agent stub (PR-17)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesInteraction.findMany.mockResolvedValue([]);
    prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
    prisma.salesDeal.update.mockImplementation(async ({ data }) => ({
      ...BASE_DEAL,
      metadata: data.metadata,
    }));
  });

  describe("computeDealRiskStub", () => {
    it("flags activity_gap when open deal has long idle period", () => {
      const result = computeDealRiskStub(
        {
          status: "open",
          updatedAt: new Date("2026-05-01T10:00:00.000Z"),
          metadata: {},
        },
        [],
        NOW,
      );

      expect(
        result.assessment.riskFlags.some((f) => f.id === "activity_gap"),
      ).toBe(true);
      expect(result.assessment.severity).toBe("high");
      expect(result.assessment.advisoryOnly).toBe(true);
      expect(result.assessment.agentGenerated).toBe(true);
    });

    it("flags no_response when nextActionAt is overdue", () => {
      const result = computeDealRiskStub(
        {
          status: "open",
          updatedAt: new Date("2026-05-20T10:00:00.000Z"),
          metadata: {
            nextActionAt: "2026-05-25T10:00:00.000Z",
            nextAction: "Follow up",
          },
        },
        [
          {
            type: "email",
            occurredAt: new Date("2026-05-26T10:00:00.000Z"),
          },
        ],
        NOW,
      );

      expect(
        result.assessment.riskFlags.some((f) => f.id === "no_response"),
      ).toBe(true);
    });

    it("flags missing_stakeholder_hint without metadata hints", () => {
      const result = computeDealRiskStub(
        {
          status: "open",
          updatedAt: new Date("2026-05-28T10:00:00.000Z"),
          metadata: {},
        },
        [
          {
            type: "meeting",
            occurredAt: new Date("2026-05-30T10:00:00.000Z"),
          },
        ],
        NOW,
      );

      expect(
        result.assessment.riskFlags.some(
          (f) => f.id === "missing_stakeholder_hint",
        ),
      ).toBe(true);
    });

    it("returns none severity for closed deals", () => {
      const result = computeDealRiskStub(
        {
          status: "won",
          updatedAt: new Date("2026-05-01T10:00:00.000Z"),
          metadata: {},
        },
        [],
        NOW,
      );

      expect(result.assessment.severity).toBe("none");
      expect(result.assessment.riskFlags).toHaveLength(0);
    });

    it("never uses LLM — advisory agent stub only", () => {
      const result = computeDealRiskStub(
        {
          status: "open",
          updatedAt: new Date("2026-05-01T10:00:00.000Z"),
          metadata: {},
        },
        [],
        NOW,
      );

      expect(result.assessment.agentGenerated).toBe(true);
      expect(result.assessment.advisoryOnly).toBe(true);
      expect(result.assessment.notes).toContain("Stub PR-17");
    });
  });

  describe("recalculateDealRisk", () => {
    it("persists riskAssessment to deal metadata and audits", async () => {
      const { deal, result } = await recalculateDealRisk("deal-1", SCOPE, ACTOR);

      expect(prisma.salesDeal.update).toHaveBeenCalled();
      const updateArg = prisma.salesDeal.update.mock.calls[0][0];
      const parsed = readDealRiskAssessment(updateArg.data.metadata);
      expect(parsed?.severity).toBe(result.assessment.severity);

      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.AGENT_DEAL_RISK_COMPUTED,
            targetType: "SalesDeal",
            targetId: "deal-1",
          }),
        }),
      );

      expect(deal.id).toBe("deal-1");
    });
  });
});
