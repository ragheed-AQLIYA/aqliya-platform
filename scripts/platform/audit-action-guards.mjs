#!/usr/bin/env node
/**
 * Lists server action files and whether they reference requireServerActionAccess
 * or product-specific equivalent guards. Run: node scripts/audit-action-guards.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ACTIONS_DIR = join(process.cwd(), "src", "actions");

/** Files that use non-standard guards or are read-only / session-bound only */
const ALLOWLIST_NO_PATTERN = new Set([
  "decision-templates.ts", // delegates to decisions guards in callers
  "download-token-actions.ts",
  "mfa.ts",
  "sales-dashboard-actions.ts",
  "sales-read-actions.ts",
]);

const GUARD_PATTERNS = [
  "requireServerActionAccess",
  "requireUserContext",
  "requireEnabled",
  "requireSalesPermission",
  "requireDecisionAccess",
  "assertProjectAccess",
  "assertLocalContentPermission",
  "getAuditActor",
  "assertEngagementAccess",
  "requireWorkflow",
  "requireWorkflowAdmin",
  "requireClientAccess",
  "writePlatformAuditLog",
];

async function main() {
  const files = (await readdir(ACTIONS_DIR)).filter((f) => f.endsWith(".ts"));
  const rows = [];

  for (const file of files.sort()) {
    const path = join(ACTIONS_DIR, file);
    const content = await readFile(path, "utf8");
    const hasUseServer = content.includes('"use server"') || content.includes("'use server'");
    const guards = GUARD_PATTERNS.filter((p) => content.includes(p));
    const writeExports = (content.match(/export async function \w+/g) ?? []).length;
    rows.push({
      file,
      hasUseServer,
      writeExports,
      guards: guards.length ? guards.join(", ") : "—",
      wired: guards.length > 0,
    });
  }

  const wired = rows.filter((r) => r.wired).length;
  console.log(`Action files: ${rows.length} | With guard signals: ${wired}\n`);
  console.log("file | exports | guards");
  console.log("-----|---------|-------");
  for (const r of rows) {
    console.log(`${r.file} | ${r.writeExports} | ${r.guards}`);
  }

  const missing = rows.filter((r) => !r.wired && !ALLOWLIST_NO_PATTERN.has(r.file));
  if (missing.length) {
    console.log(`\nNo guard pattern detected in ${missing.length} file(s):`);
    for (const r of missing) {
      console.log(`  - ${r.file}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
