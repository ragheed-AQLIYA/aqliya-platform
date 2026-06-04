// Phase 3A: AI Abstraction Foundation — Shared Types
// No schema changes. No external LLM dependency required.
// All AI outputs remain human-reviewed, evidence-aware, permissioned, and auditable.

import type { GovernanceTaskType, GovernanceContext, PromptLayerContent } from "@/lib/governance/runtime-types"

// ─── Embedding Types (IC-01 — RAG/pgvector) ───

export type EmbeddingProviderId = 'openai' | 'anthropic' | 'local'

export interface EmbeddingRequest {
  input: string | string[]
  model?: string
  user?: string
}

export interface EmbeddingResponse {
  embeddings: number[][]
  model: string
  provider: EmbeddingProviderId
  usage?: {
    promptTokens: number
    totalTokens: number
  }
}

export interface EmbeddingProvider {
  readonly providerId: EmbeddingProviderId
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>
  isAvailable(): Promise<boolean>
}

export interface Chunk {
  id?: string
  documentId: string
  organizationId: string
  chunkIndex: number
  content: string
  tokenCount?: number
  metadata: Record<string, unknown>
}

export interface SearchResult {
  chunkId: string
  documentId: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export interface RAGContext {
  chunks: SearchResult[]
  query: string
  organizationId?: string
}

// ─── Provider Identity ───

export type AIProviderId = 'deterministic' | 'cloud' | 'local' | 'openai' | 'anthropic'

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

  stream?(request: AIRequest): Promise<ReadableStream<Uint8Array>>

  getStatus(): AIProviderStatus
}

// ─── Task Handler (used by DeterministicAIProvider) ───

export type DeterministicTaskHandler = (request: AIRequest) => Promise<AIResponse>

// ─── Direct LLM Provider Types (for non-governance LLM calls) ───

export interface AIProviderConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface AICompletionMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AICompletionRequest {
  messages: AICompletionMessage[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface AICompletionResponse {
  content: string
  model: string
  provider: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  raw?: unknown
}

export interface LLMProvider {
  name: string
  complete(request: AICompletionRequest): Promise<AICompletionResponse>
  completeStream?(request: AICompletionRequest): Promise<ReadableStream<Uint8Array>>
}
