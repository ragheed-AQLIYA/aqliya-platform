import type { KernelResult } from "../types";

export type AIProvider = "anthropic" | "openai" | "openrouter" | "local";
export type AITaskType = "analysis" | "generation" | "review" | "extraction" | "classification" | "embedding";

export interface AIRequest {
  taskType: AITaskType;
  input: string;
  model?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  output: string;
  provider: AIProvider;
  model: string;
  usage: { inputTokens: number; outputTokens: number; totalCost: number };
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface AIProviderInfo {
  name: AIProvider;
  models: string[];
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface IAIGateway {
  route(request: AIRequest): Promise<KernelResult<AIResponse>>;
  estimateCost(request: AIRequest): KernelResult<number>;
  selectProvider(taskType: AITaskType, constraints?: { maxCost?: number; latencyMs?: number }): AIProvider;
  getAvailableProviders(): AIProviderInfo[];
}
