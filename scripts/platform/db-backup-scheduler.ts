/**
 * Scheduled Database Backup Scheduler.
 *
 * Runs `npm run db:backup` on a configurable interval and prunes old backups.
 *
 * Usage (dev):
 *   npx tsx scripts/platform/db-backup-scheduler.ts
 *
 * Production deployment (systemd timer):
 *   [Unit]
 *   Description=AQLIYA database backup
 *
 *   [Timer]
 *   OnCalendar=daily
 *   Persistent=true
 *
 *   [Install]
 *   WantedBy=timers.target
 *
 * Then:
 *   systemctl link /opt/aqliya/deploy/systemd/aqliya-backup.timer
 *   systemctl enable aqliya-backup.timer && systemctl start aqliya-backup.timer
 *
 * Environment:
 *   BACKUP_INTERVAL_MS  — default 3600000 (1h), only when run as daemon
 *   BACKUP_MAX_FILES    — default 30
 *   BACKUP_DIR          — default ./backups
 *   DATABASE_URL        — required (used by npm run db:backup)
 */

import { execSync } from "child_process";
import { resolve, join } from "path";
import { existsSync, readdirSync, unlinkSync, mkdirSync } from "fs";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../../.env") });

export interface BackupSchedulerConfig {
  intervalMs: number;
  maxBackups: number;
  backupDir: string;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

export function getBackupSchedulerConfig(): BackupSchedulerConfig {
  return {
    intervalMs: parsePositiveInt(process.env.BACKUP_INTERVAL_MS, 3_600_000),
    maxBackups: parsePositiveInt(process.env.BACKUP_MAX_FILES, 30),
    backupDir: resolve(__dirname, process.env.BACKUP_DIR || "../../backups"),
  };
}

export function ensureBackupDir(config: BackupSchedulerConfig): void {
  if (!existsSync(config.backupDir)) {
    mkdirSync(config.backupDir, { recursive: true });
  }
}

export function runBackup(config = getBackupSchedulerConfig()): boolean {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting scheduled backup...`);
  try {
    execSync("npm run db:backup", {
      stdio: "inherit",
      cwd: resolve(__dirname, "../.."),
      env: { ...process.env, BACKUP_DIR: config.backupDir },
      timeout: 300_000, // 5 min timeout
    });
    console.log(`[${new Date().toISOString()}] Backup complete.`);
    return true;
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Backup failed:`,
      (err as Error).message,
    );
    return false;
  }
}

export function cleanOldBackups(config = getBackupSchedulerConfig()): void {
  try {
    const backupSortKey = (filename: string) =>
      filename
        .replace(/^aqliya_backup_/, "")
        .replace(/^backup_/, "")
        .replace(/\.dump$/, "");

    const files = readdirSync(config.backupDir)
      .filter(
        (f: string) =>
          (f.startsWith("aqliya_backup_") || f.startsWith("backup_")) &&
          f.endsWith(".dump"),
      )
      .sort((a, b) => backupSortKey(b).localeCompare(backupSortKey(a)));

    if (files.length > config.maxBackups) {
      for (const oldFile of files.slice(config.maxBackups)) {
        const filePath = join(config.backupDir, oldFile);
        unlinkSync(filePath);
        console.log(`[Cleanup] Removed old backup: ${oldFile}`);
      }
    }
  } catch (err) {
    console.error("[Cleanup] Backup cleanup failed:", (err as Error).message);
  }
}

export function main(argv = process.argv): void {
  const config = getBackupSchedulerConfig();
  ensureBackupDir(config);

  const isTimerMode = argv.includes("--timer");

  if (isTimerMode) {
    console.log(
      `[BackupScheduler] Timer mode started. Interval: ${config.intervalMs}ms (${config.intervalMs / 60000}min)`,
    );

    runBackup(config);
    cleanOldBackups(config);

    const timer = setInterval(() => {
      runBackup(config);
      cleanOldBackups(config);
    }, config.intervalMs);

    process.on("SIGTERM", () => {
      clearInterval(timer);
      process.exit(0);
    });
    process.on("SIGINT", () => {
      clearInterval(timer);
      process.exit(0);
    });
    return;
  }

  const ok = runBackup(config);
  cleanOldBackups(config);
  process.exit(ok ? 0 : 1);
}

if (require.main === module) {
  main();
}
