import "server-only"

import { prisma } from "@/lib/prisma"
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge"
import { isEnabled } from "@/lib/platform/feature-flags/registry"

export async function resolveDecisionAIContext(decisionId: string): Promise<{
  organizationId: string
  ragQuery: string
  title: string
}> {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: {
      id: true,
      title: true,
      organizationId: true,
      objectives: { select: { description: true }, take: 3 },
      alternatives: { select: { description: true }, take: 3 },
    },
  })
  if (!decision) {
    throw new Error(`Decision not found: ${decisionId}`)
  }

  const ragQuery = [
    "DecisionOS governed intelligence",
    decision.title,
    ...decision.objectives.map((o) => o.description),
    ...decision.alternatives.map((a) => a.description),
  ]
    .filter(Boolean)
    .join(" ")

  return {
    organizationId: decision.organizationId,
    ragQuery,
    title: decision.title,
  }
}

export interface GovernedDecisionAIResult {
  output: string
  providerId: string
  warnings: string[]
}

export async function runGovernedDecisionAI(params: {
  decisionId: string
  userId?: string
  userRole?: string
  focus?: "insight" | "recommendation" | "overview"
}): Promise<GovernedDecisionAIResult | null> {
  if (!isEnabled("ai.rag") && !isEnabled("ai.real-providers")) {
    return null
  }

  const ctx = await resolveDecisionAIContext(params.decisionId)

  const result = await runGovernedProductAI({
    productKey: "decisionos",
    useCase: "pilot_decision",
    organizationId: ctx.organizationId,
    userId: params.userId,
    userRole: params.userRole,
    resourceId: params.decisionId,
    query: ctx.ragQuery,
    evidenceComplete: true,
    taskInput: {
      decisionTitle: ctx.title,
      focus: params.focus ?? "insight",
    },
  })

  if (!result) return null

  return {
    output: result.output,
    providerId: result.providerId,
    warnings: result.warnings,
  }
}

export function mergeDecisionInsightWithAI<T extends { summary: string }>(
  base: T,
  ai: GovernedDecisionAIResult | null,
): T & { aiAugmented?: boolean; aiDraft?: string; aiWarnings?: string[] } {
  if (!ai?.output?.trim()) {
    return base
  }
  return {
    ...base,
    aiAugmented: true,
    aiDraft: ai.output,
    aiWarnings: ai.warnings,
    summary: `${base.summary}\n\n---\n**AI-assisted context (draft — human review required):**\n${ai.output.slice(0, 1200)}`,
  }
}
