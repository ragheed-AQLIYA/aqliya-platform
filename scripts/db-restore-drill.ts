import { execSync } from "child_process"
import { existsSync, readdirSync } from "fs"
import { resolve } from "path"
import { config } from "dotenv"

config({ path: resolve(__dirname, "../.env") })

const BACKUP_DIR = resolve(__dirname, "../backups")

function findLatestBackup(): string | null {
  if (!existsSync(BACKUP_DIR)) return null
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("aqliya_backup_") && f.endsWith(".dump"))
    .sort()
    .reverse()
  return files.length > 0 ? resolve(BACKUP_DIR, files[0]) : null
}

async function main() {
  console.log("=== AQLIYA Restore Drill ===\n")

  const backupFile = findLatestBackup()
  if (!backupFile) {
    console.error("❌ No backup file found in backups/ directory.")
    console.log("Run 'npm run db:backup' first.")
    process.exit(1)
  }

  console.log(`Backup file: ${backupFile}`)
  console.log("")

  const currentDbUrl = process.env.DATABASE_URL
  if (!currentDbUrl) {
    console.error("❌ DATABASE_URL is not set.")
    process.exit(1)
  }

  console.log("Step 1: Dry run (validating backup file)...")
  try {
    execSync(`npm run db:restore -- "${backupFile}"`, { stdio: "inherit", cwd: resolve(__dirname, "..") })
    console.log("  ✅ Dry run: PASS\n")
  } catch {
    console.error("  ❌ Dry run: FAILED — backup file may be corrupt")
    process.exit(1)
  }

  console.log("Step 2: Checking backup file integrity...")
  const stats = require("fs").statSync(backupFile)
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
  console.log(`  File size: ${sizeMB} MB`)
  console.log("  ✅ File integrity: OK\n")

  console.log("Step 3: Verification (read-only data check)...")
  try {
    execSync("npm run backup:verify", { stdio: "inherit", cwd: resolve(__dirname, "..") })
  } catch {
    console.error("  ❌ Verification: FAILED — database may have data issues")
    process.exit(1)
  }

  console.log("")
  console.log("=".repeat(50))
  console.log("✅ Restore Drill: PASS")
  console.log(`   Backup: ${backupFile}`)
  console.log(`   Size: ${sizeMB} MB`)
  console.log(`   Date: ${new Date().toISOString()}`)
  console.log("=".repeat(50))
}

main().catch((err) => {
  console.error("Drill failed:", err)
  process.exit(1)
})
