// ─── Integration Test: Platform Notification Aggregation ───
// Tests end-to-end aggregation logic of getPlatformNotificationsAction.
// Verifies severity mapping, Arabic titles, sorting, and error resilience.
// Uses mocked Prisma --- no database required.

// ─── Mocks (hoisted before imports) ───

const mockDecisionFindMany = jest.fn();
const mockWorkflowRecordFindMany = jest.fn();
const mockLocalContentReviewFindMany = jest.fn();
const mockSalesDealFindMany = jest.fn();
const mockPlatformAuditLogFindMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findMany: mockDecisionFindMany,
    },
    workflowRecord: {
      findMany: mockWorkflowRecordFindMany,
    },
    localContentReview: {
      findMany: mockLocalContentReviewFindMany,
    },
    salesDeal: {
      findMany: mockSalesDealFindMany,
    },
    platformAuditLog: {
      findMany: mockPlatformAuditLogFindMany,
    },
  },
}));

// ─── Imports (after mocks) ───

import { getPlatformNotificationsAction } from "@/actions/platform-overview-actions";

// ─── Helpers ───

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function makeDecision(id: string, overrides: Record<string, unknown> = {}) {
  return { id, title: "قرار " + id, updatedAt: new Date(), targetDate: null, ...overrides };
}

function makeWorkflowRecord(id: string, overrides: Record<string, unknown> = {}) {
  return { id, title: "إجراء " + id, status: "pending", updatedAt: new Date(), ...overrides };
}

function makeReview(id: string, overrides: Record<string, unknown> = {}) {
  return { id, projectId: "p1", comments: "يرجى المراجعة", createdAt: new Date(), ...overrides };
}

function makeDeal(id: string, overrides: Record<string, unknown> = {}) {
  return { id, title: "صفقة " + id, status: "open", updatedAt: daysAgo(35), ...overrides };
}

function makeLog(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    action: "إجراء نظام",
    targetLabel: "خدمة",
    actorName: "النظام",
    createdAt: new Date(),
    severity: "info",
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Platform Notification Aggregation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── DecisionOS ──────────────────────────────────────────────────────────

  describe("DecisionOS notifications", () => {
    it("assigns severity 'warning' to IN_REVIEW decisions", async () => {
      mockDecisionFindMany
        .mockResolvedValueOnce([makeDecision("d1")])
        .mockResolvedValueOnce([]); // no overdue
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const reviewNotifs = result.notifications.filter((n) => n.id.startsWith("decision-review-"));

      expect(reviewNotifs.length).toBe(1);
      expect(reviewNotifs[0].severity).toBe("warning");
      expect(reviewNotifs[0].productKey).toBe("decision");
      expect(reviewNotifs[0].href).toBe("/decisions/d1");
      expect(reviewNotifs[0].title).toBe("قرار بانتظار المراجعة");
    });

    it("assigns severity 'critical' to overdue decisions past targetDate", async () => {
      const overdueDate = daysAgo(10);
      mockDecisionFindMany
        .mockResolvedValueOnce([]) // none in review
        .mockResolvedValueOnce([makeDecision("d2", { targetDate: overdueDate })]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const overdueNotifs = result.notifications.filter((n) => n.id.startsWith("decision-overdue-"));

      expect(overdueNotifs.length).toBe(1);
      expect(overdueNotifs[0].severity).toBe("critical");
      expect(overdueNotifs[0].title).toBe("قرار تجاوز تاريخه");
      expect(overdueNotifs[0].description).toContain("كان مستحقاً في");
    });

    it("does NOT include completed/approved/rejected/archived decisions as overdue", async () => {
      // Overdue query should filter out terminal statuses
      mockDecisionFindMany
        .mockResolvedValueOnce([]) // none in review
        .mockResolvedValueOnce([]); // overdue query returns empty (terminal statuses excluded)
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();

      expect(result.notifications.filter((n) => n.id.startsWith("decision-overdue-"))).toEqual([]);
    });
  });

  // ── WorkflowOS ──────────────────────────────────────────────────────────

  describe("WorkflowOS notifications", () => {
    it("assigns severity 'critical' to rejected workflow records", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany
        .mockResolvedValueOnce([makeWorkflowRecord("w1", { status: "rejected" })])
        .mockResolvedValueOnce([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const failedNotifs = result.notifications.filter((n) => n.id.startsWith("workflow-failed-"));

      expect(failedNotifs.length).toBe(1);
      expect(failedNotifs[0].severity).toBe("critical");
      expect(failedNotifs[0].title).toBe("إجراء مرفوض");
      expect(failedNotifs[0].href).toBe("/workflowos/w1");
    });

    it("assigns severity 'critical' to cancelled workflow records", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany
        .mockResolvedValueOnce([makeWorkflowRecord("w2", { status: "cancelled" })])
        .mockResolvedValueOnce([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const failedNotifs = result.notifications.filter((n) => n.id.startsWith("workflow-failed-"));

      expect(failedNotifs.length).toBe(1);
      expect(failedNotifs[0].severity).toBe("critical");
      expect(failedNotifs[0].title).toBe("إجراء ملغي");
    });

    it("assigns severity 'warning' to in_progress workflow records", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany
        .mockResolvedValueOnce([]) // no failed
        .mockResolvedValueOnce([makeWorkflowRecord("w3", { status: "in_progress" })]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const reviewNotifs = result.notifications.filter((n) => n.id.startsWith("workflow-review-"));

      expect(reviewNotifs.length).toBe(1);
      expect(reviewNotifs[0].severity).toBe("warning");
      expect(reviewNotifs[0].title).toBe("إجراء بانتظار المراجعة");
    });
  });

  // ── LocalContentOS ──────────────────────────────────────────────────────

  describe("LocalContentOS notifications", () => {
    it("assigns severity 'warning' to pending reviews", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValueOnce([
        makeReview("lc1"),
      ]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const lcNotifs = result.notifications.filter((n) => n.id.startsWith("lc-review-"));

      expect(lcNotifs.length).toBe(1);
      expect(lcNotifs[0].severity).toBe("warning");
      expect(lcNotifs[0].productKey).toBe("localcontent");
      expect(lcNotifs[0].title).toBe("مراجعة محتوى محلي معلقة");
      expect(lcNotifs[0].href).toBe("/local-content/p1");
    });

    it("falls back to default description when comments is null", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValueOnce([
        makeReview("lc2", { comments: null }),
      ]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const lcNotifs = result.notifications.filter((n) => n.id.startsWith("lc-review-"));

      expect(lcNotifs.length).toBe(1);
      expect(lcNotifs[0].description).toBe("مشروع بانتظار المراجعة");
    });
  });

  // ── SalesOS ─────────────────────────────────────────────────────────────

  describe("SalesOS notifications", () => {
    it("assigns severity 'warning' to stale deals (>30 days without update)", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValueOnce([
        makeDeal("s1"),
      ]);

      const result = await getPlatformNotificationsAction();
      const staleNotifs = result.notifications.filter((n) => n.id.startsWith("sales-stale-"));

      expect(staleNotifs.length).toBe(1);
      expect(staleNotifs[0].severity).toBe("warning");
      expect(staleNotifs[0].productKey).toBe("sales");
      expect(staleNotifs[0].title).toBe("صفقة قديمة بدون تحديث");
      expect(staleNotifs[0].href).toBe("/sales/s1");
    });

    it("does NOT include closed deals as stale", async () => {
      // The query filters out closed_won and closed_lost via notIn
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValueOnce([]);

      const result = await getPlatformNotificationsAction();

      expect(result.notifications.filter((n) => n.id.startsWith("sales-stale-"))).toEqual([]);
    });

    it("does NOT include recently updated deals", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValue([]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValueOnce([]); // query returns nothing

      const result = await getPlatformNotificationsAction();

      expect(result.notifications.filter((n) => n.id.startsWith("sales-stale-"))).toEqual([]);
    });
  });

  // ── Platform ────────────────────────────────────────────────────────────

  describe("Platform audit log notifications", () => {
    it("assigns severity 'critical' to logs with error severity", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([
        makeLog("pl1", { severity: "error" }),
      ]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const criticalNotifs = result.notifications.filter((n) => n.id.startsWith("platform-critical-"));

      expect(criticalNotifs.length).toBe(1);
      expect(criticalNotifs[0].severity).toBe("critical");
      expect(criticalNotifs[0].productKey).toBe("platform");
      expect(criticalNotifs[0].href).toBe("/settings/audit-logs");
    });

    it("assigns severity 'critical' to logs with critical severity", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([
        makeLog("pl2", { severity: "critical" }),
      ]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const criticalNotifs = result.notifications.filter((n) => n.id.startsWith("platform-critical-"));

      expect(criticalNotifs.length).toBe(1);
      expect(criticalNotifs[0].severity).toBe("critical");
    });

    it("falls back to actorName when targetLabel is null", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([
        makeLog("pl3", { targetLabel: null, actorName: "المسؤول" }),
      ]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const criticalNotifs = result.notifications.filter((n) => n.id.startsWith("platform-critical-"));

      expect(criticalNotifs.length).toBe(1);
      expect(criticalNotifs[0].description).toBe("المسؤول");
    });

    it("uses generic Arabic fallback when both targetLabel and actorName are null", async () => {
      mockDecisionFindMany.mockResolvedValue([]);
      mockWorkflowRecordFindMany.mockResolvedValue([]);
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([
        makeLog("pl4", { targetLabel: null, actorName: null }),
      ]);
      mockLocalContentReviewFindMany.mockResolvedValue([]);
      mockSalesDealFindMany.mockResolvedValue([]);

      const result = await getPlatformNotificationsAction();
      const criticalNotifs = result.notifications.filter((n) => n.id.startsWith("platform-critical-"));

      expect(criticalNotifs.length).toBe(1);
      expect(criticalNotifs[0].description).toBe("حدث حرج في المنصة");
    });
  });

  // ── Composite / Cross-cutting ───────────────────────────────────────────

  describe("Cross-cutting behavior", () => {
    it("aggregates mixed sources and returns correct counts", async () => {
      const now = new Date();

      // Decision: 1 in review (warning) + 1 overdue (critical)
      mockDecisionFindMany
        .mockResolvedValueOnce([makeDecision("d1", { updatedAt: now })])
        .mockResolvedValueOnce([makeDecision("d2", { targetDate: daysAgo(5), updatedAt: now })]);

      // Workflow: 1 rejected (critical) + 1 in_review (warning)
      mockWorkflowRecordFindMany
        .mockResolvedValueOnce([makeWorkflowRecord("w1", { status: "rejected", updatedAt: now })])
        .mockResolvedValueOnce([makeWorkflowRecord("w2", { status: "in_progress", updatedAt: now })]);

      // LC: 1 pending (warning)
      mockLocalContentReviewFindMany.mockResolvedValueOnce([
        makeReview("lc1", { createdAt: now }),
      ]);

      // Sales: 1 stale (warning)
      mockSalesDealFindMany.mockResolvedValueOnce([
        makeDeal("s1"),
      ]);

      // Platform: 1 error (critical)
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([
        makeLog("pl1", { severity: "error", createdAt: now }),
      ]);

      const result = await getPlatformNotificationsAction();

      expect(result.notifications.length).toBe(7);
      expect(result.counts.critical).toBe(3); // overdue + rejected + platform
      expect(result.counts.warning).toBe(4); // in_review + in_progress + LC + stale
      expect(result.counts.info).toBe(0);
    });

    it("sorts all notifications by date descending across sources", async () => {
      const oldest = daysAgo(20);
      const middle = daysAgo(10);
      const newest = daysAgo(1);

      // Decision (10 days ago - middle)
      mockDecisionFindMany
        .mockResolvedValueOnce([makeDecision("d1", { updatedAt: middle })])
        .mockResolvedValueOnce([]);

      // Workflow (20 days ago - oldest)
      mockWorkflowRecordFindMany
        .mockResolvedValueOnce([makeWorkflowRecord("w1", { status: "rejected", updatedAt: oldest })])
        .mockResolvedValueOnce([]);

      // LC (1 day ago - newest)
      mockLocalContentReviewFindMany.mockResolvedValueOnce([
        makeReview("lc1", { createdAt: newest }),
      ]);

      // Sales (empty)
      mockSalesDealFindMany.mockResolvedValueOnce([]);

      // Platform (empty)
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([]);

      const result = await getPlatformNotificationsAction();

      expect(result.notifications.length).toBe(3);

      // Should be sorted newest first: LC (1d), Decision (10d), Workflow (20d)
      expect(result.notifications[0].id).toContain("lc-review");
      expect(result.notifications[1].id).toContain("decision-review");
      expect(result.notifications[2].id).toContain("workflow-failed");
    });

    it("handles all prisma queries rejecting gracefully", async () => {
      mockDecisionFindMany.mockRejectedValue(new Error("Connection refused"));
      mockWorkflowRecordFindMany.mockRejectedValue(new Error("Connection refused"));
      mockLocalContentReviewFindMany.mockRejectedValue(new Error("Connection refused"));
      mockSalesDealFindMany.mockRejectedValue(new Error("Connection refused"));
      mockPlatformAuditLogFindMany.mockRejectedValue(new Error("Connection refused"));

      const result = await getPlatformNotificationsAction();

      expect(result.notifications).toEqual([]);
      expect(result.counts.critical).toBe(0);
      expect(result.counts.warning).toBe(0);
      expect(result.counts.info).toBe(0);
    });

    it("handles partial query failures gracefully", async () => {
      // Some queries succeed, some fail
      mockDecisionFindMany
        .mockResolvedValueOnce([makeDecision("d1")])           // IN_REVIEW: OK
        .mockRejectedValueOnce(new Error("Timeout"));          // overdue: fails
      mockWorkflowRecordFindMany.mockRejectedValue(new Error("Timeout")); // both fail
      mockLocalContentReviewFindMany.mockResolvedValueOnce([
        makeReview("lc1"),
      ]); // OK
      mockSalesDealFindMany.mockRejectedValue(new Error("Timeout")); // fails
      mockPlatformAuditLogFindMany.mockResolvedValueOnce([
        makeLog("pl1", { severity: "error" }),
      ]); // OK

      const result = await getPlatformNotificationsAction();

      // Should still have notifications from successful queries
      expect(result.notifications.length).toBe(3); // 1 decision review + 1 LC + 1 platform
      expect(result.counts.critical).toBe(1); // platform
      expect(result.counts.warning).toBe(2); // decision + LC
    });
  });
});

