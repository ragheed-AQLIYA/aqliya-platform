import type { AIProvider, AIProviderStatus, AIRequest, AIResponse } from "../types"
import { CloudAIProvider } from "./cloud-provider"

/** OpenAI routing adapter — delegates to CloudAIProvider with OpenAI env keys. */
export class OpenAIProvider implements AIProvider {
  readonly providerId = "openai" as const
  private readonly inner: CloudAIProvider

  constructor(config: ConstructorParameters<typeof CloudAIProvider>[0] = {}) {
    this.inner = new CloudAIProvider({
      ...config,
      apiKey: config?.apiKey ?? process.env.OPENAI_API_KEY,
      providerName: "openai",
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
    return { ...status, providerId: "openai" }
  }
}
