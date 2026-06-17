#!/usr/bin/env node
/**
 * P0 — pgvector health check for CI and staging verification.
 * Run: node scripts/check-pgvector-health.mjs
 * Env: DATABASE_URL, FF_AI_RAG (optional)
 *
 * Checks:
 * 1. pgvector extension availability (SKIP if not present — no fail)
 * 2. DocumentChunk table existence
 * 3. Embedding dimension consistency
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const pg = require("pg");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("pgvector_health=skip (no DATABASE_URL)");
    process.exit(0);
  }

  const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
  const results = { pgvector: false, tableExists: false, error: null };

  try {
    const client = await pool.connect();

    // 1. Check pgvector extension
    try {
      const ext = await client.query(
        `SELECT extname FROM pg_extension WHERE extname = $1`,
        ["vector"],
      );
      results.pgvector = ext.rows.length > 0;
    } catch {
      results.pgvector = false;
    }

    // 2. Check DocumentChunk table
    try {
      const tables = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = $1 AND table_name = $2
        ) AS exists`,
        ["public", "DocumentChunk"],
      );
      results.tableExists = tables.rows[0]?.exists ?? false;
    } catch {
      results.tableExists = false;
    }

    // 3. Optional: check embedding column (before release)
    if (results.tableExists && results.pgvector) {
      try {
        const dims = await client.query(
          `SELECT atttypmod FROM pg_attribute
           WHERE attrelid = $1::regclass AND attname = $2`,
          ["DocumentChunk", "embedding"],
        );
        const dimension = dims.rows[0]?.atttypmod
          ? dims.rows[0].atttypmod - 4
          : "unknown";
        results.dimension = dimension;
      } catch {
        // embedding column may not exist yet
      }
    }

    // 4. Check JSON fallback column
    if (results.tableExists && !results.pgvector) {
      try {
        const cols = await client.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_name = $1 AND column_name = $2`,
          ["DocumentChunk", "embedding_json"],
        );
        results.embeddingJsonColumn = cols.rows.length > 0;
      } catch {
        results.embeddingJsonColumn = false;
      }
    }

    client.release();

    const ragFlag = process.env.FF_AI_RAG === "true";
    const ragStatus = ragFlag ? "enabled" : "disabled";

    console.log(`pgvector_extension=${results.pgvector}`);
    console.log(`document_chunk_table=${results.tableExists}`);
    if (results.dimension) console.log(`embedding_dimension=${results.dimension}`);
    if (results.embeddingJsonColumn !== undefined) console.log(`embedding_json_column=${results.embeddingJsonColumn}`);
    console.log(`ff_ai_rag=${ragStatus}`);

    // If FF_AI_RAG is true, pgvector must be present
    if (ragFlag && !results.pgvector) {
      console.error("FAIL: FF_AI_RAG=true but pgvector extension not found");
      process.exit(1);
    }
    if (ragFlag && !results.tableExists) {
      console.error("FAIL: FF_AI_RAG=true but DocumentChunk table not found");
      process.exit(1);
    }

    console.log("pgvector_health=pass");
  } finally {
    await pool.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(`pgvector_health=error ${err.message}`);
  process.exit(1);
});
