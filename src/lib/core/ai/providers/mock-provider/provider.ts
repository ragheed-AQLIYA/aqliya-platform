import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "@/lib/core/ai/types"
import { MOCK_LATENCY_MS } from "./common"
import { generateMockResponse } from "./templates"

export class MockAIProvider implements AIProvider {
  readonly providerId = 'mock' as const

  async isAvailable(): Promise<boolean> {
    return true
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS))
    const output = generateMockResponse(request)

    return {
      output,
      confidence: 0.88,
      providerId: 'mock',
      modelVersion: 'mock-v1.0',
      tokenUsage: {
        input: request.assembledPrompt.fullPrompt.length,
        output: output.length,
      },
      metadata: {
        simulated: true,
        latencyMs: MOCK_LATENCY_MS,
      },
      warnings: [
        "هذا الرد تم إنشاؤه بواسطة المحاكاة التجريبية — يتطلب مراجعة بشرية.",
      ],
    }
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
      providerId: 'mock',
      available: true,
      modelVersion: 'mock-v1.0',
      latency: MOCK_LATENCY_MS,
      configured: true,
    }
  }
}

export const mockProvider = new MockAIProvider()
