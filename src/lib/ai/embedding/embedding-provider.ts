import "server-only"
import { getRagEmbeddingProvider, setRagEmbeddingProvider } from "@/lib/rag/embedding-provider"
import type { EmbeddingProvider as RagEmbeddingProvider } from "@/lib/ai/types"

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
  readonly providerId: string
  isAvailable(): Promise<boolean>
}

export type EmbeddingProviderType = "openai" | "local" | "mock"

const MOCK_DIMENSIONS = 1536
const MOCK_SEED = 42

function deterministicMockEmbedding(text: string, dims: number): number[] {
  let hash = MOCK_SEED
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
  }
  const vec: number[] = []
  let seed = Math.abs(hash)
  for (let i = 0; i < dims; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    vec.push((seed / 0x7fffffff) * 2 - 1)
  }
  const magnitude = Math.sqrt(vec.reduce((s, v) => s + v * v, 0))
  return vec.map((v) => v / (magnitude || 1))
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = "mock"

  async embed(text: string): Promise<number[]> {
    return deterministicMockEmbedding(text, MOCK_DIMENSIONS)
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map((t) => deterministicMockEmbedding(t, MOCK_DIMENSIONS))
  }

  async isAvailable(): Promise<boolean> {
    return true
  }
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = "openai"
  private inner: RagEmbeddingProvider

  constructor() {
    this.inner = getRagEmbeddingProvider()
  }

  async embed(text: string): Promise<number[]> {
    const resp = await this.inner.embed({ input: text })
    const emb = resp.embeddings[0]
    if (!emb) throw new Error("OpenAI embedding returned empty result")
    return emb
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const resp = await this.inner.embed({ input: texts })
    return resp.embeddings
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY)
  }
}

export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = "local";
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl =
      process.env.AI_LOCAL_BASE_URL ?? "http://localhost:11434";
    this.model = process.env.AI_LOCAL_EMBED_MODEL ?? "nomic-embed-text";
  }

  async embed(text: string): Promise<number[]> {
    const batch = await this.embedBatch([text]);
    const vec = batch[0];
    if (!vec) throw new Error("Ollama embedding returned empty result");
    return vec;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`Ollama embeddings error ${res.status}`);
    }
    const data = (await res.json()) as { embeddings?: number[][] };
    return data.embeddings ?? [];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export function createEmbeddingProvider(type?: EmbeddingProviderType): EmbeddingProvider {
  const resolvedType = type ?? (process.env.EMBEDDING_PROVIDER as EmbeddingProviderType) ?? "mock"
  switch (resolvedType) {
    case "openai":
      return new OpenAIEmbeddingProvider()
    case "local":
      return new LocalEmbeddingProvider()
    case "mock":
      return new MockEmbeddingProvider()
    default:
      return new MockEmbeddingProvider()
  }
}

let _defaultProvider: EmbeddingProvider | null = null

export function getDefaultEmbeddingProvider(): EmbeddingProvider {
  if (!_defaultProvider) {
    _defaultProvider = createEmbeddingProvider()
  }
  return _defaultProvider
}

export function setDefaultEmbeddingProvider(provider: EmbeddingProvider | null): void {
  _defaultProvider = provider
}
