// ─── Unit Test: Platform Overview Actions ───
// Tests getPlatformHealthAction and getPlatformNotificationsAction
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

const mockGetCachedOrFetch = jest.fn((_key, fn) => fn());
jest.mock("@/lib/platform/cache-strategy", () => ({
  getCachedOrFetch: (...args) => mockGetCachedOrFetch(...args),
  invalidateDashboardCaches: jest.fn(),
  DASHBOARD_CACHE_TTL_MS: 300000,
}));

const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
}));

// ─── Prisma mocks ───

const mockDecisionCount = jest.fn();
const mockDecisionFindMany = jest.fn();
const mockWorkflowRecordCount = jest.fn();
const mockWorkflowRecordFindMany = jest.fn();
const mockAuditAiOutputCount = jest.fn();
const mockAuditEventCount = jest.fn();
const mockPlatformAuditLogCount = jest.fn();
const mockPlatformAuditLogFindMany = jest.fn();
const mockLocalContentReviewFindMany = jest.fn();
const mockSalesDealFindMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findMany: mockDecisionFindMany,
      count: mockDecisionCount,
    },
    workflowRecord: {
      findMany: mockWorkflowRecordFindMany,
      count: mockWorkflowRecordCount,
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
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

// ─── Imports (after mocks) ───

import { getPlatformHealthAction } from "@/actions/platform-overview-actions/health";
import { getPlatformNotificationsAction } from "@/actions/platform-overview-actions/notifications";

// ─── Mock Data ───

const MOCK_USER = {
  id: "user-1",
  name: "مستخدم اختبار",
  email: "test@aqliya.com",
  organizationId: "org-1",
  role: "ADMIN",
};

function mockAllHealthCounts(values: {
  decisionsInReview?: number;
  workflowFailed?: number;
  workflowCompleted?: number;
  aiOutputCount?: number;
  aiAcceptedCount?: number;
  auditLogsToday?: number;
  auditLogsLast7Days?: number;
  platformAuditLogsToday?: number;
  usersLoggedInToday?: number;
}) {
  mockDecisionCount.mockResolvedValue(values.decisionsInReview ?? 0);
  mockWorkflowRecordCount
    .mockResolvedValueOnce(values.workflowFailed ?? 0)     // first call: failed
    .mockResolvedValueOnce(values.workflowCompleted ?? 0);  // second call: completed
  mockAuditAiOutputCount
    .mockResolvedValueOnce(values.aiOutputCount ?? 0)       // total
    .mockResolvedValueOnce(values.aiAcceptedCount ?? 0);    // accepted
  mockAuditEventCount
    .mockResolvedValueOnce(values.auditLogsToday ?? 0)      // today
    .mockResolvedValueOnce(values.auditLogsLast7Days ?? 0); // last 7 days
  mockPlatformAuditLogCount
    .mockResolvedValueOnce(values.auditLogsToday ?? 0)
    .mockResolvedValueOnce(values.auditLogsLast7Days ?? 0)
    .mockResolvedValueOnce(values.platformAuditLogsToday ?? 0);
  // platformAuditLog.findMany for distinct actorIds
  // If usersLoggedInToday > 0, we return mock rows
  if ((values.usersLoggedInToday ?? 0) > 0) {
    const rows = Array.from({ length: values.usersLoggedInToday! }, (_, i) => ({ actorId: `user-${i}` }));
    mockPlatformAuditLogFindMany.mockResolvedValue(rows);
  } else {
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
  }
}

// ─── Tests: getPlatformHealthAction ───

describe("getPlatformHealthAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(MOCK_USER);
  });

  it("returns healthy status when all metrics are optimal", async () => {
    mockAllHealthCounts({
      decisionsInReview: 3,
      workflowFailed: 0,
      workflowCompleted: 50,
      aiOutputCount: 100,
      aiAcceptedCount: 95,
      auditLogsToday: 200,
      auditLogsLast7Days: 1400,
      platformAuditLogsToday: 30,
      usersLoggedInToday: 10,
    });

    const result = await getPlatformHealthAction();
    expect(result.healthScore).toBeGreaterThanOrEqual(90);
    expect(result.status).toBe("healthy");
    expect(result.aiRunsToday).toBe(100);
    expect(result.pendingReviews).toBe(3);
    expect(result.activeUsersToday).toBe(10);
    expect(result.auditEventsToday).toBe(30);
  });

  it("returns warning status with moderate metrics", async () => {
    mockAllHealthCounts({
      decisionsInReview: 8,
      workflowFailed: 3,
      workflowCompleted: 47,
      aiOutputCount: 20,
      aiAcceptedCount: 14,
      auditLogsToday: 50,
      auditLogsLast7Days: 350,
      platformAuditLogsToday: 5,
      usersLoggedInToday: 3,
    });

    const result = await getPlatformHealthAction();
    expect(result.healthScore).toBeGreaterThanOrEqual(70);
    expect(result.healthScore).toBeLessThan(90);
    expect(result.status).toBe("warning");
  });

  it("returns critical status with poor metrics", async () => {
    mockAllHealthCounts({
      decisionsInReview: 50,
      workflowFailed: 20,
      workflowCompleted: 5,
      aiOutputCount: 100,
      aiAcceptedCount: 10,
      auditLogsToday: 1,
      auditLogsLast7Days: 7,
      platformAuditLogsToday: 0,
      usersLoggedInToday: 0,
    });

    const result = await getPlatformHealthAction();
    expect(result.healthScore).toBeLessThan(70);
    expect(result.status).toBe("critical");
  });

  it("handles zero counts gracefully (no data yet)", async () => {
    mockAllHealthCounts({
      decisionsInReview: 0,
      workflowFailed: 0,
      workflowCompleted: 0,
      aiOutputCount: 0,
      aiAcceptedCount: 0,
      auditLogsToday: 0,
      auditLogsLast7Days: 0,
      platformAuditLogsToday: 0,
      usersLoggedInToday: 0,
    });

    const result = await getPlatformHealthAction();
    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.healthScore).toBeLessThanOrEqual(100);
    // With zero data: pendingScore=25, failedScore=25, aiScore=25, activityScore=0, auditScore=0 => 75 = "warning"
    expect(result.status).toBe("warning");
  });

  it("caps health score at 100", async () => {
    mockAllHealthCounts({
      decisionsInReview: 0,
      workflowFailed: 0,
      workflowCompleted: 100,
      aiOutputCount: 10,
      aiAcceptedCount: 10,
      auditLogsToday: 1000,
      auditLogsLast7Days: 1000,
      platformAuditLogsToday: 500,
      usersLoggedInToday: 100,
    });

    const result = await getPlatformHealthAction();
    expect(result.healthScore).toBeLessThanOrEqual(100);
  });

  it("clamps health score at 0 minimum", async () => {
    mockAllHealthCounts({
      decisionsInReview: 999,
      workflowFailed: 999,
      workflowCompleted: 0,
      aiOutputCount: 100,
      aiAcceptedCount: 0,
      auditLogsToday: 0,
      auditLogsLast7Days: 100,
      platformAuditLogsToday: 0,
      usersLoggedInToday: 0,
    });

    const result = await getPlatformHealthAction();
    expect(result.healthScore).toBe(0);
  });
});

// ─── Tests: getPlatformNotificationsAction ───

describe("getPlatformNotificationsAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(MOCK_USER);
  });

  it("returns empty notifications when no items are pending", async () => {
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesDealFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);

    const result = await getPlatformNotificationsAction();
    expect(result.notifications).toHaveLength(0);
    expect(result.counts.critical).toBe(0);
    expect(result.counts.warning).toBe(0);
    expect(result.counts.info).toBe(0);
  });

  it("generates critical notifications for overdue decisions and failed workflows", async () => {
    mockDecisionFindMany
      .mockResolvedValueOnce([]) // decisionsInReview
      .mockResolvedValueOnce([  // decisionsOverdue
        { id: "d-1", title: "قرار متأخر", targetDate: new Date("2025-01-01"), updatedAt: new Date("2025-01-01") },
      ]);
    mockWorkflowRecordFindMany
      .mockResolvedValueOnce([  // workflowFailed
        { id: "w-1", title: "إجراء مرفوض", status: "rejected", updatedAt: new Date("2026-06-20") },
      ])
      .mockResolvedValueOnce([]); // workflowInReview
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesDealFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);

    const result = await getPlatformNotificationsAction();
    expect(result.counts.critical).toBeGreaterThanOrEqual(2);
    const criticalItems = result.notifications.filter((n) => n.severity === "critical");
    const hasOverdueDecision = criticalItems.some((n) => n.id.startsWith("decision-overdue"));
    const hasFailedWorkflow = criticalItems.some((n) => n.id.startsWith("workflow-failed"));
    expect(hasOverdueDecision).toBe(true);
    expect(hasFailedWorkflow).toBe(true);
  });

  it("generates warning notifications for pending reviews and stale deals", async () => {
    mockDecisionFindMany
      .mockResolvedValueOnce([ // decisionsInReview
        { id: "d-2", title: "قرار بانتظار المراجعة", updatedAt: new Date("2026-06-25") },
      ])
      .mockResolvedValueOnce([]); // decisionsOverdue
    mockWorkflowRecordFindMany
      .mockResolvedValueOnce([]) // workflowFailed
      .mockResolvedValueOnce([  // workflowInReview
        { id: "w-2", title: "إجراء بانتظار المراجعة", updatedAt: new Date("2026-06-24") },
      ]);
    mockLocalContentReviewFindMany.mockResolvedValue([
      { id: "lc-1", projectId: "proj-1", comments: "مراجعة المشروع", createdAt: new Date("2026-06-23") },
    ]);
    mockSalesDealFindMany.mockResolvedValue([
      { id: "s-1", title: "صفقة قديمة", updatedAt: new Date("2025-06-01") },
    ]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);

    const result = await getPlatformNotificationsAction();
    expect(result.counts.warning).toBeGreaterThanOrEqual(4);
    const warningItems = result.notifications.filter((n) => n.severity === "warning");
    const hasDecisionReview = warningItems.some((n) => n.id.startsWith("decision-review"));
    const hasWorkflowReview = warningItems.some((n) => n.id.startsWith("workflow-review"));
    const hasLCReview = warningItems.some((n) => n.id.startsWith("lc-review"));
    const hasStaleDeal = warningItems.some((n) => n.id.startsWith("sales-stale"));
    expect(hasDecisionReview).toBe(true);
    expect(hasWorkflowReview).toBe(true);
    expect(hasLCReview).toBe(true);
    expect(hasStaleDeal).toBe(true);
  });

  it("generates critical notifications for platform critical logs", async () => {
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesDealFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([
      {
        id: "log-1",
        action: "فشل في تسجيل الدخول",
        targetLabel: "محاولة دخول فاشلة",
        actorName: "مستخدم",
        createdAt: new Date("2026-07-01"),
        severity: "error",
      },
    ]);

    const result = await getPlatformNotificationsAction();
    const criticalItems = result.notifications.filter((n) => n.severity === "critical");
    const hasPlatformLog = criticalItems.some((n) => n.id.startsWith("platform-critical"));
    expect(hasPlatformLog).toBe(true);
    expect(result.counts.critical).toBeGreaterThanOrEqual(1);
  });

  it("sorts notifications by createdAt descending", async () => {
    mockDecisionFindMany
      .mockResolvedValueOnce([
        { id: "d-new", title: "جديد", updatedAt: new Date("2026-07-01") },
      ])
      .mockResolvedValueOnce([
        { id: "d-old", title: "قديم", targetDate: new Date("2025-01-01"), updatedAt: new Date("2025-01-01") },
      ]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesDealFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);

    const result = await getPlatformNotificationsAction();
    const timestamps = result.notifications.map((n) => n.createdAt.getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]);
    }
  });

  it("handles prisma errors gracefully via .catch(() => [])", async () => {
    mockDecisionFindMany.mockRejectedValue(new Error("DB error"));
    mockWorkflowRecordFindMany.mockRejectedValue(new Error("DB error"));
    mockLocalContentReviewFindMany.mockRejectedValue(new Error("DB error"));
    mockSalesDealFindMany.mockRejectedValue(new Error("DB error"));
    mockPlatformAuditLogFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getPlatformNotificationsAction();
    expect(result.notifications).toHaveLength(0);
    expect(result.counts.critical).toBe(0);
    expect(result.counts.warning).toBe(0);
  });
});
