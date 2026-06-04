import "server-only"

import type { RateLimiter, RateLimiterType } from "./types";
import { MemoryRateLimiter } from "./memory-rate-limiter";

let _instance: RateLimiter | null = null;

export async function getRateLimiter(): Promise<RateLimiter> {
  if (_instance) return _instance;
  _instance = await createRateLimiter();
  return _instance;
}

export async function createRateLimiter(): Promise<RateLimiter> {
  const type = (process.env.RATE_LIMITER as RateLimiterType) ?? "memory";

  if (type === "memory") return new MemoryRateLimiter();

  if (type === "redis") {
    const { RedisRateLimiter } = await import("./redis-rate-limiter");
    return new RedisRateLimiter();
  }

  throw new Error(`Unknown rate limiter type: ${type}`);
}

export type { RateLimiter, RateLimitConfig, RateLimitResult, RateLimiterType } from "./types";
export { RATE_LIMIT_PRESETS, rateLimitHeaders } from "./presets";
export type { RateLimitHeaders } from "./presets";
