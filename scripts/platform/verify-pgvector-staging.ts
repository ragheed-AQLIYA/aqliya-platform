#!/usr/bin/env tsx
/**
 * Cycle 5 — pgvector staging verify (enable / migrate / verify).
 * Uses pg directly (no server-only / Prisma) so CLI and CI can run it.
 * Requires DATABASE_URL (staging or local Docker on 5434).
 */
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const pg = require("pg") as typeof import("pg")

async function verifyDocumentChunkTable(
  pool: import("pg").Pool,
): Promise<{ tableExists: boolean; pgvector: boolean }> {
  const client = await pool.connect()
  try {
    const ext = await client.query(
      `SELECT extname FROM pg_extension WHERE extname = $1 LIMIT 1`,
      ["vector"],
    )
    const tables = await client.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = $1 AND table_name = $2
       ) AS exists`,
      ["public", "DocumentChunk"],
    )
    return {
      pgvector: ext.rows.length > 0,
      tableExists: Boolean(tables.rows[0]?.exists),
    }
  } finally {
    client.release()
  }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("BLOCKED: DATABASE_URL not set — run against staging DB only.")
    process.exit(1)
  }

  const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 10000 })
  try {
    const result = await verifyDocumentChunkTable(pool)
    console.log(JSON.stringify({ staging: true, ...result }, null, 2))

    if (!result.tableExists || !result.pgvector) {
      console.error(
        "FAIL: Apply migration 20260605000001_ic01_pgvector_document_chunk and CREATE EXTENSION vector on staging.",
      )
      process.exit(1)
    }

    console.log("PASS: DocumentChunk table and pgvector extension present.")
  } finally {
    await pool.end().catch(() => {})
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
