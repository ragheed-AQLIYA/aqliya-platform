import { execSync } from "child_process"
import { resolve } from "path"
import { config } from "dotenv"

config({ path: resolve(__dirname, "../../.env") })

const INTERVAL_MS = parseInt(process.env.BACKUP_INTERVAL_MS || "3600000", 10)
const MAX_BACKUPS = parseInt(process.env.BACKUP_MAX_FILES || "30", 10)
const BACKUP_DIR = resolve(__dirname, "../../backups")

function runBackup(): void {
  console.log(`[${new Date().toISOString()}] Starting scheduled backup...`)
  try {
    execSync("npm run db:backup", { stdio: "inherit", cwd: resolve(__dirname, "../..") })
    console.log(`[${new Date().toISOString()}] Backup complete.`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Backup failed:`, (err as Error).message)
  }
}

function cleanOldBackups(): void {
  try {
    const { readdirSync, unlinkSync } = require("fs")
    const { join } = require("path")
    const files = readdirSync(BACKUP_DIR)
      .filter((f: string) => f.startsWith("aqliya_backup_") && f.endsWith(".dump"))
      .sort()
      .reverse()
    if (files.length > MAX_BACKUPS) {
      for (const oldFile of files.slice(MAX_BACKUPS)) {
        unlinkSync(join(BACKUP_DIR, oldFile))
        console.log(`Removed old backup: ${oldFile}`)
      }
    }
  } catch (err) {
    console.error("Backup cleanup failed:", (err as Error).message)
  }
}

console.log(`Backup scheduler started. Interval: ${INTERVAL_MS}ms (${INTERVAL_MS / 60000}min)`)

runBackup()
cleanOldBackups()

const timer = setInterval(() => {
  runBackup()
  cleanOldBackups()
}, INTERVAL_MS)

process.on("SIGTERM", () => { clearInterval(timer); process.exit(0) })
process.on("SIGINT", () => { clearInterval(timer); process.exit(0) })
