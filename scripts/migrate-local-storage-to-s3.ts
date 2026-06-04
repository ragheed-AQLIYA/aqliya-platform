/**
 * migrate-local-storage-to-s3.ts
 *
 * One-time migration script: copies all files from local storage to S3.
 *
 * Usage:
 *   npx tsx scripts/migrate-local-storage-to-s3.ts
 *
 * Prerequisites:
 *   - S3 env vars must be set (S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET)
 *   - Local files must exist under the LOCAL_STORAGE_DIR or default ./uploads
 *
 * Safety:
 *   - Does NOT delete local files after migration (use --cleanup to delete originals)
 *   - Skips files that already exist in S3
 *   - Compares MD5-like content hash for integrity
 */
import "server-only"

import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"

let errorCount = 0
let copiedCount = 0
let skippedCount = 0

async function main() {
  const args = process.argv.slice(2)
  const cleanup = args.includes("--cleanup")

  const localDir = process.env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), "uploads")

  if (!fs.existsSync(localDir)) {
    console.log(`Local storage directory does not exist: ${localDir}`)
    console.log("Nothing to migrate.")
    process.exit(0)
  }

  const { getStorageProvider } = await import("@/lib/platform/storage")
  const storage = getStorageProvider()

  if (storage.type === "local") {
    console.error("STORAGE_PROVIDER is still set to 'local'. Switch to 's3' to migrate.")
    process.exit(1)
  }

  console.log(`Migrating files from ${localDir} to ${storage.type} storage...`)
  console.log("")

  await walkDir(localDir, localDir, storage, cleanup)

  console.log("")
  console.log("Migration complete:")
  console.log(`  Copied:  ${copiedCount}`)
  console.log(`  Skipped: ${skippedCount}`)
  console.log(`  Errors:  ${errorCount}`)

  if (cleanup && errorCount === 0) {
    console.log("")
    console.log("Cleaning up local files (--cleanup was specified)...")
    fs.rmSync(localDir, { recursive: true, force: true })
    console.log(`Deleted: ${localDir}`)
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

async function walkDir(baseDir: string, currentDir: string, storage: Awaited<ReturnType<typeof import("@/lib/platform/storage")["getStorageProvider"]>>, cleanup: boolean) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name)

    if (entry.isDirectory()) {
      await walkDir(baseDir, fullPath, storage, cleanup)
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/")
      const content = fs.readFileSync(fullPath)
      const localHash = hashContent(content)

      try {
        const exists = await storage.exists(relativePath)
        if (exists) {
          const existingFile = await storage.retrieve(relativePath)
          if (existingFile) {
            const remoteHash = hashContent(existingFile.content)
            if (remoteHash === localHash) {
              skippedCount++
              continue
            }
          }
        }

        const mimeType = mimeFromExt(path.extname(entry.name))
        await storage.store(relativePath, {
          filename: entry.name,
          mimeType,
          content,
        })

        const verifyFile = await storage.retrieve(relativePath)
        if (!verifyFile) {
          console.error(`  FAILED verify: ${relativePath}`)
          errorCount++
          continue
        }

        const verifyHash = hashContent(verifyFile.content)
        if (verifyHash !== localHash) {
          console.error(`  HASH MISMATCH: ${relativePath}`)
          errorCount++
          continue
        }

        copiedCount++
      } catch (err) {
        console.error(`  ERROR: ${relativePath} — ${err instanceof Error ? err.message : String(err)}`)
        errorCount++
      }
    }
  }
}

function hashContent(buf: Buffer): string {
  return crypto.createHash("md5").update(buf).digest("hex")
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".csv": "text/csv",
  }
  return map[ext.toLowerCase()] ?? "application/octet-stream"
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
