// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: { findFirst: jest.fn(), update: jest.fn() },
    salesEvidenceLink: { count: jest.fn(), findMany: jest.fn() },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  getConversionMemoForDeal,
  readConversionMemo,
  submitConversionMemo,
  upsertConversionMemo,
  validateUpdateConversionMemoInput,
} from "../conversion-memo";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_DEAL = {
  id: "deal-1",
  title: "Pilot deal",
  organizationId: "org-a",
  metadata: {},
};

const DRAFT_MEMO = {
  draft: "Pilot succeeded - recommend paid rollout.",
  status: "draft",
  pilotCriteria: "3 workshops delivered; NPS >= 8",
  evidenceRefs: ["link-1"],
  decidedAt: null,
  updatedById: "user-1",
  updatedByName: "Test User",
  updatedAt: "2026-06-01T10:00:00.000Z",
  submittedAt: null,
};

describe("SalesOS conversion memo (PR-13)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
    prisma.salesDeal.update.mockResolvedValue(BASE_DEAL);
    prisma.salesEvidenceLink.count.mockResolvedValue(1);
    prisma.salesEvidenceLink.findMany.mockResolvedValue([
      { id: "link-1", evidenceId: "ev-1" },
    ]);
  });

  describe("validateUpdateConversionMemoInput", () => {
    it("requires draft and pilot criteria when provided", () => {
      expect(() =>
        validateUpdateConversionMemoInput({ draft: "  ", pilotCriteria: "ok" }),
      ).toThrow(/draft is required/);
      expect(() =>
        validateUpdateConversionMemoInput({ draft: "ok", pilotCriteria: "" }),
      ).toThrow(/pilot criteria is required/);
    });
  });

  describe("readConversionMemo", () => {
    it("parses conversionMemo from deal metadata", () => {
      const memo = readConversionMemo({ conversionMemo: DRAFT_MEMO });
      expect(memo?.status).toBe("draft");
      expect(memo?.evidenceRefs).toEqual(["link-1"]);
    });
  });

  describe("upsertConversionMemo", () => {
    it("creates memo on deal metadata and records audit", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);

      const memo = await upsertConversionMemo(
        SCOPE,
        "deal-1",
        {
          draft: "Summary",
          pilotCriteria: "Criteria met",
          evidenceRefs: ["link-1"],
        },
        ACTOR,
      );

      expect(memo.status).toBe("draft");
      expect(prisma.salesDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "deal-1" },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              conversionMemo: expect.objectContaining({
                draft: "Summary",
                pilotCriteria: "Criteria met",
              }),
            }),
          }),
        }),
      );
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.CONVERSION_MEMO_UPDATED,
          }),
        }),
      );
    });

    it("blocks edit when memo is no longer draft", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          conversionMemo: { ...DRAFT_MEMO, status: "submitted" },
        },
      });

      await expect(
        upsertConversionMemo(
          SCOPE,
          "deal-1",
          { draft: "Changed" },
          ACTOR,
        ),
      ).rejects.toThrow(/only be edited while in draft/);
    });
  });

  describe("submitConversionMemo", () => {
    it("requires linked evidence on the deal", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: { conversionMemo: DRAFT_MEMO },
      });
      prisma.salesEvidenceLink.count.mockResolvedValue(0);

      await expect(
        submitConversionMemo(SCOPE, "deal-1", {}, ACTOR),
      ).rejects.toThrow(/linked evidence item is required/);
    });

    it("requires evidence refs that belong to the deal", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: {
          conversionMemo: { ...DRAFT_MEMO, evidenceRefs: ["unknown-link"] },
        },
      });

      await expect(
        submitConversionMemo(SCOPE, "deal-1", {}, ACTOR),
      ).rejects.toThrow(/evidence reference must link/);
    });

    it("submits memo when evidence gates pass", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue({
        ...BASE_DEAL,
        metadata: { conversionMemo: DRAFT_MEMO },
      });

      const memo = await submitConversionMemo(
        SCOPE,
        "deal-1",
        { markDecided: true },
        ACTOR,
      );

      expect(memo.status).toBe("decided");
      expect(memo.decidedAt).toBeTruthy();
      expect(memo.submittedAt).toBeTruthy();
    });
  });

  describe("getConversionMemoForDeal", () => {
    it("returns null when memo missing", async () => {
      prisma.salesDeal.findFirst.mockResolvedValue(BASE_DEAL);
      const memo = await getConversionMemoForDeal(SCOPE, "deal-1");
      expect(memo).toBeNull();
    });
  });
});
