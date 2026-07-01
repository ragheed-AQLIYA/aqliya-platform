import "server-only"
import { OpenAIEmbeddingProvider } from "@/lib/core/ai/providers/openai-embedding-provider"
import type { EmbeddingProvider } from "@/lib/core/ai/types"

let _embeddingProvider: EmbeddingProvider | null = null

export function getRagEmbeddingProvider(): EmbeddingProvider {
  if (!_embeddingProvider) {
    _embeddingProvider = new OpenAIEmbeddingProvider()
  }
  return _embeddingProvider as EmbeddingProvider
}

/** Test hook — reset or inject a mock provider. */
export function setRagEmbeddingProvider(provider: EmbeddingProvider | null): void {
  _embeddingProvider = provider
}
