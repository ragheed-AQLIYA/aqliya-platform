// ─── Unit/Integration Test: DecisionOS Approval Workflow ───
// Tests submit, approve, reject, revision, and re-review workflow actions.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/core/workflow/decision-os-adapter", () => ({
  assertDecisionOsTransition: jest.fn().mockReturnValue("APPROVED"),
}));

jest.mock("@/lib/platform/notification/integration", () => ({
  notifyOnEvent: jest.fn().mockResolvedValue(undefined),
  registerProductChannels: jest.fn(),
  getProductChannels: jest.fn(() => ["in_app"]),
}));


jest.mock("@/actions/approval/common", () => ({
  buildSnapshotData: jest.fn().mockReturnValue({
    recommendationId: "rec-1",
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
    snapshotConfidence: null,
    snapshotScore: null,
    snapshotOverrideReason: null,
    snapshotCreatedAt: new Date("2026-06-15"),
  }),
}));

jest.mock("@prisma/client", () => ({
  Prisma: {
    JsonNull: null,
  },
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
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
  logAudit: jest.fn().mockResolvedValue(undefined),
  logDecisionAudit: jest.fn().mockResolvedValue(undefined),
  toAuditJson: jest.fn((o) => JSON.stringify(o)),
}));

const mockDecisionFindUnique = jest.fn();
const mockDecisionUpdate = jest.fn();
const mockApprovalCreate = jest.fn();
const mockApprovalFindFirst = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findUnique: mockDecisionFindUnique,
      update: mockDecisionUpdate,
    },
    approval: {
      create: mockApprovalCreate,
      findFirst: mockApprovalFindFirst,
    },
  },
}));

// ─── Imports (after mocks) ───

import {
  submitForReview,
  approveDecision,
  approveWithConditions,
  rejectDecision,
  requestRevision,
  requestReReview,
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

const mockDecisionWithRecommendation = {
  id: "decision-1",
  title: "\u0642\u0631\u0627\u0631 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u064a",
  status: "DRAFT",
  organizationId: "org-1",
  recommendation: {
    id: "rec-1",
    recommendedAction: "\u062a\u0648\u0635\u064a\u0629",
    rationale: "\u0623\u0633\u0628\u0627\u0628",
    expectedNextState: "\u0645\u062a\u0648\u0642\u0639",
    scopeExclusions: null,
    assumptionsUsed: null,
    risksAccepted: null,
    risksRejected: null,
    humanReviewRequired: true,
    confidence: null,
    score: null,
    risks: null,
    nextActions: null,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockEnforce.mockResolvedValue(undefined);
  mockDecisionFindUnique.mockResolvedValue(mockDecisionWithRecommendation);
  mockDecisionUpdate.mockResolvedValue({});
  mockApprovalCreate.mockResolvedValue({ id: "app-1" });
});

// ─── submitForReview ───

describe("submitForReview", () => {
  it("transitions DRAFT to IN_REVIEW", async () => {
    mockDecisionUpdate.mockResolvedValue({ status: "IN_REVIEW" });

    const result = await submitForReview("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("IN_REVIEW");
    }
    expect(mockDecisionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "decision-1" },
        data: { status: "IN_REVIEW" },
      })
    );
  });

  it("rejects if decision is not in DRAFT", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "APPROVED",
    });

    const result = await submitForReview("decision-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("cannot be submitted");
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await submitForReview("nonexistent");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Decision not found");
    }
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied"));
    const result = await submitForReview("decision-1");
    expect(result.success).toBe(false);
  });
});

// ─── approveDecision ───

describe("approveDecision", () => {
  it("transitions IN_REVIEW to APPROVED", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
    });
    mockDecisionUpdate.mockResolvedValue({ status: "APPROVED" });

    const result = await approveDecision("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("APPROVED");
    }
    expect(mockDecisionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "APPROVED" },
      })
    );
    expect(mockApprovalCreate).toHaveBeenCalled();
  });

  it("rejects if status is not IN_REVIEW", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "DRAFT",
    });

    const result = await approveDecision("decision-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("cannot be approved");
    }
  });

  it("requires recommendation unless overrideReason provided", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
      recommendation: null,
    });

    const result = await approveDecision("decision-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Recommendation is required");
    }
  });

  it("accepts override reason when no recommendation", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
      recommendation: null,
    });
    mockDecisionUpdate.mockResolvedValue({ status: "APPROVED" });

    const result = await approveDecision("decision-1", "override notes", "override reason");

    expect(result.success).toBe(true);
  });

  it("handles unauthorized", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied"));
    const result = await approveDecision("decision-1");
    expect(result.success).toBe(false);
  });
});

// ─── approveWithConditions ───

describe("approveWithConditions", () => {
  it("approves with conditions", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
    });
    mockDecisionUpdate.mockResolvedValue({ status: "APPROVED" });

    const result = await approveWithConditions("decision-1", "\u064a\u062c\u0628 \u0627\u0644\u0627\u0644\u062a\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("APPROVED");
    }
    expect(mockApprovalCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "APPROVED",
          snapshotConditions: "\u064a\u062c\u0628 \u0627\u0644\u0627\u0644\u062a\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629",
        }),
      })
    );
  });

  it("rejects empty conditions", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
    });

    const result = await approveWithConditions("decision-1", "");

    expect(result.success).toBe(false);
  });

  it("rejects if wrong status", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "DRAFT",
    });

    const result = await approveWithConditions("decision-1", "\u0634\u0631\u0637");

    expect(result.success).toBe(false);
  });
});

// ─── rejectDecision ───

describe("rejectDecision", () => {
  it("transitions IN_REVIEW to REJECTED with reason", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
    });
    mockDecisionUpdate.mockResolvedValue({ status: "REJECTED" });

    const result = await rejectDecision("decision-1", "\u0646\u0642\u0635 \u0641\u064a \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("REJECTED");
    }
    expect(mockApprovalCreate).toHaveBeenCalled();
  });

  it("rejects empty reason", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
    });

    const result = await rejectDecision("decision-1", "");

    expect(result.success).toBe(false);
  });

  it("rejects if wrong status", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "DRAFT",
    });

    const result = await rejectDecision("decision-1", "reason");

    expect(result.success).toBe(false);
  });
});

// ─── requestRevision ───

describe("requestRevision", () => {
  it("transitions IN_REVIEW to DRAFT with reason", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "IN_REVIEW",
    });
    mockDecisionUpdate.mockResolvedValue({ status: "DRAFT" });

    const result = await requestRevision("decision-1", "\u064a\u062d\u062a\u0627\u062c \u062a\u062d\u0633\u064a\u0646\u0627\u062a");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("DRAFT");
    }
  });

  it("rejects if not IN_REVIEW", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "APPROVED",
    });

    const result = await requestRevision("decision-1", "\u062a\u0639\u062f\u064a\u0644");
    expect(result.success).toBe(false);
  });
});

// ─── requestReReview ───

describe("requestReReview", () => {
  it("transitions APPROVED to DRAFT with reason", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "APPROVED",
    });
    mockDecisionUpdate.mockResolvedValue({ status: "DRAFT" });

    const result = await requestReReview("decision-1", "\u062a\u063a\u064a\u0631 \u0627\u0644\u0645\u062a\u0637\u0644\u0628\u0627\u062a");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("DRAFT");
    }
  });

  it("rejects empty reason", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "APPROVED",
    });

    const result = await requestReReview("decision-1", "");
    expect(result.success).toBe(false);
  });

  it("rejects if not APPROVED or IN_REVIEW", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecisionWithRecommendation,
      status: "DRAFT",
    });

    const result = await requestReReview("decision-1", "\u062a\u063a\u064a\u064a\u0631");
    expect(result.success).toBe(false);
  });
});
