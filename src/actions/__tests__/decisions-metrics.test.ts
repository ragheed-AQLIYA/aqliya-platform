// ─── Unit/Integration Test: DecisionOS Metrics ───
// Tests dashboard metrics aggregation, quality, and insight computations.
// Uses pure function tests for compute* helpers + mocked Prisma for getDashboardMetrics.

// ─── Mocks (hoisted before imports) ───

jest.mock("@/lib/platform/cache-strategy", () => ({
  getCachedOrFetch: jest.fn((_key, fn) => fn()),
  invalidateDashboardCaches: jest.fn(),
  warmDashboardCaches: jest.fn(),
  DASHBOARD_CACHE_TTL_MS: 300000,
  ENTITY_CACHE_TTL_MS: 60000,
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockGetCurrentUser = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
  hasRequiredRole: jest.fn().mockReturnValue(true),
  isExpectedAccessDeniedError: jest.fn((error) =>
    error instanceof Error &&
    (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
  ),
}));

jest.mock("@/lib/decision/outcome-dashboard", () => ({
  buildOutcomeDashboardMetrics: jest.fn().mockReturnValue({
    totalTracked: 0,
    avgOutcomeScore: null,
    reviewedCount: 0,
  }),
}));

jest.mock("@/lib/decision/outcome-correlation", () => ({
  buildOutcomeCorrelation: jest.fn().mockReturnValue({
    correlations: [],
    insights: [],
  }),
}));

jest.mock("@/lib/decision/decision-portfolio", () => ({
  buildDecisionPortfolioSnapshot: jest.fn().mockReturnValue({
    portfolioRiskProfile: "balanced",
    diversityScore: 0,
  }),
}));

jest.mock("@/lib/decision/cross-decision-patterns", () => ({
  buildCrossDecisionPatterns: jest.fn().mockReturnValue({
    patterns: [],
    commonRisks: [],
    recommendations: [],
  }),
}));

const mockDecisionFindMany = jest.fn();
const mockDecisionGroupBy = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findMany: mockDecisionFindMany,
      groupBy: mockDecisionGroupBy,
    },
  },
}));

// ─── Imports (after mocks) ───

import { getDashboardMetrics } from "@/actions/decisions";
import { computeAggregationMetrics } from "@/actions/decisions-metrics/aggregation-metrics";
import { computeQualityMetrics } from "@/actions/decisions-metrics/quality-metrics";
import { computeInsightMetrics } from "@/actions/decisions-metrics/insight-metrics";
import type { DecisionMetricsRecord } from "@/actions/decisions-metrics/common";

// ─── Mock Data ───

const mockUser = {
  id: "user-1",
  name: "\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u062e\u062a\u0628\u0627\u0631",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
};

function makeDecision(overrides: Partial<DecisionMetricsRecord> = {}): DecisionMetricsRecord {
  return {
    id: "d-1",
    title: "\u0642\u0631\u0627\u0631",
    type: "INVESTMENT",
    status: "DRAFT",
    priority: "HIGH",
    createdAt: new Date("2026-06-01"),
    recommendation: null,
    approvals: [],
    evidence: [],
    objectives: [],
    framework: null,
    decisionScenarios: [],
    riskAnalyses: [],
    risks: [],
    outcome: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
});

// ─── computeAggregationMetrics (pure function) ───

describe("computeAggregationMetrics", () => {
  it("aggregates by status, type, and priority", () => {
    const decisions = [
      makeDecision({ status: "DRAFT", type: "INVESTMENT", priority: "HIGH" }),
      makeDecision({ status: "IN_REVIEW", type: "TENDER", priority: "MEDIUM", approvals: [{ status: "PENDING" }] }),
      makeDecision({ status: "DRAFT", type: "INVESTMENT", priority: "LOW" }),
    ];

    const result = computeAggregationMetrics(decisions);

    expect(result.totalDecisions).toBe(3);
    expect(result.byStatus).toEqual({ DRAFT: 2, IN_REVIEW: 1 });
    expect(result.byType).toEqual({ INVESTMENT: 2, TENDER: 1 });
    expect(result.byPriority).toEqual({ HIGH: 1, MEDIUM: 1, LOW: 1 });
    expect(result.draftCount).toBe(2);
    expect(result.approvedCount).toBe(0);
  });

  it("counts approved decisions correctly", () => {
    const decisions = [
      makeDecision({ approvals: [{ status: "APPROVED" }] }),
      makeDecision({
        approvals: [{ status: "PENDING" }],
        recommendation: { humanReviewRequired: false, isClientVisible: false, publishedFromSnapshot: false },
      }),
    ];

    const result = computeAggregationMetrics(decisions);

    expect(result.approvedCount).toBe(1);
    expect(result.pendingApproval).toBe(1);
  });

  it("handles empty input", () => {
    const result = computeAggregationMetrics([]);

    expect(result.totalDecisions).toBe(0);
    expect(result.byStatus).toEqual({});
    expect(result.byType).toEqual({});
    expect(result.byPriority).toEqual({});
    expect(result.approvedCount).toBe(0);
    expect(result.draftCount).toBe(0);
  });

  it("defaults missing priority to MEDIUM", () => {
    const decisions = [
      makeDecision({ priority: null }),
    ];

    const result = computeAggregationMetrics(decisions);

    expect(result.byPriority).toEqual({ MEDIUM: 1 });
  });
});

// ─── computeQualityMetrics (pure function) ───

describe("computeQualityMetrics", () => {
  it("calculates completion rates", () => {
    const decisions = [
      makeDecision({
        objectives: [{ id: "o1" }],
        framework: { context: "c", purpose: "p", options: "o", criteria: "cr", values: "v", informationGaps: null, certainty: null, assumptions: null },
        decisionScenarios: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
        riskAnalyses: [{ id: "r1" }],
        recommendation: { humanReviewRequired: false, isClientVisible: false, publishedFromSnapshot: false },
        approvals: [{ status: "APPROVED" }],
      }),
    ];

    const result = computeQualityMetrics(decisions);

    expect(result.avgCompletion).toBe(100);
  });

  it("identifies evidence-backed decisions", () => {
    const decisions = [
      makeDecision({ evidence: [{ id: "e1" }] }),
      makeDecision({ evidence: [] }),
    ];

    const result = computeQualityMetrics(decisions);

    expect(result.evidenceBackedCount).toBe(1);
    expect(result.missingEvidenceCount).toBe(1);
  });

  it("detects in-review decisions without evidence", () => {
    const decisions = [
      makeDecision({ status: "IN_REVIEW", evidence: [] }),
      makeDecision({ status: "IN_REVIEW", evidence: [{ id: "e1" }] }),
    ];

    const result = computeQualityMetrics(decisions);

    expect(result.inReviewWithoutEvidence).toBe(1);
  });

  it("counts ready for review correctly", () => {
    const decisions = [
      makeDecision({
        status: "DRAFT",
        recommendation: { humanReviewRequired: false, isClientVisible: false, publishedFromSnapshot: false },
        evidence: [{ id: "e1" }],
      }),
      makeDecision({ status: "DRAFT", recommendation: null, evidence: [] }),
    ];

    const result = computeQualityMetrics(decisions);

    expect(result.readyForReviewCount).toBe(1);
  });

  it("counts high priority pending approvals", () => {
    const decisions = [
      makeDecision({
        priority: "HIGH",
        recommendation: { humanReviewRequired: false, isClientVisible: false, publishedFromSnapshot: false },
        approvals: [],
      }),
      makeDecision({
        priority: "CRITICAL",
        recommendation: { humanReviewRequired: false, isClientVisible: false, publishedFromSnapshot: false },
        approvals: [{ status: "APPROVED" }],
      }),
    ];

    const result = computeQualityMetrics(decisions);

    expect(result.highPriorityPendingApprovalCount).toBe(1);
  });
});

// ─── computeInsightMetrics (pure function) ───

describe("computeInsightMetrics", () => {
  it("returns recent decisions (up to 5)", () => {
    const decisions = Array.from({ length: 7 }, (_, i) =>
      makeDecision({
        id: `d-${i}`,
        title: `\u0642\u0631\u0627\u0631 ${i}`,
        createdAt: new Date(2026, 5, i + 1),
      })
    );

    const result = computeInsightMetrics(decisions);

    expect(result.recentDecisions).toHaveLength(5);
    expect(result.recentDecisions[0].id).toBe("d-0");
  });

  it("identifies bottlenecks at each stage", () => {
    const decisions = [
      makeDecision({
        id: "d-1",
        framework: { context: "c", purpose: "p", options: "o", criteria: "cr", values: "v", informationGaps: null, certainty: null, assumptions: null },
        decisionScenarios: [{ id: "s1" }, { id: "s2" }],
        riskAnalyses: [],
      }),
      makeDecision({
        id: "d-2",
        framework: { context: "c", purpose: "p", options: "o", criteria: "cr", values: "v", informationGaps: null, certainty: null, assumptions: null },
        decisionScenarios: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
        riskAnalyses: [{ id: "r1" }],
        recommendation: null,
      }),
    ];

    const result = computeInsightMetrics(decisions);

    expect(result.bottlenecks.length).toBeGreaterThanOrEqual(1);
    expect(result.bottlenecks.some((b) => b.stage === "Scenarios")).toBe(true);
  });

  it("handles empty input", () => {
    const result = computeInsightMetrics([]);
    expect(result.recentDecisions).toHaveLength(0);
    expect(result.bottlenecks).toHaveLength(0);
  });
});

// ─── getDashboardMetrics (integration) ───

describe("getDashboardMetrics", () => {
  it("returns dashboard metrics for the organization", async () => {
    mockDecisionFindMany.mockResolvedValue([makeDecision()]);

    const result = await getDashboardMetrics();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalDecisions).toBe(1);
      expect(result.data.byStatus).toBeDefined();
      expect(result.data.byType).toBeDefined();
      expect(result.data.governanceMetrics).toBeDefined();
      expect(result.data.recentDecisions).toBeDefined();
      expect(result.data.bottlenecks).toBeDefined();
    }
  });

  it("handles empty decisions gracefully", async () => {
    mockDecisionFindMany.mockResolvedValue([]);

    const result = await getDashboardMetrics();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalDecisions).toBe(0);
      expect(result.data.byStatus).toEqual({});
      expect(result.data.avgCompletion).toBe(0);
    }
  });

  it("handles unauthorized access", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const result = await getDashboardMetrics();

    expect(result.success).toBe(false);
  });
});
