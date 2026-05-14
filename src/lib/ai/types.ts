// Phase 3A: AI Abstraction Foundation — Shared Types
// No schema changes. No external LLM dependency required.
// All AI outputs remain human-reviewed, evidence-aware, permissioned, and auditable.

import type { GovernanceTaskType, GovernanceContext, PromptLayerContent } from "@/lib/governance/runtime-types"

// ─── Provider Identity ───

export type AIProviderId = 'deterministic' | 'cloud' | 'local'

// ─── Provider Status ───

export interface AIProviderStatus {
  providerId: AIProviderId
  available: boolean
  modelVersion: string
  latency: number               // ms, -1 if unknown
  lastError?: string
  configured: boolean           // true if env/config is present
}

// ─── Request / Response ───

export interface AIRequest {
  taskType: GovernanceTaskType
  taskInput: Record<string, unknown>
  governanceContext: GovernanceContext
  assembledPrompt: {
    layers: PromptLayerContent[]
    fullPrompt: string
  }
  engagementId?: string
  organizationId?: string
  userId?: string
  userRole?: string
  modelConfig?: {
    provider?: AIProviderId     // routing hint
    modelId?: string             // optional override
    temperature?: number
    maxTokens?: number
  }
}

export interface AIResponse {
  output: string
  confidence: number
  providerId: AIProviderId
  modelVersion: string
  tokenUsage?: {
    input: number
    output: number
  }
  metadata: Record<string, unknown>
  warnings: string[]
}

// ─── Provider Interface ───

export interface AIProvider {
  readonly providerId: AIProviderId

  isAvailable(): Promise<boolean>

  execute(request: AIRequest): Promise<AIResponse>

  getStatus(): AIProviderStatus
}

// ─── Task Handler (used by DeterministicAIProvider) ───

export type DeterministicTaskHandler = (request: AIRequest) => Promise<AIResponse>
