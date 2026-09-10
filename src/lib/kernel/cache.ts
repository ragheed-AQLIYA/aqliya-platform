/**
 * Kernel-level bridge for platform cache strategy.
 *
 * Re-exports the higher-level cache convenience functions from the
 * platform cache strategy so consumers import from the kernel layer.
 *
 * These wrap the cache adapter (Redis/in-memory) with dashboard-specific
 * semantics: prefix-based invalidation, dashboard warming, TTL constants.
 */
export {
  getCachedOrFetch,
  invalidateCacheByPrefix,
  invalidateDashboardCaches,
  warmDashboardCaches,
  invalidateProductCache,
  getCacheKey,
  DASHBOARD_CACHE_TTL_MS,
  ENTITY_CACHE_TTL_MS,
} from "@/lib/platform/cache-strategy";
export type { WarmResult } from "@/lib/platform/cache-strategy";
