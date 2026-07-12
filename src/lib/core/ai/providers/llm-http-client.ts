/**
 * Shared HTTP completion helpers for cloud LLM providers (OpenAI-compatible + Anthropic).
 * 
 * Timeout policy: All fetch() calls use AbortSignal.timeout(30_000) (30 seconds).
 * Timeouts are caught and surfaced as user-friendly errors — never crash the process.
 */

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIRequest,
  AIResponse,
  AIProviderId,
} from "@/lib/core/ai/types";

const LLM_HTTP_TIMEOUT_MS = 30_000; // 30 seconds — shared across all LLM provider HTTP calls

export async function openAiCompatibleComplete(
  apiKey: string,
  baseUrl: string,
  model: string,
  request: AICompletionRequest,
  providerLabel: string,
): Promise<AICompletionResponse> {
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const messages = request.systemPrompt
    ? [{ role: "system" as const, content: request.systemPrompt }, ...request.messages]
    : request.messages;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 2048,
      }),
      signal: AbortSignal.timeout(LLM_HTTP_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error(`[${providerLabel}] Request timed out after ${LLM_HTTP_TIMEOUT_MS}ms to ${url}`);
      throw new Error(`${providerLabel} API request timed out after ${LLM_HTTP_TIMEOUT_MS / 1000}s. Please try again or contact support.`);
    }
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${providerLabel} API error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    model?: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  return {
    content,
    model: data.model ?? model,
    provider: providerLabel,
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
    },
    raw: data,
  };
}

export async function anthropicComplete(
  apiKey: string,
  baseUrl: string,
  model: string,
  request: AICompletionRequest,
): Promise<AICompletionResponse> {
  const url = `${baseUrl.replace(/\/$/, "")}/v1/messages`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: request.maxTokens ?? 2048,
        system: request.systemPrompt,
        messages: request.messages.filter((m) => m.role !== "system"),
        temperature: request.temperature ?? 0.2,
      }),
      signal: AbortSignal.timeout(LLM_HTTP_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error(`[anthropic] Request timed out after ${LLM_HTTP_TIMEOUT_MS}ms to ${url}`);
      throw new Error(`Anthropic API request timed out after ${LLM_HTTP_TIMEOUT_MS / 1000}s. Please try again or contact support.`);
    }
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Anthropic API error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
    model?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const content =
    data.content?.find((c) => c.type === "text")?.text ??
    data.content?.[0]?.text ??
    "";

  return {
    content,
    model: data.model ?? model,
    provider: "anthropic",
    usage: {
      promptTokens: data.usage?.input_tokens,
      completionTokens: data.usage?.output_tokens,
      totalTokens:
        (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    },
    raw: data,
  };
}

export function aiRequestToCompletion(request: AIRequest): AICompletionRequest {
  return {
    systemPrompt: request.assembledPrompt.layers
      .map((l) => l.content)
      .join("\n\n"),
    messages: [{ role: "user", content: request.assembledPrompt.fullPrompt }],
    temperature: request.modelConfig?.temperature ?? 0.2,
    maxTokens: request.modelConfig?.maxTokens ?? 2048,
  };
}

/**
 * Basic heuristic confidence based on output content length.
 * Full confidence scoring requires the governed metadata layer
 * (sourceCount, hasAllRequiredFields, responseTimeMs, etc.) via calculateConfidence().
 */
function heuristicConfidence(content: string): number {
  if (!content || content.length === 0) return 0.25
  if (content.length < 50) return 0.50
  if (content.length < 100) return 0.70
  return 0.85
}

export function completionToAiResponse(
  completion: AICompletionResponse,
  providerId: AIProviderId,
): AIResponse {
  return {
    output: completion.content,
    confidence: heuristicConfidence(completion.content),
    providerId,
    modelVersion: `${completion.provider}/${completion.model}`,
    tokenUsage: {
      input: completion.usage?.promptTokens ?? 0,
      output: completion.usage?.completionTokens ?? 0,
    },
    metadata: { rawProvider: completion.provider },
    warnings: [],
  };
}