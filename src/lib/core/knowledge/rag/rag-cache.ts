/**
 * In-memory cache for RAG search results.
 * TTL: 5 minutes. Max entries: 1000.
 */

interface CacheEntry {
  results: unknown
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

const TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ENTRIES = 1000

/**
 * Generate a cache key from search parameters.
 */
export function cacheKey(query: string, options: Record<string, unknown>): string {
  const sorted = Object.keys(options)
    .sort()
    .map((k) => `${k}=${JSON.stringify(options[k])}`)
    .join("&")
  return `${query}::${sorted}`
}

/**
 * Get cached results if available and not expired.
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.results as T
}

/**
 * Store results in cache.
 */
export function setCached(key: string, results: unknown): void {
  // Evict oldest if at capacity
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { results, expiresAt: Date.now() + TTL_MS })
}

/**
 * Clear all cached results (admin use).
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): { size: number; maxEntries: number; ttlMs: number } {
  return { size: cache.size, maxEntries: MAX_ENTRIES, ttlMs: TTL_MS }
}
