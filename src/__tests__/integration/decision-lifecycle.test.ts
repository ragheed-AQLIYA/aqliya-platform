import { prisma } from "@/lib/prisma";
import { submitForReview } from "@/actions/approval/workflow/submit";
import { approveDecision } from "@/actions/approval/workflow/approve";
import { exportDecisionReport } from "@/actions/decisions-workflow/export";
import { updateDecisionRecommendation } from "@/actions/decisions-workflow/recommendation";

// ─── Mocks (hoisted before imports) ───

jest.mock("@/lib/platform/notification/integration", () => ({
  notifyOnEvent: jest.fn().mockResolvedValue(undefined),
  registerProductChannels: jest.fn(),
  getProductChannels: jest.fn().mockReturnValue(["in_app"]),
}));

jest.mock("@/lib/auth", () => {
  const mockGetCurrentUser = jest.fn();
  return {
    getCurrentUser: mockGetCurrentUser,
    isExpectedAccessDeniedError: (error: Error) =>
      error?.message?.startsWith("Access denied:") || error?.message === "Unauthenticated",
  };
});

jest.mock("@/lib/kernel", () => ({
  enforce: jest.fn().mockResolvedValue(undefined),
}));

import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
// Decision created via prisma, audit events logged by actions

// ─── Helpers ───

async function cleanup() {
  await prisma.hashChainEntry?.deleteMany();
  await prisma.platformAuditLog?.deleteMany();
  await prisma.platformAuditLog.deleteMany();
  await prisma.decisionRiskAlert.deleteMany();
  await prisma.decisionMonitoringSignal.deleteMany();
  await prisma.decisionPattern.deleteMany();
  await prisma.decisionReport.deleteMany();
  await prisma.decisionRiskAnalysis.deleteMany();
  await prisma.decisionScenario.deleteMany();
  await prisma.decisionFramework.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.tenderProfile.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.constraint.deleteMany();
  await prisma.assumption.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.sectorPattern.deleteMany();
  await prisma.decisionEvidence.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

function mockUserContext(user: { id: string; email: string; name: string; role: string; organizationId: string }) {
  (getCurrentUser as jest.Mock).mockResolvedValue(user);
  (enforce as jest.Mock).mockResolvedValue(undefined);
}

// ─── Tests: Full Lifecycle ───

describe("DecisionOS Full Lifecycle", () => {
  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (enforce as jest.Mock).mockResolvedValue(undefined);
  });

  it("completes full lifecycle: create → intake → framework → scenarios → risks → recommendation → submit → approve → export", async () => {
    // ─── Setup org + user ───
    const org = await prisma.organization.create({
      data: { name: "Lifecycle Test Org" },
    });
    const user = await prisma.user.create({
      data: {
        email: "lifecycle@test.local",
        name: "Lifecycle Tester",
        role: "ADMIN",
        organizationId: org.id,
      },
    });
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    // ─── 1. Create decision in DRAFT ───
    const decision = await prisma.decision.create({
      data: {
        title: "Should we expand to Riyadh?",
        type: "EXPANSION",
        organizationId: org.id,
        ownerId: user.id,
        status: "DRAFT",
      },
    });
    expect(decision.status).toBe("DRAFT");
    expect(decision.title).toBe("Should we expand to Riyadh?");

    // ─── 2. Create intake data (objectives, alternatives, risks) ───
    await prisma.objective.create({
      data: { decisionId: decision.id, description: "Expand market presence in central region" },
    });
    await prisma.constraint.create({
      data: { decisionId: decision.id, description: "Budget limited to 5M SAR" },
    });
    await prisma.alternative.create({
      data: { decisionId: decision.id, description: "Partner with existing local firm" },
    });
    await prisma.risk.create({
      data: { decisionId: decision.id, description: "Market saturation risk", level: "MEDIUM" },
    });

    // Verify intake is accessible
    const objectives = await prisma.objective.findMany({ where: { decisionId: decision.id } });
    expect(objectives).toHaveLength(1);
    expect(objectives[0].description).toContain("market presence");

    // ─── 3. Create framework ───
    await prisma.decisionFramework.create({
      data: {
        decisionId: decision.id,
        context: "Riyadh market is growing rapidly with 8% CAGR",
        purpose: "Evaluate expansion feasibility under current constraints",
        options: "Build new office, Acquire local firm, Strategic partnership",
        criteria: "Cost, Speed, Risk, Cultural fit",
        values: "Growth, Efficiency, Local presence",
        informationGaps: "Competitor analysis incomplete, regulatory timeline unknown",
        certainty: "MEDIUM",
        assumptions: "Market growth continues at 8%, no regulatory changes",
      },
    });

    // Verify framework is accessible
    const framework = await prisma.decisionFramework.findUnique({
      where: { decisionId: decision.id },
    });
    expect(framework).not.toBeNull();
    expect(framework!.purpose).toContain("feasibility");

    // ─── 4. Create scenarios ───
    const scenario1 = await prisma.decisionScenario.create({
      data: {
        decisionId: decision.id,
        name: "Best Case - Fast Expansion",
        description: "Aggressive expansion with full new office",
        assumptions: "Market grows 10%, competitor slow to respond",
        expectedOutcome: "Revenue increase 30% within 18 months",
        affectedStakeholders: "Operations, Finance, HR",
        requiredConditions: "Board approval, 10M SAR budget allocation",
      },
    });
    const scenario2 = await prisma.decisionScenario.create({
      data: {
        decisionId: decision.id,
        name: "Conservative - Phased Approach",
        description: "Start with small team, scale gradually",
        assumptions: "Market grows 5%, careful resource allocation",
        expectedOutcome: "Revenue increase 15% within 24 months",
        affectedStakeholders: "Operations only",
        requiredConditions: "3M SAR initial budget, hire 5 staff",
      },
    });

    const scenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: decision.id },
    });
    expect(scenarios).toHaveLength(2);

    // ─── 5. Create risk analyses ───
    await prisma.decisionRiskAnalysis.create({
      data: {
        decisionId: decision.id,
        scenarioId: scenario1.id,
        risks: "High initial investment, market uncertainty",
        tradeoffs: "Speed vs Cost",
        sacrifices: "Short-term profitability",
        opportunityCosts: "Alternative investment opportunities",
        stakeholderRisks: "Employee relocation challenges",
        operationalRisks: "Logistics complexity in new region",
        strategicRisks: "Brand dilution if execution poor",
        knowledgeRisks: "Local market knowledge gap",
        uncertaintyLevel: "HIGH",
      },
    });
    await prisma.decisionRiskAnalysis.create({
      data: {
        decisionId: decision.id,
        scenarioId: scenario2.id,
        risks: "Slower growth, potential competitor advantage",
        tradeoffs: "Safety vs Speed",
        sacrifices: "Short-term market share",
        opportunityCosts: "First-mover advantage",
        stakeholderRisks: "Team morale if too slow",
        operationalRisks: "Managing hybrid team across cities",
        strategicRisks: "Missed window of opportunity",
        knowledgeRisks: "Need local expertise",
        uncertaintyLevel: "MEDIUM",
      },
    });

    const riskAnalyses = await prisma.decisionRiskAnalysis.findMany({
      where: { decisionId: decision.id },
    });
    expect(riskAnalyses).toHaveLength(2);

    // ─── 6. Create recommendation (via action using upsert) ───
    const recResult = await updateDecisionRecommendation(decision.id, {
      recommendedAction: "Proceed with phased expansion",
      rationale: "Riyadh market shows strong growth potential with manageable risk",
      expectedNextState: "Phase 1: Market study and office setup",
      scopeExclusions: "Non-core business lines and international expansion",
      assumptionsUsed: "Market growth 8%, no major regulatory changes",
      risksAccepted: "Initial investment risk, slower than competitors",
      risksRejected: "Partnership dependency risk",
      humanReviewRequired: true,
    });
    expect(recResult.success).toBe(true);
    expect(recResult.data).toBeDefined();

    // ─── 7. Submit for review (DRAFT → IN_REVIEW) ───
    const submitResult = await submitForReview(decision.id);
    expect(submitResult.success).toBe(true);
    const pendingDecision = await prisma.decision.findUnique({
      where: { id: decision.id },
    });
    expect(pendingDecision!.status).toBe("IN_REVIEW");

    // ─── 8. Approve decision (IN_REVIEW → APPROVED) ───
    const approveResult = await approveDecision(
      decision.id,
      "Strong business case with clear risk mitigation",
    );
    expect(approveResult.success).toBe(true);
    const approvedDecision = await prisma.decision.findUnique({
      where: { id: decision.id },
    });
    expect(approvedDecision!.status).toBe("APPROVED");

    // [MIGRATED] platformAuditLog.findMany → platformAuditLog.findMany with productKey: "decision_os"
    // const auditLogs = await prisma.platformAuditLog.findMany({
    //   where: { decisionId: decision.id },
    // });
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        productKey: "decision_os",
        targetId: decision.id,
      },
    });
    const recordedActions = auditLogs.map((l) => l.action);
    // Decision created via prisma directly (not action), so no DECISION_CREATED log
    // updateDecisionRecommendation does not log audit events
    expect(recordedActions).toContain("SUBMITTED_FOR_REVIEW");
    expect(recordedActions).toContain("DECISION_APPROVED");

    // ─── 9. Export report ───
    const exportResult = await exportDecisionReport(decision.id);
    expect(exportResult.success).toBe(true);
    if (exportResult.success) {
      expect(exportResult.content).toBeDefined();
      expect(typeof exportResult.content).toBe("string");
      expect(exportResult.content.length).toBeGreaterThan(100);
      expect(exportResult.filename).toContain("decision_report");
      expect(exportResult.mimeType).toBe("application/pdf");
    }
  });
});
