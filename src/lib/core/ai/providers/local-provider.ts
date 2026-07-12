// LocalAIProvider — Ollama REST /api/chat (ADR-001 Cycle 2)
// Timeout policy: All fetch() calls use AbortSignal.timeout(30_000) for execution,
// 3_000 for availability checks.

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "@/lib/core/ai/types";
import { aiRequestToCompletion, completionToAiResponse } from "./llm-http-client";

const LOCAL_EXECUTION_TIMEOUT_MS = 30_000; // 30 seconds for LLM execution
const LOCAL_AVAILABILITY_TIMEOUT_MS = 3_000; // 3 seconds for health checks

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
        signal: AbortSignal.timeout(LOCAL_AVAILABILITY_TIMEOUT_MS),
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

    const url = `${this.baseUrl.replace(/\/$/, "")}/api/chat`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: request.modelConfig?.modelId ?? this.defaultModel,
          messages,
          stream: false,
          options: { temperature: completionReq.temperature ?? 0.2 },
        }),
        signal: AbortSignal.timeout(LOCAL_EXECUTION_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.error(`[ollama] Request timed out after ${LOCAL_EXECUTION_TIMEOUT_MS}ms to ${url}`);
        throw new Error(`Ollama API request timed out after ${LOCAL_EXECUTION_TIMEOUT_MS / 1000}s. Please try again or check local model availability.`);
      }
      throw err;
    }

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
