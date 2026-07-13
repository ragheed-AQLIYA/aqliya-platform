import type { IAIGateway, AIRequest, AIResponse, AIProviderInfo, AIProvider } from "../contracts/ai-gateway";
import type { KernelResult } from "../types";

export class AIGatewayWrapper implements IAIGateway {
  async route(request: AIRequest): Promise<KernelResult<AIResponse>> {
    const { aiOrchestrator } = await import("@/lib/core/ai/orchestrator");

    const result = await aiOrchestrator.generate({
      taskType: request.taskType as never,
      taskInput: { input: request.input, ...request.metadata },
    });

    return {
      success: true,
      data: {
        output: result.response.output,
        provider: (result.providerId as AIProvider) ?? "anthropic",
        model: result.response.modelVersion ?? "unknown",
        usage: {
          inputTokens: result.response.tokenUsage?.input ?? 0,
          outputTokens: result.response.tokenUsage?.output ?? 0,
          totalCost: 0,
        },
        confidence: result.response.confidence,
        metadata: result.response.metadata,
      },
    };
  }

  estimateCost(request: AIRequest): KernelResult<number> {
    const inputTokens = Math.ceil(request.input.length / 4);
    const maxOutput = request.maxTokens ?? 1000;
    const cost = (inputTokens / 1000) * 0.003 + (maxOutput / 1000) * 0.015;
    return { success: true, data: cost };
  }

  selectProvider(taskType: string, constraints?: { maxCost?: number; latencyMs?: number }): AIProvider {
    return "anthropic";
  }

  getAvailableProviders(): AIProviderInfo[] {
    return [
      { name: "anthropic", models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514"], costPer1kInput: 0.003, costPer1kOutput: 0.015 },
      { name: "openai", models: ["gpt-4o"], costPer1kInput: 0.005, costPer1kOutput: 0.015 },
    ];
  }
}
