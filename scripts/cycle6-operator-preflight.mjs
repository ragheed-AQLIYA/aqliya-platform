#!/usr/bin/env node
/**
 * Cycle 6 operator preflight — checks env presence only (no network, no DB writes).
 * Usage: set DATABASE_URL + STAGING_BASE_URL, then: node scripts/cycle6-operator-preflight.mjs
 */

const required = ["DATABASE_URL"];
const recommended = [
  "STAGING_BASE_URL",
  "AUTH_SECRET",
  "FF_AI_RAG",
  "FF_AI_REAL_PROVIDERS",
];

let failed = false;

for (const key of required) {
  const val = process.env[key];
  if (!val?.trim()) {
    console.error(`[FAIL] Missing required env: ${key}`);
    failed = true;
  } else {
    console.log(`[OK] ${key} is set`);
  }
}

for (const key of recommended) {
  const val = process.env[key];
  if (!val?.trim()) {
    console.warn(`[WARN] Recommended env not set: ${key}`);
  } else {
    console.log(`[OK] ${key} is set`);
  }
}

if (process.env.DATABASE_URL?.includes("localhost:5435")) {
  console.warn(
    "[WARN] DATABASE_URL points at local proxy (:5435) — fine for dev, not remote Cycle 6 closure.",
  );
}

console.log("\nNext steps: docs/operations/cycle-6-staging-operator-checklist.md");
process.exit(failed ? 1 : 0);
