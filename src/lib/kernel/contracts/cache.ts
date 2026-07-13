import type { KernelResult } from "../types";

export interface CacheEntry<T = unknown> {
  value: T;
  expiry: number;
}

export interface ICacheLayer {
  get<T = unknown>(key: string): Promise<KernelResult<T | null>>;
  set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<KernelResult<void>>;
  invalidate(key: string): Promise<KernelResult<void>>;
  invalidatePattern(pattern: string): Promise<KernelResult<void>>;
  clear(): Promise<KernelResult<void>>;
  withTTL<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T>;
}
