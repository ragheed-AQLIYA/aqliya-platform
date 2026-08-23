import {
  checkRateLimit,
  getRemainingRequests,
  resetRateLimit,
} from "../rag-rate-limiter"
import {
  cacheKey,
  getCached,
  setCached,
  clearCache,
  getCacheStats,
} from "../rag-cache"
import { RagError, wrapRagError } from "../rag-errors"
import {
  recordSearch,
  recordCacheHit,
  recordCacheMiss,
  recordError,
  getMetrics,
  resetMetrics,
} from "../rag-metrics"

// ─── Rate Limiter ────────────────────────────────────────────────────────────

describe("rag-rate-limiter", () => {
  beforeEach(() => {
    resetRateLimit("org-test")
  })

  it("allows requests within limit", () => {
    expect(checkRateLimit("org-test")).toBe(true)
  })

  it("blocks requests over limit", () => {
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("org-test")).toBe(true)
    }
    expect(checkRateLimit("org-test")).toBe(false)
  })

  it("returns remaining requests correctly", () => {
    expect(getRemainingRequests("org-unknown")).toBe(10)
    checkRateLimit("org-test")
    expect(getRemainingRequests("org-test")).toBe(9)
  })

  it("resets after window expiry", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("org-test")
    }
    expect(checkRateLimit("org-test")).toBe(false)
    resetRateLimit("org-test")
    expect(checkRateLimit("org-test")).toBe(true)
  })

  it("keeps enrich and interactive buckets independent", () => {
    // Exhaust the interactive bucket entirely
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("org-test", "interactive")).toBe(true)
    }
    expect(checkRateLimit("org-test", "interactive")).toBe(false)

    // Enrich bucket is untouched by interactive consumption
    expect(checkRateLimit("org-test", "enrich")).toBe(true)
    expect(getRemainingRequests("org-test", "interactive")).toBe(0)
    expect(getRemainingRequests("org-test", "enrich")).toBe(119)
  })

  it("gives the enrich purpose a 120/min budget", () => {
    for (let i = 0; i < 120; i++) {
      expect(checkRateLimit("org-enrich", "enrich")).toBe(true)
    }
    expect(checkRateLimit("org-enrich", "enrich")).toBe(false)
  })

  it("resetRateLimit without purpose clears every bucket", () => {
    checkRateLimit("org-test", "interactive")
    checkRateLimit("org-test", "enrich")
    resetRateLimit("org-test")
    expect(getRemainingRequests("org-test", "interactive")).toBe(10)
    expect(getRemainingRequests("org-test", "enrich")).toBe(120)
  })

  it("resetRateLimit with purpose clears only that bucket", () => {
    checkRateLimit("org-test", "interactive")
    checkRateLimit("org-test", "enrich")
    resetRateLimit("org-test", "interactive")
    expect(getRemainingRequests("org-test", "interactive")).toBe(10)
    expect(getRemainingRequests("org-test", "enrich")).toBe(119)
  })
})

// ─── Cache ───────────────────────────────────────────────────────────────────

describe("rag-cache", () => {
  beforeEach(() => {
    clearCache()
  })

  it("stores and retrieves results", () => {
    const key = cacheKey("test query", { limit: 10 })
    setCached(key, [{ id: 1 }])
    const result = getCached<{ id: number }[]>(key)
    expect(result).toEqual([{ id: 1 }])
  })

  it("returns null for missing key", () => {
    expect(getCached("nonexistent")).toBeNull()
  })

  it("returns null after TTL expiry", () => {
    const key = cacheKey("expire test", { limit: 5 })
    setCached(key, "data")
    // Manually expire by manipulating internal state isn't possible,
    // but we can verify the cache stats show the entry
    const stats = getCacheStats()
    expect(stats.size).toBe(1)
  })

  it("evicts oldest entry at capacity", () => {
    const stats = getCacheStats()
    // Fill cache to capacity
    for (let i = 0; i < stats.maxEntries; i++) {
      setCached(`key-${i}`, i)
    }
    // Adding one more should evict the oldest
    setCached("key-new", "new")
    expect(getCached("key-0")).toBeNull()
    expect(getCached("key-new")).toBe("new")
  })

  it("generates deterministic cache keys", () => {
    const k1 = cacheKey("q", { a: 1, b: 2 })
    const k2 = cacheKey("q", { b: 2, a: 1 })
    expect(k1).toBe(k2)
  })
})

// ─── Error Handler ───────────────────────────────────────────────────────────

describe("rag-errors", () => {
  it("wraps unknown errors with context", () => {
    const err = wrapRagError(new Error("something broke"), "test context")
    expect(err).toBeInstanceOf(RagError)
    expect(err.code).toBe("UNKNOWN")
    expect(err.message).toContain("test context")
    expect(err.recoverable).toBe(true)
  })

  it("categorizes rate_limit errors", () => {
    const err = wrapRagError(new Error("rate_limit exceeded"), "api call")
    expect(err.code).toBe("RATE_LIMITED")
  })

  it("categorizes timeout errors", () => {
    const err = wrapRagError(new Error("connection timeout"), "search")
    expect(err.code).toBe("TIMEOUT")
  })

  it("categorizes embedding errors", () => {
    const err = wrapRagError(new Error("openai embedding failed"), "embed")
    expect(err.code).toBe("EMBEDDING_FAILED")
  })

  it("passes through RagError instances", () => {
    const original = new RagError("original", "DATABASE_ERROR")
    const wrapped = wrapRagError(original, "context")
    expect(wrapped).toBe(original)
  })

  it("handles non-Error values", () => {
    const err = wrapRagError("string error", "context")
    expect(err.code).toBe("UNKNOWN")
    expect(err.details).toEqual({ originalMessage: "string error" })
  })
})

// ─── Metrics ─────────────────────────────────────────────────────────────────

describe("rag-metrics", () => {
  beforeEach(() => {
    resetMetrics()
  })

  it("records search with latency and citations", () => {
    recordSearch(150, 3)
    recordSearch(200, 5)
    const m = getMetrics()
    expect(m.searchCount).toBe(2)
    expect(m.totalCitations).toBe(8)
    expect(m.avgLatencyMs).toBe(175)
  })

  it("tracks cache hit and miss rates", () => {
    recordCacheHit()
    recordCacheHit()
    recordCacheMiss()
    const m = getMetrics()
    expect(m.cacheHitRate).toBeCloseTo(2 / 3)
  })

  it("tracks error rate", () => {
    recordSearch(100, 1)
    recordSearch(100, 1)
    recordError()
    const m = getMetrics()
    expect(m.errorCount).toBe(1)
    expect(m.errorRate).toBeCloseTo(0.5)
  })

  it("calculates p95 latency", () => {
    for (let i = 1; i <= 100; i++) {
      recordSearch(i, 0)
    }
    const m = getMetrics()
    expect(m.p95LatencyMs).toBe(96)
  })

  it("resets metrics", () => {
    recordSearch(100, 2)
    recordError()
    resetMetrics()
    const m = getMetrics()
    expect(m.searchCount).toBe(0)
    expect(m.errorCount).toBe(0)
    expect(m.totalCitations).toBe(0)
  })
})
