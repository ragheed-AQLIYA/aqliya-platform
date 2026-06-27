#!/usr/bin/env node
/**
 * Redis rate limiter load smoke (Pilot Launch Closure #2)
 *
 * Usage:
 *   RATE_LIMITER=redis REDIS_URL=redis://localhost:6379 node scripts/platform/pilot-rate-limit-load.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: resolve(root, ".env") });

const REPORT_DIR = resolve(root, "backups/pilot-reports");

const CHECK_SCRIPT = `
local key = KEYS[1]
local max_req = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local count = redis.call("INCR", key)
if count == 1 then redis.call("PEXPIRE", key, window_ms) end
local ttl = redis.call("PTTL", key)
if ttl < 0 then redis.call("PEXPIRE", key, window_ms); ttl = window_ms end
local allowed = 0
if count <= max_req then allowed = 1 end
local remaining = math.max(0, max_req - count)
return {allowed, remaining, ttl}
`;

async function main() {
  const mode = process.env.RATE_LIMITER ?? "memory";
  const redisUrl = process.env.REDIS_URL;
  const startedAt = Date.now();
  const report = {
    test: "pilot-rate-limit-load",
    startedAt: new Date().toISOString(),
    rateLimiter: mode,
    redisUrlConfigured: Boolean(redisUrl),
    ok: false,
    memoryFallbackDetected: false,
  };

  if (mode !== "redis") {
    report.error = "RATE_LIMITER must be redis";
    writeReport(report, startedAt);
    process.exit(1);
  }
  if (!redisUrl) {
    report.error = "REDIS_URL missing";
    writeReport(report, startedAt);
    process.exit(1);
  }

  const { Redis } = await import("ioredis");
  const client = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
  await client.connect();
  const pong = await client.ping();
  report.redisPing = pong;

  const testKey = `ratelimit:pilot-load-test:${Date.now()}`;
  const maxRequests = 10;
  const windowMs = 60_000;
  let allowed = 0;
  let denied = 0;

  for (let i = 0; i < 15; i++) {
    const result = await client.eval(CHECK_SCRIPT, 1, testKey, String(maxRequests), String(windowMs));
    const isAllowed = Array.isArray(result) && result[0] === 1;
    if (isAllowed) allowed++;
    else denied++;
  }

  report.requests = { total: 15, allowed, denied };
  report.sharedCounterEnforced = allowed === maxRequests && denied === 5;
  report.ok = pong === "PONG" && report.sharedCounterEnforced;

  await client.del(testKey);
  await client.quit();

  writeReport(report, startedAt);
  process.exit(report.ok ? 0 : 1);
}

function writeReport(report, startedAt) {
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - startedAt;
  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  const path = resolve(REPORT_DIR, `rate-limit-load-${Date.now()}.json`);
  writeFileSync(path, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`Report: ${path}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
