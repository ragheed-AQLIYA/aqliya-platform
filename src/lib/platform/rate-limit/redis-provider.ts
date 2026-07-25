import "server-only";
import { createLogger } from "@/lib/observability/logger";
import type { RateLimiterProvider, RateLimitResult } from "./types";


const logger = createLogger({ product: "platform", action: "lib-platform-rate-limit-redis-provider" });

// Dynamic import: ioredis is an optional production dependency.
// The import is only resolved at runtime when RATE_LIMITER=redis.
type Redis = import("ioredis").default;

export class RedisRateLimiterProvider implements RateLimiterProvider {
  readonly type = "redis" as const;
  private client: Redis | null = null;
  private readonly url: string;
  private connectPromise: Promise<Redis> | null = null;

  constructor(url: string) {
    this.url = url;
  }

  private async getClient(): Promise<Redis> {
    if (this.client) return this.client;
    if (!this.connectPromise) {
      this.connectPromise = this.connect();
    }
    return this.connectPromise;
  }

  private async connect(): Promise<Redis> {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(this.url) as Redis;
    client.on("error", (err: Error) =>
      logger.error("[RedisRateLimiter]", err instanceof Error ? err : new Error(String(err))),
    );
    this.client = client;
    return client;
  }

  async increment(
    key: string,
    windowMs: number,
    limit: number,
  ): Promise<RateLimitResult> {
    const client = await this.getClient();
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

    const count = await client.incr(windowKey);
    if (count === 1) {
      await client.pexpire(windowKey, windowMs);
    }

    const ttl = await client.pttl(windowKey);
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: now + Math.max(0, ttl),
    };
  }

  async reset(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      const pattern = `ratelimit:${key}:*`;
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch {
      // Best-effort reset
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getClient();
      const result = await client.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }
}
