// ─── Unit Test: Governance Actions ───
// Tests getGovernanceDashboardAction — aggregates governance items across all products
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

const mockGetCachedOrFetch = jest.fn((_key, fn) => fn());
jest.mock("@/lib/platform/cache-strategy", () => ({
  getCachedOrFetch: (...args) => mockGetCachedOrFetch(...args),
  invalidateDashboardCaches: jest.fn(),
  DASHBOARD_CACHE_TTL_MS: 300000,
}));

const mockGetCurrentUser = jest.fn();
const mockHasRequiredRole = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
  hasRequiredRole: (...args) => mockHasRequiredRole(...args),
}));

// ─── Prisma mocks ───

const mockDecisionFindMany = jest.fn();
const mockWorkflowRecordFindMany = jest.fn();
const mockLocalContentReviewFindMany = jest.fn();
const mockSalesReviewFindMany = jest.fn();
const mockAuditRiskAssessmentFindMany = jest.fn();
const mockAuditFindingFindMany = jest.fn();

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
    salesReview: {
      findMany: mockSalesReviewFindMany,
    },
    auditRiskAssessment: {
      findMany: mockAuditRiskAssessmentFindMany,
    },
    auditFinding: {
      findMany: mockAuditFindingFindMany,
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

// ─── Imports (after mocks) ───

import { getGovernanceDashboardAction } from "@/actions/governance-actions";

// ─── Mock Data ───

const MOCK_USER = {
  id: "user-1",
  name: "مستخدم اختبار",
  email: "test@aqliya.com",
  organizationId: "org-1",
  role: "ADMIN",
};

const MOCK_DECISION = {
  id: "dec-1",
  title: "قرار استثماري",
  description: "وصف القرار",
  status: "IN_REVIEW",
  targetDate: new Date("2026-12-31"),
  owner: { name: "مستخدم" },
  createdAt: new Date("2026-06-15"),
};

const MOCK_WORKFLOW = {
  id: "wf-1",
  title: "إجراء مراجعة",
  description: "وصف الإجراء",
  status: "pending_approval",
  dueDate: new Date("2026-07-01"),
  createdById: "user-1",
  createdAt: new Date("2026-06-20"),
};

const MOCK_LC_REVIEW = {
  id: "lc-1",
  project: { name: "مشروع محتوى محلي" },
  status: "pending",
  reviewerName: "مراجع",
  createdAt: new Date("2026-06-25"),
  projectId: "proj-1",
};

const MOCK_SALES_REVIEW = {
  id: "sr-1",
  deal: { title: "صفقة استراتيجية" },
  status: "pending",
  reviewerName: "مراجع مبيعات",
  createdAt: new Date("2026-06-22"),
  dealId: "deal-1",
};

const MOCK_RISK = {
  id: "risk-1",
  title: "تقييم مخاطر التدقيق",
  status: "in_review",
  assessedById: "user-1",
  createdAt: new Date("2026-06-18"),
  engagementId: "eng-1",
};

const MOCK_FINDING = {
  id: "find-1",
  title: "نتيجة تدقيق",
  description: "وصف نتيجة التدقيق",
  status: "under_review",
  severity: "high",
  createdById: "user-1",
  createdAt: new Date("2026-06-10"),
  engagementId: "eng-1",
};

// ─── Tests ───

describe("getGovernanceDashboardAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(MOCK_USER);
    mockHasRequiredRole.mockReturnValue(true);
  });

  it("returns full dashboard with all product categories", async () => {
    mockDecisionFindMany.mockResolvedValue([MOCK_DECISION]);
    mockWorkflowRecordFindMany.mockResolvedValue([MOCK_WORKFLOW]);
    mockLocalContentReviewFindMany.mockResolvedValue([MOCK_LC_REVIEW]);
    mockSalesReviewFindMany.mockResolvedValue([MOCK_SALES_REVIEW]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([MOCK_RISK]);
    mockAuditFindingFindMany.mockResolvedValue([MOCK_FINDING]);

    const result = await getGovernanceDashboardAction();

    expect(result.items).toHaveLength(6);
    expect(result.stats.totalPending).toBe(6);
    expect(result.stats.criticalCount).toBeGreaterThanOrEqual(1);
    expect(result.stats.byProduct).toBeDefined();
    expect(result.stats.byProduct["DecisionOS"]).toBe(1);
    expect(result.stats.byProduct["WorkflowOS"]).toBe(1);
    expect(result.stats.byProduct["LocalContentOS"]).toBe(1);
    expect(result.stats.byProduct["SalesOS"]).toBe(1);
    expect(result.stats.byProduct["RiskOS"]).toBe(1);
    expect(result.stats.byProduct["AuditOS"]).toBe(1);
    expect(result.stats.averageAge).toBeGreaterThan(0);
  });

  it("returns empty dashboard when no pending items exist", async () => {
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    const result = await getGovernanceDashboardAction();

    expect(result.items).toHaveLength(0);
    expect(result.stats.totalPending).toBe(0);
    expect(result.stats.criticalCount).toBe(0);
    expect(result.stats.byProduct).toEqual({});
    expect(result.stats.averageAge).toBe(0);
  });

  it("throws Access denied when user lacks VIEWER role", async () => {
    mockHasRequiredRole.mockReturnValue(false);

    await expect(getGovernanceDashboardAction()).rejects.toThrow("Access denied: VIEWER role required");
  });

  it("handles prisma errors gracefully via catch -> empty arrays", async () => {
    mockDecisionFindMany.mockRejectedValue(new Error("DB error"));
    // Other models resolved via .catch(() => []) internally
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    const result = await getGovernanceDashboardAction();

    expect(result.items).toHaveLength(0);
    expect(result.stats.totalPending).toBe(0);
  });

  it("calculates criticalCount based on overdue or high-priority items", async () => {
    const overdueDecision = {
      ...MOCK_DECISION,
      targetDate: new Date("2025-01-01"), // past date = overdue
    };
    mockDecisionFindMany.mockResolvedValue([overdueDecision]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    const result = await getGovernanceDashboardAction();

    expect(result.stats.criticalCount).toBeGreaterThanOrEqual(1);
  });

  it("populates byProduct map correctly with multiple items per product", async () => {
    mockDecisionFindMany.mockResolvedValue([MOCK_DECISION, { ...MOCK_DECISION, id: "dec-2" }]);
    mockWorkflowRecordFindMany.mockResolvedValue([MOCK_WORKFLOW]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    const result = await getGovernanceDashboardAction();

    expect(result.stats.byProduct["DecisionOS"]).toBe(2);
    expect(result.stats.byProduct["WorkflowOS"]).toBe(1);
    expect(Object.keys(result.stats.byProduct)).toHaveLength(2);
  });

  it("uses cache key based on organizationId", async () => {
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    await getGovernanceDashboardAction();

    expect(mockGetCachedOrFetch).toHaveBeenCalled();
    const cacheKey = mockGetCachedOrFetch.mock.calls[0][0];
    expect(cacheKey).toContain("org-1");
  });

  it("accepts optional offset for pagination", async () => {
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    await getGovernanceDashboardAction(25);

    // Verify that findMany calls received skip=25
    expect(mockDecisionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 25, take: 50 })
    );
  });
  it("returns high-priority items as critical even without deadline", async () => {
    const highPriorityFinding = {
      ...MOCK_FINDING,
      severity: "critical",
    };
    mockDecisionFindMany.mockResolvedValue([]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([highPriorityFinding]);

    const result = await getGovernanceDashboardAction();
    expect(result.stats.criticalCount).toBeGreaterThanOrEqual(1);
    const criticalItem = result.items.find((i) => i.productKey === "audit");
    expect(criticalItem).toBeDefined();
    expect(criticalItem!.priority).toBe("high");
  });

  it("computes averageAge correctly across items", async () => {
    const oldItem = { ...MOCK_DECISION, createdAt: new Date("2025-01-01") };
    mockDecisionFindMany.mockResolvedValue([oldItem]);
    mockWorkflowRecordFindMany.mockResolvedValue([]);
    mockLocalContentReviewFindMany.mockResolvedValue([]);
    mockSalesReviewFindMany.mockResolvedValue([]);
    mockAuditRiskAssessmentFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);

    const result = await getGovernanceDashboardAction();
    // The item was created ~1.5 years ago, so averageAge should be > 365
    expect(result.stats.averageAge).toBeGreaterThan(365);
    expect(result.stats.totalPending).toBe(1);
  });
});
