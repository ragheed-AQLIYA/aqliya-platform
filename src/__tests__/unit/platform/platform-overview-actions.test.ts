// ─── Unit Test: Platform Overview Actions ───
// Tests getPlatformHealthAction and getPlatformNotificationsAction
// Uses mocked Prisma --- no database required.

// ─── Mocks (hoisted before imports) ───

const mockDecisionCount = jest.fn();
const mockWorkflowRecordCount = jest.fn();
const mockAuditAiOutputCount = jest.fn();
const mockAuditEventCount = jest.fn();
const mockPlatformAuditLogCount = jest.fn();
const mockPlatformAuditLogFindMany = jest.fn();
const mockDecisionFindMany = jest.fn();
const mockWorkflowRecordFindMany = jest.fn();
const mockLocalContentReviewFindMany = jest.fn();
const mockSalesDealFindMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      count: mockDecisionCount,
      findMany: mockDecisionFindMany,
    },
    workflowRecord: {
      count: mockWorkflowRecordCount,
      findMany: mockWorkflowRecordFindMany,
    },
    auditAiOutput: {
      count: mockAuditAiOutputCount,
    },
    auditEvent: {
      count: mockAuditEventCount,
    },
    platformAuditLog: {
      count: mockPlatformAuditLogCount,
      findMany: mockPlatformAuditLogFindMany,
    },
    localContentReview: {
      findMany: mockLocalContentReviewFindMany,
    },
    salesDeal: {
      findMany: mockSalesDealFindMany,
    },
  },
}));

// ─── Imports (after mocks) ───

import {
  getPlatformHealthAction,
  getPlatformNotificationsAction,
} from "@/actions/platform-overview-actions";

// ─── Helpers ───

function makeDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

// ─── Tests: getPlatformHealthAction ──────────────────────────────────────────

describe("getPlatformHealthAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns healthy status when all metrics are good", async () => {
    // No pending reviews
    mockDecisionCount.mockResolvedValue(0);
    // Zero failed, many completed
    mockWorkflowRecordCount
      .mockResolvedValueOnce(0)   // failed (rejected/cancelled)
      .mockResolvedValueOnce(100); // completed
    // High AI acceptance
    mockAuditAiOutputCount
      .mockResolvedValueOnce(100) // total outputs
      .mockResolvedValueOnce(100); // accepted
    // Active users: 10 distinct actors today
    mockPlatformAuditLogFindMany.mockResolvedValue(
      Array.from({ length: 10 }, function (_, i) {
        return { actorId: "user-" + i };
      })
    );
    // Audit events: good coverage today vs last 7 days
    mockAuditEventCount
      .mockResolvedValueOnce(100)  // today
      .mockResolvedValueOnce(700); // last 7 days
    // Platform audit logs today
    mockPlatformAuditLogCount.mockResolvedValue(0);

    const result = await getPlatformHealthAction();

    expect(result.status).toBe("healthy");
    expect(result.healthScore).toBeGreaterThanOrEqual(90);
    expect(result.healthScore).toBeLessThanOrEqual(100);
    expect(result.pendingReviews).toBe(0);
    expect(result.failedWorkflows).toBe(0);
    expect(result.activeUsersToday).toBe(10);
    expect(result.aiRunsToday).toBe(100);
  });

  it("returns warning status with some pending reviews", async () => {
    // Moderate pending reviews
    mockDecisionCount.mockResolvedValue(5);
    // Some failures
    mockWorkflowRecordCount
      .mockResolvedValueOnce(5)    // failed
      .mockResolvedValueOnce(45);  // completed
    // Moderate AI acceptance
    mockAuditAiOutputCount
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(70);  // accepted
    // Some active users
    mockPlatformAuditLogFindMany.mockResolvedValue(
      Array.from({ length: 3 }, function (_, i) {
        return { actorId: "user-" + i };
      })
    );
    // Moderate audit activity
    mockAuditEventCount
      .mockResolvedValueOnce(30)   // today
      .mockResolvedValueOnce(210); // last 7 days
    mockPlatformAuditLogCount.mockResolvedValue(0);

    const result = await getPlatformHealthAction();

    expect(result.status).toBe("warning");
    expect(result.healthScore).toBeGreaterThanOrEqual(70);
    expect(result.healthScore).toBeLessThan(90);
  });

  it("returns critical status when many things are wrong", async () => {
    // High pending reviews
    mockDecisionCount.mockResolvedValue(50);
    // Many failures, few completed
    mockWorkflowRecordCount
      .mockResolvedValueOnce(30)   // failed
      .mockResolvedValueOnce(20);  // completed
    // Low AI acceptance
    mockAuditAiOutputCount
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(10);  // accepted
    // No active users
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    // Low audit activity
    mockAuditEventCount
      .mockResolvedValueOnce(5)    // today
      .mockResolvedValueOnce(350); // last 7 days
    mockPlatformAuditLogCount.mockResolvedValue(0);

    const result = await getPlatformHealthAction();

    expect(result.status).toBe("critical");
    expect(result.healthScore).toBeLessThan(70);
  });

  it("handles prisma errors gracefully via .catch(() => 0)", async () => {
    // All queries reject
    mockDecisionCount.mockRejectedValue(new Error("DB down"));
    mockWorkflowRecordCount
      .mockRejectedValueOnce(new Error("DB down"))
      .mockRejectedValueOnce(new Error("DB down"));
    mockAuditAiOutputCount
      .mockRejectedValueOnce(new Error("DB down"))
      .mockRejectedValueOnce(new Error("DB down"));
    mockPlatformAuditLogFindMany.mockRejectedValue(new Error("DB down"));
    mockAuditEventCount
      .mockRejectedValueOnce(new Error("DB down"))
      .mockRejectedValueOnce(new Error("DB down"));
    mockPlatformAuditLogCount.mockRejectedValue(new Error("DB down"));

    const result = await getPlatformHealthAction();

    // All counts should default to 0 via .catch(() => 0)
    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.pendingReviews).toBe(0);
    expect(result.failedWorkflows).toBe(0);
    expect(result.aiRunsToday).toBe(0);
    expect(result.activeUsersToday).toBe(0);
    expect(result.auditEventsToday).toBe(0);
    // With all zeros, health score = ~75 -> warning
    expect(result.status).toBe("warning");
  });

  it("verifies health score formula boundaries (0-100)", async () => {
    // Worst case: everything broken
    mockDecisionCount.mockResolvedValue(999);
    mockWorkflowRecordCount
      .mockResolvedValueOnce(999)  // failed
      .mockResolvedValueOnce(0);   // completed
    mockAuditAiOutputCount
      .mockResolvedValueOnce(0)    // total
      .mockResolvedValueOnce(0);   // accepted
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    mockAuditEventCount
      .mockResolvedValueOnce(0)    // today
      .mockResolvedValueOnce(0);   // last 7 days
    mockPlatformAuditLogCount.mockResolvedValue(0);

    const worst = await getPlatformHealthAction();
    expect(worst.healthScore).toBeGreaterThanOrEqual(0);
    expect(worst.status).toBe("critical");

    jest.clearAllMocks();

    // Best case: everything perfect
    mockDecisionCount.mockResolvedValue(0);
    mockWorkflowRecordCount
      .mockResolvedValueOnce(0)     // failed
      .mockResolvedValueOnce(999);  // completed
    mockAuditAiOutputCount
      .mockResolvedValueOnce(999)  // total
      .mockResolvedValueOnce(999); // accepted
    mockPlatformAuditLogFindMany.mockResolvedValue(
      Array.from({ length: 50 }, function (_, i) {
        return { actorId: "user-" + i };
      })
    );
    mockAuditEventCount
      .mockResolvedValueOnce(999)    // today
      .mockResolvedValueOnce(6993);  // last 7 days (999 * 7)
    mockPlatformAuditLogCount.mockResolvedValue(0);

    const best = await getPlatformHealthAction();
    expect(best.healthScore).toBeLessThanOrEqual(100);
    expect(best.status).toBe("healthy");
  });
});

// ─── Tests: getPlatformNotificationsAction ───────────────────────────────────

describe("getPlatformNotificationsAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty notifications when no data exists", async () => {
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesDealFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);

    const result = await getPlatformNotificationsAction();

    expect(result.notifications).toEqual([]);
    expect(result.counts).toEqual({ critical: 0, warning: 0, info: 0 });
  });

  it("aggregates notifications from all product sources", async () => {
    const now = new Date();

    // DecisionOS: 1 in review
    mockDecisionFindMany
      .mockResolvedValueOnce([{ id: "d1", title: "قرار اختبار", updatedAt: now }]) // IN_REVIEW
      .mockResolvedValueOnce([]); // overdue - none

    // WorkflowOS: 1 failed + 1 in review
    mockWorkflowRecordFindMany
      .mockResolvedValueOnce([{ id: "w1", title: "إجراء فاشل", status: "rejected", updatedAt: now }]) // failed
      .mockResolvedValueOnce([{ id: "w2", title: "إجراء قيد المراجعة", updatedAt: now }]); // in review

    // LocalContentOS: 1 pending review
    mockLocalContentReviewFindMany.mockResolvedValueOnce([
      { id: "lc1", projectId: "p1", comments: "يرجى المراجعة", createdAt: now },
    ]);

    // SalesOS: 1 stale deal
    mockSalesDealFindMany.mockResolvedValueOnce([
      { id: "s1", title: "صفقة قديمة", updatedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) },
    ]);

    // Platform: 1 critical log
    mockPlatformAuditLogFindMany.mockResolvedValueOnce([
      { id: "pl1", action: "فشل النظام", targetLabel: "خدمة التكامل", actorName: "النظام", createdAt: now, severity: "error" },
    ]);

    const result = await getPlatformNotificationsAction();

    // Should have 5 notifications
    expect(result.counts.critical).toBe(2);  // 1 workflow failed + 1 platform critical
    expect(result.counts.warning).toBe(4);   // 1 decision + 1 workflow in_review + 1 LC + 1 sales
    expect(result.notifications.length).toBe(6);
    expect(result.counts.critical).toBe(2);
    expect(result.counts.warning).toBe(4);
    expect(result.counts.info).toBe(0);

    // Verify each notification has required fields
    for (const n of result.notifications) {
      expect(n.id).toBeTruthy();
      expect(n.productKey).toBeTruthy();
      expect(["critical", "warning", "info"]).toContain(n.severity);
      expect(n.title).toBeTruthy();
      expect(n.description).toBeTruthy();
      expect(n.href).toBeTruthy();
      expect(n.createdAt).toBeInstanceOf(Date);
    }
  });

  it("assigns correct severity for each source type", async () => {
    const now = new Date();

    // DecisionOS: 1 in_review (warning) + 1 overdue (critical)
    mockDecisionFindMany
      .mockResolvedValueOnce([{ id: "d1", title: "مراجعة", updatedAt: now }])
      .mockResolvedValueOnce([
        { id: "d2", title: "متأخر", targetDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), updatedAt: now },
      ]);

    // WorkflowOS: 1 rejected (critical) + cancelled (critical)
    mockWorkflowRecordFindMany
      .mockResolvedValueOnce([
        { id: "w1", title: "مرفوض", status: "rejected", updatedAt: now },
        { id: "w2", title: "ملغي", status: "cancelled", updatedAt: now },
      ])
      .mockResolvedValueOnce([{ id: "w3", title: "قيد المراجعة", updatedAt: now }]);

    // LocalContentOS: pending (warning)
    mockLocalContentReviewFindMany.mockResolvedValueOnce([
      { id: "lc1", projectId: "p1", comments: "تعليق", createdAt: now },
    ]);

    // SalesOS: stale (warning)
    mockSalesDealFindMany.mockResolvedValueOnce([
      { id: "s1", title: "قديم", updatedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) },
    ]);

    // Platform: critical (critical)
    mockPlatformAuditLogFindMany.mockResolvedValueOnce([
      { id: "pl1", action: "خطأ", targetLabel: "نظام", actorName: "مسؤول", createdAt: now, severity: "error" },
    ]);

    const result = await getPlatformNotificationsAction();

    // Check specific notification severities
    const findNotif = (idPrefix: string) =>
      result.notifications.find((n) => n.id.startsWith(idPrefix));

    expect(findNotif("decision-review-")?.severity).toBe("warning");
    expect(findNotif("decision-overdue-")?.severity).toBe("critical");
    expect(findNotif("workflow-failed-")?.severity).toBe("critical");
    expect(findNotif("workflow-review-")?.severity).toBe("warning");
    expect(findNotif("lc-review-")?.severity).toBe("warning");
    expect(findNotif("sales-stale-")?.severity).toBe("warning");
    expect(findNotif("platform-critical-")?.severity).toBe("critical");
  });

  it("sorts notifications by createdAt descending", async () => {
    const oldDate = makeDate(10);
    const midDate = makeDate(5);
    const newDate = makeDate(1);

    mockDecisionFindMany
      .mockResolvedValueOnce([{ id: "d1", title: "قديم", updatedAt: oldDate }])   // 10 days ago
      .mockResolvedValueOnce([]); // no overdue
    mockWorkflowRecordFindMany
      .mockResolvedValueOnce([{ id: "w1", title: "جديد", status: "rejected", updatedAt: newDate }]) // 1 day ago
      .mockResolvedValueOnce([{ id: "w2", title: "وسط", updatedAt: midDate }]); // 5 days ago
    mockLocalContentReviewFindMany.mockResolvedValueOnce([]);
    mockSalesDealFindMany.mockResolvedValueOnce([]);
    mockPlatformAuditLogFindMany.mockResolvedValueOnce([]);

    const result = await getPlatformNotificationsAction();

    expect(result.notifications.length).toBe(3);

    // Should be sorted newest first
    const dates = result.notifications.map((n) => n.createdAt.getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });

  it("handles prisma errors via .catch() returning empty arrays", async () => {
    // All findMany reject
    mockDecisionFindMany.mockRejectedValue(new Error("DB timeout"));
    mockWorkflowRecordFindMany.mockRejectedValue(new Error("DB timeout"));
    mockLocalContentReviewFindMany.mockRejectedValue(new Error("DB timeout"));
    mockSalesDealFindMany.mockRejectedValue(new Error("DB timeout"));
    mockPlatformAuditLogFindMany.mockRejectedValue(new Error("DB timeout"));

    const result = await getPlatformNotificationsAction();

    expect(result.notifications).toEqual([]);
    expect(result.counts).toEqual({ critical: 0, warning: 0, info: 0 });
  });

  it("uses Arabic titles for each notification type", async () => {
    const now = new Date();

    mockDecisionFindMany
      .mockResolvedValueOnce([{ id: "d1", title: "قرار", updatedAt: now }])
      .mockResolvedValueOnce([
        { id: "d2", title: "متأخر", targetDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), updatedAt: now },
      ]);
    mockWorkflowRecordFindMany
      .mockResolvedValueOnce([
        { id: "w1", title: "مرفوض", status: "rejected", updatedAt: now },
        { id: "w2", title: "ملغي", status: "cancelled", updatedAt: now },
      ])
      .mockResolvedValueOnce([{ id: "w3", title: "قيد المراجعة", updatedAt: now }]);
    mockLocalContentReviewFindMany.mockResolvedValueOnce([
      { id: "lc1", projectId: "p1", comments: "يرجى المراجعة", createdAt: now },
    ]);
    mockSalesDealFindMany.mockResolvedValueOnce([
      { id: "s1", title: "قديم", updatedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) },
    ]);
    mockPlatformAuditLogFindMany.mockResolvedValueOnce([
      { id: "pl1", action: "فشل النظام", targetLabel: "خدمة", actorName: "النظام", createdAt: now, severity: "error" },
    ]);

    const result = await getPlatformNotificationsAction();

    const find = (prefix: string) => result.notifications.find((n) => n.id.startsWith(prefix));

    // Decision in review
    expect(find("decision-review-")?.title).toBe("قرار بانتظار المراجعة");
    // Decision overdue
    expect(find("decision-overdue-")?.title).toBe("قرار تجاوز تاريخه");
    // Workflow rejected
    expect(find("workflow-failed-w1")?.title).toBe("إجراء مرفوض");
    // Workflow cancelled
    expect(find("workflow-failed-w2")?.title).toBe("إجراء ملغي");
    // Workflow in review
    expect(find("workflow-review-")?.title).toBe("إجراء بانتظار المراجعة");
    // Local content pending
    expect(find("lc-review-")?.title).toBe("مراجعة محتوى محلي معلقة");
    // Sales stale
    expect(find("sales-stale-")?.title).toBe("صفقة قديمة بدون تحديث");
    // Platform critical (uses action as title)
    expect(find("platform-critical-")?.title).toBe("فشل النظام");
  });
});


