import { validateRecommendationGate } from "./gate"
import { prisma } from "@/lib/prisma"

// Per correction 4: explicit missing union type, no `as any`
export type IntelligenceMissing =
  | "intake_not_accepted"
  | "framework_incomplete"
  | "scenarios_missing"
  | "scenarios_incomplete"
  | "risks_missing"
  | "risks_incomplete"
  | "recommendation_not_complete"
  | "decision_not_completed"
  | "patterns_already_extracted"

export interface IntelligenceGateResult {
  allowed: boolean
  missing: IntelligenceMissing[]
}

export async function validateIntelligenceGate(decisionId: string): Promise<IntelligenceGateResult> {
  const a1 = await validateRecommendationGate(decisionId)
  if (!a1.allowed) {
    return {
      allowed: false,
      // Safe: GateMissingReason is subset of IntelligenceMissing
      missing: a1.missing as IntelligenceMissing[],
    }
  }

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: { recommendation: true },
  })

  if (!decision?.recommendation) {
    return {
      allowed: false,
      missing: ["recommendation_not_complete"],
    }
  }

  return { allowed: true, missing: [] }
}

export async function validateIntelligenceLayerGate(decisionId: string): Promise<IntelligenceGateResult> {
  const a2 = await validateIntelligenceGate(decisionId)
  if (!a2.allowed) return a2

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { status: true },
  })

  if (!decision || !["APPROVED", "REJECTED"].includes(decision.status)) {
    return {
      allowed: false,
      missing: ["decision_not_completed"],
    }
  }

  return { allowed: true, missing: [] }
}

export async function validatePatternExtractionGate(decisionId: string): Promise<IntelligenceGateResult> {
  const base = await validateIntelligenceLayerGate(decisionId)
  if (!base.allowed) return base

  const existing = await prisma.decisionPattern.findUnique({
    where: { decisionId },
  })

  if (existing) {
    return {
      allowed: false,
      missing: ["patterns_already_extracted"],
    }
  }

  return { allowed: true, missing: [] }
}

// Signals and Alerts are system-generated only
// No manual creation from UI allowed
// Signals are descriptive only, do NOT trigger actions
// Alerts require human review, never auto-resolve
