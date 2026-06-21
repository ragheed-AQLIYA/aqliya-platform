import type { AIProvider, AIProviderId } from "@/lib/ai/types"
import { OpenAIProvider } from "@/lib/ai/providers/openai-provider"
import { AnthropicProvider } from "@/lib/ai/providers/anthropic-provider"
import { CloudAIProvider } from "@/lib/ai/providers/cloud-provider"

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

