import {
  cosineSimilarity,
  findSimilarChunks,
  type SearchResult,
  type SearchOptions,
} from "../retrieval/similarity-search"
import {
  formatContext,
  formatContextWithEvidence,
  buildContext,
} from "../retrieval/context-builder"
import { MockEmbeddingProvider } from "../embedding/embedding-provider"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    documentChunk: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
    },
    intelligenceQuery: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    intelligenceGraphNode: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    intelligenceGraphEdge: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    ingestionBatch: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    ingestionDocument: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $executeRawUnsafe: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  },
}))

jest.mock("@/lib/platform/pgvector-compat", () => ({
  isPgvectorAvailable: jest.fn().mockResolvedValue(false),
  getEmbeddingType: () => "JSON",
  getFallbackEmbeddingType: () => "JSON",
  supportsSimilaritySearch: jest.fn().mockResolvedValue(false),
}))

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}))

describe("InstitutionalMemory", () => {
  describe("cosineSimilarity", () => {
    it("computes similarity correctly", () => {
      const a = [1, 0, 0]
      const b = [1, 0, 0]
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 10)
    })
  })

  describe("formatContext", () => {
    it("returns empty string for empty array", () => {
      expect(formatContext([])).toBe("")
    })

    it("formats chunks with source markers", () => {
      const chunks: SearchResult[] = [
        {
          chunkId: "c1",
          documentId: "d1",
          content: "Hello world",
          chunkIndex: 0,
          tokenCount: 3,
          metadata: {},
          score: 0.95,
          createdAt: new Date(),
        },
      ]
      const result = formatContext(chunks)
      expect(result).toContain("[Source 1]")
      expect(result).toContain("95.0%")
      expect(result).toContain("Hello world")
    })
  })

  describe("formatContextWithEvidence", () => {
    it("returns context and evidence array", () => {
      const chunks: SearchResult[] = [
        {
          chunkId: "c1",
          documentId: "d1",
          content: "Test content",
          chunkIndex: 0,
          tokenCount: 2,
          metadata: {},
          score: 0.9,
          createdAt: new Date(),
        },
      ]
      const result = formatContextWithEvidence(chunks)
      expect(result.context).toContain("Test content")
      expect(result.evidence).toHaveLength(1)
      expect(result.evidence[0].chunkId).toBe("c1")
      expect(result.evidence[0].score).toBe(0.9)
    })
  })
})
