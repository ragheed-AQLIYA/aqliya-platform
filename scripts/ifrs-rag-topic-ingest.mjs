#!/usr/bin/env node
/**
 * IFRS RAG Topic-Level Re-chunking (v2)
 *
 * Replaces the coarse standard-level chunks (1-2 per standard) with
 * topic-level chunks (one per topic per standard). This improves:
 *   - precise topic filtering in searchIfrsKnowledge
 *   - paragraphRef metadata for citation badges
 *   - retrieval granularity for per-rule RAG enrichment
 *
 * Safety:
 *   - Backs up existing ifrs-kf-% chunk rows to a JSON file before deleting
 *   - --dry-run mode reports the plan without touching the DB or OpenAI
 *
 * Requires: OPENAI_API_KEY, DATABASE_URL, pgvector extension.
 *
 * Run: node scripts/ifrs-rag-topic-ingest.mjs [--dry-run]
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import "dotenv/config"

const require = createRequire(import.meta.url)
const pg = require("pg")

const DRY_RUN = process.argv.includes("--dry-run")

const ROOT = join(process.cwd(), "knowledge-foundation", "domains", "ifrs")
const BACKUP_DIR = join(tmpdir(), "opencode")
const PLATFORM_ORG = "platform"
const EMBEDDING_MODEL = "text-embedding-3-small"
const RATE_LIMIT_MS = 400
const DOC_PREFIX = "ifrs-kf-"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── File Loading ────────────────────────────────────────────────────────────

async function readJson(filePath) {
  try {
    const raw = await readFile(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function unwrapAsset(raw) {
  if (!raw) return null
  const meta = raw.meta ?? {}
  return {
    assetId: meta.assetId ?? "",
    standardCode: meta.standardCode ?? "",
    standardName: meta.standardName,
    versionLabel: meta.versionLabel ?? "",
    effectiveDate: meta.effectiveDate,
    sourceUrl: meta.sourceUrl,
    jurisdiction: meta.jurisdiction,
    ragIngest: meta.ragIngest ?? false,
    licensing: raw.licensing,
  }
}

function evaluateAdmission(asset, rules, admission) {
  if (!admission) return false
  if (admission.currentStage !== "productionAdmission") return false
  const approval = admission.stageResults?.reviewerApproval
  if (approval?.status !== "approved") return false
  if ((admission.blockedTechnologies ?? []).includes("RAG") && !admission.ragUnblockedAt)
    return false
  const emb = asset.licensing?.embedding
  if (emb && emb !== "permitted") return false
  if (!asset.standardCode || !asset.versionLabel) return false
  if (!rules?.rules?.length) return false
  return rules.rules.some((r) => r.ruleText?.trim())
}

// ─── Topic-Level Chunking ────────────────────────────────────────────────────

/**
 * Group rules by topic — one chunk per topic.
 * Content header format keeps the `| topic]` pattern that
 * searchIfrsKnowledge topic filtering relies on (topic is the last
 * element before the closing bracket).
 */
function extractTopicChunks(asset, rules) {
  const byTopic = new Map()
  for (const r of rules.rules) {
    if (!r.ruleText?.trim()) continue
    const topic = r.topic?.trim() || "general"
    if (!byTopic.has(topic)) byTopic.set(topic, [])
    byTopic.get(topic).push(r)
  }

  return [...byTopic.entries()].map(([topic, rs]) => {
    const paragraphRefs = rs.map((r) => r.paragraphReference).filter(Boolean)
    const paraLabel = paragraphRefs.length > 0 ? paragraphRefs.join(", ") : "—"
    const header = `[${asset.standardCode} | ${asset.versionLabel} | ${paraLabel} | ${topic}]`
    const body = rs.map((r) => r.ruleText.trim()).join("\n")
    const content = `${asset.standardName ? asset.standardName + "\n" : ""}${header}\n${body}`
    return {
      topic,
      ruleCount: rs.length,
      paragraphRefs,
      paragraphRef: paragraphRefs[0] ?? "",
      content,
      contentHash: createHash("sha256")
        .update([asset.assetId, asset.standardCode, asset.versionLabel, topic, ...rs.map((r) => r.ruleText)].join("||"))
        .digest("hex")
        .slice(0, 64),
    }
  })
}

// ─── OpenAI Embedding ────────────────────────────────────────────────────────

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
    signal: AbortSignal.timeout(60_000),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI embedding failed (${res.status}): ${body.slice(0, 200)}`)
  }

  const json = await res.json()
  return json.data[0].embedding
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(70))
  console.log(`  IFRS RAG TOPIC-LEVEL RE-CHUNKING (v2)${DRY_RUN ? " — DRY RUN" : ""}`)
  console.log("═".repeat(70))
  console.log()

  if (!process.env.OPENAI_API_KEY && !DRY_RUN) {
    console.error("✗ OPENAI_API_KEY not set. Aborting.")
    process.exit(1)
  }
  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL not set. Aborting.")
    process.exit(1)
  }
  console.log("✓ Pre-flight checks passed")
  console.log()

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  })

  // Discover and validate all standards
  const entries = await readdir(ROOT, { withFileTypes: true })
  const allDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()

  const standards = []
  for (const dir of allDirs) {
    const asset = unwrapAsset(await readJson(join(ROOT, dir, "asset.json")))
    const rules = await readJson(join(ROOT, dir, "rules.json"))
    const admission = await readJson(join(ROOT, dir, "admission-record.json"))
    if (!asset || !asset.ragIngest) continue
    if (!evaluateAdmission(asset, rules, admission)) continue
    standards.push({ dir, asset, rules })
  }

  // Build the full topic-chunk plan
  const plan = standards.map(({ dir, asset, rules }) => ({
    dir,
    asset,
    chunks: extractTopicChunks(asset, rules),
  }))

  const totalTopics = plan.reduce((s, p) => s + p.chunks.length, 0)
  const totalRules = plan.reduce(
    (s, p) => s + p.chunks.reduce((x, c) => x + c.ruleCount, 0),
    0,
  )
  const estTokens = plan.reduce(
    (s, p) => s + p.chunks.reduce((x, c) => x + Math.ceil(c.content.length / 4), 0),
    0,
  )

  console.log(`  Standards: ${plan.length}`)
  console.log(`  Topic chunks planned: ${totalTopics} (from ${totalRules} rules)`)
  console.log(`  Estimated tokens: ~${estTokens}`)
  console.log()
  console.log("  Per-standard breakdown:")
  for (const p of plan) {
    console.log(
      `    ${p.asset.standardCode.padEnd(12)} ${String(p.chunks.length).padStart(3)} topics  (${p.dir})`,
    )
  }
  console.log()

  if (DRY_RUN) {
    console.log("═".repeat(70))
    console.log("  DRY RUN COMPLETE — no changes made")
    console.log("═".repeat(70))
    await pool.end()
    return
  }

  // Backup existing ifrs-kf-% chunks
  const backupRows = await pool.query(
    `SELECT "id", "documentId", "chunkIndex", "content", "tokenCount", "metadata", "createdAt"
     FROM "DocumentChunk"
     WHERE "documentId" LIKE $1 AND "organizationId" = $2`,
    [`${DOC_PREFIX}%`, PLATFORM_ORG],
  )
  await mkdir(BACKUP_DIR, { recursive: true })
  const backupPath = join(
    BACKUP_DIR,
    `ifrs-kf-chunks-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  )
  await writeFile(backupPath, JSON.stringify(backupRows.rows, null, 2), "utf-8")
  console.log(`✓ Backed up ${backupRows.rows.length} existing chunks → ${backupPath}`)
  console.log()

  // Replace chunks
  const deleteResult = await pool.query(
    `DELETE FROM "DocumentChunk" WHERE "documentId" LIKE $1 AND "organizationId" = $2`,
    [`${DOC_PREFIX}%`, PLATFORM_ORG],
  )
  console.log(`✓ Deleted ${deleteResult.rowCount} old standard-level chunks`)
  console.log()

  let stored = 0
  let failed = 0

  for (const { dir, asset, chunks } of plan) {
    console.log(`── ${asset.standardCode} (${dir}): ${chunks.length} topic chunks`)
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i]
      const tokens = Math.ceil(c.content.length / 4)
      try {
        const embedding = await generateEmbedding(c.content)
        await sleep(RATE_LIMIT_MS)

        await pool.query(
          `INSERT INTO "DocumentChunk" (
            "id", "organizationId", "documentId", "chunkIndex", "content",
            "tokenCount", "metadata", "embedding", "embedding_json",
            "createdBy", "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::vector, $8, $9, NOW()
          )`,
          [
            PLATFORM_ORG,
            `${DOC_PREFIX}${dir}`,
            i,
            c.content,
            tokens,
            JSON.stringify({
              sourceType: "ifrs-knowledge-foundation",
              chunking: "topic-v2",
              standardCode: asset.standardCode,
              standardVersion: asset.versionLabel,
              topic: c.topic,
              paragraphRef: c.paragraphRef,
              paragraphRefs: c.paragraphRefs,
              sourceUrl: asset.sourceUrl,
              jurisdiction: asset.jurisdiction,
              effectiveDate: asset.effectiveDate,
              assetId: asset.assetId,
              contentHash: c.contentHash,
              productKey: "ifrs_knowledge",
              sensitivity: "internal",
            }),
            `[${embedding.join(",")}]`,
            JSON.stringify(embedding),
            "ifrs-topic-ingest-v2",
          ],
        )
        stored++
        process.stdout.write(`    ✓ [${i + 1}/${chunks.length}] ${c.topic} (${tokens} tk)\n`)
      } catch (err) {
        failed++
        console.error(`    ✗ [${i + 1}/${chunks.length}] ${c.topic}: ${err.message}`)
      }
    }
  }

  console.log()
  console.log("═".repeat(70))
  console.log("  TOPIC RE-CHUNKING SUMMARY")
  console.log("═".repeat(70))
  console.log(`  ✓ Stored: ${stored}/${totalTopics} topic chunks`)
  if (failed > 0) console.log(`  ✗ Failed: ${failed}`)
  console.log(`  Backup: ${backupPath}`)
  console.log()

  // Verification searches
  console.log("  Verification searches:")
  const probes = [
    ["inventories measurement cost", "IAS 2"],
    ["insurance contract measurement", "IFRS 17"],
    ["going concern assessment", "IAS 1"],
  ]
  for (const [query, expectCode] of probes) {
    try {
      const embedding = await generateEmbedding(query)
      const res = await pool.query(
        `SELECT "documentId",
                1 - ("embedding" <=> $1::vector) AS sim,
                metadata->>'standardCode' AS code,
                metadata->>'topic' AS topic
         FROM "DocumentChunk"
         WHERE "organizationId" = $2
         ORDER BY sim DESC
         LIMIT 1`,
        [`[${embedding.join(",")}]`, PLATFORM_ORG],
      )
      const top = res.rows[0]
      const ok = top?.code === expectCode
      console.log(
        `    ${ok ? "✓" : "?"} "${query}" → ${top?.code} / ${top?.topic} (sim ${top?.sim?.toFixed(4)})`,
      )
    } catch (err) {
      console.error(`    ✗ "${query}" probe failed: ${err.message}`)
    }
  }

  await pool.end()
  console.log()
  console.log("═".repeat(70))
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
