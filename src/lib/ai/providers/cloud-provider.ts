// Phase 3A: CloudAIProvider
// Interface-ready adapter for external LLM APIs (OpenAI, Claude, Gemini).
// Does NOT require a real external API call unless env configuration is present.
// If no API key is configured, reports unavailable and returns an error response.

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "../types"

interface CloudProviderConfig {
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
  providerName?: string
}

export class CloudAIProvider implements AIProvider {
  readonly providerId = 'cloud' as const

  private apiKey: string
  private baseUrl: string
  private defaultModel: string
  private providerName: string

  constructor(config: CloudProviderConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.AI_CLOUD_API_KEY ?? ''
    this.baseUrl = config.baseUrl ?? process.env.AI_CLOUD_BASE_URL ?? ''
    this.defaultModel = config.defaultModel ?? process.env.AI_CLOUD_MODEL ?? ''
    this.providerName = config.providerName ?? process.env.AI_CLOUD_PROVIDER_NAME ?? 'cloud-api'
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0 && this.defaultModel.length > 0
  }

  async isAvailable(): Promise<boolean> {
    return this.isConfigured
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured) {
      throw new Error(
        'Cloud AI provider is not configured. Set AI_CLOUD_API_KEY and AI_CLOUD_MODEL environment variables.'
      )
    }

    // Configured but NOT wired — real API call is Phase 3B
    throw new Error(
      `CloudAIProvider is configured (${this.providerName}/${this.defaultModel}) but execute() is not yet wired to an external API. ` +
      'Phase 3B will integrate the external LLM call. ' +
      `Task: ${request.taskType}, prompt length: ${request.assembledPrompt.fullPrompt.length} chars.`
    )
  }

  getStatus(): AIProviderStatus {
    return {
      providerId: 'cloud',
      available: this.isConfigured,
      modelVersion: this.isConfigured ? `${this.providerName}/${this.defaultModel}` : 'unconfigured',
      latency: -1,
      configured: this.isConfigured,
      lastError: this.isConfigured ? undefined : 'AI_CLOUD_API_KEY and AI_CLOUD_MODEL not set',
    }
  }
}
