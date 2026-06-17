import type { AIProvider, AIProviderId } from "./types"
import { OpenAIProvider } from "./providers/openai-provider"
import { AnthropicProvider } from "./providers/anthropic-provider"
import { CloudAIProvider } from "./providers/cloud-provider"

export function createAIProvider(providerName?: AIProviderId): AIProvider {
  const name: AIProviderId =
    providerName || (process.env.AI_PROVIDER as AIProviderId) || "openai"

  switch (name) {
    case "openai":
      return new OpenAIProvider({})
    case "anthropic":
      return new AnthropicProvider({})
    case "cloud":
      return new CloudAIProvider({})
    default:
      throw new Error(
        `Unknown AI provider: "${name}". Use "openai", "anthropic", or "cloud".`
      )
  }
}
