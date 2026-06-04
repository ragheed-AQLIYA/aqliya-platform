import "server-only"

let _pgvectorAvailable: boolean | null = null

export async function isPgvectorAvailable(): Promise<boolean> {
  if (_pgvectorAvailable !== null) return _pgvectorAvailable

  const url = process.env.DATABASE_URL
  if (!url) {
    _pgvectorAvailable = false
    return false
  }

  try {
    const { Pool } = await import("pg")
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 })
    const client = await pool.connect()
    try {
      const ext = await client.query(
        `SELECT extname FROM pg_extension WHERE extname = $1 LIMIT 1`,
        ["vector"],
      )
      _pgvectorAvailable = ext.rows.length > 0
    } finally {
      client.release()
    }
    await pool.end().catch(() => {})
  } catch {
    _pgvectorAvailable = false
  }

  return _pgvectorAvailable
}

export function getEmbeddingType(): string {
  return "vector(1536)"
}

export function getFallbackEmbeddingType(): string {
  return "JSON"
}

export async function supportsSimilaritySearch(): Promise<boolean> {
  return isPgvectorAvailable()
}

export function resetPgvectorCache(): void {
  _pgvectorAvailable = null
}
