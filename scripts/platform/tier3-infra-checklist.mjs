#!/usr/bin/env node
/**
 * Tier 3 infrastructure checklist — local pre-flight before staging/production ops.
 *
 * Usage: node scripts/platform/tier3-infra-checklist.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: resolve(root, ".env") });

const checks = [];

function record(id, status, detail) {
  checks.push({ id, status, detail });
  const icon = status === "pass" ? "✓" : status === "warn" ? "⚠" : "✗";
  console.log(`  ${icon} ${id}${detail ? ` — ${detail}` : ""}`);
}

console.log("\n═══════════════════════════════════════════════");
console.log("  Tier 3 Infrastructure Checklist");
console.log("═══════════════════════════════════════════════\n");

record(
  "I-03 RATE_LIMITER",
  process.env.RATE_LIMITER === "redis" ? "pass" : "warn",
  process.env.RATE_LIMITER ?? "memory (default)",
);

record(
  "I-03 REDIS_URL",
  process.env.REDIS_URL ? "pass" : "warn",
  process.env.REDIS_URL ? "configured" : "missing — required for redis rate limiter",
);

record(
  "T2 FF_EVENT_OUTBOX",
  process.env.FF_EVENT_OUTBOX === "true" ? "pass" : "warn",
  process.env.FF_EVENT_OUTBOX ?? "false",
);

record(
  "T3 FF_ABAC_ENFORCE",
  process.env.FF_ABAC_ENFORCE === "true" ? "pass" : "warn",
  process.env.FF_ABAC_ENFORCE ?? "false",
);

record(
  "T3 ABAC_ENFORCE_ORG_IDS",
  process.env.ABAC_ENFORCE_ORG_IDS ? "pass" : "warn",
  process.env.ABAC_ENFORCE_ORG_IDS || "empty",
);

const backupDir = resolve(root, "backups");
record(
  "I-01 BACKUP_DIR",
  existsSync(backupDir) ? "pass" : "warn",
  backupDir,
);

console.log("\nManual / live infra (cannot auto-verify locally):");
console.log("  ○ I-01  Run: DATABASE_URL=... node scripts/platform/restore-drill.mjs");
console.log("  ○ I-03  Run: npm run verify:redis-rate-limiter (with RATE_LIMITER=redis)");
console.log("  ○ I-04  ClamAV daemon + SCANNER_PROVIDER=clamav on ECS");
console.log("  ○ E-01  Schedule external penetration test");
console.log("  ○ E-02  SOC2 Type II gap assessment");

const failed = checks.filter((c) => c.status === "fail").length;
console.log("\n" + JSON.stringify({ checks }, null, 2));
process.exit(failed > 0 ? 1 : 0);
