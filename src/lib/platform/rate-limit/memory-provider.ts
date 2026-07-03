import "server-only";
import type { RateLimiterProvider, RateLimitResult } from "./types";

interface MemoryEntry {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiterProvider implements RateLimiterProvider {
  readonly type = "memory" as const;
  private store = new Map<string, MemoryEntry>();

  async increment(
    key: string,
    windowMs: number,
    limit: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /** Periodically evict expired entries to prevent memory leaks. */
  startCleanup(intervalMs = 60_000): () => void {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (now > entry.resetAt) this.store.delete(key);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }
}
