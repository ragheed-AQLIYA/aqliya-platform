import { jest } from "@jest/globals"

jest.mock("@/lib/rag/embedding-service", () => ({
  embedAndStore: jest.fn(async () => ({ chunkCount: 2, tokenCount: 10 })),
  deleteDocumentEmbeddings: jest.fn(async () => 2),
}))

jest.mock("@/lib/rag/intelligence-core-rag", () => ({
  retrieveGovernedContext: jest.fn(async () => ({
    chunks: [{ chunkId: "c1", documentId: "d1", content: "test", metadata: {}, similarity: 0.9 }],
    query: "test",
    organizationId: "org-1",
    evidence: [],
    ranking: { resultCount: 1, topSimilarity: 0.9, minSimilarityApplied: 0.25, avgSimilarity: 0.9 },
    governanceSummary: { productKeys: [], sensitivities: [] },
    retrievedAt: new Date().toISOString(),
  })),
  toGovernedRAGPayload: jest.fn(() => ({ query: "test" })),
}))

jest.mock("@/lib/rag/hybrid-search", () => ({
  hybridSearchChunks: jest.fn(async () => ({
    results: [{ chunkId: "c1", documentId: "d1", content: "test", metadata: {}, similarity: 0.9 }],
    mode: "vector",
    vectorCount: 1,
    lexicalCount: 0,
  })),
}))

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(async () => {}),
}))

jest.mock("@/lib/prisma", () => {
  const chunks = [
    {
      metadata: { governance: { productKey: "ai_core", sensitivity: "internal" } },
      tokenCount: 5,
      createdAt: new Date(),
    },
  ]
  return {
    prisma: {
      documentChunk: {
        findMany: jest.fn(async () => chunks),
      },
    },
  }
})

import { isEnabled } from "@/lib/platform/feature-flags/registry"
import {
  ingestKnowledgeDocument,
  searchKnowledge,
  getKnowledgeDocumentMetadata,
  deleteKnowledgeDocument,
} from "@/lib/rag/knowledge-service"

describe("knowledge-service", () => {
  const prev = process.env.FF_AI_RAG

  beforeEach(() => {
    process.env.FF_AI_RAG = "true"
  })

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AI_RAG
    else process.env.FF_AI_RAG = prev
  })

  it("requires FF_AI_RAG", async () => {
    delete process.env.FF_AI_RAG
    await expect(
      ingestKnowledgeDocument("org", { documentId: "d", content: "x" }),
    ).rejects.toThrow("KNOWLEDGE_DISABLED")
  })

  it("ingests document", async () => {
    expect(isEnabled("ai.rag")).toBe(true)
    const result = await ingestKnowledgeDocument("org-1", {
      documentId: "doc-1",
      content: "Institutional knowledge text.",
    })
    expect(result.chunkCount).toBe(2)
  })

  it("searches with governed payload", async () => {
    const result = await searchKnowledge("org-1", { query: "institutional" })
    expect(result.resultCount).toBeGreaterThan(0)
    expect(result.payload).toBeDefined()
  })

  it("returns metadata", async () => {
    const meta = await getKnowledgeDocumentMetadata("org-1", "doc-1")
    expect(meta?.chunkCount).toBe(1)
  })

  it("deletes document embeddings", async () => {
    const result = await deleteKnowledgeDocument("org-1", "doc-1")
    expect(result.deletedCount).toBe(2)
  })
})
