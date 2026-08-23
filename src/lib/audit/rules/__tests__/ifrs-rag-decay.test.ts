/**
 * Regression test — engine-scale RAG enrichment must not silently starve.
 *
 * Before the purpose-scoped rate buckets existed, a single 48-rule engine
 * run exhausted the shared 10/min interactive budget: the first ~10 rules
 * got citations and the rest silently degraded to [] (errors swallowed by
 * the graceful-degradation catch). This test exercises the REAL retriever
 * + limiter + cache (only hybrid-search and server boundaries mocked)
 * through the production enrichment path (searchRagCitations →
 * searchIfrsKnowledge → searchChunks) and asserts no decay occurs.
 */

jest.mock("server-only", () => ({}))
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}))
jest.mock("@/lib/core/knowledge/rag/embedding-provider", () => ({
  setRagEmbeddingProvider: jest.fn(),
}))
jest.mock("@/lib/core/knowledge/rag/hybrid-search", () => ({
  hybridSearchChunks: jest.fn(),
}))

import { hybridSearchChunks } from "@/lib/core/knowledge/rag/hybrid-search"
import { searchIfrsKnowledge } from "@/lib/core/knowledge/rag/ifrs-search"
import { searchRagCitations } from "../ifrs-rule-checks/rag-citation"
import type { IfrsKnowledgeRule } from "../types"
import { clearCache } from "@/lib/core/knowledge/rag/rag-cache"
import { resetRateLimit } from "@/lib/core/knowledge/rag/rag-rate-limiter"

const mockedHybrid = hybridSearchChunks as jest.MockedFunction<typeof hybridSearchChunks>

function makeHybridResult(queryIndex: number) {
  return {
    results: [
      {
        chunkId: `chunk-decay-${queryIndex}`,
        documentId: "ifrs-kf-ias-2",
        content: `[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement] rule ${queryIndex} sample text`,
        metadata: { standardCode: "IAS 2", paragraphRef: "IAS 2.9" },
        similarity: 0.8,
      },
    ],
    mode: "vector",
    vectorCount: 1,
    lexicalCount: 0,
  }
}

function makeRule(i: number): IfrsKnowledgeRule {
  return {
    ruleId: `IAS-2.${i}`,
    paragraphReference: `IAS 2.${i}`,
    ruleText: `Distinct inventory rule number ${i} for measurement of cost and net realisable value.`,
    // Topic matches the mocked chunk content (`| measurement]`) so the
    // topic filter inside searchIfrsKnowledge passes; queries stay
    // distinct via paragraphReference + ruleText.
    topic: "measurement",
    standardCode: "IAS 2",
    versionLabel: "IAS 2:2024",
  }
}

beforeEach(() => {
  resetRateLimit("platform")
  clearCache()
  mockedHybrid.mockReset()
  mockedHybrid.mockImplementation(async (_query: string) => makeHybridResult(0))
})

describe("engine-scale RAG enrichment decay regression", () => {
  it("a full 48-rule run receives citations for every rule (enrich bucket)", async () => {
    const rules = Array.from({ length: 48 }, (_, i) => makeRule(i + 1))

    for (const rule of rules) {
      const citations = await searchRagCitations(rule, "platform")
      expect(citations.length).toBeGreaterThanOrEqual(1)
      expect(citations[0].standardCode).toBe("IAS 2")
    }

    // 48 distinct searches executed — none silently swallowed
    expect(mockedHybrid).toHaveBeenCalledTimes(48)
  })

  it("interactive purpose still degrades gracefully past 10/min (why enrich exists)", async () => {
    // Default purpose = interactive (the dashboard/API path) — 10/min budget
    const outcomes: boolean[] = []
    for (let i = 1; i <= 12; i++) {
      const results = await searchIfrsKnowledge(`interactive probe query ${i}`, {
        organizationId: "platform",
      })
      outcomes.push(results.length > 0)
    }

    // First 10 succeed, 11th+ gracefully return empty (no throw)
    expect(outcomes.slice(0, 10).every(Boolean)).toBe(true)
    expect(outcomes.slice(10).some(Boolean)).toBe(false)
  })
})
