/**
 * Integration Test: RAG + Rule-Check Integration
 *
 * Tests searchRagCitations and evaluateIfrsRuleWithRag:
 * - RAG citation mapping
 * - Graceful degradation when RAG is unavailable
 * - Correct query construction
 * - evaluateIfrsRuleWithRag enrichment and guard conditions
 */

import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types"
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks/types"
import type { SearchResult } from "@/lib/core/ai/types"

jest.mock("@/lib/core/knowledge/rag/rag-retriever", () => ({
  searchChunks: jest.fn(),
}))

import { searchChunks } from "@/lib/core/knowledge/rag/rag-retriever"
import { searchRagCitations } from "@/lib/audit/rules/ifrs-rule-checks/rag-citation"
import { evaluateIfrsRuleWithRag } from "@/lib/audit/rules/ifrs-rule-checks/evaluator"

const mockSearchChunks = searchChunks as jest.MockedFunction<typeof searchChunks>

// --- Shared test data ---

const sampleRule: IfrsKnowledgeRule = {
  ruleId: "IAS-2.9",
  paragraphReference: "IAS 2.9",
  ruleText:
    "Inventories shall be measured at the lower of cost and net realisable value.",
  topic: "measurement",
  standardCode: "IAS 2",
  versionLabel: "IAS 2:2024",
  confidenceScore: 0.95,
}

const sampleCtx: IfrsEvaluationContext = {
  engagementId: "test-engagement",
  engagementStatus: "active",
  reportingFramework: "IFRS",
  currencyCode: "SAR",
  statementTypes: ["balanceSheet", "incomeStatement"],
  statements: [],
  mappings: [],
  tbLines: [],
  disclosureNoteCount: 5,
  organizationId: "platform",
  ragEnabled: true,
}

const mockSearchResult: SearchResult[] = [
  {
    chunkId: "chunk-1",
    documentId: "ifrs-kf-ias-2",
    content:
      "[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement] Inventories shall be measured at the lower of cost and net realisable value.",
    metadata: {
      standardCode: "IAS 2",
      paragraphRef: "IAS 2.9",
      sourceUrl: "https://example.com",
    },
    similarity: 0.85,
  },
]

// --- Tests ---

describe("searchRagCitations", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns citations when RAG has matching chunks", async () => {
    mockSearchChunks.mockResolvedValue([
      ...mockSearchResult,
      {
        chunkId: "chunk-2",
        documentId: "ifrs-kf-ias-2",
        content: "[IAS 2 | IAS 2:2024 | IAS 2.10 | measurement] Cost of purchase includes...",
        metadata: { standardCode: "IAS 2", paragraphRef: "IAS 2.10" },
        similarity: 0.72,
      },
    ])

    const citations = await searchRagCitations(sampleRule, "platform")

    expect(citations).toHaveLength(2)
    expect(citations[0]).toEqual({
      chunkId: "chunk-1",
      documentId: "ifrs-kf-ias-2",
      standardCode: "IAS 2",
      paragraphRef: "IAS 2.9",
      contentPreview: expect.stringContaining("Inventories shall be measured"),
      relevance: 1.0,
      sourceUrl: "https://example.com",
    })
    expect(citations[1]).toEqual({
      chunkId: "chunk-2",
      documentId: "ifrs-kf-ias-2",
      standardCode: "IAS 2",
      paragraphRef: "IAS 2.10",
      contentPreview: expect.stringContaining("Cost of purchase"),
      relevance: 0.87,
      sourceUrl: undefined,
    })
  })

  it("returns empty array when RAG returns no results", async () => {
    mockSearchChunks.mockResolvedValue([])

    const citations = await searchRagCitations(sampleRule, "platform")

    expect(citations).toEqual([])
  })

  it("returns empty array when RAG throws an error", async () => {
    mockSearchChunks.mockRejectedValue(new Error("RAG unavailable"))

    const citations = await searchRagCitations(sampleRule, "platform")

    expect(citations).toEqual([])
  })

  it("builds correct query from rule properties", async () => {
    mockSearchChunks.mockResolvedValue([])

    await searchRagCitations(sampleRule, "platform")

    expect(mockSearchChunks).toHaveBeenCalledTimes(1)
    const query = mockSearchChunks.mock.calls[0][0] as string
    expect(query).toContain("IAS 2")
    expect(query).toContain("IAS 2.9")
    expect(query).toContain("measurement")
    expect(query).toContain(sampleRule.ruleText.slice(0, 200))
  })
})

describe("evaluateIfrsRuleWithRag", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("enriches evaluation with RAG citations when enabled", async () => {
    mockSearchChunks.mockResolvedValue(mockSearchResult)

    const result = await evaluateIfrsRuleWithRag(sampleRule, sampleCtx)

    expect(result.ragCitations).toBeDefined()
    expect(result.ragCitations).toHaveLength(1)
    expect(result.ragCitations![0].chunkId).toBe("chunk-1")
    expect(result.ragCitations![0].relevance).toBe(1.0)
    expect(result.status).toBeDefined()
  })

  it("does not call RAG when ragEnabled is false", async () => {
    const ctx = { ...sampleCtx, ragEnabled: false }

    const result = await evaluateIfrsRuleWithRag(sampleRule, ctx)

    expect(mockSearchChunks).not.toHaveBeenCalled()
    expect(result.ragCitations).toBeUndefined()
  })

  it("does not call RAG when organizationId is missing", async () => {
    const ctx = { ...sampleCtx, organizationId: undefined }

    const result = await evaluateIfrsRuleWithRag(sampleRule, ctx)

    expect(mockSearchChunks).not.toHaveBeenCalled()
    expect(result.ragCitations).toBeUndefined()
  })

  it("degrades gracefully when RAG fails", async () => {
    mockSearchChunks.mockRejectedValue(new Error("RAG pipeline error"))

    const result = await evaluateIfrsRuleWithRag(sampleRule, sampleCtx)

    expect(result.status).toBeDefined()
    expect(result.messageAr).toBeDefined()
    expect(result.messageEn).toBeDefined()
    expect(result.ragCitations).toBeUndefined()
  })
})
