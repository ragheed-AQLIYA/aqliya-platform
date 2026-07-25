// ─── Unit/Integration Test: DecisionOS Approval Queries ───
// Tests getApprovalStatus, getRecommendationDiff, and getDecisionTimeline.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/recommendation/recommendation-diff", () => ({
  buildRecommendationDiff: jest.fn().mockReturnValue({
    fields: ["recommendedAction", "rationale"],
    changes: [{ field: "recommendedAction", from: "old", to: "new" }],
  }),
  getDiffSummary: jest.fn().mockReturnValue({
    changedFields: 2,
    hasChanged: true,
    summary: "Recommendation has changed",
  }),
}));

jest.mock("@/lib/decision/decision-timeline", () => ({
  buildTimeline: jest.fn().mockReturnValue({
    events: [
      { type: "created", at: new Date("2026-06-01"), label: "\u062a\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621" },
    ],
    duration: 0,
  }),
}));

const mockGetCurrentUser = jest.fn();
const mockEnforce = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
  hasRequiredRole: jest.fn().mockReturnValue(true),
  isExpectedAccessDeniedError: jest.fn((error) =>
    error instanceof Error &&
    (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
  ),
}));

jest.mock("@/lib/kernel", () => ({
  enforce: mockEnforce,
}));

jest.mock("@/lib/decision/decision-audit", () => ({
  logDecisionAudit: jest.fn().mockResolvedValue(undefined),
  logAudit: jest.fn().mockResolvedValue(undefined),
  toAuditJson: jest.fn((o) => JSON.stringify(o)),
  getDecisionAuditLogs: jest.fn().mockResolvedValue([{ action: "SUBMITTED_FOR_REVIEW", actorId: "user-1", actorName: "Test" }]),
}));

const mockDecisionFindUnique = jest.fn();
const mockDecisionEvidenceAggregate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findUnique: mockDecisionFindUnique,
    },
    decisionEvidence: {
      aggregate: mockDecisionEvidenceAggregate,
    },
  },
}));

// ─── Imports (after mocks) ───

import {
  getApprovalStatus,
  getRecommendationDiff,
  getDecisionTimeline,
} from "@/actions/approval";

// ─── Mock Data ───

const mockUser = {
  id: "user-1",
  name: "\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u062e\u062a\u0628\u0627\u0631",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
};

function makeApproval(overrides = {}) {
  return {
    id: "app-1",
    decisionId: "decision-1",
    status: "APPROVED",
    approverId: "user-2",
    approver: { name: "\u0645\u062f\u064a\u0631 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629" },
    comments: "\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
    recommendationId: "rec-1",
    recommendation: {
      id: "rec-1",
      recommendedAction: "\u062a\u0648\u0635\u064a\u0629",
      rationale: "\u0623\u0633\u0628\u0627\u0628",
      expectedNextState: null,
      scopeExclusions: null,
      assumptionsUsed: null,
      risksAccepted: null,
      risksRejected: null,
      humanReviewRequired: true,
      isClientVisible: false,
      publishedFromSnapshot: false,
      updatedAt: new Date("2026-06-15"),
    },
    snapshotAction: "\u062a\u0648\u0635\u064a\u0629",
    snapshotRationale: "\u0623\u0633\u0628\u0627\u0628",
    snapshotExpectedNextState: null,
    snapshotScopeExclusions: null,
    snapshotAssumptionsUsed: null,
    snapshotRisksAccepted: null,
    snapshotRisksRejected: null,
    snapshotConditions: null,
    snapshotRisks: null,
    snapshotNextActions: null,
    snapshotConfidence: 80,
    snapshotScore: 75,
    snapshotOverrideReason: null,
    snapshotCreatedAt: new Date("2026-06-15"),
    createdAt: new Date("2026-06-15"),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockEnforce.mockResolvedValue(undefined);
  mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
});

// ─── getApprovalStatus ───

describe("getApprovalStatus", () => {
  it("returns approval status with data", async () => {
    const approval = makeApproval();
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce({
        id: "decision-1",
        status: "APPROVED",
        approvals: [approval],
        recommendation: {
          id: "rec-1",
          recommendedAction: "\u062a\u0648\u0635\u064a\u0629",
          rationale: "\u0623\u0633\u0628\u0627\u0628",
          humanReviewRequired: true,
          isClientVisible: false,
          publishedFromSnapshot: false,
          updatedAt: new Date("2026-06-15"),
        },
        auditLogs: [
          { action: "SUBMITTED_FOR_REVIEW", user: { name: "\u0645\u0633\u062a\u062e\u062f\u0645" }, createdAt: new Date("2026-06-10") },
        ],
      });
    mockDecisionEvidenceAggregate.mockResolvedValue({
      _count: { _all: 3 },
      _max: { createdAt: new Date("2026-06-14") },
    });

    const result = await getApprovalStatus("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("APPROVED");
      expect(result.data.latestApproval).toBeDefined();
      expect(result.data.approvedSnapshot).toBeDefined();
      expect(result.data.evidenceCount).toBe(3);
      expect(result.data.hasRecommendation).toBe(true);
      expect(result.data.reviewActions).toHaveLength(1);
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getApprovalStatus("nonexistent");
    expect(result.success).toBe(false);
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied"));
    const result = await getApprovalStatus("decision-1");
    expect(result.success).toBe(false);
  });

  it("handles missing recommendation gracefully", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce({
        id: "decision-1",
        status: "DRAFT",
        approvals: [],
        recommendation: null,
        auditLogs: [],
      });
    mockDecisionEvidenceAggregate.mockResolvedValue({
      _count: { _all: 0 },
      _max: { createdAt: null },
    });

    const result = await getApprovalStatus("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latestApproval).toBeNull();
      expect(result.data.hasRecommendation).toBe(false);
    }
  });
});

// ─── getRecommendationDiff ───

describe("getRecommendationDiff", () => {
  it("returns diff between approval snapshot and current recommendation", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce({
        id: "decision-1",
        approvals: [makeApproval()],
        recommendation: {
          id: "rec-1",
          recommendedAction: "\u062a\u0648\u0635\u064a\u0629 \u062c\u062f\u064a\u062f\u0629",
          rationale: "\u0623\u0633\u0628\u0627\u0628 \u062c\u062f\u064a\u062f\u0629",
          expectedNextState: null,
          scopeExclusions: null,
          assumptionsUsed: null,
          risksAccepted: null,
          risksRejected: null,
        },
      });

    const result = await getRecommendationDiff("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.diff).toBeDefined();
      expect(result.data.summary).toBeDefined();
      expect(result.data.summary.hasChanged).toBe(true);
    }
  });

  it("returns error when no approval found", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce({
        id: "decision-1",
        approvals: [],
        recommendation: null,
      });

    const result = await getRecommendationDiff("decision-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No approval found");
    }
  });

  it("returns error when no immutable snapshot", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce({
        id: "decision-1",
        approvals: [makeApproval({ snapshotAction: null, snapshotRationale: null })],
        recommendation: { id: "rec-1", recommendedAction: "action", rationale: "reason" },
      });

    const result = await getRecommendationDiff("decision-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No immutable snapshot available for diff");
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getRecommendationDiff("nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── getDecisionTimeline ───

describe("getDecisionTimeline", () => {
  it("returns timeline for a decision", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce({
        id: "decision-1",
        status: "APPROVED",
        createdAt: new Date("2026-06-01"),
        updatedAt: new Date("2026-06-15"),
        recommendation: { createdAt: new Date("2026-06-10"), updatedAt: new Date("2026-06-12"), publishedAt: new Date("2026-06-15") },
        approvals: [{ status: "APPROVED", createdAt: new Date("2026-06-14"), approver: { name: "\u0645\u062f\u064a\u0631" }, comments: "\u062a\u0645\u062a", conditions: null, snapshotCreatedAt: null, overrideReason: null }],
        auditLogs: [{ action: "SUBMITTED_FOR_REVIEW", createdAt: new Date("2026-06-10"), user: { name: "\u0645\u0633\u062a\u062e\u062f\u0645" }, after: null }],
      });

    const result = await getDecisionTimeline("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.events).toHaveLength(1);
      expect(result.data.events[0].type).toBe("created");
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getDecisionTimeline("nonexistent");
    expect(result.success).toBe(false);
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied"));
    const result = await getDecisionTimeline("decision-1");
    expect(result.success).toBe(false);
  });
});
