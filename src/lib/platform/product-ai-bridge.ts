import "server-only"

import { aiOrchestrator } from "@/lib/ai/orchestrator"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { routeIntelligenceRequest } from "@/lib/ai/intelligence-runtime"
import type { AIProviderId } from "@/lib/ai/types"
import type { GovernanceTaskType } from "@/lib/governance/runtime-types"
import type { CurrentUser } from "@/lib/auth"

export interface GovernedProductAIInput {
  productKey: string
  useCase: GovernanceTaskType
  organizationId: string
  userId?: string
  userRole?: string
  resourceId: string
  query: string
  taskInput?: Record<string, unknown>
  evidenceComplete?: boolean
  preferProvider?: AIProviderId
}

export interface GovernedProductAIResult {
  output: string
  providerId: AIProviderId
  warnings: string[]
  route: ReturnType<typeof routeIntelligenceRequest>
  governedBridge: true
  reviewRequired: true
}

function resolvePreferProvider(): AIProviderId | undefined {
  if (!isEnabled("ai.real-providers")) return undefined
  const hint = process.env.AI_PROVIDER
  if (hint === "openai" || hint === "anthropic" || hint === "cloud") return hint
  return undefined
}

export function isProductAICoreEnabled(): boolean {
  return isEnabled("ai.rag") || isEnabled("ai.real-providers")
}

/**
 * Cross-product governed AI entry — LocalContentOS, SalesOS, WorkflowOS adapters.
 */
export async function runGovernedProductAI(
  input: GovernedProductAIInput,
): Promise<GovernedProductAIResult | null> {
  if (!isProductAICoreEnabled()) {
    return null
  }

  const route = routeIntelligenceRequest({
    productId: input.productKey,
    useCase: input.useCase,
    organizationId: input.organizationId,
    userId: input.userId ?? "system",
    userRole: input.userRole ?? "OPERATOR",
    evidenceComplete: input.evidenceComplete ?? false,
    inputSources: [`${input.productKey}:${input.resourceId}`],
    resourceId: input.resourceId,
  })

  const taskInput: Record<string, unknown> = {
    ...input.taskInput,
    productKey: input.productKey,
    resourceId: input.resourceId,
    query: input.query,
    text: input.query,
    contextSummary: input.taskInput?.contextSummary ?? input.query,
  }

  const result = await aiOrchestrator.generate({
    taskType: input.useCase,
    taskInput,
    organizationId: input.organizationId,
    userId: input.userId,
    userRole: input.userRole,
    preferProvider: input.preferProvider ?? resolvePreferProvider(),
  })

  const output = result.response.output?.trim()
  if (!output) {
    return null
  }

  await writePlatformAuditLog({
    productKey: input.productKey,
    action: "product_ai_generation",
    platformOrganizationId: input.organizationId,
    actorId: input.userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "product_ai_bridge",
    metadata: {
      useCase: input.useCase,
      resourceId: input.resourceId,
      providerId: result.providerId,
      warningCount: result.warnings.length,
      flags: {
        rag: isEnabled("ai.rag"),
        realProviders: isEnabled("ai.real-providers"),
      },
    },
  }).catch(() => {})

  return {
    output,
    providerId: result.providerId,
    warnings: result.warnings,
    route,
    governedBridge: true,
    reviewRequired: true,
  }
}

export function assertProductScope(user: CurrentUser, organizationId: string): void {
  if (organizationId !== user.organizationId && user.role !== "ADMIN") {
    throw new Error("Access denied: organization scope mismatch")
  }
}
