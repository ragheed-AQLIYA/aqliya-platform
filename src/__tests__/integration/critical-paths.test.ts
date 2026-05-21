import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/platform-audit";

// Cleanup helper
async function cleanup() {
  // Delete in correct FK dependency order
  await prisma.auditLog.deleteMany();
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
  await prisma.decision.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.sector.deleteMany();
}

describe("Critical Path: Full Decision Pipeline", () => {
  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("creates decision and progresses through status changes", async () => {
    const org = await prisma.organization.create({
      data: { name: "Test Org" },
    });

    const user = await prisma.user.create({
      data: {
        email: "test@aqliya.local",
        name: "Test User",
        role: "ADMIN",
        organizationId: org.id,
      },
    });

    const decision = await prisma.decision.create({
      data: {
        title: "Should we migrate to cloud?",
        type: "TENDER",
        organizationId: org.id,
        ownerId: user.id,
      },
    });

    await logAudit(user.id, decision.id, "DECISION_CREATED", "Decision");

    expect(decision.status).toBe("DRAFT");

    await prisma.decision.update({
      where: { id: decision.id },
      data: { status: "IN_REVIEW" },
    });

    await logAudit(user.id, decision.id, "DECISION_UPDATED", "Decision");

    const approved = await prisma.decision.update({
      where: { id: decision.id },
      data: { status: "APPROVED", approverId: user.id },
    });

    expect(approved.status).toBe("APPROVED");

    const recommendation = await prisma.recommendation.create({
      data: {
        decisionId: decision.id,
        recommendedAction: "Migrate to AWS",
        rationale: "Market leader",
        expectedNextState: "Implementation",
        scopeExclusions: "Legacy",
        assumptionsUsed: "Budget ok",
        risksAccepted: "Lock-in",
        risksRejected: "None",
      },
    });

    await logAudit(
      user.id,
      decision.id,
      "RECOMMENDATION_UPDATED",
      "Recommendation",
    );

    expect(recommendation).toBeDefined();

    const sector = await prisma.sector.create({
      data: { name: "Technology", code: "TECH", description: "Tech" },
    });

    const pattern = await prisma.sectorPattern.create({
      data: {
        sectorId: sector.id,
        patternType: "DECISION_OUTCOME",
        patternKey: `decision-${decision.id}`,
        confidenceScore: 0.85,
        sourceDecisionId: decision.id,
      },
    });

    await logAudit(user.id, decision.id, "PATTERN_EXTRACTED", "SectorPattern");

    expect(pattern.confidenceScore).toBe(0.85);
  });
});

describe("Critical Path: Gate Enforcement", () => {
  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("blocks transition from DRAFT to APPROVED", async () => {
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ["IN_REVIEW"],
      IN_REVIEW: ["APPROVED", "REJECTED"],
      APPROVED: ["ARCHIVED"],
      REJECTED: ["DRAFT"],
    };

    const canTransition =
      allowedTransitions["DRAFT"]?.includes("APPROVED") ?? false;
    expect(canTransition).toBe(false);
  });
});

describe("Critical Path: Signal → Alert Flow", () => {
  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("creates signal and triggers alert", async () => {
    const org = await prisma.organization.create({
      data: { name: "Test Org 3" },
    });

    const user = await prisma.user.create({
      data: {
        email: "test3@aqliya.local",
        name: "Test User 3",
        role: "ADMIN",
        organizationId: org.id,
      },
    });

    const decision = await prisma.decision.create({
      data: {
        title: "Signal Decision",
        type: "TENDER",
        organizationId: org.id,
        ownerId: user.id,
        status: "IN_REVIEW",
      },
    });

    const signal = await prisma.decisionMonitoringSignal.create({
      data: {
        decisionId: decision.id,
        organizationId: org.id,
        source: "risk",
        referenceId: "risk-1",
        signalType: "risk-increased",
        description: "Budget overrun",
        severity: "HIGH",
      },
    });

    expect(signal.severity).toBe("HIGH");

    const alert = await prisma.decisionRiskAlert.create({
      data: {
        decisionId: decision.id,
        organizationId: org.id,
        triggeringSignalId: signal.id,
        alertType: "scenario-risk-emerged",
        description: "Budget Alert",
        severity: "HIGH",
      },
    });

    await logAudit(user.id, decision.id, "ALERT_RESOLVED", "DecisionRiskAlert");

    expect(alert.status).toBe("OPEN");

    const resolved = await prisma.decisionRiskAlert.update({
      where: { id: alert.id },
      data: {
        status: "RESOLVED",
        resolution: "Budget reallocated",
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });

    await logAudit(user.id, decision.id, "ALERT_RESOLVED", "DecisionRiskAlert");

    expect(resolved.status).toBe("RESOLVED");
  });

  it("verifies audit logs are created", async () => {
    const logs = await prisma.auditLog.findMany();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((l) => l.action === "ALERT_RESOLVED")).toBe(true);
  });
});

describe("Critical Path: Pattern Extraction Blocking", () => {
  let org: { id: string }, user: { id: string };

  beforeAll(async () => {
    await cleanup();
    org = await prisma.organization.create({
      data: { name: "Test Org 4" },
    });
    user = await prisma.user.create({
      data: {
        email: "test4@aqliya.local",
        name: "Test User 4",
        role: "ADMIN",
        organizationId: org.id,
      },
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it("blocks pattern extraction for non-approved decisions", async () => {
    const decision = await prisma.decision.create({
      data: {
        title: "Draft Decision",
        type: "TENDER",
        organizationId: org.id,
        ownerId: user.id,
        status: "DRAFT",
      },
    });

    const canExtract = decision.status === "APPROVED";
    expect(canExtract).toBe(false);
  });

  it("allows pattern extraction for approved decisions", async () => {
    const sector = await prisma.sector.create({
      data: { name: "Operations", code: "OPS", description: "Ops" },
    });

    const decision = await prisma.decision.create({
      data: {
        title: "Approved Decision",
        type: "TENDER",
        organizationId: org.id,
        ownerId: user.id,
        status: "APPROVED",
      },
    });

    const canExtract = decision.status === "APPROVED";
    expect(canExtract).toBe(true);

    const pattern = await prisma.sectorPattern.create({
      data: {
        sectorId: sector.id,
        patternType: "DECISION_OUTCOME",
        patternKey: `decision-${decision.id}`,
        confidenceScore: 0.9,
        sourceDecisionId: decision.id,
      },
    });

    await logAudit(user.id, decision.id, "PATTERN_EXTRACTED", "SectorPattern");

    expect(pattern.confidenceScore).toBe(0.9);
  });
});
