// Phase 3A: DeterministicAIProvider
// Adapter for existing rule-based/non-LLM behavior.
// This is the DEFAULT provider — no external API dependency.
// Preserves existing AuditOS behavior unchanged.

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus, DeterministicTaskHandler } from "../types"

export class DeterministicAIProvider implements AIProvider {
  readonly providerId = 'deterministic' as const

  private handlers = new Map<string, DeterministicTaskHandler>()

  constructor() {}

  registerHandler(taskType: string, handler: DeterministicTaskHandler): void {
    this.handlers.set(taskType, handler)
  }

  hasHandler(taskType: string): boolean {
    return this.handlers.has(taskType)
  }

  async isAvailable(): Promise<boolean> {
    return true
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const handler = this.handlers.get(request.taskType)
    if (!handler) {
      throw new Error(
        `No deterministic handler registered for task type "${request.taskType}". ` +
        `Available handlers: [${[...this.handlers.keys()].join(', ') || 'none'}]. ` +
        'Register a handler via deterministicProvider.registerHandler() before calling execute().'
      )
    }
    return handler(request)
  }

  async stream(request: AIRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await this.execute(request)
    const encoder = new TextEncoder()
    const encoded = encoder.encode(JSON.stringify({ type: "chunk", content: response.output }) + "\n")
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoded)
        controller.close()
      },
    })
  }

  getStatus(): AIProviderStatus {
    return {
      providerId: 'deterministic',
      available: true,
      modelVersion: 'deterministic-v1.0',
      latency: 1,
      configured: true,
    }
  }
}

export const deterministicProvider = new DeterministicAIProvider()
