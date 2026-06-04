import { MemoryRateLimiter } from "@/lib/platform/rate-limiter/memory-rate-limiter";
import type { RateLimitConfig, RateLimitResult } from "@/lib/platform/rate-limiter/types";

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

const globalForEdgeRateLimit = globalThis as typeof globalThis & {
  __aqliyaEdgeRateLimiter?: MemoryRateLimiter;
};

function getEdgeRateLimiter(): MemoryRateLimiter {
  if (!globalForEdgeRateLimit.__aqliyaEdgeRateLimiter) {
    globalForEdgeRateLimit.__aqliyaEdgeRateLimiter = new MemoryRateLimiter({
      suppressWarning: true,
    });
  }

  return globalForEdgeRateLimit.__aqliyaEdgeRateLimiter;
}

/**
 * Edge-safe rate limiter entrypoint for Next.js middleware.
 *
 * Intentionally memory-only so the middleware bundle never pulls Node/Redis
 * dependencies such as ioredis.
 */
export async function checkEdgeRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Promise<RateLimitResult> {
  return getEdgeRateLimiter().check(key, config);
}
