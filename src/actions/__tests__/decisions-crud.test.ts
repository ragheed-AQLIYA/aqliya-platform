// ─── Unit/Integration Test: DecisionOS CRUD Actions ───
// Tests intake, framework update, scenarios, and risk analysis actions.
// Uses mocked Prisma — no database required.

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
const mockDecisionUpdate = jest.fn();
const mockDecisionScenarioFindMany = jest.fn();
const mockDecisionScenarioFindFirst = jest.fn();
const mockDecisionScenarioCreate = jest.fn();
const mockDecisionScenarioUpdate = jest.fn();
const mockDecisionScenarioDeleteMany = jest.fn();
const mockDecisionRiskAnalysisFindMany = jest.fn();
const mockDecisionRiskAnalysisFindFirst = jest.fn();
const mockDecisionRiskAnalysisCreate = jest.fn();
const mockDecisionRiskAnalysisUpdate = jest.fn();
const mockDecisionObjectiveDeleteMany = jest.fn();
const mockDecisionObjectiveCreate = jest.fn();
const mockDecisionConstraintDeleteMany = jest.fn();
const mockDecisionConstraintCreate = jest.fn();
const mockDecisionAssumptionDeleteMany = jest.fn();
const mockDecisionAssumptionCreate = jest.fn();
const mockDecisionAlternativeDeleteMany = jest.fn();
const mockDecisionAlternativeCreate = jest.fn();
const mockDecisionRiskDeleteMany = jest.fn();
const mockDecisionRiskCreate = jest.fn();
const mockDecisionFrameworkUpsert = jest.fn();
const mockTransaction = jest.fn((ops) => Promise.all(ops));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findUnique: mockDecisionFindUnique,
      update: mockDecisionUpdate,
    },
    decisionScenario: {
      findMany: mockDecisionScenarioFindMany,
      findFirst: mockDecisionScenarioFindFirst,
      create: mockDecisionScenarioCreate,
      update: mockDecisionScenarioUpdate,
      deleteMany: mockDecisionScenarioDeleteMany,
    },
    decisionRiskAnalysis: {
      findMany: mockDecisionRiskAnalysisFindMany,
      findFirst: mockDecisionRiskAnalysisFindFirst,
      create: mockDecisionRiskAnalysisCreate,
      update: mockDecisionRiskAnalysisUpdate,
    },
    objective: {
      deleteMany: mockDecisionObjectiveDeleteMany,
      create: mockDecisionObjectiveCreate,
    },
    constraint: {
      deleteMany: mockDecisionConstraintDeleteMany,
      create: mockDecisionConstraintCreate,
    },
    assumption: {
      deleteMany: mockDecisionAssumptionDeleteMany,
      create: mockDecisionAssumptionCreate,
    },
    alternative: {
      deleteMany: mockDecisionAlternativeDeleteMany,
      create: mockDecisionAlternativeCreate,
    },
    risk: {
      deleteMany: mockDecisionRiskDeleteMany,
      create: mockDecisionRiskCreate,
    },
    decisionFramework: {
      upsert: mockDecisionFrameworkUpsert,
    },
    $transaction: mockTransaction,
  },
}));

// ─── Imports (after mocks) ───

import {
  getDecisionIntake,
  updateDecisionIntake,
  updateDecisionFramework,
  getDecisionScenarios,
  updateDecisionScenarios,
  getDecisionRiskAnalysis,
  updateDecisionRiskAnalysis,
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

const mockFramework = {
  id: "fw-1",
  decisionId: "decision-1",
  context: "\u0633\u064a\u0627\u0642 \u0627\u0644\u0642\u0631\u0627\u0631",
  purpose: "\u0627\u0644\u063a\u0631\u0636 \u0645\u0646 \u0627\u0644\u0642\u0631\u0627\u0631",
  options: "\u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629",
  criteria: "\u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u062a\u0642\u064a\u064a\u0645",
  values: "\u0627\u0644\u0642\u064a\u0645 \u0627\u0644\u0645\u0624\u0633\u0633\u064a\u0629",
  informationGaps: "\u0641\u062c\u0648\u0627\u062a \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a",
  certainty: "\u062f\u0631\u062c\u0629 \u0627\u0644\u064a\u0642\u064a\u0646",
  assumptions: "\u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u0627\u062a",
};

const mockDecisionLookup = { organizationId: "org-1" };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockEnforce.mockResolvedValue(undefined);
  mockDecisionFindUnique.mockResolvedValue(mockDecisionLookup);
  mockDecisionUpdate.mockResolvedValue({ id: "decision-1" });
  mockTransaction.mockResolvedValue([]);
});

// ─── getDecisionIntake ───

describe("getDecisionIntake", () => {
  it("returns intake data for the decision", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      title: "\u0642\u0631\u0627\u0631 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u064a",
      type: "INVESTMENT",
      objectives: [],
      constraints: [],
      assumptions: [],
      alternatives: [],
      risks: [],
      organizationId: "org-1",
    });

    const result = await getDecisionIntake("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("INVESTMENT");
      expect(result.data.intake).toBeDefined();
      expect(result.data.intake.status).toBe("accepted");
    }
    expect(mockEnforce).toHaveBeenCalled();
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);

    const result = await getDecisionIntake("nonexistent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Decision not found");
    }
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied: VIEWER role required"));

    const result = await getDecisionIntake("decision-1");

    expect(result.success).toBe(false);
  });
});

// ─── updateDecisionIntake ───

describe("updateDecisionIntake", () => {
  it("updates objectives successfully", async () => {
    mockDecisionFindUnique
      .mockReset()
      .mockResolvedValue(mockDecisionLookup);
    mockDecisionFindUnique
      .mockResolvedValueOnce(mockDecisionLookup)
      .mockResolvedValueOnce({
        title: "\u0642\u0631\u0627\u0631",
        objectives: [{ id: "obj-1", description: "\u0647\u062f\u0641 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a" }],
        alternatives: [],
        risks: [],
      });

    const result = await updateDecisionIntake("decision-1", {
      objectives: "\u0647\u062f\u0641 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intake).toBeDefined();
    }
    expect(mockDecisionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "decision-1" },
        data: expect.objectContaining({
          objectives: expect.objectContaining({
            deleteMany: {},
            create: expect.arrayContaining([
              expect.objectContaining({ description: "\u0647\u062f\u0641 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a" }),
            ]),
          }),
        }),
      })
    );
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockReset().mockResolvedValue(null);

    const result = await updateDecisionIntake("nonexistent", { objectives: "test" });
    expect(result.success).toBe(false);
  });

  it("handles unauthorized", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied: OPERATOR role required"));

    const result = await updateDecisionIntake("decision-1", { objectives: "test" });
    expect(result.success).toBe(false);
  });
});

// ─── updateDecisionFramework ───

describe("updateDecisionFramework", () => {
  it("updates framework successfully", async () => {
    const form = {
      context: "\u0633\u064a\u0627\u0642",
      purpose: "\u063a\u0631\u0636",
      options: "\u062e\u064a\u0627\u0631\u0627\u062a",
      criteria: "\u0645\u0639\u0627\u064a\u064a\u0631",
      values: "\u0642\u064a\u0645",
      informationGaps: "\u0641\u062c\u0648\u0627\u062a",
      certainty: "\u064a\u0642\u064a\u0646",
      assumptions: "\u0627\u0641\u062a\u0631\u0627\u0636\u0627\u062a",
    };
    mockDecisionFrameworkUpsert.mockResolvedValue({ id: "fw-1", ...form });

    const result = await updateDecisionFramework("decision-1", form);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.framework).toBeDefined();
      expect(result.data.frameworkState).toBeDefined();
      expect(result.data.frameworkState.isComplete).toBe(true);
    }
    expect(mockDecisionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "decision-1" },
        data: expect.objectContaining({
          framework: expect.objectContaining({
            upsert: expect.objectContaining({
              where: { decisionId: "decision-1" },
            }),
          }),
        }),
      })
    );
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockReset().mockResolvedValue(null);

    const result = await updateDecisionFramework("decision-1", {
      context: "", purpose: "", options: "", criteria: "", values: "",
      informationGaps: "", certainty: "", assumptions: "",
    });
    expect(result.success).toBe(false);
  });
});

// ─── getDecisionScenarios ───

describe("getDecisionScenarios", () => {
  it("returns scenarios data with evaluation", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      title: "\u0642\u0631\u0627\u0631",
      type: "INVESTMENT",
      objectives: [],
      alternatives: [],
      risks: [],
      framework: mockFramework,
      decisionScenarios: [
        { id: "sc-1", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648 1", description: "\u0648\u0635\u0641", assumptions: "", expectedOutcome: "", affectedStakeholders: "", requiredConditions: "" },
      ],
      scenarios: [],
      organizationId: "org-1",
    });

    const result = await getDecisionScenarios("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("INVESTMENT");
      expect(result.data.scenarioDrafts).toHaveLength(1);
      expect(result.data.scenarioState).toBeDefined();
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockReset().mockResolvedValue(null);
    const result = await getDecisionScenarios("nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── updateDecisionScenarios ───

describe("updateDecisionScenarios", () => {
  it("updates scenarios via transaction", async () => {
    mockDecisionFindUnique
      .mockReset()
      .mockResolvedValue({ organizationId: "org-1", decisionScenarios: [] });
    mockTransaction.mockResolvedValue([{ id: "sc-1" }]);
    mockDecisionScenarioFindMany.mockResolvedValue([
      { id: "sc-1", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648 1", description: "\u0648\u0635\u0641", assumptions: "", expectedOutcome: "", affectedStakeholders: "", requiredConditions: "" },
    ]);

    const result = await updateDecisionScenarios("decision-1", {
      scenarios: [{
        name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648 1",
        description: "\u0648\u0635\u0641",
        assumptions: "\u0627\u0641\u062a\u0631\u0627\u0636",
        expectedOutcome: "\u0646\u062a\u064a\u062c\u0629",
        affectedStakeholders: "\u0623\u0637\u0631\u0627\u0641",
        requiredConditions: "\u0634\u0631\u0648\u0637",
      }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.decisionScenarios).toHaveLength(1);
      expect(result.data.scenarioState).toBeDefined();
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockReset().mockResolvedValue(null);
    const result = await updateDecisionScenarios("decision-1", { scenarios: [] });
    expect(result.success).toBe(false);
  });
});

// ─── getDecisionRiskAnalysis ───

describe("getDecisionRiskAnalysis", () => {
  it("returns risk analysis data with evaluation", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      title: "\u0642\u0631\u0627\u0631",
      type: "INVESTMENT",
      objectives: [],
      alternatives: [],
      risks: [],
      framework: mockFramework,
      decisionScenarios: [{ id: "sc-1", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648" }],
      riskAnalyses: [],
      scenarios: [],
      organizationId: "org-1",
    });

    const result = await getDecisionRiskAnalysis("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("INVESTMENT");
      expect(result.data.riskAnalysisState).toBeDefined();
      expect(result.data.analysisDrafts).toEqual([]);
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockReset().mockResolvedValue(null);
    const result = await getDecisionRiskAnalysis("nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── updateDecisionRiskAnalysis ───

describe("updateDecisionRiskAnalysis", () => {
  it("updates risk analyses via transaction", async () => {
    mockDecisionFindUnique
      .mockReset()
      .mockResolvedValue(mockDecisionLookup);
    mockDecisionRiskAnalysisFindMany.mockResolvedValue([]);
    mockTransaction.mockResolvedValue([{ id: "ra-1" }]);
    mockDecisionRiskAnalysisFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: "ra-1", scenarioId: "sc-1", risks: "\u0645\u062e\u0627\u0637\u0631", tradeoffs: "\u0645\u0642\u0627\u064a\u0636\u0627\u062a", uncertaintyLevel: "MEDIUM" },
      ]);
    mockDecisionScenarioFindMany.mockResolvedValue([{ id: "sc-1", name: "\u0633\u064a\u0646\u0627\u0631\u064a\u0648" }]);

    const result = await updateDecisionRiskAnalysis("decision-1", {
      analyses: [{
        scenarioId: "sc-1",
        risks: "\u0645\u062e\u0627\u0637\u0631 \u0627\u0644\u0633\u0648\u0642",
        tradeoffs: "\u0645\u0642\u0627\u064a\u0636\u0627\u062a",
        sacrifices: "\u062a\u0636\u062d\u064a\u0627\u062a",
        opportunityCosts: "\u062a\u0643\u0627\u0644\u064a\u0641 \u0627\u0644\u0641\u0631\u0635\u0629",
        stakeholderRisks: "\u0645\u062e\u0627\u0637\u0631 \u0627\u0644\u0623\u0637\u0631\u0627\u0641",
        operationalRisks: "\u0645\u062e\u0627\u0637\u0631 \u062a\u0634\u063a\u064a\u0644\u064a\u0629",
        strategicRisks: "\u0645\u062e\u0627\u0637\u0631 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629",
        knowledgeRisks: "\u0645\u062e\u0627\u0637\u0631 \u0645\u0639\u0631\u0641\u064a\u0629",
        uncertaintyLevel: "MEDIUM",
      }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.riskAnalyses).toHaveLength(1);
      expect(result.data.riskAnalysisState).toBeDefined();
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockReset().mockResolvedValue(null);
    const result = await updateDecisionRiskAnalysis("decision-1", { analyses: [] });
    expect(result.success).toBe(false);
  });
});
