#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, mkdirSync, statSync, readdirSync, unlinkSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKUP_DIR = path.join(__dirname, "..", "..", "backups")
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-")
const DATABASE_URL = process.env.DATABASE_URL

console.log("=== AQLIYA Database Backup ===\n")

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Load .env.local or set environment variable.")
  process.exit(1)
}

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

const url = new URL(DATABASE_URL)
const dbName = url.pathname.replace(/^\//, "")
const filename = `aqliya-backup-${TIMESTAMP}.sql`
const filepath = path.join(BACKUP_DIR, filename)

try {
  console.log(`📦 Backing up database: ${dbName}`)
  console.log(`📍 Output: ${filepath}\n`)

  execSync(
    `pg_dump "${DATABASE_URL}" --no-owner --no-acl --format=c > "${filepath}"`,
    { stdio: "inherit", timeout: 120_000 }
  )

  const sizeMB = (statSync(filepath).size / 1024 / 1024).toFixed(2)
  console.log(`\n✅ Backup complete: ${filename}`)
  console.log(`📊 Size: ${sizeMB} MB`)

  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith("aqliya-backup-") && f.endsWith(".sql"))
    .sort()
    .reverse()

  if (files.length > 30) {
    for (const oldFile of files.slice(30)) {
      unlinkSync(path.join(BACKUP_DIR, oldFile))
      console.log(`🗑️  Removed old backup: ${oldFile}`)
    }
  }
} catch (error) {
  console.error(`\n❌ Backup failed: ${error.message}`)
  process.exit(1)
}
