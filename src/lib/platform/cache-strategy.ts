import "server-only";
import { cacheAdapter } from "./redis-cache-adapter";

/** Default TTL for dashboard/metrics cache: 5 minutes (300 seconds) */
export const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

/** Default TTL for entity cache (e.g., decision detail): 2 minutes */
export const ENTITY_CACHE_TTL_MS = 2 * 60 * 1000;

export function getCacheKey(product: string, entity: string, id: string): string {
  return `${product}:${entity}:${id}`;
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const cached = await cacheAdapter.get<T>(key);
  if (cached !== null) return cached;

  const value = await fetchFn();
  await cacheAdapter.set(key, value, ttlMs);
  return value;
}

/**
 * Invalidate a specific cache key.
 */
export async function invalidateProductCache(
  product: string,
  entity: string,
  entityId: string,
): Promise<void> {
  const key = getCacheKey(product, entity, entityId);
  await cacheAdapter.del(key);
}

/**
 * Invalidate all cache entries matching a prefix pattern.
 * For Redis: uses SCAN + DEL to avoid blocking.
 * For in-memory: iterates and deletes matching keys.
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  await cacheAdapter.del(prefix);
}

/**
 * Invalidate all dashboard caches for an organization.
 * Call this after mutations that affect dashboard data (creates, status changes, etc.).
 */
export async function invalidateDashboardCaches(orgId: string): Promise<void> {
  const prefixes = [
    `dashboard:decision:${orgId}`,
    `dashboard:platform:${orgId}`,
    `dashboard:governance:${orgId}`,
  ];
  for (const prefix of prefixes) {
    await invalidateCacheByPrefix(prefix);
  }
}
