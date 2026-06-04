#!/usr/bin/env tsx
/**
 * Cycle 5 — pgvector staging verify (enable / migrate / verify).
 * Does not apply production rollout. Requires DATABASE_URL (staging).
 */
import { verifyDocumentChunkTable } from "../src/lib/rag/vector-store"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("BLOCKED: DATABASE_URL not set — run against staging DB only.")
    process.exit(1)
  }

  const result = await verifyDocumentChunkTable()
  console.log(JSON.stringify({ staging: true, ...result }, null, 2))

  if (!result.tableExists || !result.pgvector) {
    console.error(
      "FAIL: Apply migration 20260605000001_ic01_pgvector_document_chunk and CREATE EXTENSION vector on staging.",
    )
    process.exit(1)
  }

  console.log("PASS: DocumentChunk table and pgvector extension present.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
