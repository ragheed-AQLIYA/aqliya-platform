import "server-only"
import { isPgvectorAvailable, supportsSimilaritySearch } from "./pgvector-compat"

export interface PgvectorDiagnostics {
  pgvectorAvailable: boolean
  similaritySearchSupported: boolean
  extensionVersion: string | null
  errors: string[]
}

export async function runDiagnostics(): Promise<PgvectorDiagnostics> {
  const result: PgvectorDiagnostics = {
    pgvectorAvailable: false,
    similaritySearchSupported: false,
    extensionVersion: null,
    errors: [],
  }

  const url = process.env.DATABASE_URL
  if (!url) {
    result.errors.push("DATABASE_URL not set")
    return result
  }

  try {
    const { Pool } = await import("pg")
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 })
    const client = await pool.connect()

    try {
      const ext = await client.query(
        `SELECT extname, extversion FROM pg_extension WHERE extname = $1 LIMIT 1`,
        ["vector"],
      )
      if (ext.rows.length > 0) {
        result.pgvectorAvailable = true
        result.extensionVersion = ext.rows[0].extversion
      } else {
        result.errors.push("pgvector extension not installed (run: CREATE EXTENSION vector)")
      }

      result.similaritySearchSupported = await supportsSimilaritySearch()
    } finally {
      client.release()
    }
    await pool.end().catch(() => {})
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    result.errors.push(`Database connection failed: ${message}`)
  }

  return result
}

export async function getEmbeddingColumnType(): Promise<string> {
  const available = await isPgvectorAvailable()
  return available ? "vector(1536)" : "JSON (embeddingJson)"
}
