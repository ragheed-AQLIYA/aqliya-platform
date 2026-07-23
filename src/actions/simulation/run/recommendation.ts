"use server"

import { prisma } from "@/lib/prisma"
import { generateRecommendation } from "@/lib/recommendation/tender-recommendation"
import { generateGenericRecommendation, canGenerateRecommendation, type RecommendationInput } from "@/lib/recommendation/recommendation-engine"
import { deriveScores } from "@/lib/simulation/simulation-engine"
import { buildScoringInputFromDecision } from "../common"
import type { ScenarioScore } from "./common"
import type { ScenarioScores } from "@/lib/simulation/tender-simulation"

export async function handleRecommendation(
  decision: {
    id: string
    type: string
    tenderProfile: {
      riskLevel: string
      marginEstimate: number
    } | null
    risks: { level: string }[]
    priority?: string | null
    targetDate?: Date | null
    objectives: unknown
    constraints: unknown
    assumptions: unknown
    alternatives: unknown
    framework: unknown
  },
  scenarioScores: ScenarioScore[],
): Promise<void> {
  if (decision.type === "TENDER" && decision.tenderProfile) {
    const recommendationInput = {
      riskLevel: decision.tenderProfile.riskLevel as "LOW" | "MEDIUM" | "HIGH",
      marginEstimate: decision.tenderProfile.marginEstimate,
    }
    const recommendation = generateRecommendation(scenarioScores as ScenarioScores[], recommendationInput)

    const existingRecommendation = await prisma.recommendation.findUnique({
      where: { decisionId: decision.id },
    })

    if (existingRecommendation) {
      await prisma.recommendation.update({
        where: { id: existingRecommendation.id },
        data: {
          recommendedAction: recommendation.recommendedAction,
          rationale: recommendation.rationale,
          expectedNextState: recommendation.expectedNextState,
          scopeExclusions: recommendation.scopeExclusions,
          assumptionsUsed: recommendation.assumptionsUsed,
          risksAccepted: recommendation.risksAccepted,
          risksRejected: recommendation.risksRejected,
          humanReviewRequired: recommendation.humanReviewRequired,
        },
      })
    } else {
      await prisma.recommendation.create({
        data: {
          decisionId: decision.id,
          recommendedAction: recommendation.recommendedAction,
          rationale: recommendation.rationale,
          expectedNextState: recommendation.expectedNextState,
          scopeExclusions: recommendation.scopeExclusions,
          assumptionsUsed: recommendation.assumptionsUsed,
          risksAccepted: recommendation.risksAccepted,
          risksRejected: recommendation.risksRejected,
          humanReviewRequired: recommendation.humanReviewRequired,
        },
      })
    }
  } else {
    const riskLevel = (decision.risks?.[0]?.level as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma Decision includes all ScoringDecisionInput fields
    const scoringData = buildScoringInputFromDecision(decision as any)
    const derived = deriveScores(scoringData)

    const recommendationInput: RecommendationInput = {
      decisionId: decision.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decision.type is string matching DecisionType enum
      decisionType: decision.type as any,
      scenarioScores,
      riskLevel,
      strategicFitScore: derived.strategicFitScore,
      priority: decision.priority ?? undefined,
      targetDate: decision.targetDate,
      workflowComplete: derived.missingInputs.length === 0,
      missingInputs: derived.missingInputs.length > 0 ? derived.missingInputs : undefined,
    }

    const prereqs = canGenerateRecommendation(recommendationInput)
    if (!prereqs.canRun) {
      console.warn("Cannot generate recommendation:", prereqs.missingInputs)
    } else {
      const recommendation = generateGenericRecommendation(recommendationInput)

      const existingRecommendation = await prisma.recommendation.findUnique({
        where: { decisionId: decision.id },
      })

      const recData = {
        decisionId: decision.id,
        recommendedAction: recommendation.recommendedAction,
        rationale: recommendation.rationale,
        expectedNextState: recommendation.expectedNextState,
        scopeExclusions: recommendation.scopeExclusions,
        assumptionsUsed: recommendation.assumptionsUsed,
        risksAccepted: recommendation.risksAccepted,
        risksRejected: recommendation.risksRejected,
        humanReviewRequired: recommendation.humanReviewRequired,
      }

      if (existingRecommendation) {
        await prisma.recommendation.update({
          where: { id: existingRecommendation.id },
          data: recData,
        })
      } else {
        await prisma.recommendation.create({
          data: recData,
        })
      }
    }
  }
}
