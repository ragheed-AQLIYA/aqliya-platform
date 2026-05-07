"use server"

import { prisma } from "@/lib/prisma"
import type { DecisionStatus, UserRole } from "@prisma/client"
import {
  type DecisionIntake,
  type DecisionFramework,
  type DecisionScenario,
  type DecisionRiskAnalysis,
  type Recommendation,
  type Tender,
} from "@/lib/types/decision"
import {
  evaluateIntake,
  evaluateFramework,
  evaluateScenarios,
  evaluateRisks,
} from "@/lib/decision"
import { isExpectedAccessDeniedError } from "@/lib/auth"
import type { RequiredRole } from "@/lib/auth"
import {
  getCurrentUser,
  requireUserContext,
  requireOrgAccess,
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
    const { user, organizationId } = await requireDecisionAccess(id, "VIEWER")
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
    const user = await requireUserContext("OPERATOR")
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
      select: { framework: true },
    })
    return { success: true, data: decision?.framework as DecisionFramework }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching framework:", error)
    }
    return { success: false, error: "Failed to fetch framework" }
  }
}

export async function updateDecisionFramework(id: string, data: DecisionFramework) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    const decision = await prisma.decision.update({
      where: { id },
      data: { framework: data as any },
    })
    return { success: true, data: decision }
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
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
      },
    })
    return { success: true, data: decision as unknown as DecisionIntake }
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
    await requireDecisionAccess(id, "OPERATOR")
    const decision = await prisma.decision.update({
      where: { id },
      data: {
        objectives: data.objectives ? { set: { description: data.objectives } } : undefined,
        constraints: data.constraints ? { set: { description: data.constraints } } : undefined,
        assumptions: data.assumptions ? { set: { description: data.assumptions } } : undefined,
        alternatives: data.alternatives ? { set: { description: data.alternatives } } : undefined,
        risks: data.risks ? { set: { description: data.risks } } : undefined,
      } as any,
    })
    return { success: true, data: decision }
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
    const scenarios = await prisma.scenario.findMany({
      where: { decisionId: id },
      include: { simulation: true },
    })
    return { success: true, data: scenarios }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching scenarios:", error)
    }
    return { success: false, error: "Failed to fetch scenarios" }
  }
}

export async function updateDecisionScenarios(id: string, scenarios: DecisionScenario[]) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    // Implementation would go here
    return { success: true }
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
    const risks = await prisma.risk.findMany({
      where: { decisionId: id },
    })
    return { success: true, data: risks }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching risks:", error)
    }
    return { success: false, error: "Failed to fetch risks" }
  }
}

export async function updateDecisionRiskAnalysis(id: string, risks: DecisionRiskAnalysis) {
  try {
    await requireDecisionAccess(id, "OPERATOR")
    // Implementation would go here
    return { success: true }
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
        recommendation: (decision as any).recommendation,
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

export async function updateDecisionRecommendation(id: string, data: Recommendation) {
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
  const intake = evaluateIntake({ title: "" } as any)
  const framework = evaluateFramework({} as any)
  const scenarios = evaluateScenarios([])
  const risks = evaluateRisks({} as any)

  const missing: string[] = []
  if (!intake.accepted) missing.push("intake_not_accepted")
  if (!(framework as any).isComplete) missing.push("framework_incomplete")
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

    console.log({
      currentUser: user,
      decisionOrgId: decision.organizationId,
      recommendationVisible: decision.recommendation?.isClientVisible,
    })

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
