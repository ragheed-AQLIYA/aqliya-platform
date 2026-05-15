"use server"

import { prisma } from "@/lib/prisma"
import { isExpectedAccessDeniedError, requireDecisionAccess, getCurrentUser } from "@/lib/auth"
import type { OutcomeStatus, Prisma } from "@prisma/client"

export async function getDecisionOutcome(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER")

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: {
        id: true,
        status: true,
        recommendation: {
          select: {
            recommendedAction: true,
            expectedNextState: true,
          },
        },
        outcome: {
          include: {
            reviewedBy: true,
          },
        },
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    return {
      success: true,
      data: {
        decisionId: decision.id,
        decisionStatus: decision.status,
        expectedOutcome: decision.recommendation?.expectedNextState || null,
        outcome: decision.outcome,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching outcome:", error)
    }
    return { success: false, error: "Failed to fetch outcome" }
  }
}

export async function upsertDecisionOutcome(data: {
  decisionId: string
  expectedOutcome: string
  actualOutcome?: string
  outcomeStatus?: OutcomeStatus
  actualValue?: number
  expectedValue?: number
  lessonsLearned?: string
  followUpActions?: Prisma.InputJsonValue
}) {
  try {
    const access = await requireDecisionAccess(data.decisionId, "OPERATOR")
    const user = access.user

    const variance =
      data.actualValue != null && data.expectedValue != null
        ? data.actualValue - data.expectedValue
        : undefined

    const outcome = await prisma.decisionOutcome.upsert({
      where: { decisionId: data.decisionId },
      create: {
        decisionId: data.decisionId,
        expectedOutcome: data.expectedOutcome,
        actualOutcome: data.actualOutcome || null,
        outcomeStatus: data.outcomeStatus || "UNKNOWN",
        actualValue: data.actualValue,
        expectedValue: data.expectedValue,
        variance,
        lessonsLearned: data.lessonsLearned || null,
        followUpActions: data.followUpActions ?? undefined,
      },
      update: {
        expectedOutcome: data.expectedOutcome,
        actualOutcome: data.actualOutcome || null,
        outcomeStatus: data.outcomeStatus || "UNKNOWN",
        actualValue: data.actualValue,
        expectedValue: data.expectedValue,
        variance,
        lessonsLearned: data.lessonsLearned || null,
        followUpActions: data.followUpActions ?? undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        decisionId: data.decisionId,
        organizationId: user.organizationId,
        userId: user.id,
        action: outcome.createdAt === outcome.updatedAt ? "OUTCOME_CREATED" : "OUTCOME_UPDATED",
        entity: "DecisionOutcome",
        before: outcome.createdAt === outcome.updatedAt ? null : JSON.stringify({ status: outcome.outcomeStatus }),
        after: JSON.stringify({
          status: outcome.outcomeStatus,
          variance,
          hasActualOutcome: !!data.actualOutcome,
        }),
      },
    })

    return { success: true, data: outcome }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error upserting outcome:", error)
    }
    return { success: false, error: "Failed to save outcome" }
  }
}

export async function reviewDecisionOutcome(decisionId: string) {
  try {
    const access = await requireDecisionAccess(decisionId, "ADMIN")
    const user = access.user

    const outcome = await prisma.decisionOutcome.update({
      where: { decisionId },
      data: {
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      include: {
        reviewedBy: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        decisionId,
        organizationId: user.organizationId,
        userId: user.id,
        action: "OUTCOME_REVIEWED",
        entity: "DecisionOutcome",
        after: JSON.stringify({
          reviewedBy: user.name,
          reviewedAt: outcome.reviewedAt,
          status: outcome.outcomeStatus,
        }),
      },
    })

    return { success: true, data: outcome }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error reviewing outcome:", error)
    }
    return { success: false, error: "Failed to review outcome" }
  }
}

export async function calculateOutcomeVariance(expected: number | null, actual: number | null): Promise<number | null> {
  if (expected == null || actual == null) return null
  return actual - expected
}

export async function getOutcomeSummaryForDecision(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER")

    const outcome = await prisma.decisionOutcome.findUnique({
      where: { decisionId },
      include: {
        reviewedBy: true,
      },
    })

    if (!outcome) {
      return { success: false, error: "No outcome found" }
    }

    const variance = calculateOutcomeVariance(outcome.expectedValue, outcome.actualValue)

    return {
      success: true,
      data: {
        id: outcome.id,
        decisionId: outcome.decisionId,
        expectedOutcome: outcome.expectedOutcome,
        actualOutcome: outcome.actualOutcome,
        outcomeStatus: outcome.outcomeStatus,
        expectedValue: outcome.expectedValue,
        actualValue: outcome.actualValue,
        variance,
        lessonsLearned: outcome.lessonsLearned,
        followUpActions: outcome.followUpActions,
        reviewedBy: outcome.reviewedBy?.name || null,
        reviewedAt: outcome.reviewedAt,
        createdAt: outcome.createdAt,
        updatedAt: outcome.updatedAt,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching outcome summary:", error)
    }
    return { success: false, error: "Failed to fetch outcome summary" }
  }
}

export async function getOrganizationOutcomeMetrics() {
  try {
    const user = await getCurrentUser()

    const outcomes = await prisma.decisionOutcome.findMany({
      where: {
        decision: {
          organizationId: user.organizationId,
        },
      },
      include: {
        decision: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
      },
    })

    const totalOutcomes = outcomes.length
    const byStatus = outcomes.reduce((acc, o) => {
      acc[o.outcomeStatus] = (acc[o.outcomeStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const reviewedCount = outcomes.filter((o) => o.reviewedAt).length
    const missingReview = totalOutcomes - reviewedCount

    const decisionsWithOutcomes = outcomes.map((o) => ({
      id: o.decision.id,
      title: o.decision.title,
      type: o.decision.type,
      status: o.decision.status,
      outcomeStatus: o.outcomeStatus,
      reviewed: !!o.reviewedAt,
      variance: o.variance,
    }))

    return {
      success: true,
      data: {
        totalOutcomes,
        byStatus,
        reviewedCount,
        missingReview,
        decisionsWithOutcomes,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching outcome metrics:", error)
    }
    return { success: false, error: "Failed to fetch outcome metrics" }
  }
}
