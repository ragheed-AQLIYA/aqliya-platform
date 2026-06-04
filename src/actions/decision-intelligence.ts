"use server"

import { prisma } from "@/lib/prisma"
import { validateIntelligenceGate } from "@/lib/decision/intelligence-gate"
import { generateStrategicInsight } from "@/lib/decision/insight"
import { generateWhatToDoNow } from "@/lib/decision/what-to-do"
import { generateExecutiveOverview } from "@/lib/decision/overview"
import {
  mergeDecisionInsightWithAI,
  runGovernedDecisionAI,
} from "@/lib/decision/decision-ai-bridge"
import { isExpectedAccessDeniedError, requireDecisionAccess } from "@/lib/auth"

export async function getDecisionForIntelligence(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const gate = await validateIntelligenceGate(decisionId)
    if (!gate.allowed) {
      return { success: false, error: "Intelligence access blocked", missing: gate.missing }
    }

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: {
          orderBy: { createdAt: 'asc' },
          include: { riskAnalysis: true },
        },
        riskAnalyses: {
          include: { scenario: true },
          orderBy: { createdAt: 'asc' },
        },
        recommendation: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    return { success: true, data: decision }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error fetching decision for intelligence:', error)
    }
    return { success: false, error: "Failed to fetch decision" }
  }
}

export async function generateStrategicInsightAction(decisionId: string) {
  try {
    const access = await requireDecisionAccess(decisionId, "OPERATOR")
    const gate = await validateIntelligenceGate(decisionId)
    if (!gate.allowed) {
      return { success: false, error: "Intelligence access blocked", missing: gate.missing }
    }

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: {
          orderBy: { createdAt: 'asc' },
          include: { riskAnalysis: true },
        },
        riskAnalyses: {
          include: { scenario: true },
          orderBy: { createdAt: 'asc' },
        },
        recommendation: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    const base = generateStrategicInsight(decision)
    const ai = await runGovernedDecisionAI({
      decisionId,
      userId: access.user.id,
      userRole: access.user.role,
      focus: "insight",
    }).catch(() => null)
    const insight = mergeDecisionInsightWithAI(base, ai)
    return { success: true, data: insight }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error generating strategic insight:', error)
    }
    return { success: false, error: "Failed to generate strategic insight" }
  }
}

export async function generateWhatToDoNowAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const gate = await validateIntelligenceGate(decisionId)
    if (!gate.allowed) {
      return { success: false, error: "Intelligence access blocked", missing: gate.missing }
    }

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: {
          orderBy: { createdAt: 'asc' },
          include: { riskAnalysis: true },
        },
        riskAnalyses: {
          include: { scenario: true },
          orderBy: { createdAt: 'asc' },
        },
        recommendation: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    const whatToDo = generateWhatToDoNow(decision)
    return { success: true, data: whatToDo }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error generating what to do now:', error)
    }
    return { success: false, error: "Failed to generate what to do now" }
  }
}

export async function generateExecutiveOverviewAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const gate = await validateIntelligenceGate(decisionId)
    if (!gate.allowed) {
      return { success: false, error: "Intelligence access blocked", missing: gate.missing }
    }

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: {
          orderBy: { createdAt: 'asc' },
          include: { riskAnalysis: true },
        },
        riskAnalyses: {
          include: { scenario: true },
          orderBy: { createdAt: 'asc' },
        },
        recommendation: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    const overview = generateExecutiveOverview(decision)
    return { success: true, data: overview }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error generating executive overview:', error)
    }
    return { success: false, error: "Failed to generate executive overview" }
  }
}
