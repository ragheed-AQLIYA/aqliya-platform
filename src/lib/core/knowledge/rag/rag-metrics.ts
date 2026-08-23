/**
 * In-memory metrics for RAG pipeline.
 * Tracks search counts, latency, and error rates.
 *
 * Memory is the source of truth and every exported function stays
 * synchronous. When RAG_METRICS_PERSISTENCE=redis, mutations are mirrored to
 * Redis write-behind and a once-per-boot restore merges persisted state back
 * in — see rag-persistence.ts. With the flag unset ("memory") behavior is
 * byte-for-byte the original in-memory implementation.
 */

import {
  getRagMetricsPersistence,
  type RagMetricsPersistenceHook,
  type RestoredRagMetricsSnapshot,
} from "./rag-persistence"

interface Metrics {
  searchCount: number
  searchLatencies: number[]
  errorCount: number
  cacheHitCount: number
  cacheMissCount: number
  citationCount: number
}

const metrics: Metrics = {
  searchCount: 0,
  searchLatencies: [],
  errorCount: 0,
  cacheHitCount: 0,
  cacheMissCount: 0,
  citationCount: 0,
}

const MAX_LATENCY_ENTRIES = 1000

/** Merge a restored Redis snapshot into memory (invoked once, asynchronously). */
function mergeRestoredSnapshot(snapshot: RestoredRagMetricsSnapshot): void {
  metrics.searchCount += snapshot.searchCount
  metrics.errorCount += snapshot.errorCount
  metrics.cacheHitCount += snapshot.cacheHitCount
  metrics.cacheMissCount += snapshot.cacheMissCount
  metrics.citationCount += snapshot.citationCount
  if (snapshot.searchLatencies.length > 0) {
    // Restored samples are older than anything recorded locally this boot.
    metrics.searchLatencies = [...snapshot.searchLatencies, ...metrics.searchLatencies]
    if (metrics.searchLatencies.length > MAX_LATENCY_ENTRIES) {
      metrics.searchLatencies = metrics.searchLatencies.slice(-MAX_LATENCY_ENTRIES)
    }
  }
}

function persistence(): RagMetricsPersistenceHook | null {
  return getRagMetricsPersistence(mergeRestoredSnapshot)
}

/**
 * Record a search request.
 */
export function recordSearch(latencyMs: number, citationCount: number): void {
  metrics.searchCount++
  metrics.citationCount += citationCount
  if (metrics.searchLatencies.length >= MAX_LATENCY_ENTRIES) {
    metrics.searchLatencies.shift()
  }
  metrics.searchLatencies.push(latencyMs)
  persistence()?.recordDelta({ searchCount: 1, citationCount, latencies: [latencyMs] })
}

/**
 * Record a cache hit.
 */
export function recordCacheHit(): void {
  metrics.cacheHitCount++
  persistence()?.recordDelta({ cacheHitCount: 1 })
}

/**
 * Record a cache miss.
 */
export function recordCacheMiss(): void {
  metrics.cacheMissCount++
  persistence()?.recordDelta({ cacheMissCount: 1 })
}

/**
 * Record an error.
 */
export function recordError(): void {
  metrics.errorCount++
  persistence()?.recordDelta({ errorCount: 1 })
}

/**
 * Get current metrics snapshot.
 */
export function getMetrics(): {
  searchCount: number
  avgLatencyMs: number
  p95LatencyMs: number
  errorCount: number
  errorRate: number
  cacheHitRate: number
  totalCitations: number
} {
  // Lazy trigger: touching metrics ensures the boot restore has started even
  // if no mutation has occurred yet in this process.
  persistence()
  const sorted = [...metrics.searchLatencies].sort((a, b) => a - b)
  const p95Index = Math.floor(sorted.length * 0.95)

  return {
    searchCount: metrics.searchCount,
    avgLatencyMs: sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
    p95LatencyMs: sorted.length > 0 ? sorted[p95Index] ?? 0 : 0,
    errorCount: metrics.errorCount,
    errorRate: metrics.searchCount > 0 ? metrics.errorCount / metrics.searchCount : 0,
    cacheHitRate: metrics.cacheHitCount + metrics.cacheMissCount > 0
      ? metrics.cacheHitCount / (metrics.cacheHitCount + metrics.cacheMissCount)
      : 0,
    totalCitations: metrics.citationCount,
  }
}

/**
 * Reset all metrics (admin use).
 */
export function resetMetrics(): void {
  metrics.searchCount = 0
  metrics.searchLatencies = []
  metrics.errorCount = 0
  metrics.cacheHitCount = 0
  metrics.cacheMissCount = 0
  metrics.citationCount = 0
  persistence()?.reset()
}
