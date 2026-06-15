/**
 * Shared HTTP completion helpers for cloud LLM providers (OpenAI-compatible + Anthropic).
 */

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIRequest,
  AIResponse,
  AIProviderId,
} from "../types";

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

  const res = await fetch(url, {
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
  });

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
  const res = await fetch(url, {
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
  });

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

export function completionToAiResponse(
  completion: AICompletionResponse,
  providerId: AIProviderId,
  confidence = 0.75,
): AIResponse {
  return {
    output: completion.content,
    confidence,
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
