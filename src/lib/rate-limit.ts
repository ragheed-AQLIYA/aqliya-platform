import "server-only";

import { createRateLimiter } from "@/lib/platform/rate-limiter";
import type { RateLimitConfig, RateLimiter } from "@/lib/platform/rate-limiter/types";

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

let _instance: RateLimiter | null = null;

/**
 * Server-only rate limiter entrypoint.
 *
 * This module may use Redis when RATE_LIMITER=redis, so it must stay out of
 * Edge middleware dependency graphs.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (!_instance) {
    try {
      _instance = await createRateLimiter();
    } catch {
      const { MemoryRateLimiter } = await import("@/lib/platform/rate-limiter/memory-rate-limiter");
      _instance = new MemoryRateLimiter({ suppressWarning: true });
    }
  }
  return _instance.check(key, config);
}
