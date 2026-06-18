import "server-only"

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

/**
 * Generic in-memory cache with TTL support.
 *
 * If a valid (non-expired) entry exists for key, returns it.
 * Otherwise calls etcher, stores the result with the given TTL, and returns it.
 *
 * @param key - Unique cache key
 * @param ttlMs - Time-to-live in milliseconds
 * @param fetcher - Async function that produces the value when cache misses
 */
export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const entry = store.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.value as T
  }

  // Expired or missing — evict stale entry and fetch fresh
  store.delete(key)
  const value = await fetcher()
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

/**
 * Remove a single entry from the cache by exact key.
 */
export function invalidateCache(key: string): void {
  store.delete(key)
}

/**
 * Remove all entries whose key starts with the given prefix.
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key)
    }
  }
}

/**
 * Clear the entire in-memory cache.
 */
export function clearCache(): void {
  store.clear()
}
