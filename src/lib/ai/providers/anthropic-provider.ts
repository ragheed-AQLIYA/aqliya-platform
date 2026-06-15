import type { AIProvider, AIProviderStatus, AIRequest, AIResponse } from "../types";
import { CloudAIProvider } from "./cloud-provider";
import {
  aiRequestToCompletion,
  anthropicComplete,
  completionToAiResponse,
} from "./llm-http-client";

/** Anthropic Messages API adapter */
export class AnthropicProvider implements AIProvider {
  readonly providerId = "anthropic" as const;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(
    config: { apiKey?: string; baseUrl?: string; model?: string } = {},
  ) {
    this.apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
    this.baseUrl =
      config.baseUrl ??
      process.env.ANTHROPIC_BASE_URL ??
      "https://api.anthropic.com";
    this.defaultModel =
      config.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async isAvailable(): Promise<boolean> {
    return this.isConfigured;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured) {
      throw new Error("Anthropic provider not configured. Set ANTHROPIC_API_KEY.");
    }

    const completion = await anthropicComplete(
      this.apiKey,
      this.baseUrl,
      request.modelConfig?.modelId ?? this.defaultModel,
      aiRequestToCompletion(request),
    );

    return completionToAiResponse(completion, "anthropic", 0.8);
  }

  getStatus(): AIProviderStatus {
    const inner = new CloudAIProvider({
      apiKey: this.apiKey,
      providerName: "anthropic",
      defaultModel: this.defaultModel,
    });
    const status = inner.getStatus();
    return { ...status, providerId: "anthropic" };
  }
}
