/**
 * Cache utility for AQLIYA data layer.
 *
 * Usage:
 *   const data = await cachedFetch("engagements:list", async () => {
 *     return prisma.engagement.findMany({ ... })
 *   }, { ttl: 60_000 })
 *
 * In production, replace Map with Redis/ioredis.
 */

const cache = new Map<string, { value: unknown; expiry: number }>();

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 30s)
}

const DEFAULT_TTL = 30_000;

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> {
  const ttl = options?.ttl ?? DEFAULT_TTL;
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiry > now) {
    return cached.value as T;
  }

  const value = await fetcher();
  cache.set(key, { value, expiry: now + ttl });

  // Prevent memory leak — clean up old entries periodically
  if (cache.size > 100) {
    const cutoff = Date.now();
    Array.from(cache.entries()).forEach(([k, v]) => {
      if (v.expiry < cutoff) cache.delete(k);
    });
  }

  return value;
}

export function invalidateCache(key: string) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}
