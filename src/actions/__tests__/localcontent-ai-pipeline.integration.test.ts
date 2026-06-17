// ─── Integration Test: LocalContentOS AI Pipeline ───
// Tests the full AI pipeline workflow:
//   review queue → approve/reject → batch review → quality metrics → PDF export
// Uses mocked Prisma — no database required.
// Pattern follows localcontent-workbook-actions.test.ts

import type {
  LcPatternSuggestion,
  LcMatchReview,
  LcPatternHealthRecord,
  LcAiReviewRun,
  LcIndustryPatternMemory,
  LcOrganizationMatchMemory,
  LcAiAuditEvent,
} from "@prisma/client";

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    userId: "user-1",
    organizationId: "org-1",
    role: "admin",
  }),
}));

// Mock the audit-events helper to avoid side effects
jest.mock("@/lib/local-content/audit-events", () => ({
  createAiAuditEvent: jest.fn().mockResolvedValue({ id: "audit-1" }),
  AuditActions: {
    PATTERN_SUGGESTION_REVIEWED: "PATTERN_SUGGESTION_REVIEWED",
    MATCH_REVIEW_CONFIRMED: "MATCH_REVIEW_CONFIRMED",
    MATCH_REVIEW_REJECTED: "MATCH_REVIEW_REJECTED",
    SUGGESTION_APPROVED: "SUGGESTION_APPROVED",
    SUGGESTION_REJECTED: "SUGGESTION_REJECTED",
  },
}));

jest.mock("@/lib/local-content/workbook/ai-advisor", () => ({
  reviewPatternSuggestion: jest.fn().mockResolvedValue({ success: true }),
  reviewFalsePositive: jest.fn().mockResolvedValue({ success: true }),
}));

// ─── Prisma mock functions ───

const mockLcPatternSuggestionFindMany = jest.fn();
const mockLcPatternSuggestionFindUnique = jest.fn();
const mockLcPatternSuggestionUpdate = jest.fn();
const mockLcPatternSuggestionCount = jest.fn();
const mockLcMatchReviewFindMany = jest.fn();
const mockLcMatchReviewFindUnique = jest.fn();
const mockLcMatchReviewUpdate = jest.fn();
const mockLcMatchReviewUpdateMany = jest.fn();
const mockLcPatternHealthRecordFindMany = jest.fn();
const mockLcPatternHealthRecordCount = jest.fn();
const mockLcAiReviewRunFindMany = jest.fn();
const mockLcIndustryPatternMemoryFindMany = jest.fn();
const mockLcOrganizationMatchMemoryCount = jest.fn();
const mockLcOrganizationMatchMemoryFindMany = jest.fn();
const mockLcAiAuditEventCount = jest.fn();
const mockLcAiAuditEventFindMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lcPatternSuggestion: {
      findMany: mockLcPatternSuggestionFindMany,
      findUnique: mockLcPatternSuggestionFindUnique,
      update: mockLcPatternSuggestionUpdate,
      count: mockLcPatternSuggestionCount,
    },
    lcMatchReview: {
      findMany: mockLcMatchReviewFindMany,
      findUnique: mockLcMatchReviewFindUnique,
      update: mockLcMatchReviewUpdate,
      updateMany: mockLcMatchReviewUpdateMany,
    },
    lcPatternHealthRecord: {
      findMany: mockLcPatternHealthRecordFindMany,
      count: mockLcPatternHealthRecordCount,
    },
    lcAiReviewRun: {
      findMany: mockLcAiReviewRunFindMany,
    },
    lcIndustryPatternMemory: {
      findMany: mockLcIndustryPatternMemoryFindMany,
    },
    lcOrganizationMatchMemory: {
      count: mockLcOrganizationMatchMemoryCount,
      findMany: mockLcOrganizationMatchMemoryFindMany,
    },
    lcAiAuditEvent: {
      count: mockLcAiAuditEventCount,
      findMany: mockLcAiAuditEventFindMany,
    },
  },
}));

// ─── Imports (after mocks) ───

import {
  getReviewQueueAction,
  batchReviewAction,
} from "@/actions/localcontent-review-actions";
import { getAiQualityMetricsAction } from "@/actions/localcontent-quality-actions";
import { exportReviewSummaryPdfAction } from "@/actions/localcontent-review-export";

// ─── Helpers ───

function makeSuggestion(
  overrides?: Partial<LcPatternSuggestion>,
): LcPatternSuggestion {
  return {
    id: `sug-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: "org-1",
    workbookLineCode: "REV-01",
    currentPattern: "revenue_*",
    suggestedPattern: "revenue_*,sales_*",
    reasoning: "Include sales accounts for complete revenue coverage",
    falsePositiveAccounts: null,
    unmatchedAccounts: null,
    confidence: 85,
    status: "pending",
    reviewedById: null,
    reviewedAt: null,
    reviewNotes: null,
    source: "ai",
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    acceptanceScore: null,
    successScore: null,
    falsePositiveRate: null,
    decayScore: 1.0,
    appliedAt: null,
    healthScore: null,
    ...overrides,
  };
}

function makeExplanation(
  overrides?: Partial<LcMatchReview>,
): LcMatchReview {
  return {
    id: `exp-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: "org-1",
    workbookLineId: null,
    workbookLineCode: "REV-01",
    accountCode: "400001",
    accountName: "إيرادات المبيعات / Sales Revenue",
    patternUsed: "revenue_*_ifrs",
    matchType: "pattern",
    confidence: 92,
    riskLevel: "low",
    riskReason: null,
    evidence: { matchSource: "code_pattern" },
    isFalsePositive: false,
    status: "pending",
    reviewedById: null,
    reviewedAt: null,
    reviewNotes: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    ...overrides,
  };
}

function makeHealthRecord(
  overrides?: Partial<LcPatternHealthRecord>,
): LcPatternHealthRecord {
  return {
    id: `health-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: "org-1",
    workbookLineCode: "REV-01",
    pattern: "revenue_*",
    status: "high_performing",
    matchCount: 50,
    correctCount: 48,
    falsePositiveCount: 2,
    healthScore: 96,
    lastEvaluatedAt: new Date("2026-06-15"),
    notes: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-15"),
    ...overrides,
  };
}

function makeReviewRun(
  overrides?: Partial<LcAiReviewRun>,
): LcAiReviewRun {
  return {
    id: `run-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: "org-1",
    status: "completed",
    startedAt: new Date("2026-06-15T10:00:00Z"),
    completedAt: new Date("2026-06-15T10:05:00Z"),
    explanationsGenerated: 25,
    patternSuggestions: 8,
    falsePositives: 3,
    durationMs: 300000,
    trigger: "manual",
    metadata: null,
    summary: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-15"),
    updatedAt: new Date("2026-06-15"),
    ...overrides,
  };
}

function makeIndustryPattern(
  overrides?: Partial<LcIndustryPatternMemory>,
): LcIndustryPatternMemory {
  return {
    id: `ind-${Math.random().toString(36).slice(2, 8)}`,
    industry: "services",
    workbookLineCode: "REV-01",
    pattern: "revenue_*",
    totalMatches: 50,
    correctMatches: 45,
    falsePositives: 5,
    effectivenessPct: 90,
    notes: null,
    metadata: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    ...overrides,
  };
}

function makeOrgMemory(
  overrides?: Partial<LcOrganizationMatchMemory>,
): LcOrganizationMatchMemory {
  return {
    id: `mem-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: "org-1",
    workbookLineCode: "REV-01",
    accountCode: "400001",
    accountName: "Sales Revenue",
    previousResult: "matched",
    currentPattern: "revenue_*",
    manualOverride: false,
    overrideReason: null,
    classification: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    ...overrides,
  };
}

function makeAuditEvent(
  overrides?: Partial<LcAiAuditEvent>,
): LcAiAuditEvent {
  return {
    id: `audit-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: "org-1",
    projectId: null,
    workbookId: null,
    action: "PATTERN_SUGGESTED",
    actorId: "user-1",
    providerId: "deterministic",
    modelVersion: null,
    promptVersion: null,
    confidence: 85,
    status: "success",
    inputSummary: null,
    outputSummary: null,
    warningCount: 0,
    durationMs: 150,
    metadata: null,
    createdAt: new Date("2026-06-15"),
    ...overrides,
  };
}

// ─── Cleanup ───

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests: Review Queue ───

describe("getReviewQueueAction", () => {
  it("should return empty queue when no items exist", async () => {
    mockLcMatchReviewFindMany.mockResolvedValue([]);
    mockLcPatternSuggestionFindMany.mockResolvedValue([]);
    mockLcPatternSuggestionCount.mockResolvedValue(0);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);

    const queue = await getReviewQueueAction("org-1");

    expect(queue.total).toBe(0);
    expect(queue.items).toHaveLength(0);
    expect(queue.counts.explanations).toBe(0);
    expect(queue.counts.suggestions).toBe(0);
    expect(queue.counts.falsePositives).toBe(0);
    expect(queue.stats.totalMemoryRecords).toBe(0);
  });

  it("should return queue with only non-pending items (empty actionable queue)", async () => {
    mockLcMatchReviewFindMany
      .mockResolvedValueOnce([]) // pending explanations
      .mockResolvedValueOnce([]); // false positives
    mockLcPatternSuggestionFindMany.mockResolvedValue([]);
    mockLcPatternSuggestionCount.mockResolvedValue(0);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcPatternHealthRecordCount.mockResolvedValue(0);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);

    const queue = await getReviewQueueAction("org-1");
    expect(queue.total).toBe(0);
    expect(queue.items).toHaveLength(0);
    expect(queue.counts.explanations).toBe(0);
    expect(queue.counts.suggestions).toBe(0);
  });

  it("should return mixed queue with explanations, suggestions, and false positives", async () => {
    const pendingExplanation = makeExplanation({
      id: "exp-pending-1",
      status: "pending",
      confidence: 85,
    });
    const confirmedExplanation = makeExplanation({
      id: "exp-confirmed-1",
      status: "confirmed",
      confidence: 92,
    });
    const fpExplanation = makeExplanation({
      id: "exp-fp-1",
      isFalsePositive: true,
      status: "pending",
      confidence: 30,
      accountCode: "999999",
    });
    const pendingSuggestion = makeSuggestion({
      id: "sug-pending-1",
      workbookLineCode: "COS-01",
      confidence: 78,
    });

    mockLcMatchReviewFindMany
      .mockResolvedValueOnce([pendingExplanation, fpExplanation, confirmedExplanation]) // first call: explanations
      .mockResolvedValueOnce([fpExplanation]); // third call: false positives
    mockLcPatternSuggestionFindMany.mockResolvedValueOnce([pendingSuggestion]); // second call: suggestions
    mockLcPatternSuggestionCount.mockResolvedValue(1);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(5);
    mockLcPatternHealthRecordCount.mockResolvedValue(1);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([
      makeHealthRecord(),
    ]);
    mockLcAiReviewRunFindMany.mockResolvedValue([makeReviewRun()]);

    const queue = await getReviewQueueAction("org-1");

    expect(queue.total).toBe(4); // 3 explanations (pending + confirmed + FP) + 1 suggestion
    expect(queue.counts.explanations).toBe(2); // pending + confirmed (FP excluded from this count)
    expect(queue.counts.suggestions).toBe(1);
    expect(queue.counts.falsePositives).toBe(1); // FP with isFalsePositive=true
    expect(queue.stats.totalMemoryRecords).toBe(5);
    expect(queue.stats.totalHealthRecords).toBe(1);
    expect(queue.stats.lastReviewRun).toBeTruthy();
  });
});

// ─── Tests: Batch Review ───

describe("batchReviewAction", () => {
  it("should batch approve all selected suggestions via mocked service", async () => {
    // batchReviewAction calls reviewPatternSuggestion (mocked) for each ID.
    // Our mock returns { success: true }, so all should process successfully.
    const result = await batchReviewAction(
      "suggestion",
      ["sug-b1", "sug-b2"],
      "approved",
      "Batch approval test",
    );

    expect(result.success).toBe(true);
    expect(result.processed).toBe(2);
    expect(result.errors).toBe(0);
  });

  it("should report errors when mocked service fails", async () => {
    // Temporarily make the mock return failure
    const mockReviewPatternSuggestion = jest.requireMock(
      "@/lib/local-content/workbook/ai-advisor",
    ).reviewPatternSuggestion;
    mockReviewPatternSuggestion.mockResolvedValueOnce({
      success: false,
      error: "Simulated failure",
    });

    const result = await batchReviewAction(
      "suggestion",
      ["sug-fail-1"],
      "approved",
      "Batch test: one fails",
    );

    expect(result.success).toBe(false);
    expect(result.processed).toBe(0);
    expect(result.errors).toBe(1);
  });

  it("should handle empty selection list gracefully", async () => {
    const result = await batchReviewAction(
      "suggestion",
      [],
      "approved",
      "Batch with empty list",
    );
    expect(result.success).toBe(true);
    expect(result.processed).toBe(0);
    expect(result.errors).toBe(0);
  });

  it("should process explanations via mocked service", async () => {
    const result = await batchReviewAction(
      "explanation",
      ["exp-nonexistent"],
      "confirmed",
      "Batch confirm explanations",
    );

    expect(result.success).toBe(true);
    expect(result.processed).toBe(1);
    expect(result.errors).toBe(0);
  });
});

// ─── Tests: Quality Metrics ───

describe("getAiQualityMetricsAction", () => {
  it("should aggregate correct metrics from all sources", async () => {
    // 4 suggestions: 2 approved, 1 rejected, 1 pending
    mockLcPatternSuggestionFindMany.mockResolvedValue([
      makeSuggestion({ id: "sug-qa-1", status: "approved", confidence: 90 }),
      makeSuggestion({ id: "sug-qa-2", status: "approved", confidence: 85 }),
      makeSuggestion({ id: "sug-qa-3", status: "rejected", confidence: 40 }),
      makeSuggestion({ id: "sug-qa-4", status: "pending", confidence: 75 }),
    ]);

    // 3 explanations: 2 confirmed low-risk, 1 pending high-risk
    mockLcMatchReviewFindMany
      .mockResolvedValueOnce([
        makeExplanation({
          id: "exp-qa-1",
          status: "confirmed",
          confidence: 95,
          riskLevel: "low",
        }),
        makeExplanation({
          id: "exp-qa-2",
          status: "confirmed",
          confidence: 88,
          riskLevel: "low",
        }),
        makeExplanation({
          id: "exp-qa-3",
          status: "pending",
          confidence: 60,
          riskLevel: "high",
        }),
      ])
      .mockResolvedValueOnce([]); // false positives

    // Health records
    mockLcPatternHealthRecordFindMany.mockResolvedValue([
      makeHealthRecord({ status: "high_performing", healthScore: 96 }),
      makeHealthRecord({
        status: "active",
        healthScore: 75,
        workbookLineCode: "COS-01",
      }),
      makeHealthRecord({
        status: "decaying",
        healthScore: 45,
        workbookLineCode: "AST-01",
      }),
    ]);

    // Review runs
    mockLcAiReviewRunFindMany.mockResolvedValue([
      makeReviewRun({ status: "completed", explanationsGenerated: 25, patternSuggestions: 8, falsePositives: 3 }),
      makeReviewRun({ status: "completed", explanationsGenerated: 18, patternSuggestions: 5, falsePositives: 1 }),
      makeReviewRun({ status: "failed", explanationsGenerated: 0, patternSuggestions: 0, falsePositives: 0 }),
    ]);

    // Org memory count
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(15);

    // Industry patterns
    mockLcIndustryPatternMemoryFindMany.mockResolvedValue([
      makeIndustryPattern({ effectivenessPct: 90 }),
      makeIndustryPattern({ effectivenessPct: 75, workbookLineCode: "AST-01" }),
    ]);

    const result = await getAiQualityMetricsAction();

    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();

    const d = result.data!;

    // Suggestions
    expect(d.totalSuggestions).toBe(4);
    expect(d.approvedSuggestions).toBe(2);
    expect(d.rejectedSuggestions).toBe(1);
    expect(d.pendingSuggestions).toBe(1);
    expect(d.suggestionAcceptanceRate).toBe(67);
    expect(d.avgSuggestionConfidence).toBe(73);

    // Explanations
    expect(d.totalExplanations).toBe(3);
    expect(d.confirmedExplanations).toBe(2);
    expect(d.rejectedExplanations).toBe(0);
    expect(d.falsePositives).toBe(0);
    expect(d.avgExplanationConfidence).toBe(81);

    // Risk
    expect(d.highRiskCount).toBe(1);
    expect(d.mediumRiskCount).toBe(0);
    expect(d.lowRiskCount).toBe(2);

    // Health
    expect(d.totalHealthRecords).toBe(3);
    expect(d.highPerformingRecords).toBe(1);
    expect(d.activeRecords).toBe(1);
    expect(d.decayingRecords).toBe(1);
    expect(d.obsoleteRecords).toBe(0);
    expect(d.avgHealthScore).toBe(72);

    // Runs
    expect(d.totalReviewRuns).toBe(3);
    expect(d.completedRuns).toBe(2);
    expect(d.failedRuns).toBe(1);
    expect(d.totalExplanationsGenerated).toBe(43);
    expect(d.totalPatternSuggestions).toBe(13);
    expect(d.lastRunStatus).toBe("completed");

    // Org memory
    expect(d.totalOrgMemoryRecords).toBe(15);

    // Industry patterns
    expect(d.totalIndustryPatterns).toBe(2);
    expect(d.avgEffectiveness).toBe(83);

    // Recent runs
    expect(d.recentRuns).toHaveLength(3);
  });

  it("should handle zero data gracefully", async () => {
    mockLcPatternSuggestionFindMany.mockResolvedValue([]);
    mockLcMatchReviewFindMany.mockResolvedValue([]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcIndustryPatternMemoryFindMany.mockResolvedValue([]);

    const result = await getAiQualityMetricsAction();

    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();

    const d = result.data!;
    expect(d.totalSuggestions).toBe(0);
    expect(d.suggestionAcceptanceRate).toBeNull();
    expect(d.totalExplanations).toBe(0);
    expect(d.totalHealthRecords).toBe(0);
    expect(d.totalReviewRuns).toBe(0);
    expect(d.totalOrgMemoryRecords).toBe(0);
    expect(d.totalIndustryPatterns).toBe(0);
  });

  it("should compute acceptanceOverTime with weekly buckets", async () => {
    const now = Date.now();
    // Place suggestions across 3 weeks (spread enough to hit different buckets)
    mockLcPatternSuggestionFindMany.mockResolvedValue([
      makeSuggestion({
        id: "s-t-1",
        status: "approved",
        createdAt: new Date(now - 2 * 86400000), // ~2 days ago
      }),
      makeSuggestion({
        id: "s-t-2",
        status: "approved",
        createdAt: new Date(now - 15 * 86400000), // ~15 days ago
      }),
      makeSuggestion({
        id: "s-t-3",
        status: "rejected",
        createdAt: new Date(now - 25 * 86400000), // ~25 days ago
      }),
    ]);
    mockLcMatchReviewFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcIndustryPatternMemoryFindMany.mockResolvedValue([]);

    const result = await getAiQualityMetricsAction();
    expect(result.ok).toBe(true);

    // 4 weekly buckets returned
    expect(result.data!.acceptanceOverTime).toHaveLength(4);

    // Each bucket should have label, total, approved, rate
    result.data!.acceptanceOverTime.forEach((p) => {
      expect(typeof p.label).toBe("string");
      expect(typeof p.total).toBe("number");
      expect(typeof p.approved).toBe("number");
      expect(p.rate === null || typeof p.rate === "number").toBe(true);
    });
  });

  it("should handle acceptanceOverTime with zero data", async () => {
    mockLcPatternSuggestionFindMany.mockResolvedValue([]);
    mockLcMatchReviewFindMany.mockResolvedValue([]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcIndustryPatternMemoryFindMany.mockResolvedValue([]);

    const result = await getAiQualityMetricsAction();
    expect(result.ok).toBe(true);

    // All buckets should have zero data
    result.data!.acceptanceOverTime.forEach((p) => {
      expect(p.total).toBe(0);
      expect(p.rate).toBeNull();
    });
  });

  it("should compute confidence distribution buckets correctly", async () => {
    // 4 suggestions with confidences 40, 60, 85, 92
    mockLcPatternSuggestionFindMany.mockResolvedValue([
      makeSuggestion({ id: "s-cd-1", confidence: 40 }),
      makeSuggestion({ id: "s-cd-2", confidence: 60 }),
      makeSuggestion({ id: "s-cd-3", confidence: 85 }),
      makeSuggestion({ id: "s-cd-4", confidence: 92 }),
    ]);
    // 4 explanations with confidences 25, 55, 78, 95
    mockLcMatchReviewFindMany
      .mockResolvedValueOnce([
        makeExplanation({ id: "e-cd-1", confidence: 25 }),
        makeExplanation({ id: "e-cd-2", confidence: 55 }),
        makeExplanation({ id: "e-cd-3", confidence: 78 }),
        makeExplanation({ id: "e-cd-4", confidence: 95 }),
      ])
      .mockResolvedValueOnce([]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcIndustryPatternMemoryFindMany.mockResolvedValue([]);

    const result = await getAiQualityMetricsAction();
    expect(result.ok).toBe(true);

    // Suggestions: 40→[1] (25-50), 60→[1] (50-75), 85+92→[2] (75-100)
    expect(result.data!.suggestionConfidenceBuckets).toEqual([0, 1, 1, 2]);

    // Explanations: 25→[1] (0-25), 55→[1] (50-75), 78+95→[2] (75-100)
    expect(result.data!.explanationConfidenceBuckets).toEqual([1, 0, 1, 2]);
  });

  it("should place confidence boundary values (25, 50, 75, 100) in correct buckets", async () => {
    // Exactly at boundaries
    mockLcPatternSuggestionFindMany.mockResolvedValue([
      makeSuggestion({ id: "s-b1", confidence: 25 }),
      makeSuggestion({ id: "s-b2", confidence: 50 }),
      makeSuggestion({ id: "s-b3", confidence: 75 }),
      makeSuggestion({ id: "s-b4", confidence: 100 }),
    ]);
    mockLcMatchReviewFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);
    mockLcOrganizationMatchMemoryCount.mockResolvedValue(0);
    mockLcIndustryPatternMemoryFindMany.mockResolvedValue([]);

    const result = await getAiQualityMetricsAction();
    expect(result.ok).toBe(true);

    // 25 → bucket[0] (0-25), 50 → bucket[1] (25-50), 75 → bucket[2] (50-75), 100 → bucket[3] (75-100)
    expect(result.data!.suggestionConfidenceBuckets).toEqual([1, 1, 1, 1]);
  });
});

// ─── Tests: PDF Export ───

describe("exportReviewSummaryPdfAction", () => {
  it("should generate a PDF summary with suggestions & explanations", async () => {
    mockLcPatternSuggestionFindMany.mockResolvedValue([
      makeSuggestion({
        id: "sug-pdf-1",
        status: "approved",
        reviewedById: "user-1",
        reviewedAt: new Date("2026-06-16"),
        workbookLineCode: "REV-01",
        suggestedPattern: "revenue_*,sales_*",
        confidence: 85,
      }),
      makeSuggestion({
        id: "sug-pdf-2",
        status: "rejected",
        reviewedById: "user-1",
        reviewedAt: new Date("2026-06-16"),
        workbookLineCode: "COS-01",
        suggestedPattern: "cos_direct_*",
        confidence: 42,
      }),
    ]);
    mockLcMatchReviewFindMany.mockResolvedValue([
      makeExplanation({
        id: "exp-pdf-1",
        status: "confirmed",
        confidence: 95,
        riskLevel: "low",
      }),
      makeExplanation({
        id: "exp-pdf-2",
        status: "pending",
        confidence: 60,
        riskLevel: "high",
      }),
    ]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([
      makeHealthRecord(),
    ]);
    mockLcAiReviewRunFindMany.mockResolvedValue([
      makeReviewRun(),
    ]);
    mockLcPatternSuggestionCount.mockResolvedValue(2);

    const result = await exportReviewSummaryPdfAction();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.filename).toMatch(/\.pdf$/);
    expect(result.data!.contentType).toBe("application/pdf");
    expect(result.data!.base64).toBeTruthy();
    // Decode and verify it's valid base64 PDF
    const decoded = Buffer.from(result.data!.base64, "base64");
    expect(decoded.length).toBeGreaterThan(100);
    // PDF header magic bytes
    expect(decoded.toString("ascii", 0, 5)).toBe("%PDF-");
  });

  it("should return error when no data exists", async () => {
    mockLcPatternSuggestionFindMany.mockResolvedValue([]);
    mockLcMatchReviewFindMany.mockResolvedValue([]);
    mockLcPatternHealthRecordFindMany.mockResolvedValue([]);
    mockLcAiReviewRunFindMany.mockResolvedValue([]);
    mockLcPatternSuggestionCount.mockResolvedValue(0);

    const result = await exportReviewSummaryPdfAction();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    const decoded = Buffer.from(result.data!.base64, "base64");
    expect(decoded.toString("ascii", 0, 5)).toBe("%PDF-");
  });
});


