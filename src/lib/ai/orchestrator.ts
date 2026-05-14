// Phase 3C: AIOrchestrator — Provider Selection + Governance Context Injection
// Selects deterministic/cloud/local providers based on task type and configuration.
// All 5 AuditOS AI generation functions are wired through this orchestrator.
// No schema changes. No external LLM dependency required for build.

import type { AIProvider, AIRequest, AIResponse, AIProviderId, AIProviderStatus } from "./types"
import type { GovernanceTaskType, GovernanceContext } from "@/lib/governance/runtime-types"
import { deterministicProvider } from "./providers/deterministic-provider"
import { CloudAIProvider } from "./providers/cloud-provider"
import { LocalAIProvider } from "./providers/local-provider"
import { getPromptBuilder, assemblePrompt } from "./prompt-registry"
import { getGovernanceContext } from "@/lib/governance/retrieval-router"

export type OrchestratorConfig = {
  defaultProvider?: AIProviderId
  cloudConfig?: { apiKey?: string; baseUrl?: string; defaultModel?: string; providerName?: string }
  localConfig?: { baseUrl?: string; defaultModel?: string }
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
    this.defaultProviderId = config.defaultProvider ?? 'deterministic'
    this.onGenerate = config.onGenerate

    this.providers = new Map()
    this.providers.set('deterministic', deterministicProvider)
    this.providers.set('cloud', new CloudAIProvider(config.cloudConfig))
    this.providers.set('local', new LocalAIProvider(config.localConfig))
  }

  private resolveProvider(
    taskType: GovernanceTaskType,
    preferProvider?: AIProviderId
  ): { provider: AIProvider; providerId: AIProviderId } {
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
    const assembledRequest = hasPromptBuilder
      ? assemblePrompt(aiRequest)
      : aiRequest

    const { provider, providerId } = this.resolveProvider(request.taskType, request.preferProvider)

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

    if (providerId !== 'deterministic' && !request.preferProvider) {
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
})
