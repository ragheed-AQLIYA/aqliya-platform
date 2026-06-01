// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    salesDeal: { findMany: jest.fn() },
    salesAuditEvent: { findMany: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  appendInstitutionalMemoryMetadata,
  buildAuditMemoryEntries,
  buildIcpReviewEntry,
  buildReviewDecisionEntries,
  readInstitutionalMemory,
  syncInstitutionalMemoryForAccount,
  MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT,
} from "../institutional-memory";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };

describe("SalesOS institutional memory (metadata stub)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readInstitutionalMemory", () => {
    it("parses append-only entries and sorts by at desc", () => {
      const entries = readInstitutionalMemory({
        institutionalMemory: [
          {
            type: "audit",
            summary: "older",
            sourceRef: "audit:1",
            actorId: "u1",
            at: "2026-06-01T10:00:00.000Z",
          },
          {
            type: "icp_review",
            summary: "newer",
            sourceRef: "icp-review:acc:2",
            actorId: "u2",
            at: "2026-06-02T10:00:00.000Z",
          },
        ],
      });
      expect(entries).toHaveLength(2);
      expect(entries[0].type).toBe("icp_review");
      expect(entries[1].type).toBe("audit");
    });

    it("skips invalid rows", () => {
      expect(
        readInstitutionalMemory({
          institutionalMemory: [{ type: "invalid", summary: "x" }],
        }),
      ).toEqual([]);
    });
  });

  describe("appendInstitutionalMemoryMetadata", () => {
    it("dedupes by sourceRef and caps at max", () => {
      const existing = {
        institutionalMemory: Array.from({ length: MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT }, (_, i) => ({
          type: "audit",
          summary: `e${i}`,
          sourceRef: `audit:${i}`,
          actorId: "u1",
          at: `2026-06-01T10:00:${String(i).padStart(2, "0")}.000Z`,
        })),
      };
      const next = appendInstitutionalMemoryMetadata(existing, [
        {
          type: "audit",
          summary: "dup",
          sourceRef: "audit:0",
          actorId: "u1",
          at: "2026-06-03T10:00:00.000Z",
        },
        {
          type: "review_decision",
          summary: "new",
          sourceRef: "review:d1:r1",
          actorId: "u2",
          at: "2026-06-03T11:00:00.000Z",
        },
      ]);
      const stored = readInstitutionalMemory(next);
      expect(stored).toHaveLength(MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT);
      expect(stored.some((e) => e.sourceRef === "review:d1:r1")).toBe(false);
    });
  });

  describe("buildReviewDecisionEntries", () => {
    it("maps deal review decisions to memory entries", () => {
      const entries = buildReviewDecisionEntries([
        {
          id: "deal-1",
          title: "Pilot deal",
          metadata: {
            reviewDecisions: [
              {
                id: "rd-1",
                decision: "approved",
                actorId: "op-1",
                reason: "Evidence sufficient",
                createdAt: "2026-06-01T12:00:00.000Z",
                stageSlug: "pilot",
              },
            ],
          },
        },
      ]);
      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe("review_decision");
      expect(entries[0].sourceRef).toBe("review:deal-1:rd-1");
      expect(entries[0].summary).toContain("Pilot deal");
    });
  });

  describe("buildIcpReviewEntry", () => {
    it("returns entry when ICP score is reviewed", () => {
      const entry = buildIcpReviewEntry("acc-1", {
        icpScore: {
          fitScore: 72,
          band: "moderate",
          reviewed: true,
          reviewedAt: "2026-06-01T09:00:00.000Z",
          reviewedById: "admin-1",
        },
      });
      expect(entry?.type).toBe("icp_review");
      expect(entry?.sourceRef).toBe("icp-review:acc-1:2026-06-01T09:00:00.000Z");
    });

    it("returns null when not reviewed", () => {
      expect(
        buildIcpReviewEntry("acc-1", {
          icpScore: { fitScore: 50, band: "moderate", reviewed: false },
        }),
      ).toBeNull();
    });
  });

  describe("buildAuditMemoryEntries", () => {
    it("skips audit rows when review sourceRef already exists", () => {
      const refs = new Set(["review:deal-1:rd-1"]);
      const entries = buildAuditMemoryEntries(
        [
          {
            id: "evt-1",
            action: SalesAuditActions.GOVERNANCE_REVIEW_DECISION,
            actorId: "op-1",
            targetType: "SalesDeal",
            targetId: "deal-1",
            metadata: { reviewDecisionId: "rd-1", decision: "approved", reason: "ok" },
            createdAt: new Date("2026-06-01T12:00:00.000Z"),
          },
        ],
        new Map([["deal-1", "Pilot"]]),
        refs,
      );
      expect(entries).toHaveLength(0);
    });
  });

  describe("syncInstitutionalMemoryForAccount", () => {
    it("appends new entries from deals, icp, and audit", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        id: "acc-1",
        metadata: { institutionalMemory: [] },
      });
      prisma.salesDeal.findMany.mockResolvedValue([
        {
          id: "deal-1",
          title: "Deal A",
          metadata: {
            reviewDecisions: [
              {
                id: "rd-1",
                decision: "approved",
                actorId: "op-1",
                reason: "Ready",
                createdAt: "2026-06-01T12:00:00.000Z",
              },
            ],
          },
        },
      ]);
      prisma.salesAuditEvent.findMany.mockResolvedValue([
        {
          id: "evt-icp",
          action: SalesAuditActions.AGENT_ICP_SCORED,
          actorId: "agent",
          targetType: "SalesAccount",
          targetId: "acc-1",
          metadata: { fitScore: 80, band: "strong" },
          createdAt: new Date("2026-06-01T08:00:00.000Z"),
        },
      ]);
      prisma.salesAccount.update.mockImplementation(async ({ data }) => ({
        id: "acc-1",
        metadata: data.metadata,
      }));

      const result = await syncInstitutionalMemoryForAccount("acc-1", SCOPE);

      expect(prisma.salesAccount.update).toHaveBeenCalled();
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((e) => e.type === "review_decision")).toBe(true);
      expect(result.some((e) => e.type === "audit")).toBe(true);
    });

    it("is no-op when all sourceRefs already stored", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue({
        id: "acc-1",
        metadata: {
          institutionalMemory: [
            {
              type: "review_decision",
              summary: "existing",
              sourceRef: "review:deal-1:rd-1",
              actorId: "op-1",
              at: "2026-06-01T12:00:00.000Z",
            },
          ],
        },
      });
      prisma.salesDeal.findMany.mockResolvedValue([
        {
          id: "deal-1",
          title: "Deal A",
          metadata: {
            reviewDecisions: [
              {
                id: "rd-1",
                decision: "approved",
                actorId: "op-1",
                reason: "Ready",
                createdAt: "2026-06-01T12:00:00.000Z",
              },
            ],
          },
        },
      ]);
      prisma.salesAuditEvent.findMany.mockResolvedValue([]);

      const result = await syncInstitutionalMemoryForAccount("acc-1", SCOPE);

      expect(prisma.salesAccount.update).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
