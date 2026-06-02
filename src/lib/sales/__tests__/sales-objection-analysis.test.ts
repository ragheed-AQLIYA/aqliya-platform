// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    salesInteraction: {
      findFirst: jest.fn(),
    },
    salesAuditEvent: { create: jest.fn() },
  },
}));

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "run-uuid-1"),
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  computeObjectionAnalysisStub,
  readObjectionAnalysisRuns,
  runObjectionAnalysisStub,
} from "../agents/objection-analysis";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User", role: "OPERATOR" as const };

const BASE_DEAL = {
  id: "deal-1",
  metadata: {},
};

describe("SalesOS objection analysis agent (PR-16)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesDeal.update.mockResolvedValue(BASE_DEAL);
  });

  describe("computeObjectionAnalysisStub", () => {
    it("categorizes price objections from Arabic keywords", () => {
      const result = computeObjectionAnalysisStub(
        "العميل يقول السعر مكلف جداً مقارنة بالميزانية",
      );
      expect(result.category).toBe("price");
      expect(result.status).toBe("draft_pending_review");
      expect(result.suggestedResponse).toContain("استثمار");
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
    });

    it("categorizes AI replacement objections", () => {
      const result = computeObjectionAnalysisStub(
        "Will AI replace our auditors and reviewers?",
      );
      expect(result.category).toBe("ai_replacement");
      expect(result.suggestedResponse).toContain("Humans decide");
    });

    it("falls back to other when no keywords match", () => {
      const result = computeObjectionAnalysisStub("hello there");
      expect(result.category).toBe("other");
      expect(result.matchedKeywords).toHaveLength(0);
    });
  });

  describe("readObjectionAnalysisRuns", () => {
    it("returns empty array when objectionAnalysis is missing", () => {
      expect(readObjectionAnalysisRuns({})).toEqual([]);
      expect(readObjectionAnalysisRuns({ agentRuns: {} })).toEqual([]);
    });

    it("parses stored runs from metadata array", () => {
      const runs = readObjectionAnalysisRuns({
        agentRuns: {
          objectionAnalysis: [
            {
              id: "run-1",
              category: "trust",
              categoryLabelAr: "الثقة",
              suggestedResponse: "رد مقترح",
              confidence: 60,
              status: "draft_pending_review",
              sourceText: "نص الاعتراض",
              interactionId: null,
              matchedKeywords: ["trust"],
              analyzedAt: "2026-06-01T12:00:00.000Z",
              analyzedById: "user-1",
              analyzedByName: "Test User",
            },
          ],
        },
      });

      expect(runs).toHaveLength(1);
      expect(runs[0]?.category).toBe("trust");
      expect(runs[0]?.status).toBe("draft_pending_review");
    });
  });

  describe("runObjectionAnalysisStub", () => {
    it("analyzes pasted text, appends to metadata array, and audits", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      const run = await runObjectionAnalysisStub(
        { scope: SCOPE, actor: ACTOR },
        "deal-1",
        { pastedText: "The price is too expensive for our budget this year" },
      );

      expect(run.id).toBe("run-uuid-1");
      expect(run.category).toBe("price");
      expect(run.status).toBe("draft_pending_review");
      expect(run.analyzedById).toBe("user-1");

      expect(prisma.salesDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "deal-1" },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              agentRuns: expect.objectContaining({
                objectionAnalysis: expect.arrayContaining([
                  expect.objectContaining({
                    id: "run-uuid-1",
                    category: "price",
                    status: "draft_pending_review",
                  }),
                ]),
              }),
            }),
          }),
        }),
      );

      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.OBJECTION_ANALYZED,
            targetId: "deal-1",
          }),
        }),
      );
    });

    it("loads text from interaction when interactionId is provided", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
      prisma.salesInteraction.findFirst.mockResolvedValue({
        id: "int-1",
        dealId: "deal-1",
        subject: "Pricing concern",
        summary: "Customer said the cost is too high for this quarter",
        metadata: {},
      });

      const run = await runObjectionAnalysisStub(
        { scope: SCOPE, actor: ACTOR },
        "deal-1",
        { interactionId: "int-1" },
      );

      expect(run.interactionId).toBe("int-1");
      expect(run.category).toBe("price");
    });

    it("rejects interaction not on deal", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
      prisma.salesInteraction.findFirst.mockResolvedValue({
        id: "int-1",
        dealId: "other-deal",
        subject: "Pricing",
        summary: "Too expensive for budget",
        metadata: {},
      });

      await expect(
        runObjectionAnalysisStub(
          { scope: SCOPE, actor: ACTOR },
          "deal-1",
          { interactionId: "int-1" },
        ),
      ).rejects.toThrow(/does not belong/);
    });

    it("rejects both interactionId and pasted text", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      await expect(
        runObjectionAnalysisStub(
          { scope: SCOPE, actor: ACTOR },
          "deal-1",
          {
            interactionId: "int-1",
            pastedText: "Some pasted objection text here",
          },
        ),
      ).rejects.toThrow(/either interactionId or pasted text/);
    });
  });
});
