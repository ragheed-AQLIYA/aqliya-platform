import "server-only";
import type { RateLimiterProvider } from "./types";
import { MemoryRateLimiterProvider } from "./memory-provider";
import { RedisRateLimiterProvider } from "./redis-provider";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "platform", action: "rate-limit" });

export type { RateLimiterProvider, RateLimitResult } from "./types";

let _provider: RateLimiterProvider | null = null;

/**
 * Creates and returns the global rate limiter provider singleton.
 *
 * Backend selection:
 * - `RATE_LIMITER=redis` → Redis (requires REDIS_URL)
 * - anything else / unset → in-memory (single-instance dev/staging)
 */
export function getRateLimiterProvider(): RateLimiterProvider {
  if (_provider) return _provider;

  const mode = process.env.RATE_LIMITER?.trim().toLowerCase();

  if (mode === "redis") {
    const url = process.env.REDIS_URL;
    if (!url) {
      logger.warn(
        "RATE_LIMITER=redis but REDIS_URL is not set. Falling back to memory.",
      );
      _provider = new MemoryRateLimiterProvider();
    } else {
      _provider = new RedisRateLimiterProvider(url);
    }
  } else {
    _provider = new MemoryRateLimiterProvider();
  }

  return _provider;
}

/**
 * Reset the singleton (useful in tests).
 */
export function resetRateLimiterProvider(): void {
  _provider = null;
}
