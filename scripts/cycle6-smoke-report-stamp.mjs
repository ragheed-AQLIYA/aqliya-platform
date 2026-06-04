#!/usr/bin/env node
/**
 * Prints markdown rows for LIVE_SMOKE_REPORT.md Required Evidence (commit + timestamp).
 * No network, no DB. Operator copies into docs/validation/cycle-6/LIVE_SMOKE_REPORT.md.
 */

import { execSync } from "node:child_process";

function git(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const sha = git("git rev-parse --short HEAD");
const shaFull = git("git rev-parse HEAD");
const branch = git("git rev-parse --abbrev-ref HEAD");
const ts = new Date().toISOString();

console.log("## Smoke report stamp (paste into LIVE_SMOKE_REPORT.md)\n");
console.log("| Field | Value |");
console.log("| ----- | ----- |");
console.log(`| smoke_execution_timestamp | \`${ts}\` |`);
console.log(`| commit_sha | \`${sha}\` (\`${shaFull}\`) |`);
console.log(`| git_branch | \`${branch}\` |`);
console.log(`| staging_base_url | _<operator fills>_ |`);
console.log(`| database_url_host | _<redacted host only>_ |`);
console.log("\nMigrations to deploy before smoke (Phase 3+):");
console.log("- `20260607100000_audit_evidence_version` (A1-05)");
console.log("\nThen: npm run db:verify-pgvector && npm run ic:smoke:cycle5:live && npm run cycle6:smoke:audit-ai");
