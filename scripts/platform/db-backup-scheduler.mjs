#!/usr/bin/env node

/**
 * AQLIYA — Automated Database Backup Scheduler
 *
 * Runs pg_dump on an interval, prunes old backups.
 * Designed for Docker Compose / ECS sidecar deployment.
 *
 * Usage:
 *   DATABASE_URL=<pg-url> node scripts/platform/db-backup-scheduler.mjs
 *
 * Env vars:
 *   BACKUP_INTERVAL_MS   default: 3600000 (1 hour)
 *   BACKUP_MAX_FILES     default: 30
 *   BACKUP_DIR           default: ./backups
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { resolve } from "path";

const INTERVAL_MS = parseInt(process.env.BACKUP_INTERVAL_MS || "3600000", 10);
const MAX_BACKUPS = parseInt(process.env.BACKUP_MAX_FILES || "30", 10);
const BACKUP_DIR = resolve(process.env.BACKUP_DIR || "./backups");

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
}

function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `aqliya_backup_${timestamp}.dump`;
  const filepath = resolve(BACKUP_DIR, filename);
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error(`[${new Date().toISOString()}] ❌ DATABASE_URL not set`);
    return;
  }

  console.log(`[${new Date().toISOString()}] Starting backup → ${filename}`);
  try {
    execSync(`pg_dump -Fc --no-owner -d "${dbUrl}" -f "${filepath}"`, {
      stdio: "pipe",
      timeout: 300_000,
    });
    console.log(`[${new Date().toISOString()}] ✅ Backup complete: ${filepath}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Backup failed:`, err.message);
  }
}

function cleanOldBackups() {
  try {
    const files = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("aqliya_backup_") && f.endsWith(".dump"))
      .sort()
      .reverse();
    if (files.length > MAX_BACKUPS) {
      for (const oldFile of files.slice(MAX_BACKUPS)) {
        unlinkSync(resolve(BACKUP_DIR, oldFile));
        console.log(`  Pruned: ${oldFile}`);
      }
    }
  } catch (err) {
    console.error("Backup cleanup failed:", err.message);
  }
}

console.log(`[backup-scheduler] Starting. Interval: ${INTERVAL_MS / 60000}min, Max files: ${MAX_BACKUPS}`);

runBackup();
cleanOldBackups();

const timer = setInterval(() => {
  runBackup();
  cleanOldBackups();
}, INTERVAL_MS);

process.on("SIGTERM", () => { clearInterval(timer); process.exit(0); });
process.on("SIGINT", () => { clearInterval(timer); process.exit(0); });
