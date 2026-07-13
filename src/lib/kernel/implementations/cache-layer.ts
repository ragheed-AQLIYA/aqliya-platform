import type { ICacheLayer } from "../contracts/cache";
import type { KernelResult } from "../types";
import { cachedFetch, invalidateCache, clearCache } from "@/lib/cache";

export class CacheLayerWrapper implements ICacheLayer {
  private store = new Map<string, { value: unknown; expiry: number }>();

  async get<T = unknown>(key: string): Promise<KernelResult<T | null>> {
    const entry = this.store.get(key);
    if (!entry || entry.expiry < Date.now()) {
      this.store.delete(key);
      return { success: true, data: null };
    }
    return { success: true, data: entry.value as T };
  }

  async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<KernelResult<void>> {
    const ttl = ttlMs ?? 30_000;
    this.store.set(key, { value, expiry: Date.now() + ttl });
    return { success: true };
  }

  async invalidate(key: string): Promise<KernelResult<void>> {
    this.store.delete(key);
    invalidateCache(key);
    return { success: true };
  }

  async invalidatePattern(pattern: string): Promise<KernelResult<void>> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
    return { success: true };
  }

  async clear(): Promise<KernelResult<void>> {
    this.store.clear();
    clearCache();
    return { success: true };
  }

  async withTTL<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    return cachedFetch(key, fetcher, { ttl: ttlMs });
  }
}
