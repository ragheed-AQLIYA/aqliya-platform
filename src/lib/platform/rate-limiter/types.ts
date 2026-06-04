export type RateLimiterType = "memory" | "redis";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  readonly type: RateLimiterType;
  check(key: string, config?: RateLimitConfig): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}