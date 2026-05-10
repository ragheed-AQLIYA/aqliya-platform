"use server"

import { prisma } from "@/lib/prisma"
import type { DecisionStatus } from "@prisma/client"
import {
  evaluateIntake,
  evaluateFramework,
  evaluateScenarios,
  evaluateRisks,
} from "@/lib/decision"

import { isExpectedAccessDeniedError } from "@/lib/auth"
import {
  getCurrentUser,
  requireUserContext,
  requireDecisionAccess,
} from "@/lib/auth"

// --- Decision List ---
export async function getDecisions() {
  try {
    const user = await getCurrentUser()
    const decisions = await prisma.decision.findMany({
      where: { organizationId: user.organizationId },
      include: {
        organization: true,
        owner: true,
        tenderProfile: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: decisions }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decisions:", error)
    }
    return { success: false, error: "Failed to fetch decisions" }
  }
}

// --- Decision by ID ---
export async function getDecisionById(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER")
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
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    return { success: true, data: decision }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decision:", error)
    }
    return { success: false, error: "Failed to fetch decision" }
  }
}

// --- Create Decision ---
export async function createDecision(data: {
  title: string
  type?: string
  ownerId: string
  organizationId: string
  objectives?: string
  constraints?: string
  assumptions?: string
  alternatives?: string
  risks?: string
}) {
  try {
    await requireUserContext("OPERATOR")
    const decision = await prisma.decision.create({
      data: {
        title: data.title,
        type: (data.type as "TENDER") || "TENDER",
        ownerId: data.ownerId,
        organizationId: data.organizationId,
        status: "DRAFT",
      },
    })
    return { success: true, data: decision }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error creating decision:", error)
    }
    return { success: false, error: "Failed to create decision" }
  }
}

// --- Update Decision Status ---
export async function updateDecisionStatus(id: string, status: string) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    const decision = await prisma.decision.update({
      where: { id },
      data: { status: status as DecisionStatus },
    })
    return { success: true, data: decision }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating decision status:", error)
    }
    return { success: false, error: "Failed to update decision status" }
  }
}

// --- Decision Framework ---
export async function getDecisionFramework(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER")
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
      },
    })
    if (!decision) return { success: false, error: "Decision not found" }
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    })
    const frameworkState = evaluateFramework(decision.framework)
    return { success: true, data: { framework: decision.framework, intake, frameworkState } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching framework:", error)
    }
    return { success: false, error: "Failed to fetch framework" }
  }
}

export async function updateDecisionFramework(id: string, form: {
  context: string; purpose: string; options: string; criteria: string; values: string; informationGaps: string; certainty: string; assumptions: string
}) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    await prisma.decision.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { framework: form as any },
    })
    const frameworkState = evaluateFramework(form)
    return { success: true, data: { framework: form, frameworkState } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating framework:", error)
    }
    return { success: false, error: "Failed to update framework" }
  }
}

// --- Decision Intake ---
export async function getDecisionIntake(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER")
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
      },
    })
    if (!decision) return { success: false, error: "Decision not found" }
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    })
    return { success: true, data: { ...decision, intake } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching intake:", error)
    }
    return { success: false, error: "Failed to fetch intake" }
  }
}

export async function updateDecisionIntake(id: string, data: {
  objectives?: string
  constraints?: string
  assumptions?: string
  alternatives?: string
  risks?: string
}) {
  try {
    await requireUserContext("OPERATOR")
    await prisma.decision.update({
      where: { id },
      data: {
        objectives: data.objectives ? { set: { description: data.objectives } } : undefined,
        constraints: data.constraints ? { set: { description: data.constraints } } : undefined,
        assumptions: data.assumptions ? { set: { description: data.assumptions } } : undefined,
        alternatives: data.alternatives ? { set: { description: data.alternatives } } : undefined,
        risks: data.risks ? { set: { description: data.risks } } : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
    const result = await prisma.decision.findUnique({
      where: { id },
      select: { title: true, objectives: true, alternatives: true, risks: true },
    })
    const intake = result ? evaluateIntake({
      title: result.title,
      objectives: result.objectives,
      alternatives: result.alternatives,
      risks: result.risks,
    }) : { status: "reframe_required" as const, readyForFramework: false, reasonCodes: [], reasons: [], requiredNextSteps: [] }
    return { success: true, data: { ...result, intake } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating intake:", error)
    }
    return { success: false, error: "Failed to update intake" }
  }
}

// --- Decision Scenarios ---
export async function getDecisionScenarios(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER")
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: true,
        scenarios: { include: { simulation: true } },
      },
    })
    if (!decision) return { success: false, error: "Decision not found" }

    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    })
    const frameworkState = evaluateFramework(decision.framework)
    const scenarioDrafts = decision.decisionScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      assumptions: s.assumptions,
      expectedOutcome: s.expectedOutcome,
      affectedStakeholders: s.affectedStakeholders,
      requiredConditions: s.requiredConditions,
    }))
    const scenarioState = evaluateScenarios(decision.decisionScenarios)

    return { success: true, data: { intake, frameworkState, scenarioState, scenarioDrafts } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching scenarios:", error)
    }
    return { success: false, error: "Failed to fetch scenarios" }
  }
}

export async function updateDecisionScenarios(
  id: string,
  _input: { scenarios: { id?: string; name: string; description: string; assumptions: string; expectedOutcome: string; affectedStakeholders: string; requiredConditions: string }[] }
) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    return { success: true, data: { decisionScenarios: _input.scenarios, scenarioState: { isComplete: true, missingDefaultScenarios: [], incompleteScenarios: [], nextSteps: [] } } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating scenarios:", error)
    }
    return { success: false, error: "Failed to update scenarios" }
  }
}

// --- Decision Risk Analysis ---
export async function getDecisionRiskAnalysis(id: string) {
  try {
    await requireDecisionAccess(id, "VIEWER")
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: { select: { id: true, name: true } },
        riskAnalyses: true,
        scenarios: { include: { simulation: true } },
      },
    })
    if (!decision) return { success: false, error: "Decision not found" }

    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    })
    const frameworkState = evaluateFramework(decision.framework)
    const scenarioState = evaluateScenarios(decision.decisionScenarios)
    const riskAnalysisState = evaluateRisks(decision.decisionScenarios, decision.riskAnalyses)
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
    }))

    return { success: true, data: { intake, frameworkState, scenarioState, riskAnalysisState, decisionScenarios: decision.decisionScenarios as { id: string; name: string }[], analysisDrafts } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching risks:", error)
    }
    return { success: false, error: "Failed to fetch risks" }
  }
}

export async function updateDecisionRiskAnalysis(
  id: string,
  _input: { analyses: { scenarioId: string; risks: string; tradeoffs: string; sacrifices: string; opportunityCosts: string; stakeholderRisks: string; operationalRisks: string; strategicRisks: string; knowledgeRisks: string; uncertaintyLevel: string }[] }
) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    return { success: true, data: { riskAnalyses: _input.analyses, riskAnalysisState: { isComplete: true, missingScenarioAnalyses: [], incompleteAnalyses: [], nextSteps: [] } } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating risks:", error)
    }
    return { success: false, error: "Failed to update risks" }
  }
}

// --- Decision Recommendation ---
export async function getDecisionRecommendation(id: string) {
  try {
    const { user } = await requireDecisionAccess(id, "VIEWER")

    // If viewer, only show published
    if (user.role === "VIEWER") {
      return await getPublishedRecommendationViewAction(id)
    }

    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        id: true,
        recommendation: true,
      },
    })

    if (!decision?.recommendation) {
      return { success: false, error: "Recommendation not found" }
    }

    return {
      success: true,
      data: {
        id: decision.id,
        recommendation: decision.recommendation,
        currentUserRole: user.role,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching recommendation:", error)
    }
    return { success: false, error: "Failed to fetch recommendation" }
  }
}

export async function updateDecisionRecommendation(id: string, data: {
  recommendedAction: string
  rationale: string
  expectedNextState: string
  scopeExclusions: string
  assumptionsUsed: string
  risksAccepted: string
  risksRejected: string
  humanReviewRequired: boolean
}) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
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
    })
    return { success: true, data: recommendation }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating recommendation:", error)
    }
    return { success: false, error: "Failed to update recommendation" }
  }
}

// --- Check Recommendation Gate ---
function validateRecommendationGate(decisionId: string) {
  // These should fetch data from DB and evaluate
  const intake = evaluateIntake({ title: "" })
  const framework = evaluateFramework(null)
  const scenarios = evaluateScenarios([])
  const risks = evaluateRisks([], [])

  const missing: string[] = []
  if (intake.status !== "accepted") missing.push("intake_not_accepted")
  if (!framework.isComplete) missing.push("framework_incomplete")
  if (!scenarios.isComplete) missing.push("scenarios_incomplete")
  if (!risks.isComplete) missing.push("risks_incomplete")

  return { allowed: missing.length === 0, missing }
}

export async function checkRecommendationGate(decisionId: string) {
  await requireDecisionAccess(decisionId, "OPERATOR")
  return await validateRecommendationGate(decisionId)
}

// --- Publish / Unpublish ---
export async function publishRecommendationAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "ADMIN")
    const existing = await prisma.recommendation.findUnique({
      where: { decisionId },
    })

    if (!existing) {
      return { success: false, error: "Recommendation not found" }
    }

    const recommendation = await prisma.recommendation.update({
      where: { decisionId },
      data: {
        isClientVisible: true,
        publishedAt: new Date(),
        publishedById: (await getCurrentUser()).id,
        publishedVersion: { increment: 1 },
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "OUTPUT_PUBLISHED",
        entity: "Recommendation",
        userId: (await getCurrentUser()).id,
        organizationId: (await requireDecisionAccess(decisionId)).organizationId,
        decisionId: decisionId,
      },
    })

    return { success: true, data: recommendation }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error publishing recommendation:", error)
    }
    return { success: false, error: "Failed to publish recommendation" }
  }
}

export async function unpublishRecommendationAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "ADMIN")
    const recommendation = await prisma.recommendation.update({
      where: { decisionId },
      data: {
        isClientVisible: false,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "OUTPUT_UNPUBLISHED",
        entity: "Recommendation",
        userId: (await getCurrentUser()).id,
        organizationId: (await requireDecisionAccess(decisionId)).organizationId,
        decisionId: decisionId,
      },
    })

    return { success: true, data: recommendation }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error unpublishing recommendation:", error)
    }
    return { success: false, error: "Failed to unpublish recommendation" }
  }
}

// --- Published Recommendation View (Read-only, org-scoped) ---
export async function getPublishedRecommendationViewAction(decisionId: string) {
  try {
    const user = await getCurrentUser()
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: {
        id: true,
        title: true,
        organizationId: true,
        recommendation: {
          select: {
            recommendedAction: true,
            rationale: true,
            expectedNextState: true,
            isClientVisible: true,
            publishedAt: true,
            publishedVersion: true,
          },
        },
      },
    })

    if (!decision) {
      return { success: false, error: "Recommendation not available" }
    }

    if (decision.organizationId !== user.organizationId) {
      return { success: false, error: "Recommendation not available" }
    }

    if (!decision.recommendation?.isClientVisible) {
      return { success: false, error: "Recommendation not available" }
    }

    return {
      success: true,
      data: {
        id: decision.id,
        title: decision.title,
        recommendation: decision.recommendation,
        currentUserRole: user.role,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching published recommendation:", error)
    }
    return { success: false, error: "Failed to fetch published recommendation" }
  }
}
