import type { AIProvider, AIProviderStatus, AIRequest, AIResponse } from "../types"
import { CloudAIProvider } from "./cloud-provider"

/** Anthropic routing adapter — delegates to CloudAIProvider with Anthropic env keys. */
export class AnthropicProvider implements AIProvider {
  readonly providerId = "anthropic" as const
  private readonly inner: CloudAIProvider

  constructor(config: ConstructorParameters<typeof CloudAIProvider>[0] = {}) {
    this.inner = new CloudAIProvider({
      ...config,
      apiKey: config?.apiKey ?? process.env.ANTHROPIC_API_KEY,
      providerName: "anthropic",
    })
  }

  isAvailable(): Promise<boolean> {
    return this.inner.isAvailable()
  }

  execute(request: AIRequest): Promise<AIResponse> {
    return this.inner.execute(request)
  }

  getStatus(): AIProviderStatus {
    const status = this.inner.getStatus()
    return { ...status, providerId: "anthropic" }
  }
}
