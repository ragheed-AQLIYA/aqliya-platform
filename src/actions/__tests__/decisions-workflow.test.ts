// ─── Unit/Integration Test: DecisionOS Workflow Actions ───
// Tests recommendation CRUD, publishing, workflow readiness, and export.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/decision", () => ({
  evaluateIntake: jest.fn().mockReturnValue({
    status: "accepted",
    readyForFramework: true,
    reasonCodes: [],
    reasons: [],
    requiredNextSteps: [],
  }),
  evaluateFramework: jest.fn().mockReturnValue({
    isComplete: true,
    missingFields: [],
    suggestion: "Framework is complete",
    completeness: 100,
    scores: { clarity: 8, coverage: 7, alignment: 9 },
  }),
  evaluateScenarios: jest.fn().mockReturnValue({
    isComplete: true,
    gapIdentified: false,
    missingPerspectives: [],
    missingCount: 0,
    suggestion: "Scenarios are adequate",
    scores: { diversity: 7, coverage: 8 },
  }),
  evaluateRisks: jest.fn().mockReturnValue({
    isComplete: true,
    gapIdentified: false,
    missingTypes: [],
    missingCount: 0,
    recommendation: "Risks adequately evaluated",
    scores: { identification: 8, mitigation: 7 },
  }),
}));

jest.mock("@/lib/decision/decision-export-pdf", () => ({
  buildDecisionReportPDF: jest.fn().mockResolvedValue({
    content: Buffer.from("mock-pdf-content"),
    mimeType: "application/pdf",
    filename: "decision-report.pdf",
  }),
}));

jest.mock("@/lib/simulation/simulation-engine", () => ({
  deriveScores: jest.fn().mockReturnValue({
    strategicFitScore: 75,
    feasibilityScore: 70,
    riskScore: 65,
    confidenceScore: 72,
    dataQuality: "good",
    missingInputs: [],
  }),
  buildScoringData: jest.fn().mockReturnValue({}),
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

jest.mock("@/lib/observability/logger", () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

const mockDecisionFindUnique = jest.fn();
const mockDecisionFindMany = jest.fn();
const mockDecisionUpdate = jest.fn();
const mockRecommendationFindUnique = jest.fn();
const mockRecommendationFindFirst = jest.fn();
const mockRecommendationUpsert = jest.fn();
const mockRecommendationUpdate = jest.fn();
const mockApprovalFindFirst = jest.fn();
const mockApprovalFindUnique = jest.fn();
const mockDecisionObjectiveFindMany = jest.fn();
const mockDecisionConstraintFindMany = jest.fn();
const mockDecisionAssumptionFindMany = jest.fn();
const mockDecisionAlternativeFindMany = jest.fn();
const mockDecisionRiskFindMany = jest.fn();
const mockDecisionScenarioFindMany = jest.fn();
const mockDecisionScenarioFindFirst = jest.fn();
const mockScenarioFindMany = jest.fn();
const mockDecisionFrameworkFindUnique = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findUnique: mockDecisionFindUnique,
      findMany: mockDecisionFindMany,
      update: mockDecisionUpdate,
    },
    recommendation: {
      findUnique: mockRecommendationFindUnique,
      findFirst: mockRecommendationFindFirst,
      upsert: mockRecommendationUpsert,
      update: mockRecommendationUpdate,
    },
    approval: {
      findFirst: mockApprovalFindFirst,
      findUnique: mockApprovalFindUnique,
    },
    objective: { findMany: mockDecisionObjectiveFindMany },
    constraint: { findMany: mockDecisionConstraintFindMany },
    assumption: { findMany: mockDecisionAssumptionFindMany },
    alternative: { findMany: mockDecisionAlternativeFindMany },
    risk: { findMany: mockDecisionRiskFindMany },
    decisionScenario: { findMany: mockDecisionScenarioFindMany, findFirst: mockDecisionScenarioFindFirst },
    scenario: { findMany: mockScenarioFindMany },
    decisionFramework: { findUnique: mockDecisionFrameworkFindUnique },
  },
}));

// ─── Imports (after mocks) ───

import {
  getDecisionRecommendation,
  updateDecisionRecommendation,
  checkRecommendationGate,
  publishRecommendationAction,
  unpublishRecommendationAction,
  getPublishedRecommendationViewAction,
  getWorkflowReadiness,
  exportDecisionReport,
} from "@/actions/decisions";

// ─── Mock Data ───

const mockUser = {
  id: "user-1",
  name: "\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u062e\u062a\u0628\u0627\u0631",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
  organization: { id: "org-1", name: "\u0645\u0646\u0638\u0645\u0629 \u0627\u062e\u062a\u0628\u0627\u0631" },
};

const mockDecision = {
  id: "decision-1",
  title: "\u0642\u0631\u0627\u0631 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u064a",
  type: "INVESTMENT",
  status: "DRAFT",
  priority: "HIGH",
  description: "\u0642\u0631\u0627\u0631 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u064a",
  ownerId: "user-1",
  organizationId: "org-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  targetDate: new Date("2026-12-31"),
  organization: { id: "org-1", name: "\u0645\u0646\u0638\u0645\u0629 \u0627\u062e\u062a\u0628\u0627\u0631" },
  owner: { id: "user-1", name: "\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u062e\u062a\u0628\u0627\u0631" },
};

const mockRecommendation = {
  id: "rec-1",
  decisionId: "decision-1",
  recommendedAction: "\u0627\u0644\u0645\u0636\u064a \u0642\u062f\u0645\u0627\u064b \u0641\u064a \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631",
  rationale: "\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0629",
  expectedNextState: "\u0645\u062a\u0648\u0642\u0639\u0627\u062a",
  scopeExclusions: "\u0627\u0633\u062a\u062b\u0646\u0627\u0621\u0627\u062a",
  assumptionsUsed: "\u0627\u0641\u062a\u0631\u0627\u0636\u0627\u062a",
  risksAccepted: "\u0645\u062e\u0627\u0637\u0631 \u0645\u0642\u0628\u0648\u0644\u0629",
  risksRejected: "\u0645\u062e\u0627\u0637\u0631 \u0645\u0631\u0641\u0648\u0636\u0629",
  humanReviewRequired: true,
  isClientVisible: false,
  publishedVersion: 1,
  publishedFromSnapshot: false,
  publishedApprovalId: null,
  publishedAt: null,
  publishedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockEnforce.mockResolvedValue(undefined);
  mockDecisionFindUnique.mockResolvedValue(mockDecision);
  mockDecisionFindMany.mockResolvedValue([]);
  mockRecommendationFindUnique.mockResolvedValue(mockRecommendation);
  mockRecommendationFindFirst.mockResolvedValue(mockRecommendation);
  mockApprovalFindFirst.mockResolvedValue(null);
  mockApprovalFindUnique.mockResolvedValue(null);
});

// ─── getDecisionRecommendation ───

describe("getDecisionRecommendation", () => {
  it("returns recommendation data", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      id: "decision-1",
      type: "INVESTMENT",
      recommendation: mockRecommendation,
      organizationId: "org-1",
    });

    const result = await getDecisionRecommendation("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recommendation.id).toBe("rec-1");
      expect(result.data.decisionType).toBe("INVESTMENT");
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getDecisionRecommendation("nonexistent");
    expect(result.success).toBe(false);
  });

  it("returns error when no recommendation exists", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      id: "decision-1",
      type: "INVESTMENT",
      recommendation: null,
      organizationId: "org-1",
    });
    const result = await getDecisionRecommendation("decision-1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Recommendation not found");
    }
  });

  it("redirects VIEWER to published view", async () => {
    mockGetCurrentUser.mockResolvedValue({ ...mockUser, role: "VIEWER" });
    mockDecisionFindUnique.mockResolvedValue({
      id: "decision-1",
      type: "INVESTMENT",
      recommendation: mockRecommendation,
      organizationId: "org-1",
    });

    const result = await getDecisionRecommendation("decision-1");

    expect(result.success).toBe(false);
    // VIEWER gets redirected to published view which fails because not visible
    expect(result.error).toBe("Recommendation not available");
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied: VIEWER role required"));
    const result = await getDecisionRecommendation("decision-1");
    expect(result.success).toBe(false);
  });
});

// ─── updateDecisionRecommendation ───

describe("updateDecisionRecommendation", () => {
  it("upserts recommendation successfully", async () => {
    mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
    mockRecommendationUpsert.mockResolvedValue(mockRecommendation);

    const result = await updateDecisionRecommendation("decision-1", {
      recommendedAction: "\u0627\u0644\u0645\u0636\u064a \u0642\u062f\u0645\u0627\u064b",
      rationale: "\u0623\u0633\u0628\u0627\u0628",
      expectedNextState: "\u0645\u062a\u0648\u0642\u0639",
      scopeExclusions: "\u0627\u0633\u062a\u062b\u0646\u0627\u0621",
      assumptionsUsed: "\u0627\u0641\u062a\u0631\u0627\u0636\u0627\u062a",
      risksAccepted: "\u0645\u0642\u0628\u0648\u0644\u0629",
      risksRejected: "\u0645\u0631\u0641\u0648\u0636\u0629",
      humanReviewRequired: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("rec-1");
    }
    expect(mockRecommendationUpsert).toHaveBeenCalled();
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await updateDecisionRecommendation("decision-1", {
      recommendedAction: "test", rationale: "test", expectedNextState: "test",
      scopeExclusions: "", assumptionsUsed: "", risksAccepted: "", risksRejected: "",
      humanReviewRequired: true,
    });
    expect(result.success).toBe(false);
  });
});

// ─── checkRecommendationGate ───

describe("checkRecommendationGate", () => {
  it("returns gate status", async () => {
    mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });

    const result = await checkRecommendationGate("decision-1");

    // Gate evaluation uses mocked evaluate functions which return complete/ready
    expect(result.allowed).toBeDefined();
    expect(result.missing).toBeDefined();
    expect(mockEnforce).toHaveBeenCalled();
  });
});

// ─── publishRecommendationAction ───

describe("publishRecommendationAction", () => {
  it("publishes recommendation without approval snapshot", async () => {
    mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
    mockRecommendationFindUnique.mockResolvedValue(mockRecommendation);
    mockApprovalFindFirst.mockResolvedValue(null);
    mockRecommendationUpdate.mockResolvedValue({
      ...mockRecommendation,
      isClientVisible: true,
      publishedAt: new Date(),
      publishedVersion: 2,
    });

    const result = await publishRecommendationAction("decision-1");

    expect(result.success).toBe(true);
    expect(mockRecommendationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { decisionId: "decision-1" },
        data: expect.objectContaining({ isClientVisible: true }),
      })
    );
  });

  it("publishes from snapshot when approval matches", async () => {
    mockDecisionFindUnique.mockResolvedValueOnce({ organizationId: "org-1" });
    mockDecisionFindUnique.mockResolvedValueOnce({ organizationId: "org-1" });
    mockRecommendationFindUnique.mockResolvedValue(mockRecommendation);
    mockApprovalFindFirst.mockResolvedValue({
      id: "app-1",
      status: "APPROVED",
      snapshotAction: "\u0627\u0644\u0645\u0636\u064a \u0642\u062f\u0645\u0627\u064b \u0641\u064a \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631",
      snapshotRationale: "\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0629",
      snapshotCreatedAt: new Date(),
      approverId: "user-2",
    });
    mockRecommendationUpdate.mockResolvedValue({
      ...mockRecommendation,
      isClientVisible: true,
      publishedVersion: 2,
      publishedFromSnapshot: true,
      publishedApprovalId: "app-1",
    });

    const result = await publishRecommendationAction("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.publishedFromSnapshot).toBe(true);
    }
  });

  it("returns requiresOverride when snapshot differs", async () => {
    mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
    mockRecommendationFindUnique.mockResolvedValue(mockRecommendation);
    mockApprovalFindFirst.mockResolvedValue({
      id: "app-1",
      status: "APPROVED",
      snapshotAction: "\u062a\u0648\u0635\u064a\u0629 \u0645\u062e\u062a\u0644\u0641\u0629",
      snapshotRationale: "\u0623\u0633\u0628\u0627\u0628 \u0645\u062e\u062a\u0644\u0641\u0629",
      snapshotCreatedAt: new Date(),
      approverId: "user-2",
    });

    const result = await publishRecommendationAction("decision-1");

    expect(result.success).toBe(false);
    expect(result.requiresOverride).toBe(true);
  });

  it("force publishes when override provided", async () => {
    mockDecisionFindUnique
      .mockReset()
      .mockResolvedValue({ organizationId: "org-1" });
    mockRecommendationFindUnique.mockResolvedValue(mockRecommendation);
    mockApprovalFindFirst.mockResolvedValue({
      id: "app-1",
      status: "APPROVED",
      snapshotAction: "\u062a\u0648\u0635\u064a\u0629 \u0645\u062e\u062a\u0644\u0641\u0629",
      snapshotRationale: "\u0623\u0633\u0628\u0627\u0628 \u0645\u062e\u062a\u0644\u0641\u0629",
      snapshotCreatedAt: new Date(),
      approverId: "user-2",
    });
    mockRecommendationUpdate.mockResolvedValue({
      ...mockRecommendation,
      isClientVisible: true,
      publishedVersion: 2,
      publishedFromSnapshot: false,
    });

    const result = await publishRecommendationAction("decision-1", true);

    expect(result.success).toBe(true);
    expect(mockRecommendationUpdate).toHaveBeenCalled();
  });

  it("returns error when no recommendation exists", async () => {
    mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
    mockRecommendationFindUnique.mockResolvedValue(null);

    const result = await publishRecommendationAction("decision-1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Recommendation not found");
    }
  });

  it("handles unauthorized", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied: OPERATOR role required"));
    const result = await publishRecommendationAction("decision-1");
    expect(result.success).toBe(false);
  });
});

// ─── unpublishRecommendationAction ───

describe("unpublishRecommendationAction", () => {
  it("unpublishes recommendation successfully", async () => {
    mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
    mockRecommendationUpdate.mockResolvedValue({
      ...mockRecommendation,
      isClientVisible: false,
    });

    const result = await unpublishRecommendationAction("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isClientVisible).toBe(false);
    }
    expect(mockRecommendationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { decisionId: "decision-1" },
        data: expect.objectContaining({ isClientVisible: false }),
      })
    );
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await unpublishRecommendationAction("nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── getPublishedRecommendationViewAction ───

describe("getPublishedRecommendationViewAction", () => {
  it("returns published recommendation when visible", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      id: "decision-1",
      title: "\u0642\u0631\u0627\u0631",
      type: "INVESTMENT",
      organizationId: "org-1",
      recommendation: {
        ...mockRecommendation,
        isClientVisible: true,
        publishedAt: new Date(),
        publishedVersion: 2,
        publishedFromSnapshot: false,
        publishedApprovalId: null,
      },
    });

    const result = await getPublishedRecommendationViewAction("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("\u0642\u0631\u0627\u0631");
      expect(result.data.currentUserRole).toBe("ADMIN");
    }
  });

  it("returns error when not visible", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      id: "decision-1",
      title: "\u0642\u0631\u0627\u0631",
      type: "INVESTMENT",
      organizationId: "org-1",
      recommendation: {
        ...mockRecommendation,
        isClientVisible: false,
      },
    });

    const result = await getPublishedRecommendationViewAction("decision-1");
    expect(result.success).toBe(false);
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getPublishedRecommendationViewAction("nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── getWorkflowReadiness ───

describe("getWorkflowReadiness", () => {
  it("returns readiness status for complete decision", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      id: "decision-1",
      type: "INVESTMENT",
      priority: "HIGH",
      targetDate: new Date("2026-12-31"),
      objectives: [{ id: "obj-1" }],
      constraints: [],
      assumptions: [],
      alternatives: [],
      risks: [],
      framework: {
        context: "\u0633\u064a\u0627\u0642",
        purpose: "\u063a\u0631\u0636",
        options: "\u062e\u064a\u0627\u0631\u0627\u062a",
        criteria: "\u0645\u0639\u0627\u064a\u064a\u0631",
        values: "\u0642\u064a\u0645",
        informationGaps: null,
        certainty: null,
        assumptions: null,
      },
      decisionScenarios: [
        { id: "sc-1", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648 1", description: "\u0648\u0635\u0641", riskAnalysis: { id: "ra-1" } },
        { id: "sc-2", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648 2", description: "\u0648\u0635\u0641", riskAnalysis: { id: "ra-2" } },
        { id: "sc-3", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648 3", description: "\u0648\u0635\u0641", riskAnalysis: { id: "ra-3" } },
      ],
      scenarios: [{ id: "sc-1", simulation: { id: "sim-1" } }],
      recommendation: {
        recommendedAction: "\u062a\u0648\u0635\u064a\u0629",
        rationale: "\u0623\u0633\u0628\u0627\u0628",
      },
      organizationId: "org-1",
    });

    const result = await getWorkflowReadiness("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intakeAccepted).toBe(true);
      expect(result.data.frameworkComplete).toBe(true);
      expect(result.data.scenariosComplete).toBe(true);
      expect(result.data.risksComplete).toBe(true);
      expect(result.data.simulationReady).toBe(true);
      expect(result.data.recommendationReady).toBeTruthy();
      expect(result.data.derivedScores).toBeDefined();
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getWorkflowReadiness("nonexistent");
    expect(result.success).toBe(false);
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied"));
    const result = await getWorkflowReadiness("decision-1");
    expect(result.success).toBe(false);
  });
});
