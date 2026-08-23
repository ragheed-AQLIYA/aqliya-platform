/** @jest-environment node */

import {
  searchIfrsKnowledge,
  buildIfrsQuery,
  formatIfrsCitations,
} from "../ifrs-search"
import type { SearchResult } from "@/lib/core/ai/types"

jest.mock("@/lib/core/knowledge/rag/rag-retriever", () => ({
  searchChunks: jest.fn(),
}))

import { searchChunks } from "@/lib/core/knowledge/rag/rag-retriever"
const mockSearchChunks = searchChunks as jest.MockedFunction<typeof searchChunks>

describe("IFRS Search Quality", () => {
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
      documentId: "ifrs-kf-ifrs-17",
      content:
        "[IFRS 17 | IFRS 17:2024 | IFRS 17.1 | scope] An entity shall apply this Standard to insurance contracts.",
      metadata: { standardCode: "IFRS 17", paragraphRef: "IFRS 17.1" },
      similarity: 0.45,
    },
    {
      chunkId: "chunk-3",
      documentId: "ifrs-kf-ias-1",
      content:
        "[IAS 1 | IAS 1:2024 | IAS 1.10 | complete-set] A complete set of financial statements.",
      metadata: { standardCode: "IAS 1", paragraphRef: "IAS 1.10" },
      similarity: 0.40,
    },
  ]

  beforeEach(() => {
    mockSearchChunks.mockResolvedValue(mockResults)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("searchIfrsKnowledge", () => {
    it("calls searchChunks with 3x limit for reranking", async () => {
      await searchIfrsKnowledge("inventories", { limit: 3, standardCode: "IAS 2" })

      expect(mockSearchChunks).toHaveBeenCalledWith(
        "inventories",
        expect.objectContaining({ limit: 9 }),
      )
    })

    it("filters by standardCode using metadata", async () => {
      const results = await searchIfrsKnowledge("inventories", {
        standardCode: "IAS 2",
      })

      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(
        results.every(
          (r) =>
            r.documentId.toUpperCase().includes("IAS-2") ||
            (r.metadata.standardCode as string).toUpperCase() === "IAS 2",
        ),
      ).toBe(true)
    })

    it("filters by standardCode using documentId", async () => {
      const results = await searchIfrsKnowledge("contracts", {
        standardCode: "IFRS 17",
      })

      expect(results).toHaveLength(1)
      expect(results[0].documentId).toBe("ifrs-kf-ifrs-17")
    })

    it("applies metadata boost for exact standardCode match", async () => {
      const results = await searchIfrsKnowledge("measurement", {
        standardCode: "IAS 2",
      })

      expect(results[0].chunkId).toBe("chunk-1")
      expect(results[0].similarity).toBeGreaterThan(0.85)
    })

    it("returns empty when no match", async () => {
      mockSearchChunks.mockResolvedValue([])
      const results = await searchIfrsKnowledge("xyz123")
      expect(results).toEqual([])
    })

    it("degrades gracefully on error", async () => {
      mockSearchChunks.mockRejectedValue(new Error("timeout"))
      const results = await searchIfrsKnowledge("test")
      expect(results).toEqual([])
    })

    it("respects limit option", async () => {
      const results = await searchIfrsKnowledge("inventories", { limit: 1 })
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it("applies minSimilarity to underlying search", async () => {
      await searchIfrsKnowledge("query", { minSimilarity: 0.5 })

      expect(mockSearchChunks).toHaveBeenCalledWith(
        "query",
        expect.objectContaining({ minSimilarity: 0.5 }),
      )
    })

    it("defaults organizationId to platform", async () => {
      await searchIfrsKnowledge("query")

      expect(mockSearchChunks).toHaveBeenCalledWith(
        "query",
        expect.objectContaining({ organizationId: "platform" }),
      )
    })
  })

  describe("buildIfrsQuery", () => {
    it("combines rule properties into query", () => {
      const query = buildIfrsQuery(
        "IAS 2",
        "IAS 2.9",
        "measurement",
        "Inventories shall be measured",
      )
      expect(query).toContain("IAS 2")
      expect(query).toContain("IAS 2.9")
      expect(query).toContain("measurement")
      expect(query).toContain("Inventories shall be measured")
    })

    it("truncates long rule text at 200 chars", () => {
      const longText = "x".repeat(500)
      const query = buildIfrsQuery("IAS 2", "IAS 2.9", "measurement", longText)
      expect(query.length).toBeLessThan(400)
      expect(query).toContain("x".repeat(200))
    })

    it("does not truncate short rule text", () => {
      const shortText = "Short rule"
      const query = buildIfrsQuery("IAS 2", "IAS 2.9", "measurement", shortText)
      expect(query).toContain(shortText)
    })
  })

  describe("formatIfrsCitations", () => {
    it("formats search results into citations", () => {
      const citations = formatIfrsCitations([mockResults[0]])
      expect(citations).toHaveLength(1)
      expect(citations[0].standardCode).toBe("IAS 2")
      expect(citations[0].paragraphRef).toBe("IAS 2.9")
      expect(citations[0].relevance).toBe(0.85)
      expect(citations[0].chunkId).toBe("chunk-1")
      expect(citations[0].documentId).toBe("ifrs-kf-ias-2")
    })

    it("truncates content preview to 300 chars", () => {
      const longContent: SearchResult = {
        ...mockResults[0],
        content: "x".repeat(500),
      }
      const citations = formatIfrsCitations([longContent])
      expect(citations[0].contentPreview.length).toBeLessThanOrEqual(300)
    })

    it("handles missing metadata gracefully", () => {
      const noMeta: SearchResult = {
        chunkId: "chunk-x",
        documentId: "doc-x",
        content: "content",
        metadata: {},
        similarity: 0.5,
      }
      const citations = formatIfrsCitations([noMeta])
      expect(citations[0].standardCode).toBe("")
      expect(citations[0].paragraphRef).toBe("")
      expect(citations[0].sourceUrl).toBeUndefined()
    })

    it("preserves sourceUrl when present", () => {
      const withUrl: SearchResult = {
        ...mockResults[0],
        metadata: { ...mockResults[0].metadata, sourceUrl: "https://ifrs.org/ias-2" },
      }
      const citations = formatIfrsCitations([withUrl])
      expect(citations[0].sourceUrl).toBe("https://ifrs.org/ias-2")
    })
  })
})
