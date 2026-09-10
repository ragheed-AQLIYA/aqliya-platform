import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ─── Mocks (hoisted before imports) ───

const mockGetCurrentUser = jest.fn();
const mockEnforce = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isExpectedAccessDeniedError: jest.fn(
    (error: Error) =>
      error?.message?.startsWith("Access denied:") ||
      error?.message === "Unauthenticated",
  ),
}));

jest.mock("@/lib/kernel", () => ({
  enforce: mockEnforce,
}));

jest.mock("@/lib/prisma", () => {
  return {
    prisma: {
      decision: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      objective: { create: jest.fn(), findMany: jest.fn() },
      constraint: { create: jest.fn(), findMany: jest.fn() },
      alternative: { create: jest.fn(), findMany: jest.fn() },
      risk: { create: jest.fn(), findMany: jest.fn() },
      decisionFramework: { create: jest.fn(), findUnique: jest.fn() },
      decisionScenario: { create: jest.fn(), findMany: jest.fn() },
      decisionRiskAnalysis: { create: jest.fn(), findMany: jest.fn() },
      recommendation: { create: jest.fn(), upsert: jest.fn() },
      approval: { create: jest.fn(), findMany: jest.fn() },
      decisionEvidence: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      decisionReport: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      platformAuditLog: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      organization: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
    },
  };
});

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "audit-1" }),
}));

jest.mock("@/lib/platform/notification/integration", () => ({
  notifyOnEvent: jest.fn().mockResolvedValue(undefined),
  registerProductChannels: jest.fn(),
  getProductChannels: jest.fn().mockReturnValue(["in_app"]),
}));

jest.mock("@/lib/observability/logger", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock("@/lib/core/workflow/decision-os-adapter", () => ({
  assertDecisionOsTransition: jest.fn(),
}));

jest.mock("@/actions/approval/common", () => ({
  buildSnapshotData: jest.fn(() => ({
    snapshotCreatedAt: new Date().toISOString(),
    snapshotOverrideReason: null,
  })),
}));

const mockLogAudit = jest.fn().mockResolvedValue({ id: "audit-log-1" });
jest.mock("@/lib/decision/decision-audit", () => ({
  logAudit: (...args: unknown[]) => mockLogAudit(...args),
  logDecisionAudit: (...args: unknown[]) => mockLogAudit(...args),
  getDecisionAuditLogs: jest.fn().mockResolvedValue([]),
  countDecisionAuditLogs: jest.fn().mockResolvedValue(0),
}));

// ─── Imports ───

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";

// ─── Helpers ───

function makeDecision(overrides: Record<string, unknown> = {}) {
  return {
    id: "decision-1",
    title: "Test Decision",
    type: "EXPANSION",
    organizationId: "org-1",
    ownerId: "user-1",
    status: "DRAFT",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

// ─── Test: Decision Lifecycle Stage Progression ───

describe("Decision Lifecycle: Stage Progression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (enforce as jest.Mock).mockResolvedValue(undefined);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      name: "Test User",
      role: "ADMIN",
      organizationId: "org-1",
    });
  });

  it("DRAFT decision can transition to IN_REVIEW via submit", async () => {
    const decision = makeDecision({ status: "DRAFT" });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);
    (prisma.decision.update as jest.Mock).mockResolvedValue({
      ...decision,
      status: "IN_REVIEW",
    });

    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    const result = await submitForReview("decision-1");

    expect(result.success).toBe(true);
    expect(prisma.decision.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "decision-1" },
        data: { status: "IN_REVIEW" },
      }),
    );
  });

  it("IN_REVIEW decision can transition to APPROVED via approve", async () => {
    const decision = makeDecision({
      status: "IN_REVIEW",
      recommendation: { id: "rec-1", recommendedAction: "Proceed" },
    });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);
    (prisma.decision.update as jest.Mock).mockResolvedValue({
      ...decision,
      status: "APPROVED",
    });
    (prisma.approval.create as jest.Mock).mockResolvedValue({ id: "approval-1" });

    const { approveDecision } = await import(
      "@/actions/approval/workflow/approve"
    );
    const result = await approveDecision("decision-1", "Strong case");

    expect(result.success).toBe(true);
    expect(prisma.decision.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "APPROVED" },
      }),
    );
  });

  it("DRAFT decision cannot be approved directly", async () => {
    const decision = makeDecision({ status: "DRAFT", recommendation: null });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);

    const { approveDecision } = await import(
      "@/actions/approval/workflow/approve"
    );
    const result = await approveDecision("decision-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("DRAFT");
  });

  it("APPROVED decision cannot be submitted for review", async () => {
    const decision = makeDecision({ status: "APPROVED" });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);

    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    const result = await submitForReview("decision-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("APPROVED");
  });

  it("IN_REVIEW decision cannot be submitted again", async () => {
    const decision = makeDecision({ status: "IN_REVIEW" });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);

    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    const result = await submitForReview("decision-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("IN_REVIEW");
  });
});

// ─── Test: Decision Intake Evaluation ───

describe("Decision Intake: Validation Rules", () => {
  it("accepts a well-formed decision intake", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "Should we expand to Riyadh?",
      objectives: [{ description: "Increase revenue" }],
      alternatives: [
        { description: "Open new office" },
        { description: "Do nothing" },
      ],
      risks: [{ description: "Market saturation" }],
    });
    expect(result.status).toBe("accepted");
    expect(result.readyForFramework).toBe(true);
    expect(result.reasonCodes).toHaveLength(0);
  });

  it("rejects information request disguised as decision", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "What is the current budget status?",
    });
    expect(result.status).toBe("rejected");
    expect(result.reasonCodes).toContain("information_request");
  });

  it("rejects routine action disguised as decision", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "Schedule the quarterly review meeting",
    });
    expect(result.status).toBe("rejected");
    expect(result.reasonCodes).toContain("routine_action");
  });

  it("rejects already-decided requests", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "We have already decided to expand",
    });
    expect(result.status).toBe("rejected");
    expect(result.reasonCodes).toContain("already_decided");
  });

  it("flags missing title", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      objectives: [{ description: "Growth" }],
      alternatives: [{ description: "A" }, { description: "B" }],
      risks: [{ description: "Risk" }],
    });
    expect(result.status).toBe("reframe_required");
    expect(result.reasonCodes).toContain("missing_title");
  });

  it("flags missing objectives", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "Should we expand?",
      objectives: [],
      alternatives: [{ description: "A" }, { description: "B" }],
      risks: [{ description: "Risk" }],
    });
    expect(result.status).toBe("reframe_required");
    expect(result.reasonCodes).toContain("missing_objective");
  });

  it("flags fewer than 2 alternatives", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "Should we expand?",
      objectives: [{ description: "Growth" }],
      alternatives: [{ description: "Only option" }],
      risks: [{ description: "Risk" }],
    });
    expect(result.status).toBe("reframe_required");
    expect(result.reasonCodes).toContain("missing_alternatives");
  });

  it("flags missing risks", async () => {
    const { evaluateDecisionIntake } = await import(
      "@/lib/core/decision/evaluators/intake"
    );
    const result = evaluateDecisionIntake({
      title: "Should we expand?",
      objectives: [{ description: "Growth" }],
      alternatives: [{ description: "A" }, { description: "B" }],
      risks: [],
    });
    expect(result.status).toBe("reframe_required");
    expect(result.reasonCodes).toContain("missing_uncertainty");
  });
});

// ─── Test: Framework Evaluation ───

describe("Decision Framework: Completeness Check", () => {
  it("reports complete when all 8 fields are filled", async () => {
    const { evaluateDecisionFramework } = await import(
      "@/lib/core/decision/evaluators/framework"
    );
    const result = evaluateDecisionFramework({
      context: "Market context",
      purpose: "Decision purpose",
      options: "Option A, B",
      criteria: "Cost, impact",
      values: "Efficiency",
      informationGaps: "None known",
      certainty: "Medium",
      assumptions: "Stable market",
    });
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.nextSteps).toContain(
      "Proceed to A-1.2 Scenarios & Optionality.",
    );
  });

  it("detects all missing fields on empty input", async () => {
    const { evaluateDecisionFramework } = await import(
      "@/lib/core/decision/evaluators/framework"
    );
    const result = evaluateDecisionFramework({});
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toHaveLength(8);
  });

  it("detects partially filled framework", async () => {
    const { evaluateDecisionFramework } = await import(
      "@/lib/core/decision/evaluators/framework"
    );
    const result = evaluateDecisionFramework({
      context: "Market context",
      purpose: "Decision purpose",
    });
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("options");
    expect(result.missingFields).toContain("criteria");
  });

  it("handles null input gracefully", async () => {
    const { evaluateDecisionFramework } = await import(
      "@/lib/core/decision/evaluators/framework"
    );
    const result = evaluateDecisionFramework(null);
    expect(result.isComplete).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
  });

  it("normalizes whitespace-only fields as empty", async () => {
    const { evaluateDecisionFramework } = await import(
      "@/lib/core/decision/evaluators/framework"
    );
    const result = evaluateDecisionFramework({
      context: "   ",
      purpose: "\t\n",
    });
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("context");
    expect(result.missingFields).toContain("purpose");
  });
});

// ─── Test: Scenario Evaluation ───

describe("Decision Scenarios: Default Scenario Requirements", () => {
  it("reports complete when all 3 default scenarios are present and filled", async () => {
    const { evaluateDecisionScenarios } = await import(
      "@/lib/core/decision/evaluators/scenarios"
    );
    const result = evaluateDecisionScenarios([
      {
        name: "Base case",
        description: "Expected",
        assumptions: "Normal",
        expectedOutcome: "Stable",
        affectedStakeholders: "All",
        requiredConditions: "None",
      },
      {
        name: "Upside case",
        description: "Best",
        assumptions: "Growth",
        expectedOutcome: "Profit",
        affectedStakeholders: "Investors",
        requiredConditions: "Funding",
      },
      {
        name: "Downside case",
        description: "Worst",
        assumptions: "Decline",
        expectedOutcome: "Loss",
        affectedStakeholders: "Employees",
        requiredConditions: "Reserves",
      },
    ]);
    expect(result.isComplete).toBe(true);
    expect(result.missingDefaultScenarios).toHaveLength(0);
  });

  it("detects missing default scenarios", async () => {
    const { evaluateDecisionScenarios } = await import(
      "@/lib/core/decision/evaluators/scenarios"
    );
    const result = evaluateDecisionScenarios([
      { name: "Custom scenario", description: "Custom" },
    ]);
    expect(result.isComplete).toBe(false);
    expect(result.missingDefaultScenarios).toContain("Base case");
    expect(result.missingDefaultScenarios).toContain("Upside case");
    expect(result.missingDefaultScenarios).toContain("Downside case");
  });

  it("detects incomplete scenarios with missing fields", async () => {
    const { evaluateDecisionScenarios } = await import(
      "@/lib/core/decision/evaluators/scenarios"
    );
    const result = evaluateDecisionScenarios([
      { name: "Base case" },
      { name: "Upside case", description: "Best case" },
      { name: "Downside case" },
    ]);
    expect(result.isComplete).toBe(false);
    expect(result.incompleteScenarios.length).toBeGreaterThan(0);
  });

  it("creates default scenarios when none exist", async () => {
    const { createDefaultDecisionScenarios } = await import(
      "@/lib/core/decision/evaluators/scenarios"
    );
    const result = createDefaultDecisionScenarios([]);
    expect(result).toHaveLength(3);
    const names = result.map((s) => s.name);
    expect(names).toContain("Base case");
    expect(names).toContain("Upside case");
    expect(names).toContain("Downside case");
  });

  it("does not duplicate existing default scenarios", async () => {
    const { createDefaultDecisionScenarios } = await import(
      "@/lib/core/decision/evaluators/scenarios"
    );
    const result = createDefaultDecisionScenarios([
      { name: "Base case", description: "Existing base" },
    ]);
    expect(result).toHaveLength(3);
    const baseCases = result.filter((s) => s.name === "Base case");
    expect(baseCases).toHaveLength(1);
    expect(baseCases[0].description).toBe("Existing base");
  });
});

// ─── Test: Risk Analysis Evaluation ───

describe("Decision Risk Analysis: Per-Scenario Completeness", () => {
  const scenarios = [
    { id: "s1", name: "Base case" },
    { id: "s2", name: "Upside case" },
    { id: "s3", name: "Downside case" },
  ];

  it("reports complete when all scenarios have full risk analysis", async () => {
    const { evaluateDecisionRiskAnalysis } = await import(
      "@/lib/core/decision/evaluators/risk-analysis"
    );
    const result = evaluateDecisionRiskAnalysis(scenarios, [
      {
        scenarioId: "s1", risks: "Low risk", tradeoffs: "Minor", sacrifices: "Time",
        opportunityCosts: "Revenue", stakeholderRisks: "Low", operationalRisks: "Medium",
        strategicRisks: "None", knowledgeRisks: "Low", uncertaintyLevel: "Medium",
      },
      {
        scenarioId: "s2", risks: "Medium risk", tradeoffs: "Significant", sacrifices: "Resources",
        opportunityCosts: "Growth", stakeholderRisks: "Medium", operationalRisks: "High",
        strategicRisks: "Low", knowledgeRisks: "Medium", uncertaintyLevel: "High",
      },
      {
        scenarioId: "s3", risks: "High risk", tradeoffs: "Critical", sacrifices: "Capital",
        opportunityCosts: "Market share", stakeholderRisks: "High", operationalRisks: "High",
        strategicRisks: "Medium", knowledgeRisks: "High", uncertaintyLevel: "Very High",
      },
    ]);
    expect(result.isComplete).toBe(true);
  });

  it("detects missing scenario analyses", async () => {
    const { evaluateDecisionRiskAnalysis } = await import(
      "@/lib/core/decision/evaluators/risk-analysis"
    );
    const result = evaluateDecisionRiskAnalysis(scenarios, []);
    expect(result.isComplete).toBe(false);
    expect(result.missingScenarioAnalyses).toContain("Base case");
    expect(result.missingScenarioAnalyses).toContain("Upside case");
    expect(result.missingScenarioAnalyses).toContain("Downside case");
  });

  it("detects incomplete analysis with missing fields", async () => {
    const { evaluateDecisionRiskAnalysis } = await import(
      "@/lib/core/decision/evaluators/risk-analysis"
    );
    const result = evaluateDecisionRiskAnalysis(scenarios, [
      { scenarioId: "s1", risks: "Low risk" },
    ]);
    expect(result.isComplete).toBe(false);
    expect(result.incompleteAnalyses.length).toBeGreaterThan(0);
  });

  it("creates default risk analyses for all scenarios", async () => {
    const { createDefaultRiskAnalyses } = await import(
      "@/lib/core/decision/evaluators/risk-analysis"
    );
    const result = createDefaultRiskAnalyses(scenarios);
    expect(result).toHaveLength(3);
    expect(result[0].scenarioId).toBe("s1");
    expect(result[1].scenarioId).toBe("s2");
    expect(result[2].scenarioId).toBe("s3");
  });
});

// ─── Test: Recommendation Evaluation ───

describe("Decision Recommendation: Completeness Check", () => {
  it("reports complete when all fields including humanReviewRequired=true", async () => {
    const { evaluateDecisionRecommendation } = await import(
      "@/lib/core/decision/evaluators/recommendation"
    );
    const result = evaluateDecisionRecommendation({
      recommendedAction: "Proceed with expansion",
      rationale: "Strong market indicators",
      expectedNextState: "Phase 1 starts",
      scopeExclusions: "International markets",
      assumptionsUsed: "8% CAGR continues",
      risksAccepted: "Initial investment risk",
      risksRejected: "Partnership dependency",
      humanReviewRequired: true,
    });
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it("reports incomplete when humanReviewRequired is false", async () => {
    const { evaluateDecisionRecommendation } = await import(
      "@/lib/core/decision/evaluators/recommendation"
    );
    const result = evaluateDecisionRecommendation({
      recommendedAction: "Proceed",
      rationale: "Good",
      expectedNextState: "Done",
      scopeExclusions: "None",
      assumptionsUsed: "Stable",
      risksAccepted: "Low",
      risksRejected: "None",
      humanReviewRequired: false,
    });
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("humanReviewRequired");
  });

  it("detects multiple missing fields", async () => {
    const { evaluateDecisionRecommendation } = await import(
      "@/lib/core/decision/evaluators/recommendation"
    );
    const result = evaluateDecisionRecommendation({
      recommendedAction: "Proceed",
    });
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("rationale");
    expect(result.missingFields).toContain("expectedNextState");
  });

  it("handles null/undefined input", async () => {
    const { evaluateDecisionRecommendation } = await import(
      "@/lib/core/decision/evaluators/recommendation"
    );
    const result = evaluateDecisionRecommendation(null);
    expect(result.isComplete).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
  });
});

// ─── Test: Decision Engine Progress ───

describe("Decision Engine: Progress Calculation", () => {
  it("calculates 0% progress for empty decision", async () => {
    const { getDecisionProgressSummary } = await import(
      "@/lib/core/decision/engine"
    );
    const { getDecisionTypeConfig } = await import(
      "@/lib/decision/decision-type-config"
    );
    const typeConfig = getDecisionTypeConfig("EXPANSION");
    const config = {
      modules: typeConfig.modules.map((m) => ({
        id: m.id, label: m.label, href: m.href,
        description: m.description, required: m.required,
      })),
      getStageEvaluator: () => null,
    };
    const summary = getDecisionProgressSummary(
      { id: "d1", type: "EXPANSION", title: "Empty", status: "DRAFT" },
      config,
    );
    expect(summary.percentage).toBe(0);
    expect(summary.completed).toBe(0);
  });

  it("returns all stages with optional status when no evaluators", async () => {
    const { getDecisionCompletionState } = await import(
      "@/lib/core/decision/engine"
    );
    const { getDecisionTypeConfig } = await import(
      "@/lib/decision/decision-type-config"
    );
    const typeConfig = getDecisionTypeConfig("EXPANSION");
    const config = {
      modules: typeConfig.modules.map((m) => ({
        id: m.id, label: m.label, href: m.href,
        description: m.description, required: m.required,
      })),
      getStageEvaluator: () => null,
    };
    const state = getDecisionCompletionState(
      { id: "d1", type: "EXPANSION", title: "Test", status: "DRAFT" },
      config,
    );
    expect(state.stages.every((s) => s.status === "optional")).toBe(true);
    expect(state.isComplete).toBe(true);
    expect(state.blockedStages).toHaveLength(0);
  });
});

// ─── Test: Decision Status Guard ───

describe("Decision Status Guards: Prevent Invalid Transitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (enforce as jest.Mock).mockResolvedValue(undefined);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1", email: "user@test.com", name: "Test User",
      role: "ADMIN", organizationId: "org-1",
    });
  });

  it("submitForReview requires DRAFT status", async () => {
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(
      makeDecision({ status: "IN_REVIEW" }),
    );
    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    const result = await submitForReview("decision-1");
    expect(result.success).toBe(false);
  });

  it("approveDecision requires IN_REVIEW status", async () => {
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(
      makeDecision({ status: "DRAFT", recommendation: null }),
    );
    const { approveDecision } = await import(
      "@/actions/approval/workflow/approve"
    );
    const result = await approveDecision("decision-1");
    expect(result.success).toBe(false);
  });

  it("submitForReview returns error for non-existent decision", async () => {
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(null);
    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    const result = await submitForReview("nonexistent");
    expect(result.success).toBe(false);
  });

  it("approveDecision returns error for non-existent decision", async () => {
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(null);
    const { approveDecision } = await import(
      "@/actions/approval/workflow/approve"
    );
    const result = await approveDecision("nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── Test: Audit Trail on Decision Lifecycle ───

describe("Decision Audit Trail: Lifecycle Events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (enforce as jest.Mock).mockResolvedValue(undefined);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1", email: "user@test.com", name: "Test User",
      role: "ADMIN", organizationId: "org-1",
    });
  });

  it("submitForReview logs SUBMITTED_FOR_REVIEW via logAudit", async () => {
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(
      makeDecision({ status: "DRAFT" }),
    );
    (prisma.decision.update as jest.Mock).mockResolvedValue(
      makeDecision({ status: "IN_REVIEW" }),
    );

    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    await submitForReview("decision-1");

    expect(mockLogAudit).toHaveBeenCalledWith(
      "user-1",
      "decision-1",
      "SUBMITTED_FOR_REVIEW",
      "Decision",
      expect.any(String),
      expect.any(String),
      "org-1",
    );
  });

  it("approveDecision logs DECISION_APPROVED via logAudit", async () => {
    const decision = makeDecision({
      status: "IN_REVIEW",
      recommendation: { id: "rec-1" },
    });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);
    (prisma.decision.update as jest.Mock).mockResolvedValue({
      ...decision,
      status: "APPROVED",
    });
    (prisma.approval.create as jest.Mock).mockResolvedValue({
      id: "approval-1",
    });

    const { approveDecision } = await import(
      "@/actions/approval/workflow/approve"
    );
    await approveDecision("decision-1", "Approved");

    expect(mockLogAudit).toHaveBeenCalledWith(
      "user-1",
      "decision-1",
      "DECISION_APPROVED",
      "Decision",
      expect.any(String),
      expect.any(String),
      "org-1",
    );
  });
});

// ─── Test: Tenant Isolation on Decision Actions ───

describe("Decision Actions: Tenant Isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: "user-1", email: "user@test.com", name: "Test User",
      role: "ADMIN", organizationId: "org-1",
    });
  });

  it("submitForReview calls enforce for tenant check", async () => {
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(
      makeDecision({ status: "DRAFT", organizationId: "org-1" }),
    );
    (prisma.decision.update as jest.Mock).mockResolvedValue(
      makeDecision({ status: "IN_REVIEW" }),
    );

    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    await submitForReview("decision-1");

    expect(enforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "decision", id: "decision-1" }),
      "update",
    );
  });

  it("approveDecision calls enforce with admin action", async () => {
    const decision = makeDecision({
      status: "IN_REVIEW",
      recommendation: { id: "rec-1" },
    });
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(decision);
    (prisma.decision.update as jest.Mock).mockResolvedValue({
      ...decision,
      status: "APPROVED",
    });
    (prisma.approval.create as jest.Mock).mockResolvedValue({
      id: "approval-1",
    });

    const { approveDecision } = await import(
      "@/actions/approval/workflow/approve"
    );
    await approveDecision("decision-1");

    expect(enforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "decision", id: "decision-1" }),
      "admin",
    );
  });

  it("submitForReview fails when enforce rejects", async () => {
    (enforce as jest.Mock).mockRejectedValue(
      new Error("Access denied: tenant mismatch"),
    );
    (prisma.decision.findUnique as jest.Mock).mockResolvedValue(
      makeDecision({ status: "DRAFT" }),
    );

    const { submitForReview } = await import(
      "@/actions/approval/workflow/submit"
    );
    const result = await submitForReview("decision-1");

    expect(result.success).toBe(false);
  });
});
