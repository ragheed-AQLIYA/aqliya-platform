import {
  MockEmbeddingProvider,
  createEmbeddingProvider,
  type EmbeddingProvider,
} from "../embedding/embedding-provider"

describe("EmbeddingProvider", () => {
  describe("MockEmbeddingProvider", () => {
    let provider: EmbeddingProvider

    beforeAll(() => {
      provider = new MockEmbeddingProvider()
    })

    it("generates correct dimensions (1536)", async () => {
      const emb = await provider.embed("test text")
      expect(emb).toHaveLength(1536)
    })

    it("generates deterministic results for same input", async () => {
      const emb1 = await provider.embed("hello world")
      const emb2 = await provider.embed("hello world")
      expect(emb1).toEqual(emb2)
    })

    it("generates different results for different inputs", async () => {
      const emb1 = await provider.embed("hello")
      const emb2 = await provider.embed("world")
      expect(emb1).not.toEqual(emb2)
    })

    it("produces normalized vectors (unit length)", async () => {
      const emb = await provider.embed("test vector")
      const magnitude = Math.sqrt(emb.reduce((s, v) => s + v * v, 0))
      expect(magnitude).toBeCloseTo(1, 5)
    })

    it("embedBatch returns correct number of embeddings", async () => {
      const texts = ["first", "second", "third"]
      const embeddings = await provider.embedBatch(texts)
      expect(embeddings).toHaveLength(3)
      for (const emb of embeddings) {
        expect(emb).toHaveLength(1536)
      }
    })

    it("isAvailable returns true", async () => {
      await expect(provider.isAvailable()).resolves.toBe(true)
    })
  })

  describe("createEmbeddingProvider factory", () => {
    it("creates MockEmbeddingProvider for 'mock' type", () => {
      const provider = createEmbeddingProvider("mock")
      expect(provider.providerId).toBe("mock")
    })

    it("creates OpenAIEmbeddingProvider for 'openai' type", () => {
      const provider = createEmbeddingProvider("openai")
      expect(provider.providerId).toBe("openai")
    })

    it("creates LocalEmbeddingProvider for 'local' type", () => {
      const provider = createEmbeddingProvider("local")
      expect(provider.providerId).toBe("local")
    })

    it("falls back to mock for unknown type", () => {
      const provider = createEmbeddingProvider("unknown" as never)
      expect(provider.providerId).toBe("mock")
    })
  })
})
