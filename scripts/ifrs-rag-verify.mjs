#!/usr/bin/env node
/**
 * IFRS RAG Retrieval Verification
 *
 * Standalone sanity check for the IFRS knowledge corpus. Verifies:
 *   - chunk counts and total tokens
 *   - metadata completeness (topic, paragraphRef, standardCode)
 *   - semantic retrieval quality against known-answer probes
 *   - topic-filter pattern integrity (`| topic]` in content)
 *
 * No mutations — read-only against the database.
 *
 * Run: node scripts/ifrs-rag-verify.mjs
 */
import { createRequire } from "node:module"
import "dotenv/config"

const require = createRequire(import.meta.url)
const pg = require("pg")

const PLATFORM_ORG = "platform"
const EMBEDDING_MODEL = "text-embedding-3-small"

// Known-answer probes: [query, expectedStandardCode, expectedTopic]
const PROBES = [
  ["inventories measurement cost NRV", "IAS 2", null],
  ["insurance contract measurement", "IFRS 17", null],
  ["going concern assessment doubt", "IAS 1", "going-concern"],
  ["expected credit loss staging", "IFRS 9", "expected-credit-loss"],
  ["revenue five step model", "IFRS 15", "five-step-model"],
  ["segment reporting CODM", "IFRS 8", null],
  ["lease liability initial measurement", "IFRS 16", null],
  ["fair value measurement hierarchy", "IFRS 13", null],
]

async function generateEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY not set")

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`embedding failed (${res.status})`)
  return (await res.json()).data[0].embedding
}

async function main() {
  console.log("═".repeat(70))
  console.log("  IFRS RAG RETRIEVAL VERIFICATION")
  console.log("═".repeat(70))

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  })

  // ── Corpus stats ─────────────────────────────────────────────────────────
  const stats = await pool.query(
    `SELECT COUNT(*)::int AS chunks,
            COALESCE(SUM("tokenCount"), 0)::int AS tokens,
            COUNT(DISTINCT "documentId")::int AS documents
     FROM "DocumentChunk"
     WHERE "organizationId" = $1 AND "documentId" LIKE 'ifrs-kf-%'`,
    [PLATFORM_ORG],
  )
  const s = stats.rows[0]
  console.log()
  console.log(`  Corpus: ${s.documents} standards, ${s.chunks} chunks, ~${s.tokens} tokens`)

  // ── Metadata completeness ────────────────────────────────────────────────
  const meta = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE metadata->>'topic' IS NULL OR metadata->>'topic' = '')::int AS missing_topic,
       COUNT(*) FILTER (WHERE metadata->>'paragraphRef' IS NULL OR metadata->>'paragraphRef' = '')::int AS missing_para,
       COUNT(*) FILTER (WHERE metadata->>'standardCode' IS NULL OR metadata->>'standardCode' = '')::int AS missing_code,
       COUNT(*) FILTER (WHERE metadata->>'chunking' = 'topic-v2')::int AS topic_v2
     FROM "DocumentChunk"
     WHERE "organizationId" = $1 AND "documentId" LIKE 'ifrs-kf-%'`,
    [PLATFORM_ORG],
  )
  const m = meta.rows[0]
  console.log(`  Chunking: ${m.topic_v2}/${s.chunks} topic-v2`)
  console.log(`  Metadata gaps: topic=${m.missing_topic}, paragraphRef=${m.missing_para}, standardCode=${m.missing_code}`)

  // ── Topic pattern integrity ──────────────────────────────────────────────
  const pattern = await pool.query(
    `SELECT COUNT(*)::int AS bad
     FROM "DocumentChunk"
     WHERE "organizationId" = $1
       AND "documentId" LIKE 'ifrs-kf-%'
       AND metadata->>'chunking' = 'topic-v2'
       AND content NOT LIKE '%| ' || (metadata->>'topic') || ']%'`,
    [PLATFORM_ORG],
  )
  console.log(`  Topic-pattern violations: ${pattern.rows[0].bad}`)

  // ── Semantic probes ──────────────────────────────────────────────────────
  console.log()
  console.log("  Semantic retrieval probes:")
  let pass = 0
  for (const [query, expectedCode, expectedTopic] of PROBES) {
    try {
      const embedding = await generateEmbedding(query)
      const res = await pool.query(
        `SELECT "documentId",
                metadata->>'standardCode' AS code,
                metadata->>'topic' AS topic,
                1 - ("embedding" <=> $1::vector) AS sim
         FROM "DocumentChunk"
         WHERE "organizationId" = $2
         ORDER BY sim DESC
         LIMIT 3`,
        [`[${embedding.join(",")}]`, PLATFORM_ORG],
      )
      const top = res.rows[0]
      const codeOk = top?.code === expectedCode
      const topicOk = expectedTopic === null || top?.topic === expectedTopic
      const ok = codeOk && topicOk
      if (ok) pass++
      const expect = expectedTopic ? `${expectedCode}/${expectedTopic}` : expectedCode
      console.log(
        `    ${ok ? "✓" : "✗"} "${query}" → ${top?.code ?? "?"}/${top?.topic ?? "?"} (sim ${top?.sim?.toFixed(4)}) [expect ${expect}]`,
      )
    } catch (err) {
      console.error(`    ✗ "${query}" probe failed: ${err.message}`)
    }
  }

  console.log()
  console.log("═".repeat(70))
  console.log(`  RESULT: ${pass}/${PROBES.length} probes passed`)
  console.log("═".repeat(70))

  await pool.end()
  if (pass < PROBES.length) process.exit(1)
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
