import "server-only";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiterProvider {
  readonly type: "memory" | "redis";
  /** Increment counter for key. Returns current state. */
  increment(key: string, windowMs: number, limit: number): Promise<RateLimitResult>;
  /** Reset counter for key. */
  reset(key: string): Promise<void>;
  /** Returns true if provider is operational. */
  healthCheck(): Promise<boolean>;
}
