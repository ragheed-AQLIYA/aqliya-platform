import "server-only"
import type {
  EmbeddingProvider,
  EmbeddingProviderId,
  EmbeddingRequest,
  EmbeddingResponse,
} from "@/lib/core/ai/types"

const DEFAULT_MODEL = "text-embedding-3-small"
const EMBEDDING_HTTP_TIMEOUT_MS = 30_000;

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly providerId: EmbeddingProviderId = "openai"

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY)
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured")
    }

    const model = request.model ?? DEFAULT_MODEL
    const input = request.input

    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, input }),
        signal: AbortSignal.timeout(EMBEDDING_HTTP_TIMEOUT_MS),
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.error(`[openai-embeddings] Request timed out after ${EMBEDDING_HTTP_TIMEOUT_MS}ms`);
        throw new Error(`OpenAI embeddings request timed out after ${EMBEDDING_HTTP_TIMEOUT_MS / 1000}s. Please try again.`);
      }
      throw err;
    }

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OpenAI embeddings failed (${res.status}): ${body.slice(0, 200)}`)
    }

    const json = (await res.json()) as {
      data: Array<{ embedding: number[] }>
      model: string
      usage?: { prompt_tokens: number; total_tokens: number }
    }

    return {
      embeddings: json.data.map((row) => row.embedding),
      model: json.model,
      provider: "openai",
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            totalTokens: json.usage.total_tokens,
          }
        : undefined,
    }
  }
}
