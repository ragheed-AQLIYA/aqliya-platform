"use server";

import { prisma } from "@/lib/prisma";
import type { DecisionStatus } from "@prisma/client";
import {
  evaluateIntake,
  evaluateFramework,
  evaluateScenarios,
  evaluateRisks,
} from "@/lib/decision";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  getCurrentUser,
  requireUserContext,
  requireDecisionAccess,
} from "@/lib/auth";
import { logAudit, toAuditJson } from "@/lib/platform-audit";

// --- Decision List ---
export async function getDecisions() {
  try {
    const user = await getCurrentUser();
    const decisions = await prisma.decision.findMany({
      where: { organizationId: user.organizationId },
      include: {
        organization: true,
        owner: true,
        tenderProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: decisions };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decisions:", error);
    }
    return { success: false, error: "Failed to fetch decisions" };
  }
}

// --- Decision by ID ---
export async function getDecisionById(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER");
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        organization: true,
        owner: true,
        reviewer: true,
        approver: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        tenderProfile: true,
        scenarios: {
          include: { simulation: true },
        },
        framework: true,
        decisionScenarios: true,
        riskAnalyses: true,
        recommendation: true,
        approvals: {
          include: { approver: true },
        },
        auditLogs: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    return { success: true, data: decision };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decision:", error);
    }
    return { success: false, error: "Failed to fetch decision" };
  }
}

const VALID_DECISION_TYPES = [
  "TENDER",
  "INVESTMENT",
  "EXPANSION",
  "PROCUREMENT",
  "HIRING",
  "PARTNERSHIP",
  "PRICING",
  "STRATEGIC",
  "OPERATIONS",
  "CUSTOM",
] as const;
type ValidDecisionType = (typeof VALID_DECISION_TYPES)[number];

function isValidDecisionType(type: string): type is ValidDecisionType {
  return (VALID_DECISION_TYPES as readonly string[]).includes(type);
}

// --- Create Decision ---
export async function createDecision(data: {
  title: string;
  type?: string;
  description?: string;
  priority?: string;
  targetDate?: string;
  objectives?: string;
  constraints?: string;
  assumptions?: string;
  alternatives?: string;
  risks?: string;
}) {
  try {
    const user = await requireUserContext("OPERATOR");

    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: "Decision title is required" };
    }

    const decisionType = data.type || "TENDER";
    if (!isValidDecisionType(decisionType)) {
      return { success: false, error: `Invalid decision type: ${data.type}` };
    }

    const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

    const decision = await prisma.decision.create({
      data: {
        title: data.title.trim(),
        type: decisionType,
        description: data.description?.trim() || null,
        priority: data.priority || "MEDIUM",
        targetDate,
        ownerId: user.id,
        organizationId: user.organizationId,
        status: "DRAFT",
      },
    });

    await logAudit(
      user.id,
      decision.id,
      "DECISION_CREATED",
      "Decision",
      undefined,
      JSON.stringify({ title: decision.title, type: decision.type }),
      user.organizationId,
    );

    return { success: true, data: decision };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error creating decision:", error);
    }
    return { success: false, error: "Failed to create decision" };
  }
}

// --- Update Decision Status ---
export async function updateDecisionStatus(id: string, status: string) {
  try {
    await requireDecisionAccess(id, "OPERATOR");
    const decision = await prisma.decision.update({
      where: { id },
      data: { status: status as DecisionStatus },
    });
    return { success: true, data: decision };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating decision status:", error);
    }
    return { success: false, error: "Failed to update decision status" };
  }
}

// --- Decision Framework ---
export async function getDecisionFramework(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER");
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    const frameworkState = evaluateFramework(decision.framework);
    return {
      success: true,
      data: {
        type: decision.type,
        framework: decision.framework,
        intake,
        frameworkState,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching framework:", error);
    }
    return { success: false, error: "Failed to fetch framework" };
  }
}

export async function updateDecisionFramework(
  id: string,
  form: {
    context: string;
    purpose: string;
    options: string;
    criteria: string;
    values: string;
    informationGaps: string;
    certainty: string;
    assumptions: string;
  },
) {
  try {
    await requireDecisionAccess(id, "OPERATOR");
    await prisma.decision.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { framework: form as any },
    });
    const frameworkState = evaluateFramework(form);
    return { success: true, data: { framework: form, frameworkState } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating framework:", error);
    }
    return { success: false, error: "Failed to update framework" };
  }
}

// --- Decision Intake ---
export async function getDecisionIntake(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER");
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    return { success: true, data: { ...decision, intake } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching intake:", error);
    }
    return { success: false, error: "Failed to fetch intake" };
  }
}

export async function updateDecisionIntake(
  id: string,
  data: {
    objectives?: string;
    constraints?: string;
    assumptions?: string;
    alternatives?: string;
    risks?: string;
  },
) {
  try {
    await requireDecisionAccess(id, "OPERATOR");
    await prisma.decision.update({
      where: { id },
      data: {
        objectives: data.objectives
          ? { set: { description: data.objectives } }
          : undefined,
        constraints: data.constraints
          ? { set: { description: data.constraints } }
          : undefined,
        assumptions: data.assumptions
          ? { set: { description: data.assumptions } }
          : undefined,
        alternatives: data.alternatives
          ? { set: { description: data.alternatives } }
          : undefined,
        risks: data.risks ? { set: { description: data.risks } } : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    const result = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        alternatives: true,
        risks: true,
      },
    });
    const intake = result
      ? evaluateIntake({
          title: result.title,
          objectives: result.objectives,
          alternatives: result.alternatives,
          risks: result.risks,
        })
      : {
          status: "reframe_required" as const,
          readyForFramework: false,
          reasonCodes: [],
          reasons: [],
          requiredNextSteps: [],
        };
    return { success: true, data: { ...result, intake } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating intake:", error);
    }
    return { success: false, error: "Failed to update intake" };
  }
}

// --- Decision Scenarios ---
export async function getDecisionScenarios(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER");
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: true,
        scenarios: { include: { simulation: true } },
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };

    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    const frameworkState = evaluateFramework(decision.framework);
    const scenarioDrafts = decision.decisionScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      assumptions: s.assumptions,
      expectedOutcome: s.expectedOutcome,
      affectedStakeholders: s.affectedStakeholders,
      requiredConditions: s.requiredConditions,
    }));
    const scenarioState = evaluateScenarios(decision.decisionScenarios);

    return {
      success: true,
      data: {
        type: decision.type,
        intake,
        frameworkState,
        scenarioState,
        scenarioDrafts,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching scenarios:", error);
    }
    return { success: false, error: "Failed to fetch scenarios" };
  }
}

export async function updateDecisionScenarios(
  id: string,
  _input: {
    scenarios: {
      id?: string;
      name: string;
      description: string;
      assumptions: string;
      expectedOutcome: string;
      affectedStakeholders: string;
      requiredConditions: string;
    }[];
  },
) {
  try {
    await requireDecisionAccess(id, "OPERATOR");
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: { decisionScenarios: { select: { id: true } } },
    });
    const existingIds = new Set(
      decision?.decisionScenarios.map((s) => s.id) || [],
    );
    for (const scenario of _input.scenarios) {
      if (scenario.id && existingIds.has(scenario.id)) {
        await prisma.decisionScenario.update({
          where: { id: scenario.id },
          data: {
            name: scenario.name,
            description: scenario.description,
            assumptions: scenario.assumptions,
            expectedOutcome: scenario.expectedOutcome,
            affectedStakeholders: scenario.affectedStakeholders,
            requiredConditions: scenario.requiredConditions,
          },
        });
      } else {
        await prisma.decisionScenario.create({
          data: {
            decisionId: id,
            name: scenario.name,
            description: scenario.description,
            assumptions: scenario.assumptions,
            expectedOutcome: scenario.expectedOutcome,
            affectedStakeholders: scenario.affectedStakeholders,
            requiredConditions: scenario.requiredConditions,
          },
        });
      }
    }
    const updatedScenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: id },
    });
    const scenarioState = evaluateScenarios(updatedScenarios);
    return {
      success: true,
      data: { decisionScenarios: updatedScenarios, scenarioState },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating scenarios:", error);
    }
    return { success: false, error: "Failed to update scenarios" };
  }
}

// --- Decision Risk Analysis ---
export async function getDecisionRiskAnalysis(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER");
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: { select: { id: true, name: true } },
        riskAnalyses: true,
        scenarios: { include: { simulation: true } },
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };

    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    const frameworkState = evaluateFramework(decision.framework);
    const scenarioState = evaluateScenarios(decision.decisionScenarios);
    const riskAnalysisState = evaluateRisks(
      decision.decisionScenarios,
      decision.riskAnalyses,
    );
    const analysisDrafts = decision.riskAnalyses.map((r) => ({
      id: r.id,
      scenarioId: r.scenarioId,
      risks: r.risks,
      tradeoffs: r.tradeoffs,
      sacrifices: r.sacrifices,
      opportunityCosts: r.opportunityCosts,
      stakeholderRisks: r.stakeholderRisks,
      operationalRisks: r.operationalRisks,
      strategicRisks: r.strategicRisks,
      knowledgeRisks: r.knowledgeRisks,
      uncertaintyLevel: r.uncertaintyLevel,
    }));

    return {
      success: true,
      data: {
        type: decision.type,
        intake,
        frameworkState,
        scenarioState,
        riskAnalysisState,
        decisionScenarios: decision.decisionScenarios as {
          id: string;
          name: string;
        }[],
        analysisDrafts,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching risks:", error);
    }
    return { success: false, error: "Failed to fetch risks" };
  }
}

export async function updateDecisionRiskAnalysis(
  id: string,
  _input: {
    analyses: {
      scenarioId: string;
      risks: string;
      tradeoffs: string;
      sacrifices: string;
      opportunityCosts: string;
      stakeholderRisks: string;
      operationalRisks: string;
      strategicRisks: string;
      knowledgeRisks: string;
      uncertaintyLevel: string;
    }[];
  },
) {
  try {
    await requireDecisionAccess(id, "OPERATOR");
    for (const analysis of _input.analyses) {
      const existing = await prisma.decisionRiskAnalysis.findFirst({
        where: { decisionId: id, scenarioId: analysis.scenarioId },
      });
      if (existing) {
        await prisma.decisionRiskAnalysis.update({
          where: { id: existing.id },
          data: {
            risks: analysis.risks,
            tradeoffs: analysis.tradeoffs,
            sacrifices: analysis.sacrifices,
            opportunityCosts: analysis.opportunityCosts,
            stakeholderRisks: analysis.stakeholderRisks,
            operationalRisks: analysis.operationalRisks,
            strategicRisks: analysis.strategicRisks,
            knowledgeRisks: analysis.knowledgeRisks,
            uncertaintyLevel: analysis.uncertaintyLevel,
          },
        });
      } else {
        await prisma.decisionRiskAnalysis.create({
          data: {
            decisionId: id,
            scenarioId: analysis.scenarioId,
            risks: analysis.risks,
            tradeoffs: analysis.tradeoffs,
            sacrifices: analysis.sacrifices,
            opportunityCosts: analysis.opportunityCosts,
            stakeholderRisks: analysis.stakeholderRisks,
            operationalRisks: analysis.operationalRisks,
            strategicRisks: analysis.strategicRisks,
            knowledgeRisks: analysis.knowledgeRisks,
            uncertaintyLevel: analysis.uncertaintyLevel,
          },
        });
      }
    }
    const updatedAnalyses = await prisma.decisionRiskAnalysis.findMany({
      where: { decisionId: id },
      include: { scenario: true },
    });
    const scenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: id },
    });
    const riskAnalysisState = evaluateRisks(scenarios, updatedAnalyses);
    return {
      success: true,
      data: { riskAnalyses: updatedAnalyses, riskAnalysisState },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating risks:", error);
    }
    return { success: false, error: "Failed to update risks" };
  }
}

// --- Decision Recommendation ---
export async function getDecisionRecommendation(id: string) {
  try {
    const { user } = await requireDecisionAccess(id, "VIEWER");

    // If viewer, only show published
    if (user.role === "VIEWER") {
      return await getPublishedRecommendationViewAction(id);
    }

    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        recommendation: true,
      },
    });

    if (!decision?.recommendation) {
      return { success: false, error: "Recommendation not found" };
    }

    return {
      success: true,
      data: {
        id: decision.id,
        recommendation: decision.recommendation,
        decisionType: decision.type,
        currentUserRole: user.role,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching recommendation:", error);
    }
    return { success: false, error: "Failed to fetch recommendation" };
  }
}

export async function updateDecisionRecommendation(
  id: string,
  data: {
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    humanReviewRequired: boolean;
  },
) {
  try {
    await requireDecisionAccess(id, "OPERATOR");
    const recommendation = await prisma.recommendation.upsert({
      where: { decisionId: id },
      create: {
        decisionId: id,
        recommendedAction: data.recommendedAction,
        rationale: data.rationale,
        expectedNextState: data.expectedNextState,
        scopeExclusions: data.scopeExclusions,
        assumptionsUsed: data.assumptionsUsed,
        risksAccepted: data.risksAccepted,
        risksRejected: data.risksRejected,
        humanReviewRequired: data.humanReviewRequired ?? true,
      },
      update: {
        recommendedAction: data.recommendedAction,
        rationale: data.rationale,
        expectedNextState: data.expectedNextState,
        scopeExclusions: data.scopeExclusions,
        assumptionsUsed: data.assumptionsUsed,
        risksAccepted: data.risksAccepted,
        risksRejected: data.risksRejected,
        humanReviewRequired: data.humanReviewRequired ?? true,
      },
    });
    return { success: true, data: recommendation };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating recommendation:", error);
    }
    return { success: false, error: "Failed to update recommendation" };
  }
}

// --- Check Recommendation Gate ---
function validateRecommendationGate(decisionId: string) {
  // These should fetch data from DB and evaluate
  const intake = evaluateIntake({ title: "" });
  const framework = evaluateFramework(null);
  const scenarios = evaluateScenarios([]);
  const risks = evaluateRisks([], []);

  const missing: string[] = [];
  if (intake.status !== "accepted") missing.push("intake_not_accepted");
  if (!framework.isComplete) missing.push("framework_incomplete");
  if (!scenarios.isComplete) missing.push("scenarios_incomplete");
  if (!risks.isComplete) missing.push("risks_incomplete");

  return { allowed: missing.length === 0, missing };
}

export async function checkRecommendationGate(decisionId: string) {
  await requireDecisionAccess(decisionId, "OPERATOR");
  return await validateRecommendationGate(decisionId);
}

// --- Publish / Unpublish ---
export async function publishRecommendationAction(
  decisionId: string,
  forcePublishCurrent?: boolean,
) {
  try {
    const access = await requireDecisionAccess(decisionId, "ADMIN");
    const user = access.user;
    const existing = await prisma.recommendation.findUnique({
      where: { decisionId },
    });

    if (!existing) {
      return { success: false, error: "Recommendation not found" };
    }

    const latestApproval = await prisma.approval.findFirst({
      where: { decisionId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });

    const hasImmutableSnapshot = !!(
      latestApproval?.snapshotAction && latestApproval?.snapshotRationale
    );

    if (hasImmutableSnapshot && latestApproval) {
      const snapshotDiffers =
        latestApproval.snapshotAction !== existing.recommendedAction ||
        latestApproval.snapshotRationale !== existing.rationale;

      if (snapshotDiffers && !forcePublishCurrent) {
        await logAudit(
          user.id,
          decisionId,
          "STALE_PUBLISH_BLOCKED",
          "Recommendation",
          JSON.stringify({ currentVersion: existing.publishedVersion }),
          JSON.stringify({
            reason: "Current recommendation differs from approved snapshot",
            snapshotAction: latestApproval.snapshotAction,
            currentAction: existing.recommendedAction,
          }),
          access.organizationId,
        );

        return {
          success: false,
          error:
            "Current recommendation differs from approved snapshot. Publish the approved version or provide forcePublishCurrent override.",
          requiresOverride: true,
          snapshotInfo: {
            approvedAction: latestApproval.snapshotAction,
            currentAction: existing.recommendedAction,
            approvedAt: latestApproval.snapshotCreatedAt,
            approver: latestApproval.approverId,
          },
        };
      }

      if (snapshotDiffers && forcePublishCurrent) {
        await logAudit(
          user.id,
          decisionId,
          "STALE_PUBLISH_OVERRIDE",
          "Recommendation",
          JSON.stringify({ snapshotAction: latestApproval.snapshotAction }),
          JSON.stringify({
            publishedCurrentInstead: true,
            currentAction: existing.recommendedAction,
          }),
          access.organizationId,
        );

        const recommendation = await prisma.recommendation.update({
          where: { decisionId },
          data: {
            isClientVisible: true,
            publishedAt: new Date(),
            publishedById: user.id,
            publishedVersion: { increment: 1 },
            publishedFromSnapshot: false,
            publishedApprovalId: null,
          },
        });

        await logAudit(
          user.id,
          decisionId,
          "CURRENT_PUBLISHED_WITHOUT_APPROVAL",
          "Recommendation",
          undefined,
          JSON.stringify({
            version: recommendation.publishedVersion,
            fromSnapshot: false,
          }),
          access.organizationId,
        );

        return {
          success: true,
          data: recommendation,
          publishedFromSnapshot: false,
        };
      }

      const recommendation = await prisma.recommendation.update({
        where: { decisionId },
        data: {
          isClientVisible: true,
          publishedAt: new Date(),
          publishedById: user.id,
          publishedVersion: { increment: 1 },
          publishedFromSnapshot: true,
          publishedApprovalId: latestApproval.id,
        },
      });

      await logAudit(
        user.id,
        decisionId,
        "SNAPSHOT_PUBLISHED",
        "Recommendation",
        undefined,
        JSON.stringify({
          version: recommendation.publishedVersion,
          approvalId: latestApproval.id,
          fromSnapshot: true,
        }),
        access.organizationId,
      );

      return {
        success: true,
        data: recommendation,
        publishedFromSnapshot: true,
      };
    }

    const recommendation = await prisma.recommendation.update({
      where: { decisionId },
      data: {
        isClientVisible: true,
        publishedAt: new Date(),
        publishedById: user.id,
        publishedVersion: { increment: 1 },
        publishedFromSnapshot: false,
        publishedApprovalId: null,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "CURRENT_PUBLISHED_WITHOUT_APPROVAL",
      "Recommendation",
      undefined,
      JSON.stringify({
        version: recommendation.publishedVersion,
        fromSnapshot: false,
      }),
      access.organizationId,
    );

    return {
      success: true,
      data: recommendation,
      publishedFromSnapshot: false,
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error publishing recommendation:", error);
    }
    return { success: false, error: "Failed to publish recommendation" };
  }
}

export async function unpublishRecommendationAction(decisionId: string) {
  try {
    const access = await requireDecisionAccess(decisionId, "ADMIN");
    const user = access.user;
    const recommendation = await prisma.recommendation.update({
      where: { decisionId },
      data: {
        isClientVisible: false,
        publishedFromSnapshot: false,
        publishedApprovalId: null,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "OUTPUT_UNPUBLISHED",
      "Recommendation",
      undefined,
      undefined,
      access.organizationId,
    );

    return { success: true, data: recommendation };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error unpublishing recommendation:", error);
    }
    return { success: false, error: "Failed to unpublish recommendation" };
  }
}

// --- Published Recommendation View (Read-only, org-scoped) ---
export async function getPublishedRecommendationViewAction(decisionId: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: {
        id: true,
        title: true,
        type: true,
        organizationId: true,
        recommendation: {
          select: {
            recommendedAction: true,
            rationale: true,
            expectedNextState: true,
            scopeExclusions: true,
            assumptionsUsed: true,
            risksAccepted: true,
            risksRejected: true,
            isClientVisible: true,
            publishedAt: true,
            publishedVersion: true,
            publishedFromSnapshot: true,
            publishedApprovalId: true,
          },
        },
      },
    });

    if (!decision) {
      return { success: false, error: "Recommendation not available" };
    }

    if (decision.organizationId !== user.organizationId) {
      return { success: false, error: "Recommendation not available" };
    }

    if (!decision.recommendation?.isClientVisible) {
      return { success: false, error: "Recommendation not available" };
    }

    let contentSource:
      | "approved_snapshot"
      | "current_recommendation"
      | "legacy" = "current_recommendation";
    let snapshotMetadata = null;

    if (
      decision.recommendation.publishedFromSnapshot &&
      decision.recommendation.publishedApprovalId
    ) {
      const approval = await prisma.approval.findUnique({
        where: { id: decision.recommendation.publishedApprovalId },
        select: {
          snapshotAction: true,
          snapshotRationale: true,
          snapshotExpectedNextState: true,
          snapshotScopeExclusions: true,
          snapshotAssumptionsUsed: true,
          snapshotRisksAccepted: true,
          snapshotRisksRejected: true,
          snapshotConditions: true,
          snapshotConfidence: true,
          snapshotScore: true,
          snapshotCreatedAt: true,
          approver: { select: { name: true } },
        },
      });

      if (approval?.snapshotAction && approval.snapshotRationale) {
        contentSource = "approved_snapshot";
        snapshotMetadata = {
          approvedAt: approval.snapshotCreatedAt,
          approver: approval.approver?.name,
          conditions: approval.snapshotConditions,
          confidence: approval.snapshotConfidence,
          score: approval.snapshotScore,
        };
      }
    } else if (
      decision.recommendation.publishedAt &&
      !decision.recommendation.publishedFromSnapshot
    ) {
      const latestApproval = await prisma.approval.findFirst({
        where: { decisionId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: {
          snapshotAction: true,
          snapshotRationale: true,
          snapshotCreatedAt: true,
          approver: { select: { name: true } },
        },
      });

      if (latestApproval?.snapshotAction && latestApproval.snapshotRationale) {
        const matchesSnapshot =
          latestApproval.snapshotAction ===
            decision.recommendation.recommendedAction &&
          latestApproval.snapshotRationale ===
            decision.recommendation.rationale;

        if (matchesSnapshot) {
          contentSource = "approved_snapshot";
          snapshotMetadata = {
            approvedAt: latestApproval.snapshotCreatedAt,
            approver: latestApproval.approver?.name,
          };
        }
      } else if (latestApproval) {
        contentSource = "legacy";
      }
    }

    return {
      success: true,
      data: {
        id: decision.id,
        title: decision.title,
        recommendation: decision.recommendation,
        decisionType: decision.type,
        currentUserRole: user.role,
        contentSource,
        snapshotMetadata,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching published recommendation:", error);
    }
    return {
      success: false,
      error: "Failed to fetch published recommendation",
    };
  }
}

// --- Dashboard Metrics ---
export async function getDashboardMetrics() {
  try {
    const user = await getCurrentUser();

    const decisions = await prisma.decision.findMany({
      where: { organizationId: user.organizationId },
      include: {
        owner: true,
        recommendation: true,
        approvals: { include: { approver: true } },
        evidence: { select: { id: true } },
        objectives: true,
        constraints: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: true,
        riskAnalyses: true,
        outcome: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalDecisions = decisions.length;
    const byStatus = decisions.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byType = decisions.reduce(
      (acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byPriority = decisions.reduce(
      (acc, d) => {
        const p = d.priority || "MEDIUM";
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const approvedCount = decisions.filter((d) =>
      d.approvals.some((a) => a.status === "APPROVED"),
    ).length;

    const pendingApproval = decisions.filter(
      (d) =>
        d.recommendation && !d.approvals.some((a) => a.status === "APPROVED"),
    ).length;

    const draftCount = byStatus["DRAFT"] || 0;
    const inProgressCount = totalDecisions - draftCount - approvedCount;

    const completionRates = decisions.map((d) => {
      let stages = 0;
      let complete = 0;

      if (d.title) {
        stages++;
        complete++;
      }
      if (d.objectives.length > 0) {
        stages++;
        complete++;
      }
      if (d.framework) {
        stages++;
        complete++;
      }
      if (d.decisionScenarios.length >= 3) {
        stages++;
        complete++;
      }
      if (d.riskAnalyses.length > 0) {
        stages++;
        complete++;
      }
      if (d.recommendation) {
        stages++;
        complete++;
      }
      if (d.approvals.some((a) => a.status === "APPROVED")) {
        stages++;
        complete++;
      }

      return stages > 0 ? (complete / stages) * 100 : 0;
    });

    const avgCompletion =
      completionRates.length > 0
        ? Math.round(
            completionRates.reduce((a, b) => a + b, 0) / completionRates.length,
          )
        : 0;

    const evidenceBackedCount = decisions.filter(
      (d) => d.evidence.length > 0,
    ).length;
    const missingEvidenceCount = totalDecisions - evidenceBackedCount;
    const inReviewWithoutEvidence = decisions.filter(
      (d) => d.status === "IN_REVIEW" && d.evidence.length === 0,
    ).length;
    const humanReviewRequiredCount = decisions.filter(
      (d) => d.recommendation?.humanReviewRequired,
    ).length;
    const readyForReviewCount = decisions.filter(
      (d) =>
        d.status === "DRAFT" && !!d.recommendation && d.evidence.length > 0,
    ).length;
    const publishedWithoutSnapshotCount = decisions.filter(
      (d) =>
        d.recommendation?.isClientVisible &&
        !d.recommendation.publishedFromSnapshot,
    ).length;
    const highPriorityPendingApprovalCount = decisions.filter(
      (d) =>
        !!d.recommendation &&
        !d.approvals.some((a) => a.status === "APPROVED") &&
        ["HIGH", "CRITICAL"].includes(d.priority || ""),
    ).length;

    const recentDecisions = decisions.slice(0, 5).map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      status: d.status,
      priority: d.priority,
      createdAt: d.createdAt,
      hasRecommendation: !!d.recommendation,
      hasApproval: d.approvals.some((a) => a.status === "APPROVED"),
      hasEvidence: d.evidence.length > 0,
      humanReviewRequired: Boolean(d.recommendation?.humanReviewRequired),
      stageCount: [
        !!d.title,
        d.objectives.length > 0,
        !!d.framework,
        d.decisionScenarios.length >= 3,
        d.riskAnalyses.length > 0,
        !!d.recommendation,
        d.approvals.some((a) => a.status === "APPROVED"),
      ].filter(Boolean).length,
    }));

    const bottlenecks = decisions
      .filter((d) => {
        const hasFramework = !!d.framework;
        const hasScenarios = d.decisionScenarios.length >= 3;
        const hasRisks = d.riskAnalyses.length > 0;
        const hasRecommendation = !!d.recommendation;
        const hasApproval = d.approvals.some((a) => a.status === "APPROVED");

        return (
          (hasFramework && !hasScenarios) ||
          (hasScenarios && !hasRisks) ||
          (hasRisks && !hasRecommendation) ||
          (hasRecommendation && !hasApproval)
        );
      })
      .map((d) => {
        let stage = "Unknown";
        if (d.framework && d.decisionScenarios.length < 3) stage = "Scenarios";
        else if (d.decisionScenarios.length >= 3 && d.riskAnalyses.length === 0)
          stage = "Risk Analysis";
        else if (d.riskAnalyses.length > 0 && !d.recommendation)
          stage = "Recommendation";
        else if (
          d.recommendation &&
          !d.approvals.some((a) => a.status === "APPROVED")
        )
          stage = "Approval";
        return { id: d.id, title: d.title, stage, priority: d.priority };
      });

    const { buildOutcomeDashboardMetrics } = await import(
      "@/lib/decision/outcome-dashboard"
    );
    const outcomeInput = decisions.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      priority: d.priority,
      type: d.type,
      outcome: d.outcome
        ? {
            outcomeStatus: d.outcome.outcomeStatus,
            actualOutcome: d.outcome.actualOutcome,
            variance: d.outcome.variance,
            reviewedAt: d.outcome.reviewedAt,
            updatedAt: d.outcome.updatedAt,
          }
        : null,
    }));

    const outcomeMetrics = buildOutcomeDashboardMetrics(outcomeInput);

    const { buildOutcomeCorrelation } = await import(
      "@/lib/decision/outcome-correlation"
    );
    const outcomeCorrelation = buildOutcomeCorrelation(outcomeInput);

    const { buildDecisionPortfolioSnapshot } = await import(
      "@/lib/decision/decision-portfolio"
    );
    const portfolioSnapshot = buildDecisionPortfolioSnapshot(
      decisions.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        type: d.type,
        priority: d.priority,
      })),
    );

    return {
      success: true,
      data: {
        totalDecisions,
        byStatus,
        byType,
        byPriority,
        approvedCount,
        pendingApproval,
        draftCount,
        inProgressCount,
        avgCompletion,
        governanceMetrics: {
          evidenceBackedCount,
          missingEvidenceCount,
          inReviewWithoutEvidence,
          humanReviewRequiredCount,
          readyForReviewCount,
          publishedWithoutSnapshotCount,
          highPriorityPendingApprovalCount,
        },
        recentDecisions,
        bottlenecks,
        outcomeMetrics,
        outcomeCorrelation,
        portfolioSnapshot,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching dashboard metrics:", error);
    }
    return { success: false, error: "Failed to fetch dashboard metrics" };
  }
}

// --- Workflow Readiness ---
export async function getWorkflowReadiness(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: {
          include: {
            riskAnalysis: true,
          },
        },
        scenarios: { include: { simulation: true } },
        recommendation: true,
      },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    const intakeAccepted = true;
    const frameworkComplete = !!(
      decision.framework &&
      decision.framework.context &&
      decision.framework.purpose &&
      decision.framework.options &&
      decision.framework.criteria &&
      decision.framework.values
    );

    const scenariosComplete =
      decision.decisionScenarios.length >= 3 &&
      decision.decisionScenarios.every((s) => s.name && s.description);

    const risksComplete =
      decision.decisionScenarios.length > 0 &&
      decision.decisionScenarios.every((s) => s.riskAnalysis);

    const hasSimulationResults = decision.scenarios.some((s) => s.simulation);
    const simulationReady = hasSimulationResults;

    const recommendationReady =
      !!decision.recommendation &&
      decision.recommendation.recommendedAction &&
      decision.recommendation.rationale;

    const { deriveScores, buildScoringData } =
      await import("@/lib/simulation/simulation-engine");
    const scoringData = buildScoringData({
      objectives: decision.objectives,
      constraints: decision.constraints,
      assumptions: decision.assumptions,
      alternatives: decision.alternatives,
      risks: decision.risks,
      framework: decision.framework
        ? {
            context: decision.framework.context,
            purpose: decision.framework.purpose,
            options: decision.framework.options,
            criteria: decision.framework.criteria,
            values: decision.framework.values,
            informationGaps: decision.framework.informationGaps,
            certainty: decision.framework.certainty,
            assumptions: decision.framework.assumptions,
          }
        : null,
      decisionScenarios: decision.decisionScenarios.map((s) => ({
        name: s.name,
        description: s.description,
      })),
      priority: decision.priority,
      targetDate: decision.targetDate,
    });

    const derived = deriveScores(scoringData);

    return {
      success: true,
      data: {
        decisionType: decision.type,
        intakeAccepted,
        frameworkComplete,
        scenariosComplete,
        risksComplete,
        simulationReady,
        recommendationReady,
        dataQuality: derived.dataQuality,
        missingInputs: derived.missingInputs,
        derivedScores: {
          strategicFitScore: derived.strategicFitScore,
          feasibilityScore: derived.feasibilityScore,
          riskScore: derived.riskScore,
          confidenceScore: derived.confidenceScore,
        },
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching workflow readiness:", error);
    }
    return { success: false, error: "Failed to fetch workflow readiness" };
  }
}

// --- Export Decision Report (PDF) ---
export async function exportDecisionReport(decisionId: string) {
  try {
    const user = await requireUserContext("OPERATOR");
    const decision = (await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        owner: true,
        organization: true,
        tenderProfile: true,
        scenarios: {
          include: { simulation: true },
        },
        recommendation: true,
        auditLogs: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })) as unknown as {
      id: string;
      title: string;
      status: string;
      organizationId: string;
      owner: { name: string | null } | null;
      organization: { name: string | null } | null;
      createdAt: Date;
      tenderProfile: {
        clientName: string;
        estimatedContractValue: number;
        estimatedCost: number;
        durationMonths: number;
        marginEstimate: number;
        riskLevel: string;
        requiredCapacity: number;
        internalAvailableCapacity: number;
        strategicFitScore: number;
      } | null;
      recommendation: {
        type: string;
        confidenceScore: number | null;
        reasoning: string | null;
        conditions: string | null;
        riskNotes: string | null;
      } | null;
      scenarios: {
        type: string;
        simulation: {
          feasibilityScore: number;
          financialScore: number;
          capacityScore: number;
          riskScore: number;
          strategicFitScore: number;
          overallDecisionScore: number;
        } | null;
      }[];
      auditLogs: {
        action: string;
        user: { name: string | null } | null;
        createdAt: Date;
      }[];
    };

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    if (decision.organizationId !== user.organizationId) {
      return { success: false, error: "Access denied" };
    }

    const { buildDecisionReportPDF } = await import("@/lib/decisions/export");

    const pdfResult = await buildDecisionReportPDF({
      decisionId,
      title: decision.title,
      status: decision.status,
      ownerName: decision.owner?.name ?? null,
      organizationName: decision.organization?.name ?? null,
      createdAt: decision.createdAt,
      recommendation: decision.recommendation
        ? {
            type: decision.recommendation.type,
            confidenceScore: decision.recommendation.confidenceScore,
            reasoning: decision.recommendation.reasoning,
            conditions: decision.recommendation.conditions,
            riskNotes: decision.recommendation.riskNotes,
          }
        : null,
      tenderProfile: decision.tenderProfile
        ? {
            clientName: decision.tenderProfile.clientName,
            estimatedContractValue: decision.tenderProfile.estimatedContractValue,
            estimatedCost: decision.tenderProfile.estimatedCost,
            durationMonths: decision.tenderProfile.durationMonths,
            marginEstimate: decision.tenderProfile.marginEstimate,
            riskLevel: String(decision.tenderProfile.riskLevel),
            requiredCapacity: String(decision.tenderProfile.requiredCapacity),
            internalAvailableCapacity: String(decision.tenderProfile.internalAvailableCapacity),
            strategicFitScore: decision.tenderProfile.strategicFitScore,
          }
        : null,
      scenarios: decision.scenarios.map((s) => ({
        type: s.type,
        feasibilityScore: s.simulation?.feasibilityScore ?? null,
        financialScore: s.simulation?.financialScore ?? null,
        capacityScore: s.simulation?.capacityScore ?? null,
        riskScore: s.simulation?.riskScore ?? null,
        strategicFitScore: s.simulation?.strategicFitScore ?? null,
        overallDecisionScore: s.simulation?.overallDecisionScore ?? null,
      })),
      auditLogs: decision.auditLogs.map((log) => ({
        action: log.action,
        userName: log.user?.name ?? null,
        createdAt: log.createdAt,
      })),
      exportedAt: new Date(),
      exportedById: user.id,
    });

    await logAudit(
      user.id,
      decisionId,
      "OUTPUT_PUBLISHED",
      "DecisionReport",
      undefined,
      JSON.stringify({ format: "pdf", exportedAt: new Date().toISOString() }),
      user.organizationId,
    );

    return {
      success: true,
      content: pdfResult.content.toString("base64"),
      mimeType: pdfResult.mimeType,
      filename: pdfResult.filename,
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error exporting decision report:", error);
    }
    return { success: false, error: "Failed to export decision report" };
  }
}
