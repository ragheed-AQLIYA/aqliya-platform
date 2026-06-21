// LocalAIProvider — Ollama REST /api/chat (ADR-001 Cycle 2)

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "../types";
import { aiRequestToCompletion, completionToAiResponse } from "./llm-http-client";

export class LocalAIProvider implements AIProvider {
  readonly providerId = "local" as const;

  private baseUrl: string;
  private defaultModel: string;

  constructor(config?: { baseUrl?: string; defaultModel?: string }) {
    this.baseUrl =
      config?.baseUrl ??
      process.env.AI_LOCAL_BASE_URL ??
      "http://localhost:11434";
    this.defaultModel =
      config?.defaultModel ?? process.env.AI_LOCAL_MODEL ?? "llama3";
  }

  get isConfigured(): boolean {
    return this.baseUrl.length > 0 && this.defaultModel.length > 0;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured) return false;
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured) {
      throw new Error(
        "Local AI not configured. Set AI_LOCAL_BASE_URL and AI_LOCAL_MODEL.",
      );
    }

    const completionReq = aiRequestToCompletion(request);
    const messages = completionReq.systemPrompt
      ? [
          { role: "system", content: completionReq.systemPrompt },
          ...completionReq.messages,
        ]
      : completionReq.messages;

    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: request.modelConfig?.modelId ?? this.defaultModel,
        messages,
        stream: false,
        options: { temperature: completionReq.temperature ?? 0.2 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Ollama API error ${res.status}: ${errText.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      eval_count?: number;
      prompt_eval_count?: number;
    };

    return completionToAiResponse(
      {
        content: data.message?.content ?? "",
        model: this.defaultModel,
        provider: "ollama",
        usage: {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
        },
      },
      "local",
      0.72,
    );
  }

  getStatus(): AIProviderStatus {
    return {
      providerId: "local",
      available: this.isConfigured,
      modelVersion: this.isConfigured
        ? `ollama/${this.defaultModel}`
        : "unconfigured",
      latency: -1,
      configured: this.isConfigured,
      lastError: this.isConfigured ? undefined : "AI_LOCAL_BASE_URL not set",
    };
  }
}
