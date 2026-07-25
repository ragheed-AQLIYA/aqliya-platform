import "server-only";
import type { SecretResult } from "./common";
import { DEFAULT_TTL_MS } from "./common";

interface CacheEntry {
  result: SecretResult;
  expiresAt: number; // timestamp ms
}

class SecretCache {
  private store = new Map<string, CacheEntry>();

  makeKey(organizationId: string, integrationId: string): string {
    return `${organizationId}:${integrationId}`;
  }

  get(key: string): SecretResult | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.result;
  }

  set(key: string, result: SecretResult, ttlMs: number = DEFAULT_TTL_MS): void {
    this.store.set(key, {
      result: { ...result, source: "cache", cacheHit: true },
      expiresAt: Date.now() + ttlMs,
    });
  }

  /** Invalidate cache for a specific integration.
   *  Called on SECRET_ROTATED and SECRET_REVOKED events. */
  invalidate(organizationId: string, integrationId: string): void {
    const key = this.makeKey(organizationId, integrationId);
    this.store.delete(key);
  }

  /** Get current cache size (for diagnostics). */
  get size(): number {
    return this.store.size;
  }

  /** Clear entire cache (for test isolation). */
  clear(): void {
    this.store.clear();
  }
}

const globalForCache = globalThis as unknown as {
  secretResolverCache: SecretCache | undefined;
};

function getCache(): SecretCache {
  if (typeof globalForCache.secretResolverCache === "undefined") {
    globalForCache.secretResolverCache = new SecretCache();
  }
  return globalForCache.secretResolverCache;
}

/**
 * Invalidate the cached secret for a given integration.
 * Called when SECRET_ROTATED or SECRET_REVOKED governance events fire.
 */
export function invalidateSecretCache(
  organizationId: string,
  integrationId: string,
): void {
  getCache().invalidate(organizationId, integrationId);
}

/** Get the current cache size. Useful for test assertions. */
export function getSecretCacheSize(): number {
  return getCache().size;
}

/** Clear the entire secret cache. For test isolation — never call in production. */
export function clearSecretCache(): void {
  getCache().clear();
}

export type { SecretCache };
export { getCache };
