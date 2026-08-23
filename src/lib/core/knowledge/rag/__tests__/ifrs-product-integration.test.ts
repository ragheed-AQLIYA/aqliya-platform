/** @jest-environment node */

import type { SearchResult } from "@/lib/core/ai/types"

jest.mock("@/lib/core/knowledge/rag/rag-retriever", () => ({
  searchChunks: jest.fn(),
}))

import { searchChunks } from "@/lib/core/knowledge/rag/rag-retriever"
const mockSearchChunks = searchChunks as jest.MockedFunction<typeof searchChunks>

const mockResults: SearchResult[] = [
  {
    chunkId: "chunk-1",
    documentId: "ifrs-kf-ias-2",
    content:
      "[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement] Inventories shall be measured at the lower of cost and net realisable value.",
    metadata: { standardCode: "IAS 2", paragraphRef: "IAS 2.9" },
    similarity: 0.85,
  },
  {
    chunkId: "chunk-2",
    documentId: "ifrs-kf-ias-16",
    content:
      "[IAS 16 | IAS 16:2024 | IAS 16.6 | recognition] Property, plant and equipment shall be recognised as an asset when.",
    metadata: { standardCode: "IAS 16", paragraphRef: "IAS 16.6" },
    similarity: 0.65,
  },
]

describe("IFRS RAG Product Integration", () => {
  beforeEach(() => {
    mockSearchChunks.mockResolvedValue(mockResults)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("LocalContentOS: returns relevant standards for classification query", async () => {
    const { searchLocalContentRelevantStandards } = await import(
      "@/lib/local-content/rag-integration"
    )

    const ctx = await searchLocalContentRelevantStandards("direct materials", "oil-gas")

    expect(ctx.relevantStandards).toContain("IAS 2")
    expect(ctx.citations.length).toBeGreaterThan(0)
    expect(ctx.citations[0]).toHaveProperty("standardCode")
    expect(ctx.citations[0]).toHaveProperty("relevance")
  })

  it("DecisionOS: returns relevant standards for decision query", async () => {
    const { searchDecisionRelevantStandards } = await import(
      "@/lib/decisions/rag-integration"
    )

    const ctx = await searchDecisionRelevantStandards(
      "investment",
      "capital expenditure on new equipment",
    )

    expect(ctx.relevantStandards.length).toBeGreaterThan(0)
    expect(ctx.citations.length).toBeGreaterThan(0)
  })

  it("SalesOS: returns relevant standards for sales query", async () => {
    const { searchSalesRelevantStandards } = await import(
      "@/lib/sales/rag-integration"
    )

    const ctx = await searchSalesRelevantStandards(
      "multi-element arrangement",
      "software license",
    )

    expect(ctx.relevantStandards.length).toBeGreaterThan(0)
    expect(ctx.citations.length).toBeGreaterThan(0)
  })

  it("degrades gracefully on error for all products", async () => {
    mockSearchChunks.mockRejectedValue(new Error("connection refused"))

    const { searchLocalContentRelevantStandards } = await import(
      "@/lib/local-content/rag-integration"
    )
    const { searchDecisionRelevantStandards } = await import(
      "@/lib/decisions/rag-integration"
    )
    const { searchSalesRelevantStandards } = await import(
      "@/lib/sales/rag-integration"
    )

    const lcos = await searchLocalContentRelevantStandards("test", "test")
    const decision = await searchDecisionRelevantStandards("test", "test")
    const sales = await searchSalesRelevantStandards("test", "test")

    expect(lcos).toEqual({ relevantStandards: [], citations: [] })
    expect(decision).toEqual({ relevantStandards: [], citations: [] })
    expect(sales).toEqual({ relevantStandards: [], citations: [] })
  })

  it("API route returns valid JSON", async () => {
    const { GET } = await import(
      "@/app/api/knowledge/rag/search/route"
    )

    const response = await GET()
    const body = await response.json()

    expect(body.status).toBe("healthy")
    expect(body.service).toBe("ifrs-rag-search")
    expect(body.metrics).toBeDefined()
  })

  it("stats endpoint returns metrics", async () => {
    const { GET } = await import(
      "@/app/api/knowledge/rag/stats/route"
    )

    const response = await GET()
    const body = await response.json()

    expect(body.status).toBe("healthy")
    expect(body.service).toBe("ifrs-rag")
    expect(body.metrics).toBeDefined()
    expect(body.rateLimits).toBeDefined()
    expect(body.timestamp).toBeDefined()
  })
})
