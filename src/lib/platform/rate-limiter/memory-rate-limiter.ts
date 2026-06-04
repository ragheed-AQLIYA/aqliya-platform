import type { RateLimiter, RateLimiterType, RateLimitConfig, RateLimitResult } from "./types";

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

export class MemoryRateLimiter implements RateLimiter {
  readonly type: RateLimiterType = "memory";

  private store = new Map<string, { count: number; resetAt: number }>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options?: { suppressWarning?: boolean }) {
    if (!options?.suppressWarning) {
      console.warn(
        "Using in-memory rate limiter — not suitable for production multi-instance deployment",
      );
    }
    this.startCleanup();
  }

  async check(key: string, config: RateLimitConfig = DEFAULT_CONFIG): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + config.windowMs });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    entry.count++;
    if (entry.count > config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  private startCleanup(): void {
    if (typeof setInterval === "undefined") return;
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (now >= entry.resetAt) this.store.delete(key);
      }
    }, 60_000);
  }

  dispose(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.store.clear();
  }
}
