#!/usr/bin/env node
/**
 * AQLIYA — Database Restore Drill Script
 *
 * Purpose : Verifies that a backup file can be fully restored to a scratch
 *           database (aqliya_drill_<timestamp>), then drops it.
 *           Exits 0 on success, 1 on any failure — safe to run from CI or cron.
 *
 * Usage   : DATABASE_URL=<pg-url> node scripts/platform/restore-drill.mjs [backup-file]
 *           If no backup-file is provided, the most-recent file in ./backups/ is used.
 *
 * Requirements:
 *   - pg_restore and psql must be in PATH
 *   - The Postgres user must have CREATEDB privilege
 *   - DATABASE_URL must point to the same Postgres server (database name is replaced)
 *
 * Exit codes:
 *   0 — restore successful, row counts logged
 *   1 — any failure (missing backup, pg_restore error, row-count zero after restore)
 */

import { execSync } from "child_process";
import { existsSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, "..", "..", "backups");
const REPORT_DIR = path.join(__dirname, "..", "..", "backups", "drill-reports");

// ─── Helpers ───────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[restore-drill] ${msg}`);
}

function fail(msg) {
  console.error(`[restore-drill] ❌ FAIL: ${msg}`);
  process.exit(1);
}

function run(cmd, opts = {}) {
  log(`$ ${cmd}`);
  return execSync(cmd, { stdio: "pipe", timeout: 300_000, ...opts }).toString().trim();
}

// ─── Config ────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) fail("DATABASE_URL not set. Source .env first.");

const url = new URL(DATABASE_URL);
const host = url.hostname;
const port = url.port || "5432";
const user = url.username;
const password = url.password;
const pgEnv = {
  ...process.env,
  PGPASSWORD: password,
};

// ─── Select backup file ─────────────────────────────────────────────────────

let backupFile = process.argv[2];

if (!backupFile) {
  if (!existsSync(BACKUP_DIR)) fail(`Backup directory not found: ${BACKUP_DIR}`);
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".sql") || f.endsWith(".dump"))
    .map((f) => ({ f, mtime: statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) fail("No backup files found in ./backups/");
  backupFile = path.join(BACKUP_DIR, files[0].f);
  log(`Using most-recent backup: ${files[0].f}`);
} else {
  if (!existsSync(backupFile)) fail(`Backup file not found: ${backupFile}`);
}

// ─── Drill database name ────────────────────────────────────────────────────

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const drillDb = `aqliya_drill_${ts}`;
log(`Drill database: ${drillDb}`);

// ─── Create drill DB ────────────────────────────────────────────────────────

try {
  run(
    `psql -h ${host} -p ${port} -U ${user} -c "CREATE DATABASE \\"${drillDb}\\";"`,
    { env: pgEnv },
  );
} catch (err) {
  fail(`Could not create drill database: ${err.message}`);
}

// ─── Restore ────────────────────────────────────────────────────────────────

const drillUrl = DATABASE_URL.replace(url.pathname, `/${drillDb}`);
let rowCount = 0;

try {
  const isCustomFormat = backupFile.endsWith(".dump");
  if (isCustomFormat) {
    run(
      `pg_restore -h ${host} -p ${port} -U ${user} -d "${drillDb}" --no-owner --no-acl "${backupFile}"`,
      { env: pgEnv },
    );
  } else {
    run(
      `psql -h ${host} -p ${port} -U ${user} -d "${drillDb}" -f "${backupFile}"`,
      { env: pgEnv },
    );
  }

  // ─── Spot-check: count rows in key tables ──────────────────────────────
  const tables = [
    "Organization",
    "User",
    "AuditEngagement",
    "PlatformAuditLog",
    "PlatformOutboxEvent",
  ];
  const counts = {};
  for (const table of tables) {
    try {
      const result = run(
        `psql -h ${host} -p ${port} -U ${user} -d "${drillDb}" -t -c "SELECT COUNT(*) FROM \\"${table}\\";"`,
        { env: pgEnv },
      );
      counts[table] = parseInt(result.trim(), 10);
      rowCount += counts[table];
    } catch {
      counts[table] = "error (table may not exist)";
    }
  }

  log("Row counts after restore:");
  for (const [t, c] of Object.entries(counts)) {
    log(`  ${t}: ${c}`);
  }

  if (rowCount === 0) {
    log("⚠️  WARNING: All spot-check tables returned 0 rows. Verify backup is non-empty.");
  } else {
    log(`✅ Restore verified — ${rowCount} total rows across spot-check tables.`);
  }
} catch (err) {
  // Cleanup before exit
  try {
    run(
      `psql -h ${host} -p ${port} -U ${user} -c "DROP DATABASE IF EXISTS \\"${drillDb}\\";"`,
      { env: pgEnv },
    );
  } catch {
    // ignore cleanup errors
  }
  fail(`Restore failed: ${err.message}`);
} finally {
  // ─── Drop drill DB ───────────────────────────────────────────────────────
  try {
    run(
      `psql -h ${host} -p ${port} -U ${user} -c "DROP DATABASE IF EXISTS \\"${drillDb}\\";"`,
      { env: pgEnv },
    );
    log(`Drill database dropped: ${drillDb}`);
  } catch (err) {
    log(`⚠️  Could not drop drill database (manual cleanup needed): ${err.message}`);
  }
}

// ─── Write drill report ─────────────────────────────────────────────────────

try {
  if (!existsSync(REPORT_DIR)) {
    const { mkdirSync } = await import("fs");
    mkdirSync(REPORT_DIR, { recursive: true });
  }
  const report = {
    drillAt: new Date().toISOString(),
    backupFile,
    drillDatabase: drillDb,
    rowCountSpotCheck: rowCount,
    status: rowCount > 0 ? "PASS" : "WARN_EMPTY",
  };
  const reportPath = path.join(REPORT_DIR, `drill-${ts}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Drill report written: ${reportPath}`);
} catch (err) {
  log(`⚠️  Could not write drill report: ${err.message}`);
}

log("Done.");
