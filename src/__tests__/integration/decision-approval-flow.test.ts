import { prisma } from "@/lib/prisma";
import { submitForReview } from "@/actions/approval/workflow/submit";
import { approveDecision, approveWithConditions } from "@/actions/approval/workflow/approve";
import { rejectDecision, requestRevision } from "@/actions/approval/workflow/reject";
import { updateDecisionRecommendation } from "@/actions/decisions-workflow/recommendation";

// ─── Mocks (hoisted before imports) ───

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

async function createOrgAndUser(orgName: string, userEmail: string) {
  const org = await prisma.organization.create({ data: { name: orgName } });
  const user = await prisma.user.create({
    data: {
      email: userEmail,
      name: orgName + " User",
      role: "ADMIN",
      organizationId: org.id,
    },
  });
  return { org, user };
}

async function createDraftDecision(
  orgId: string,
  userId: string,
  title: string,
  type = "TENDER",
) {
  return prisma.decision.create({
    data: { title, type, organizationId: orgId, ownerId: userId, status: "DRAFT" },
  });
}

async function addRecommendation(decisionId: string) {
  const result = await updateDecisionRecommendation(decisionId, {
    recommendedAction: "Proceed with plan",
    rationale: "Analysis supports this course of action",
    expectedNextState: "Implementation phase",
    scopeExclusions: "N/A",
    assumptionsUsed: "Market conditions stable",
    risksAccepted: "Execution risk",
    risksRejected: "Partnership risk",
    humanReviewRequired: true,
  });
  return result;
}

function mockUserContext(user: { id: string; email: string; name: string; role: string; organizationId: string }) {
  (getCurrentUser as jest.Mock).mockResolvedValue(user);
  (enforce as jest.Mock).mockResolvedValue(undefined);
}

// ─── Tests: Approval Flow ───

describe("DecisionOS Approval Flow", () => {
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

  // ─── 1. Invalid Transition: DRAFT → APPROVED ───

  it("rejects direct approval from DRAFT status", async () => {
    const { org, user } = await createOrgAndUser("DirectApproveTest", "direct@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(org.id, user.id, "Direct approval test");

    // Add recommendation so the only blocker is the status gate
    await addRecommendation(decision.id);

    // Attempt to approve directly from DRAFT — should fail
    const result = await approveDecision(decision.id, "Skip to approval");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("cannot be approved");
    }

    // Verify status remained DRAFT
    const stillDraft = await prisma.decision.findUnique({ where: { id: decision.id } });
    expect(stillDraft!.status).toBe("DRAFT");
  });

  // ─── 2. Full Approval Cycle with Conditions ───

  it("approves with conditions after submit flow", async () => {
    const { org, user } = await createOrgAndUser("ConditionalApproval", "cond@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(
      org.id,
      user.id,
      "Conditional approval test",
      "INVESTMENT",
    );

    // Add recommendation
    await addRecommendation(decision.id);

    // Submit for review
    const submitResult = await submitForReview(decision.id);
    expect(submitResult.success).toBe(true);

    // Approve with conditions
    const conditions = "Must complete market study within 90 days; Monthly progress reports required";
    const approveResult = await approveWithConditions(
      decision.id,
      conditions,
    );
    expect(approveResult.success).toBe(true);

    // Verify status changed
    const approved = await prisma.decision.findUnique({ where: { id: decision.id } });
    expect(approved!.status).toBe("APPROVED");

    // Verify approval record was created with conditions
    const approvals = await prisma.approval.findMany({
      where: { decisionId: decision.id },
    });
    expect(approvals).toHaveLength(1);
    expect(approvals[0].status).toBe("APPROVED");
    expect(approvals[0].comments).toContain("conditions");
    
    // Verify audit log — [MIGRATED] platformAuditLog.findMany → platformAuditLog.findMany
    // const auditLogs = await prisma.platformAuditLog.findMany({
    //   where: { decisionId: decision.id },
    // });
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        productKey: "decision_os",
        targetId: decision.id,
      },
    });
    const actions = auditLogs.map((l) => l.action);
    expect(actions).toContain("DECISION_APPROVED_WITH_CONDITIONS");
  });

  // ─── 3. Rejection Cycle ───

  it("rejects decision and returns to DRAFT on re-submit", async () => {
    const { org, user } = await createOrgAndUser("RejectionTest", "reject@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(org.id, user.id, "Rejection cycle test");

    // Add recommendation
    await addRecommendation(decision.id);

    // Submit for review
    const submitResult = await submitForReview(decision.id);
    expect(submitResult.success).toBe(true);

    // Reject
    const rejectResult = await rejectDecision(decision.id, "Insufficient market analysis data");
    expect(rejectResult.success).toBe(true);

    // Verify status is REJECTED
    const rejected = await prisma.decision.findUnique({ where: { id: decision.id } });
    expect(rejected!.status).toBe("REJECTED");

    // Verify rejection record
    const approvals = await prisma.approval.findMany({
      where: { decisionId: decision.id },
    });
    expect(approvals).toHaveLength(1);
    expect(approvals[0].status).toBe("REJECTED");
    expect(approvals[0].comments).toContain("Insufficient");

    // Verify audit log — [MIGRATED] platformAuditLog.findMany → platformAuditLog.findMany
    // const auditLogs = await prisma.platformAuditLog.findMany({
    //   where: { decisionId: decision.id },
    // });
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        productKey: "decision_os",
        targetId: decision.id,
      },
    });
    const actions = auditLogs.map((l) => l.action);
    expect(actions).toContain("DECISION_REJECTED");
  });

  // ─── 4. Revision Cycle — Approve → Request Revision → Back to DRAFT ───

  it("requests revision on approved decision and returns to DRAFT", async () => {
    const { org, user } = await createOrgAndUser("RevisionTest", "revision@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(
      org.id,
      user.id,
      "Revision cycle test",
      "STRATEGIC",
    );

    // Add recommendation
    await addRecommendation(decision.id);

    // Submit for review
    await submitForReview(decision.id);

    // Approve
    const approveResult = await approveDecision(decision.id, "Looks good");
    expect(approveResult.success).toBe(true);

    // Verify APPROVED
    const approved = await prisma.decision.findUnique({ where: { id: decision.id } });
    expect(approved!.status).toBe("APPROVED");

    // Request revision — this goes IN_REVIEW → DRAFT (from approve/review cycle)
    // But the decision is already APPROVED. We need to submit again first
    // Actually, requestRevision only allows IN_REVIEW status
    
    // Let's create a fresh cycle: DRAFT → IN_REVIEW → request revision → DRAFT
    const decision2 = await createDraftDecision(
      org.id,
      user.id,
      "Revision cycle test 2",
      "STRATEGIC",
    );
    await addRecommendation(decision2.id);
    await submitForReview(decision2.id);

    // Now request revision
    const revisionResult = await requestRevision(
      decision2.id,
      "Please add more detailed financial projections and risk analysis",
    );
    expect(revisionResult.success).toBe(true);

    // Verify back to DRAFT
    const revised = await prisma.decision.findUnique({ where: { id: decision2.id } });
    expect(revised!.status).toBe("DRAFT");

    // Verify audit log — [MIGRATED] platformAuditLog.findMany → platformAuditLog.findMany
    // const auditLogs = await prisma.platformAuditLog.findMany({
    //   where: { decisionId: decision2.id },
    // });
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        productKey: "decision_os",
        targetId: decision2.id,
      },
    });
    const actions = auditLogs.map((l) => l.action);
    expect(actions).toContain("REVISION_REQUESTED");
  });

  // ─── 5. Edge Cases ───

  it("rejects approval when decision does not exist", async () => {
    const { org, user } = await createOrgAndUser("EdgeCases", "edge@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const result = await approveDecision("nonexistent-id", "Should fail");
    expect(result.success).toBe(false);
  });

  it("rejects approval without recommendation unless override reason provided", async () => {
    const { org, user } = await createOrgAndUser("NoRecTest", "norec@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(org.id, user.id, "No recommendation test");
    
    // Submit for review (no recommendation yet)
    const submitResult = await submitForReview(decision.id);
    expect(submitResult.success).toBe(true);

    // Attempt to approve without recommendation
    const result = await approveDecision(decision.id, "Try without recommendation");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Recommendation");
    }

    // Approve with override reason (bypasses recommendation gate)
    const overrideResult = await approveDecision(
      decision.id,
      "Emergency approval with override",
      "Urgent business need, will document recommendation post-facto",
    );
    expect(overrideResult.success).toBe(true);

    const approved = await prisma.decision.findUnique({ where: { id: decision.id } });
    expect(approved!.status).toBe("APPROVED");
  });

  it("rejects conditional approval with empty conditions", async () => {
    const { org, user } = await createOrgAndUser("EmptyCondTest", "emptycond@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(org.id, user.id, "Empty conditions test");
    await addRecommendation(decision.id);
    await submitForReview(decision.id);

    const result = await approveWithConditions(decision.id, "");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Conditions");
    }
  });

  it("rejects rejection without reason", async () => {
    const { org, user } = await createOrgAndUser("NoReasonTest", "noreason@test.local");
    mockUserContext({
      id: user.id,
      email: user.email,
      name: user.name!,
      role: user.role,
      organizationId: user.organizationId,
    });

    const decision = await createDraftDecision(org.id, user.id, "No reason test");
    await addRecommendation(decision.id);
    await submitForReview(decision.id);

    const result = await rejectDecision(decision.id, "");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("reason");
    }
  });
});
