import { prisma } from "@/lib/prisma"
import { isExpectedAccessDeniedError, getCurrentUser } from "@/lib/auth"
import { enforce } from "@/lib/kernel"
import { buildScoringData } from "@/lib/simulation/simulation-engine"

export type ScenarioScore = {
  scenarioType: string
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  strategicFitScore: number
  overallDecisionScore: number
}

export async function authorizeForDecision(decisionId: string) {
  const user = await getCurrentUser()
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  })
  if (!decisionLookup) return null
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update")
  return user
}

/**
 * Runtime type guard for DecisionType — validates that a string is a valid Prisma DecisionType enum value.
 */
const VALID_DECISION_TYPES = new Set([
  "TENDER", "INVESTMENT", "EXPANSION", "PROCUREMENT",
  "HIRING", "PARTNERSHIP", "PRICING", "STRATEGIC", "OPERATIONS", "CUSTOM",
] as const)

export function isValidDecisionType(value: string): value is "TENDER" | "INVESTMENT" | "EXPANSION" | "PROCUREMENT" | "HIRING" | "PARTNERSHIP" | "PRICING" | "STRATEGIC" | "OPERATIONS" | "CUSTOM" {
  return VALID_DECISION_TYPES.has(value as Parameters<typeof VALID_DECISION_TYPES.has>[0])
}

/**
 * Adapter: maps a Prisma Decision-shaped object to the buildScoringData parameter type.
 * Both shapes share the same fields but Prisma uses JsonValue types.
 */
export function adaptDecisionToScoringInput(decision: {
  objectives: unknown
  constraints: unknown
  assumptions: unknown
  alternatives: unknown
  risks: unknown
  framework: unknown
  decisionScenarios?: unknown
  priority?: unknown
  targetDate?: unknown
}) {
  return decision as Parameters<typeof buildScoringData>[0]
}

export function buildScoringInputFromDecision(decision: Parameters<typeof buildScoringData>[0]) {
  return buildScoringData(decision)
}

export { isExpectedAccessDeniedError }
