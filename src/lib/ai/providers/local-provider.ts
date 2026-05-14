// Phase 3A: LocalAIProvider — Phase 4 Stub Only
// Does NOT implement Local AI runtime (Ollama, vLLM, Qwen, Llama).
// Fails cleanly with "Local AI is not configured/implemented."
// Do NOT claim Local AI, On-Prem, Air-Gapped, or Model Governance as implemented.

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "../types"

export class LocalAIProvider implements AIProvider {
  readonly providerId = 'local' as const

  private baseUrl: string
  private defaultModel: string

  constructor(config?: { baseUrl?: string; defaultModel?: string }) {
    this.baseUrl = config?.baseUrl ?? process.env.AI_LOCAL_BASE_URL ?? ''
    this.defaultModel = config?.defaultModel ?? process.env.AI_LOCAL_MODEL ?? ''
  }

  get isConfigured(): boolean {
    return this.baseUrl.length > 0
  }

  async isAvailable(): Promise<boolean> {
    return false
  }

  async execute(_request: AIRequest): Promise<AIResponse> {
    throw new Error(
      'Local AI is not implemented. ' +
      'This is a Phase 4 deliverable (Local AI Prototype). ' +
      'No Local AI runtime (Ollama, vLLM, Qwen, Llama) is available.'
    )
  }

  getStatus(): AIProviderStatus {
    return {
      providerId: 'local',
      available: false,
      modelVersion: 'not-implemented',
      latency: -1,
      configured: false,
      lastError: 'Local AI not implemented — Phase 4 (Local AI Prototype) planned',
    }
  }
}
