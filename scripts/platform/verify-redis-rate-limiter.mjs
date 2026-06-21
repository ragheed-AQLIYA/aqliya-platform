#!/usr/bin/env node
/**
 * I-03 — verify Redis connectivity when RATE_LIMITER=redis.
 *
 * Usage:
 *   node scripts/platform/verify-redis-rate-limiter.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".env") });

const mode = process.env.RATE_LIMITER ?? "memory";
const redisUrl = process.env.REDIS_URL;

console.log(JSON.stringify({ step: "config", rateLimiter: mode, redisUrlConfigured: Boolean(redisUrl) }, null, 2));

if (mode !== "redis") {
  console.log(JSON.stringify({ ok: true, status: "skipped", reason: "RATE_LIMITER is not redis" }));
  process.exit(0);
}

if (!redisUrl) {
  console.error(JSON.stringify({ ok: false, error: "RATE_LIMITER=redis but REDIS_URL missing" }));
  process.exit(1);
}

try {
  const { createClient } = await import("redis");
  const client = createClient({ url: redisUrl });
  client.on("error", (err) => console.error("redis error", err.message));
  await client.connect();
  const pong = await client.ping();
  await client.quit();
  console.log(JSON.stringify({ ok: true, ping: pong }));
  process.exit(pong === "PONG" ? 0 : 1);
} catch (err) {
  console.error(
    JSON.stringify({
      ok: false,
      error: err instanceof Error ? err.message : "Redis check failed",
    }),
  );
  process.exit(1);
}
