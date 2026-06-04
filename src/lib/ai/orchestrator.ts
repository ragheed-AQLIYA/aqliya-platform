// Phase 3C + IC-02: AIOrchestrator — Provider Selection + Governance Context Injection
// Uses cost-based routing (selectOptimalProvider) when ai.real-providers is enabled.
// Enforces per-tenant budget quotas before execution (IC-06 integration).
// Falls back to deterministic provider when real providers are unavailable or disabled.

import type { AIProvider, AIRequest, AIResponse, AIProviderId, AIProviderStatus } from "./types"
import type { GovernanceTaskType, GovernanceContext } from "@/lib/governance/runtime-types"
import { deterministicProvider } from "./providers/deterministic-provider"
import { CloudAIProvider } from "./providers/cloud-provider"
import { LocalAIProvider } from "./providers/local-provider"
import { OpenAIProvider } from "./providers/openai-provider"
import { AnthropicProvider } from "./providers/anthropic-provider"
import { getPromptBuilder, assemblePrompt } from "./prompt-registry"
import { getGovernanceContext } from "@/lib/governance/retrieval-router"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { selectOptimalProvider } from "./provider-router"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { checkBudgetQuota } from "./budget-manager"
import { injectGovernedRagIntoRequest } from "./orchestrator-rag-inject"

export type OrchestratorConfig = {
  defaultProvider?: AIProviderId
  cloudConfig?: { apiKey?: string; baseUrl?: string; defaultModel?: string; providerName?: string }
  localConfig?: { baseUrl?: string; defaultModel?: string }
  openaiConfig?: { apiKey?: string; baseUrl?: string; model?: string }
  anthropicConfig?: { apiKey?: string; baseUrl?: string; model?: string }
  // Optional: called after every generate() call with full result + request
  onGenerate?: (event: GenerateEvent) => void | Promise<void>
}

export type GenerateEvent = {
  taskType: GovernanceTaskType
  engagementId?: string
  providerId: AIProviderId
  providerModelVersion: string
  responseConfidence: number
  outputCount: number
  warnings: string[]
  governanceContext: GovernanceContext
  durationMs: number
  timestamp: string
}

function createDefaultOnGenerate(): (event: GenerateEvent) => Promise<void> {
  return async (event) => {
    try {
      await writePlatformAuditLog({
        productKey: "ai_orchestrator",
        action: "ai_generation",
        aiProvider: event.providerId,
        aiModel: event.providerModelVersion,
        targetType: "ai_generation",
        targetId: event.engagementId,
        severity: event.warnings.length > 0 ? "warning" : "info",
        status: "recorded",
        sourceSystem: "ai_orchestrator",
        sourceModel: "orchestrator_v1",
        metadata: {
          taskType: event.taskType,
          responseConfidence: event.responseConfidence,
          outputCount: event.outputCount,
          warnings: event.warnings,
          durationMs: event.durationMs,
          timestamp: event.timestamp,
        } as Record<string, unknown>,
      });
    } catch {
      /* Must never break generation flow */
    }
  };
}

class AIProviderNotAvailableError extends Error {
  constructor(providerId: AIProviderId, reason: string) {
    super(`AI provider "${providerId}" is not available: ${reason}`)
    this.name = 'AIProviderNotAvailableError'
  }
}

export class AIOrchestrator {
  private providers: Map<AIProviderId, AIProvider>
  private defaultProviderId: AIProviderId
  private onGenerate?: (event: GenerateEvent) => void | Promise<void>

  constructor(config: OrchestratorConfig = {}) {
    const envProvider = (process.env.AI_PROVIDER as AIProviderId | undefined)
    const validProviders: AIProviderId[] = ['openai', 'anthropic', 'cloud', 'deterministic']
    const envDefault = envProvider && validProviders.includes(envProvider) ? envProvider : 'deterministic'

    this.defaultProviderId = config.defaultProvider ?? envDefault
    this.onGenerate = config.onGenerate

    this.providers = new Map()
    this.providers.set('deterministic', deterministicProvider)
    this.providers.set('cloud', new CloudAIProvider(config.cloudConfig))
    this.providers.set('local', new LocalAIProvider(config.localConfig))
    this.providers.set('openai', new OpenAIProvider(config.openaiConfig))
    this.providers.set('anthropic', new AnthropicProvider(config.anthropicConfig))
  }

  private async resolveProvider(
    taskType: GovernanceTaskType,
    preferProvider?: AIProviderId
  ): Promise<{ provider: AIProvider; providerId: AIProviderId }> {
    const realProviderOrder: AIProviderId[] = preferProvider
      ? [preferProvider, "openai", "anthropic", "cloud"]
      : ["openai", "anthropic", "cloud"]

    if (isEnabled("ai.real-providers")) {
      for (const id of realProviderOrder) {
        const candidate = this.providers.get(id)
        if (!candidate) continue
        const status = candidate.getStatus()
        if (status.configured && (await candidate.isAvailable())) {
          return { provider: candidate, providerId: id }
        }
      }
      try {
        const decision = await selectOptimalProvider(taskType, preferProvider)
        const selectedProvider = this.providers.get(decision.selected)
        if (selectedProvider) {
          const status = selectedProvider.getStatus()
          if (status.configured && status.available) {
            return { provider: selectedProvider, providerId: decision.selected }
          }
        }
      } catch {
        /* fall through to preferred/default fallback */
      }
    }

    const preferred = preferProvider ? this.providers.get(preferProvider) : null
    const providerStatus = preferred ? preferred.getStatus() : null

    if (preferred && providerStatus?.configured && providerStatus?.available) {
      return { provider: preferred, providerId: preferProvider! }
    }

    return {
      provider: this.providers.get('deterministic')!,
      providerId: 'deterministic',
    }
  }

  async generate(request: {
    taskType: GovernanceTaskType
    taskInput: Record<string, unknown>
    engagementId?: string
    organizationId?: string
    userId?: string
    userRole?: string
    preferProvider?: AIProviderId
  }): Promise<{
    response: AIResponse
    providerId: AIProviderId
    governanceContext: GovernanceContext
    warnings: string[]
  }> {
    const startMs = Date.now()
    const governanceContext = getGovernanceContext(request.taskType)

    const aiRequest: AIRequest = {
      taskType: request.taskType,
      taskInput: request.taskInput,
      governanceContext,
      assembledPrompt: { layers: [], fullPrompt: '' },
      engagementId: request.engagementId,
      organizationId: request.organizationId,
      userId: request.userId,
      userRole: request.userRole,
    }

    const hasPromptBuilder = getPromptBuilder(request.taskType) !== null
    let assembledRequest = hasPromptBuilder
      ? assemblePrompt(aiRequest)
      : aiRequest

    assembledRequest = await injectGovernedRagIntoRequest(
      assembledRequest,
      request.organizationId,
    )

    if (request.organizationId && isEnabled('ai.budget-quotas')) {
      const quota = await checkBudgetQuota(request.organizationId)
      if (!quota.allowed) {
        throw new Error(`Budget quota exceeded for org ${request.organizationId}: ${quota.reason}`)
      }
    }

    const { provider, providerId } = await this.resolveProvider(request.taskType, request.preferProvider)

    let response: AIResponse
    try {
      response = await provider.execute(assembledRequest)
    } catch (err) {
      if (providerId !== 'deterministic') {
        response = await this.providers.get('deterministic')!.execute(assembledRequest)
      } else {
        throw err
      }
    }

    const allWarnings = [
      ...assembledRequest.governanceContext.evidenceRequirements
        .filter(e => e.status === 'missing' || e.status === 'partial')
        .map(e => `Evidence incomplete: "${e.description}" is ${e.status}${e.requiredForApproval ? ' (required for approval)' : ''}`),
      ...(assembledRequest.governanceContext.humanApprovalRequired
        ? ['Human approval is required — output is draft until reviewed']
        : []),
      ...response.warnings,
    ]

    if (providerId !== "deterministic" && response.providerId === "deterministic") {
      allWarnings.push(`Provider "${providerId}" fell back to deterministic`)
    }

    const outputCount = Array.isArray(response.metadata?.outputs)
      ? (response.metadata.outputs as unknown[]).length
      : 0

    // Invoke optional logging callback (non-blocking, fire-and-forget)
    if (this.onGenerate) {
      const event: GenerateEvent = {
        taskType: request.taskType,
        engagementId: request.engagementId,
        providerId: response.providerId,
        providerModelVersion: response.modelVersion,
        responseConfidence: response.confidence,
        outputCount,
        warnings: allWarnings,
        governanceContext,
        durationMs: Date.now() - startMs,
        timestamp: new Date().toISOString(),
      }
      try { this.onGenerate(event) } catch { /* callback errors must not break generation flow */ }
    }

    return {
      response,
      providerId: response.providerId,
      governanceContext,
      warnings: allWarnings,
    }
  }

  async generateStream(request: {
    taskType: GovernanceTaskType
    taskInput: Record<string, unknown>
    engagementId?: string
    organizationId?: string
    userId?: string
    userRole?: string
    preferProvider?: AIProviderId
  }): Promise<{
    stream: ReadableStream<Uint8Array>
    providerId: AIProviderId
  }> {
    const governanceContext = getGovernanceContext(request.taskType)

    const aiRequest: AIRequest = {
      taskType: request.taskType,
      taskInput: request.taskInput,
      governanceContext,
      assembledPrompt: { layers: [], fullPrompt: '' },
      engagementId: request.engagementId,
      organizationId: request.organizationId,
      userId: request.userId,
      userRole: request.userRole,
    }

    const hasPromptBuilder = getPromptBuilder(request.taskType) !== null
    let assembledRequest = hasPromptBuilder
      ? assemblePrompt(aiRequest)
      : aiRequest

    assembledRequest = await injectGovernedRagIntoRequest(
      assembledRequest,
      request.organizationId,
    )

    if (request.organizationId && isEnabled('ai.budget-quotas')) {
      const quota = await checkBudgetQuota(request.organizationId)
      if (!quota.allowed) {
        throw new Error(`Budget quota exceeded for org ${request.organizationId}: ${quota.reason}`)
      }
    }

    const { provider, providerId } = await this.resolveProvider(request.taskType, request.preferProvider)

    if (!provider.stream) {
      throw new Error(`Provider "${providerId}" does not support streaming`)
    }

    let stream: ReadableStream<Uint8Array>
    try {
      stream = await provider.stream(assembledRequest)
    } catch (err) {
      if (providerId !== 'deterministic') {
        const fallback = this.providers.get('deterministic')!
        if (fallback.stream) {
          stream = await fallback.stream(assembledRequest)
        } else {
          throw err
        }
      } else {
        throw err
      }
    }

    return { stream, providerId }
  }

  getAllStatus(): Record<AIProviderId, AIProviderStatus> {
    const status: Partial<Record<AIProviderId, AIProviderStatus>> = {}
    for (const [id, provider] of this.providers) {
      status[id] = provider.getStatus()
    }
    return status as Record<AIProviderId, AIProviderStatus>
  }

  getDefaultProviderId(): AIProviderId {
    return this.defaultProviderId
  }
}

// Singleton instance — shared across the application
export const aiOrchestrator = new AIOrchestrator({
  defaultProvider: 'deterministic',
  onGenerate: createDefaultOnGenerate(),
})
