/**
 * searchChunks ordering guarantees:
 *   1. Cache hits NEVER consume rate-limit quota (cache checked first).
 *   2. Cache misses are still guarded by the purpose-scoped limiter.
 *   3. The enrich purpose accommodates full engine-sized batches.
 *
 * The retriever under test is REAL — only its deepest dependency
 * (hybrid-search) and server-only boundaries are mocked, so the real
 * limiter + cache + metrics integration is exercised.
 */

jest.mock("server-only", () => ({}))
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}))
jest.mock("../embedding-provider", () => ({
  setRagEmbeddingProvider: jest.fn(),
}))
jest.mock("../hybrid-search", () => ({
  hybridSearchChunks: jest.fn(),
}))

import { hybridSearchChunks } from "../hybrid-search"
import { searchChunks } from "../rag-retriever"
import { RagError } from "../rag-errors"
import {
  cacheKey,
  clearCache,
  getCached,
  setCached,
} from "../rag-cache"
import {
  getRemainingRequests,
  resetRateLimit,
} from "../rag-rate-limiter"

const mockedHybrid = hybridSearchChunks as jest.MockedFunction<typeof hybridSearchChunks>

const sampleResult = {
  chunkId: "chunk-order-1",
  documentId: "ifrs-kf-ias-2",
  content: "[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement] sample",
  metadata: { standardCode: "IAS 2", paragraphRef: "IAS 2.9" },
  similarity: 0.85,
}

beforeEach(() => {
  resetRateLimit("org-order-1")
  resetRateLimit("org-order-2")
  resetRateLimit("org-order-3")
  clearCache()
  mockedHybrid.mockReset()
  mockedHybrid.mockResolvedValue({
    results: [sampleResult],
    mode: "vector",
    vectorCount: 1,
    lexicalCount: 0,
  })
})

describe("searchChunks cache/limiter ordering", () => {
  it("cache hits never consume rate-limit quota", async () => {
    const query = "cached measurement query"
    // Precisely reproduce the retriever's cache key and warm it.
    const key = cacheKey(query, {
      limit: 3,
      minSimilarity: 0.2,
      documentId: null,
      orgId: "org-order-1",
    })
    setCached(key, [sampleResult])

    // 15 hits — more than double the interactive budget of 10
    for (let i = 0; i < 15; i++) {
      const results = await searchChunks(query, {
        organizationId: "org-order-1",
        limit: 3,
        minSimilarity: 0.2,
      })
      expect(results).toEqual([sampleResult])
    }

    expect(mockedHybrid).not.toHaveBeenCalled()
    expect(getRemainingRequests("org-order-1")).toBe(10)
  })

  it("cache misses are still guarded by the interactive limiter", async () => {
    // 10 distinct queries = 10 misses = interactive budget consumed
    for (let i = 1; i <= 10; i++) {
      const results = await searchChunks(`distinct query ${i}`, {
        organizationId: "org-order-2",
        limit: 3,
        minSimilarity: 0.2,
      })
      expect(results).toEqual([sampleResult])
    }

    // Each result was cached under its own key
    expect(
      getCached(
        cacheKey("distinct query 1", {
          limit: 3,
          minSimilarity: 0.2,
          documentId: null,
          orgId: "org-order-2",
        }),
      ),
    ).toEqual([sampleResult])

    await expect(
      searchChunks("the eleventh distinct query", {
        organizationId: "org-order-2",
        limit: 3,
        minSimilarity: 0.2,
      }),
    ).rejects.toMatchObject({ code: "RATE_LIMITED" })

    expect(mockedHybrid).toHaveBeenCalledTimes(10)
  })

  it("enrich purpose accommodates a full engine-sized batch (48 rules)", async () => {
    for (let i = 1; i <= 48; i++) {
      const results = await searchChunks(`engine rule query ${i}`, {
        organizationId: "org-order-3",
        limit: 6,
        minSimilarity: 0.2,
        purpose: "enrich",
      })
      expect(results).toEqual([sampleResult])
    }

    // All 48 distinct searches executed — none rate-limited
    expect(mockedHybrid).toHaveBeenCalledTimes(48)
    expect(getRemainingRequests("org-order-3", "enrich")).toBe(72)
    // Interactive bucket untouched by enrich traffic
    expect(getRemainingRequests("org-order-3", "interactive")).toBe(10)
    expect(RagError).toBeDefined()
  })
})
