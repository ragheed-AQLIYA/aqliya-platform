// ─── Unit Test: Simulation Actions ───
// Tests runSimulationAndRecommendation and getSimulationResults
// Uses mocked Prisma and external dependencies — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("@/lib/platform/cache-strategy", () => ({
  getCachedOrFetch: jest.fn((_key, fn) => fn()),
  invalidateDashboardCaches: jest.fn(),
  DASHBOARD_CACHE_TTL_MS: 300000,
}));

const mockGetCurrentUser = jest.fn();
const mockIsExpectedAccessDenied = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
  hasRequiredRole: jest.fn().mockReturnValue(true),
  isExpectedAccessDeniedError: (...args) => mockIsExpectedAccessDenied(...args),
}));

const mockEnforce = jest.fn();
jest.mock("@/lib/kernel", () => ({
  enforce: mockEnforce,
}));

const mockAuditLoggerRecord = jest.fn();
jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({ record: mockAuditLoggerRecord })),
  Product: { DECISION_OS: "decision_os" },
}));

const mockDeriveScores = jest.fn();
const mockBuildScoringData = jest.fn();
const mockRunGenericSimulation = jest.fn();
const mockCanRunSimulation = jest.fn();
jest.mock("@/lib/simulation/simulation-engine", () => ({
  deriveScores: (...args) => mockDeriveScores(...args),
  buildScoringData: (...args) => mockBuildScoringData(...args),
  runGenericSimulation: (...args) => mockRunGenericSimulation(...args),
  canRunSimulation: (...args) => mockCanRunSimulation(...args),
}));

const mockTenderRunSimulation = jest.fn();
jest.mock("@/lib/simulation/tender-simulation", () => ({
  runSimulation: (...args) => mockTenderRunSimulation(...args),
}));

const mockGenerateRecommendation = jest.fn();
jest.mock("@/lib/recommendation/tender-recommendation", () => ({
  generateRecommendation: (...args) => mockGenerateRecommendation(...args),
}));

const mockCanGenerateRecommendation = jest.fn();
const mockGenerateGenericRecommendation = jest.fn();
jest.mock("@/lib/recommendation/recommendation-engine", () => ({
  canGenerateRecommendation: (...args) => mockCanGenerateRecommendation(...args),
  generateGenericRecommendation: (...args) => mockGenerateGenericRecommendation(...args),
}));

const mockGetScoreDrivers = jest.fn();
jest.mock("@/lib/simulation/decision-scoring", () => ({
  getScoreDrivers: (...args) => mockGetScoreDrivers(...args),
}));

// ─── Prisma mocks ───

const mockDecisionFindUnique = jest.fn();
const mockScenarioCreateMany = jest.fn();
const mockScenarioFindMany = jest.fn();
const mockSimulationResultUpdate = jest.fn();
const mockSimulationResultCreateMany = jest.fn();
const mockRecommendationFindUnique = jest.fn();
const mockRecommendationCreate = jest.fn();
const mockRecommendationUpdate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findUnique: mockDecisionFindUnique,
    },
    scenario: {
      createMany: mockScenarioCreateMany,
      findMany: mockScenarioFindMany,
    },
    simulationResult: {
      update: mockSimulationResultUpdate,
      createMany: mockSimulationResultCreateMany,
    },
    recommendation: {
      findUnique: mockRecommendationFindUnique,
      create: mockRecommendationCreate,
      update: mockRecommendationUpdate,
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

// ─── Imports (after mocks) ───

import { runSimulationAndRecommendation } from "@/actions/simulation/run/index";
import { getSimulationResults } from "@/actions/simulation/get-results";

// ─── Mock Data ───

const MOCK_USER = {
  id: "user-1",
  name: "مستخدم اختبار",
  email: "test@aqliya.com",
  organizationId: "org-1",
  role: "ADMIN",
};

const DECISION_ID = "decision-1";

function makeDecision(type = "INVESTMENT", overrides = {}) {
  return {
    id: DECISION_ID,
    type,
    status: "IN_REVIEW",
    priority: "HIGH",
    organizationId: "org-1",
    title: "قرار استثماري",
    description: "وصف القرار",
    targetDate: new Date("2026-12-31"),
    ownerId: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    owner: { id: "user-1", name: "مستخدم" },
    tenderProfile: null,
    risks: [{ level: "MEDIUM" }],
    objectives: [{ id: "obj-1", title: "هدف 1", weight: 50 }],
    constraints: [],
    assumptions: [],
    alternatives: [],
    framework: null,
    scenarios: [],
    decisionScenarios: [],
    recommendation: null,
    ...overrides,
  };
}

const MOCK_SCENARIO_SCORES = [
  {
    scenarioType: "BEST_CASE",
    feasibilityScore: 85,
    financialScore: 80,
    capacityScore: 75,
    riskScore: 70,
    strategicFitScore: 90,
    overallDecisionScore: 82,
  },
  {
    scenarioType: "EXPECTED_CASE",
    feasibilityScore: 70,
    financialScore: 65,
    capacityScore: 60,
    riskScore: 55,
    strategicFitScore: 75,
    overallDecisionScore: 67,
  },
];

// ─── Tests: runSimulationAndRecommendation ───

describe("runSimulationAndRecommendation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(MOCK_USER);
    mockEnforce.mockResolvedValue(undefined);
    mockIsExpectedAccessDenied.mockReturnValue(false);
  });

  it("returns error when authorizeForDecision returns null (decision not found)", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await runSimulationAndRecommendation("nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Decision not found");
  });

  it("returns error when decision not found after authorization", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ id: DECISION_ID, organizationId: "org-1" }) // authorizeForDecision
      .mockResolvedValueOnce(null); // findUnique inside run
    const result = await runSimulationAndRecommendation(DECISION_ID);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Decision not found");
  });

  it("runs generic simulation for non-TENDER decision and returns scores", async () => {
    const decision = makeDecision("INVESTMENT");
    mockDecisionFindUnique
      .mockResolvedValueOnce({ id: DECISION_ID, organizationId: "org-1" }) // authorize
      .mockResolvedValueOnce(decision); // run
    mockDeriveScores.mockReturnValue({
      strategicFitScore: 75,
      feasibilityScore: 70,
      riskScore: 60,
      confidenceScore: 68,
      dataQuality: "good",
      missingInputs: [],
    });
    mockCanRunSimulation.mockReturnValue({ canRun: true, missingInputs: [], recommendedNextStep: "" });
    mockRunGenericSimulation.mockReturnValue(MOCK_SCENARIO_SCORES.map((s) => ({
      ...s,
      scenarioType: s.scenarioType as "BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE",
    })));
    mockRecommendationFindUnique.mockResolvedValue(null);
    mockCanGenerateRecommendation.mockReturnValue({ canRun: true, missingInputs: [] });
    mockGenerateGenericRecommendation.mockReturnValue({
      recommendedAction: "متابعة",
      rationale: "التوصية بناءً على النتائج",
      expectedNextState: "approved",
      scopeExclusions: [],
      assumptionsUsed: [],
      risksAccepted: [],
      risksRejected: [],
      humanReviewRequired: true,
    });
    mockScenarioCreateMany.mockResolvedValue({ count: 2 });
    mockScenarioFindMany.mockResolvedValue([
      { id: "scenario-1", type: "BEST_CASE", simulation: null },
      { id: "scenario-2", type: "EXPECTED_CASE", simulation: null },
    ]);

    const result = await runSimulationAndRecommendation(DECISION_ID);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.scenarios).toHaveLength(2);
    expect(result.data!.decisionType).toBe("INVESTMENT");
  });

  it("runs tender simulation for TENDER decision type", async () => {
    const tenderProfile = {
      estimatedContractValue: 5_000_000,
      estimatedCost: 3_500_000,
      durationMonths: 24,
      requiredCapacity: 100,
      internalAvailableCapacity: 60,
      strategicFitScore: 80,
      riskLevel: "MEDIUM",
      marginEstimate: 0.3,
    };
    const decision = makeDecision("TENDER", { tenderProfile });
    mockDecisionFindUnique
      .mockResolvedValueOnce({ id: DECISION_ID, organizationId: "org-1" })
      .mockResolvedValueOnce(decision);
    mockTenderRunSimulation.mockReturnValue(MOCK_SCENARIO_SCORES.map((s) => ({
      ...s,
      scenarioType: s.scenarioType as "BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE",
    })));
    mockRecommendationFindUnique.mockResolvedValue(null);
    mockGenerateRecommendation.mockReturnValue({
      recommendedAction: "تقديم عرض",
      rationale: "تحليل العطاء يوصي بالتقديم",
      expectedNextState: "bid_submitted",
      scopeExclusions: [],
      assumptionsUsed: [],
      risksAccepted: [],
      risksRejected: [],
      humanReviewRequired: false,
    });

    const result = await runSimulationAndRecommendation(DECISION_ID);
    expect(result.success).toBe(true);
    expect(result.data!.decisionType).toBe("TENDER");
    expect(mockTenderRunSimulation).toHaveBeenCalledTimes(1);
  });

  it("returns error when simulation core fails", async () => {
    const decision = makeDecision("INVESTMENT");
    mockDecisionFindUnique
      .mockResolvedValueOnce({ id: DECISION_ID, organizationId: "org-1" })
      .mockResolvedValueOnce(decision);
    mockCanRunSimulation.mockReturnValue({
      canRun: false,
      missingInputs: ["strategicFitScore"],
      recommendedNextStep: "Complete all required inputs",
    });

    const result = await runSimulationAndRecommendation(DECISION_ID);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot run simulation");
  });

  it("catches unexpected errors and returns generic failure", async () => {
    mockDecisionFindUnique.mockRejectedValue(new Error("Unexpected DB error"));
    const result = await runSimulationAndRecommendation(DECISION_ID);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to run simulation");
  });

  it("suppresses expected access denied errors", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Access denied: insufficient permissions"));
    mockIsExpectedAccessDenied.mockReturnValue(true);
    const result = await runSimulationAndRecommendation(DECISION_ID);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to run simulation");
  });
});

// ─── Tests: getSimulationResults ───

describe("getSimulationResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(MOCK_USER);
    mockEnforce.mockResolvedValue(undefined);
    mockIsExpectedAccessDenied.mockReturnValue(false);
    mockGetScoreDrivers.mockReturnValue([]);
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);
    const result = await getSimulationResults(DECISION_ID);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Decision not found");
  });

  it("returns full simulation results for a decision with scenarios", async () => {
    const decision = makeDecision("INVESTMENT", {
      scenarios: [
        { id: "s1", type: "BEST_CASE", simulation: { id: "sim-1", overallDecisionScore: 82 } },
        { id: "s2", type: "EXPECTED_CASE", simulation: { id: "sim-2", overallDecisionScore: 67 } },
      ],
      recommendation: {
        id: "rec-1",
        decisionId: DECISION_ID,
        recommendedAction: "متابعة",
        rationale: "تحليل إيجابي",
        humanReviewRequired: true,
      },
    });
    mockDecisionFindUnique.mockResolvedValue(decision);
    mockBuildScoringData.mockReturnValue({
      objectives: [{ id: "obj-1", title: "هدف 1", weight: 50 }],
      risks: [{ level: "MEDIUM" }],
    });
    mockDeriveScores.mockReturnValue({
      strategicFitScore: 75,
      feasibilityScore: 70,
      riskScore: 60,
      confidenceScore: 68,
      dataQuality: "good",
      missingInputs: [],
    });

    const result = await getSimulationResults(DECISION_ID);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.scenarios).toHaveLength(2);
    expect(result.data!.decisionType).toBe("INVESTMENT");
    expect(result.data!.recommendation).toBeDefined();
    expect(result.data!.recommendation!.recommendedAction).toBe("متابعة");
    expect(result.data!.derivedScores.strategicFitScore).toBe(75);
  });

  it("returns null tenderProfile for non-TENDER decisions", async () => {
    const decision = makeDecision("INVESTMENT", { scenarios: [], recommendation: null });
    mockDecisionFindUnique.mockResolvedValue(decision);
    mockBuildScoringData.mockReturnValue({});
    mockDeriveScores.mockReturnValue({
      strategicFitScore: 0, feasibilityScore: 0, riskScore: 0, confidenceScore: 0, dataQuality: "poor", missingInputs: [],
    });

    const result = await getSimulationResults(DECISION_ID);
    expect(result.success).toBe(true);
    expect(result.data!.tenderProfile).toBeNull();
  });

  it("returns tenderProfile for TENDER decisions", async () => {
    const decision = makeDecision("TENDER", {
      tenderProfile: { estimatedContractValue: 5_000_000, estimatedCost: 3_500_000, durationMonths: 24, requiredCapacity: 100, internalAvailableCapacity: 60, strategicFitScore: 80, riskLevel: "MEDIUM", marginEstimate: 0.3 },
      scenarios: [],
      recommendation: null,
    });
    mockDecisionFindUnique.mockResolvedValue(decision);
    mockBuildScoringData.mockReturnValue({});
    mockDeriveScores.mockReturnValue({
      strategicFitScore: 0, feasibilityScore: 0, riskScore: 0, confidenceScore: 0, dataQuality: "poor", missingInputs: [],
    });

    const result = await getSimulationResults(DECISION_ID);
    expect(result.success).toBe(true);
    expect(result.data!.tenderProfile).toBeDefined();
    expect(result.data!.tenderProfile!.estimatedContractValue).toBe(5_000_000);
  });

  it("handles errors gracefully", async () => {
    mockDecisionFindUnique.mockRejectedValue(new Error("DB error"));
    const result = await getSimulationResults(DECISION_ID);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to fetch simulation results");
  });
});
