import { hybridSearchChunks } from "@/lib/rag/hybrid-search"
import { setRagEmbeddingProvider } from "@/lib/rag/embedding-provider"
import type { EmbeddingProvider } from "@/lib/ai/types"

const mockProvider: EmbeddingProvider = {
  async embed({ input }) {
    const texts = Array.isArray(input) ? input : [input]
    return {
      embeddings: texts.map(() => Array.from({ length: 1536 }, () => 0.01)),
      usage: { totalTokens: 1 },
    }
  },
}

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(async () => []),
    documentChunk: {
      findMany: jest.fn(async () => [
        {
          id: "lex-1",
          documentId: "doc-1",
          content: "institutional policy text",
          metadata: {},
        },
      ]),
    },
  },
}))

describe("hybridSearchChunks", () => {
  beforeEach(() => {
    setRagEmbeddingProvider(mockProvider)
  })

  it("falls back to lexical when vector empty", async () => {
    const result = await hybridSearchChunks("institutional policy", {
      organizationId: "org-1",
      limit: 5,
    })
    expect(result.mode).toBe("lexical")
    expect(result.results.length).toBeGreaterThan(0)
  })
})
