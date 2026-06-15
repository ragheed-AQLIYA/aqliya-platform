// CloudAIProvider — wired OpenAI-compatible LLM HTTP (ADR-001 Cycle 1)

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "../types";
import {
  aiRequestToCompletion,
  completionToAiResponse,
  openAiCompatibleComplete,
} from "./llm-http-client";

interface CloudProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  providerName?: string;
}

export class CloudAIProvider implements AIProvider {
  readonly providerId = "cloud" as const;

  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private providerName: string;

  constructor(config: CloudProviderConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.AI_CLOUD_API_KEY ?? "";
    this.baseUrl =
      config.baseUrl ??
      process.env.AI_CLOUD_BASE_URL ??
      "https://api.openai.com/v1";
    this.defaultModel = config.defaultModel ?? process.env.AI_CLOUD_MODEL ?? "";
    this.providerName =
      config.providerName ?? process.env.AI_CLOUD_PROVIDER_NAME ?? "cloud-api";
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0 && this.defaultModel.length > 0;
  }

  async isAvailable(): Promise<boolean> {
    return this.isConfigured;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured) {
      throw new Error(
        "Cloud AI provider is not configured. Set AI_CLOUD_API_KEY and AI_CLOUD_MODEL.",
      );
    }

    const completion = await openAiCompatibleComplete(
      this.apiKey,
      this.baseUrl,
      request.modelConfig?.modelId ?? this.defaultModel,
      aiRequestToCompletion(request),
      this.providerName,
    );

    return completionToAiResponse(completion, "cloud", 0.78);
  }

  getStatus(): AIProviderStatus {
    return {
      providerId: "cloud",
      available: this.isConfigured,
      modelVersion: this.isConfigured
        ? `${this.providerName}/${this.defaultModel}`
        : "unconfigured",
      latency: -1,
      configured: this.isConfigured,
      lastError: this.isConfigured
        ? undefined
        : "AI_CLOUD_API_KEY and AI_CLOUD_MODEL not set",
    };
  }
}
