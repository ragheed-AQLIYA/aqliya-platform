import "server-only"
import { cacheAdapter } from "./redis-cache-adapter"

export function getCacheKey(product: string, entity: string, id: string): string {
  return `${product}:${entity}:${id}`
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const cached = await cacheAdapter.get<T>(key)
  if (cached !== null) return cached

  const value = await fetchFn()
  await cacheAdapter.set(key, value, ttlMs)
  return value
}

export async function invalidateProductCache(
  product: string,
  entity: string,
  entityId: string,
): Promise<void> {
  const key = getCacheKey(product, entity, entityId)
  await cacheAdapter.del(key)
}

export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  await cacheAdapter.del(prefix)
}
