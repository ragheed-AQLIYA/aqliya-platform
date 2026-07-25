import "server-only";
import { isRedisAvailable } from "../redis-client";
import {
  DASHBOARD_CACHE_TTL_MS,
  ENTITY_CACHE_TTL_MS,
  getCacheKey,
  getCachedOrFetch,
  invalidateProductCache,
  invalidateCacheByPrefix,
  invalidateDashboardCaches,
  type WarmResult,
} from "./common";
import { warmDecisionMetrics } from "./decision-metrics";
import { warmPlatformHealth } from "./platform-health";
import { warmGovernanceItems } from "./governance-items";

export {
  DASHBOARD_CACHE_TTL_MS,
  ENTITY_CACHE_TTL_MS,
  getCacheKey,
  getCachedOrFetch,
  invalidateProductCache,
  invalidateCacheByPrefix,
  invalidateDashboardCaches,
  warmDecisionMetrics,
  warmPlatformHealth,
  warmGovernanceItems,
};
export type { WarmResult };

export async function warmDashboardCaches(
  organizationId: string,
): Promise<WarmResult[]> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    return [
      {
        key: "dashboard:*",
        status: "skipped",
        error: "Redis not available — skipping cache warming",
      },
    ];
  }

  const results: WarmResult[] = [];
  await warmDecisionMetrics(organizationId, results);
  await warmPlatformHealth(organizationId, results);
  await warmGovernanceItems(organizationId, results);
  return results;
}
