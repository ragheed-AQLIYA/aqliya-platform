// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAuditEvent: { findMany: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  SALES_AUDIT_TRAIL_DEFAULT_LIMIT,
  SALES_AUDIT_TRAIL_MAX_LIMIT,
  buildSalesAuditTrailWhere,
  listOrgSalesAuditEvents,
  parseSalesAuditTrailFilters,
} from "../audit-trail";

describe("SalesOS org audit trail (PR-12)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.findMany.mockResolvedValue([]);
  });

  describe("parseSalesAuditTrailFilters", () => {
    it("parses targetType and action prefix", () => {
      const filters = parseSalesAuditTrailFilters({
        targetType: " SalesDeal ",
        action: "sales.deal",
      });
      expect(filters.targetType).toBe("SalesDeal");
      expect(filters.actionPrefix).toBe("sales.deal");
    });

    it("accepts actionPrefix alias", () => {
      const filters = parseSalesAuditTrailFilters({
        actionPrefix: "sales.outreach",
      });
      expect(filters.actionPrefix).toBe("sales.outreach");
    });

    it("parses valid date range", () => {
      const filters = parseSalesAuditTrailFilters({
        from: "2026-06-01",
        to: "2026-06-02",
      });
      expect(filters.fromDate).toBeInstanceOf(Date);
      expect(filters.toDate).toBeInstanceOf(Date);
    });

    it("ignores invalid dates", () => {
      const filters = parseSalesAuditTrailFilters({ from: "not-a-date" });
      expect(filters.fromDate).toBeUndefined();
    });

    it("caps limit at max", () => {
      const filters = parseSalesAuditTrailFilters({ limit: "500" });
      expect(filters.limit).toBe(SALES_AUDIT_TRAIL_MAX_LIMIT);
    });
  });

  describe("buildSalesAuditTrailWhere", () => {
    it("scopes by organizationId only by default", () => {
      expect(buildSalesAuditTrailWhere("org-a", {})).toEqual({
        organizationId: "org-a",
      });
    });

    it("adds targetType and action prefix filters", () => {
      expect(
        buildSalesAuditTrailWhere("org-a", {
          targetType: "SalesAccount",
          actionPrefix: "sales.account",
        }),
      ).toEqual({
        organizationId: "org-a",
        targetType: "SalesAccount",
        action: { startsWith: "sales.account" },
      });
    });

    it("adds createdAt range when fromDate/toDate set", () => {
      const fromDate = new Date("2026-06-01");
      const toDate = new Date("2026-06-02");
      expect(
        buildSalesAuditTrailWhere("org-a", { fromDate, toDate }).createdAt,
      ).toEqual({ gte: fromDate, lte: toDate });
    });
  });

  describe("listOrgSalesAuditEvents", () => {
    it("queries org-scoped events with default limit 100", async () => {
      prisma.salesAuditEvent.findMany.mockResolvedValue([
        {
          id: "evt-1",
          action: SalesAuditActions.DEAL_CREATED,
          targetType: "SalesDeal",
          targetId: "deal-1",
          actorId: "user-1",
          actorName: "Test",
          metadata: null,
          createdAt: new Date("2026-06-01"),
        },
      ]);

      const rows = await listOrgSalesAuditEvents("org-a");
      expect(rows).toHaveLength(1);
      expect(prisma.salesAuditEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: "org-a" },
          orderBy: { createdAt: "desc" },
          take: SALES_AUDIT_TRAIL_DEFAULT_LIMIT,
        }),
      );
    });

    it("applies filters and cursor pagination", async () => {
      const fromDate = new Date("2026-06-01");
      await listOrgSalesAuditEvents("org-b", {
        targetType: "SalesDeal",
        actionPrefix: "sales.deal",
        fromDate,
        limit: 25,
        cursor: "evt-cursor",
      });

      expect(prisma.salesAuditEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: "org-b",
            targetType: "SalesDeal",
            action: { startsWith: "sales.deal" },
            createdAt: { gte: fromDate },
          },
          take: 25,
          skip: 1,
          cursor: { id: "evt-cursor" },
        }),
      );
    });

    it("never queries without organizationId in where", async () => {
      await listOrgSalesAuditEvents("org-isolated", {
        actionPrefix: "sales",
      });

      const call = prisma.salesAuditEvent.findMany.mock.calls[0][0];
      expect(call.where.organizationId).toBe("org-isolated");
    });
  });
});
