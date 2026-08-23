#!/usr/bin/env node
/**
 * IFRS RAG Batch Ingestion
 *
 * Ingests ALL eligible IFRS knowledge-foundation standards into the RAG pipeline.
 * Skips the 3 pilot standards already ingested (ias-1, ias-2, ifrs-17).
 * Requires: OPENAI_API_KEY, DATABASE_URL, pgvector extension.
 *
 * Run: node scripts/ifrs-rag-batch-ingest.mjs
 */
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import "dotenv/config"

const require = createRequire(import.meta.url)
const pg = require("pg")

const ROOT = join(process.cwd(), "knowledge-foundation", "domains", "ifrs")
const PLATFORM_ORG = "platform"
const EMBEDDING_MODEL = "text-embedding-3-small"
const EMBEDDING_DIMS = 1536
const PILOT_DIRS = new Set(["ias-1", "ias-2", "ifrs-17"])
const BATCH_SIZE = 5
const RATE_LIMIT_MS = 500
const BATCH_DELAY_MS = 2000

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
    vectorIndex: meta.vectorIndex ?? false,
    licensing: raw.licensing,
  }
}

// ─── Admission Evaluation ───────────────────────────────────────────────────

function evaluateAdmission(asset, rules, admission) {
  const reasons = []
  if (!admission) return { ok: false, reasons: ["No admission record"] }
  if (admission.currentStage !== "productionAdmission")
    return { ok: false, reasons: [`Stage: ${admission.currentStage}`] }

  const approval = admission.stageResults?.reviewerApproval
  if (approval?.status !== "approved")
    return { ok: false, reasons: [`Approval: ${approval?.status ?? "missing"}`] }

  // RAG block: allow if ragUnblockedAt is set, otherwise check blockedTechnologies
  if ((admission.blockedTechnologies ?? []).includes("RAG") && !admission.ragUnblockedAt)
    return { ok: false, reasons: ["RAG blocked (no ragUnblockedAt)"] }

  const emb = asset.licensing?.embedding
  if (emb && emb !== "permitted")
    return { ok: false, reasons: [`Embedding: ${emb}`] }

  if (!asset.standardCode) return { ok: false, reasons: ["Missing standardCode"] }
  if (!asset.versionLabel) return { ok: false, reasons: ["Missing versionLabel"] }
  if (!rules?.rules?.length) return { ok: false, reasons: ["No rules"] }

  const withText = rules.rules.filter((r) => r.ruleText?.trim())
  if (withText.length === 0) return { ok: false, reasons: ["All rules empty"] }

  return { ok: true, ruleCount: withText.length }
}

// ─── Content Extraction ─────────────────────────────────────────────────────

function extractContent(asset, rules) {
  return rules.rules
    .filter((r) => r.ruleText?.trim())
    .map((r) => {
      const para = r.paragraphReference ?? ""
      const topic = r.topic ? ` | ${r.topic}` : ""
      return `[${asset.standardCode} | ${asset.versionLabel} | ${para}${topic}]\n${r.ruleText.trim()}`
    })
    .join("\n\n")
}

function computeContentHash(asset, rules) {
  const parts = [
    asset.assetId,
    asset.standardCode,
    asset.versionLabel,
    ...rules.rules.map((r) => `${r.ruleId}:${r.ruleText}`),
  ]
  return createHash("sha-256").update(parts.join("||")).digest("hex").slice(0, 64)
}

// ─── OpenAI Embedding ──────────────────────────────────────────────────────

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

// ─── Chunking ───────────────────────────────────────────────────────────────

function chunkText(text, maxChars = 1024, overlap = 128) {
  const chunks = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length)
    chunks.push(text.slice(start, end))
    if (end >= text.length) break
    start = end - overlap
  }
  return chunks
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(70))
  console.log("  IFRS RAG BATCH INGESTION")
  console.log("═".repeat(70))
  console.log()

  // Pre-flight checks
  if (!process.env.OPENAI_API_KEY) {
    console.error("✗ OPENAI_API_KEY not set. Aborting.")
    process.exit(1)
  }
  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL not set. Aborting.")
    process.exit(1)
  }
  console.log("✓ Pre-flight: OPENAI_API_KEY and DATABASE_URL present")

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  })

  // Discover all directories
  const entries = await readdir(ROOT, { withFileTypes: true })
  const allDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  console.log(`✓ Found ${allDirs.length} total standard directories`)

  // Scan for eligibility
  const eligible = []
  const skipped = { pilot: [], noRag: [], noAsset: [], noRules: [], noAdmission: [], blocked: [], noRulesContent: [] }

  for (const dir of allDirs) {
    // Skip already-ingested pilot standards
    if (PILOT_DIRS.has(dir)) {
      skipped.pilot.push(dir)
      continue
    }

    const rawAsset = await readJson(join(ROOT, dir, "asset.json"))
    const asset = unwrapAsset(rawAsset)
    if (!asset) {
      skipped.noAsset.push(dir)
      continue
    }

    // Check ragIngest flag
    if (!asset.ragIngest) {
      skipped.noRag.push(dir)
      continue
    }

    const rules = await readJson(join(ROOT, dir, "rules.json"))
    if (!rules) {
      skipped.noRules.push(dir)
      continue
    }

    const admission = await readJson(join(ROOT, dir, "admission-record.json"))
    if (!admission) {
      skipped.noAdmission.push(dir)
      continue
    }

    const admResult = evaluateAdmission(asset, rules, admission)
    if (!admResult.ok) {
      skipped.blocked.push({ dir, reasons: admResult.reasons })
      continue
    }

    eligible.push({ dir, asset, rules, admission, ruleCount: admResult.ruleCount })
  }

  console.log(`✓ Found ${eligible.length} eligible standards (out of ${allDirs.length} total)`)
  if (skipped.pilot.length)
    console.log(`  ⏭ Already ingested (pilot): ${skipped.pilot.join(", ")}`)
  if (skipped.noRag.length)
    console.log(`  ⏭ ragIngest=false: ${skipped.noRag.join(", ")}`)
  if (skipped.noAsset.length)
    console.log(`  ⏭ No asset.json: ${skipped.noAsset.join(", ")}`)
  if (skipped.noRules.length)
    console.log(`  ⏭ No rules.json: ${skipped.noRules.join(", ")}`)
  if (skipped.noAdmission.length)
    console.log(`  ⏭ No admission record: ${skipped.noAdmission.join(", ")}`)
  if (skipped.blocked.length)
    console.log(`  ⏭ Admission blocked: ${skipped.blocked.map((b) => b.dir).join(", ")}`)
  if (skipped.noRulesContent.length)
    console.log(`  ⏭ No rule text: ${skipped.noRulesContent.join(", ")}`)

  // Ingest eligible standards
  const results = []
  let globalChunkCount = 0
  let globalTokenCount = 0

  for (let idx = 0; idx < eligible.length; idx++) {
    const { dir, asset, rules, ruleCount } = eligible[idx]

    console.log()
    console.log(`── ${dir} ${"─".repeat(Math.max(1, 60 - dir.length))}`)

    const docId = `ifrs-kf-${dir}`
    const content = extractContent(asset, rules)
    const contentHash = computeContentHash(asset, rules)

    // Check existing chunks — skip if already ingested
    const existing = await pool.query(
      `SELECT COUNT(*) as cnt FROM "DocumentChunk" WHERE "documentId" = $1 AND "organizationId" = $2`,
      [docId, PLATFORM_ORG]
    )
    const existingCount = parseInt(existing.rows[0].cnt)
    if (existingCount > 0) {
      console.log(`  ⚠ ${existingCount} chunks already exist — skipping`)
      results.push({
        dir,
        status: "skipped",
        standardCode: asset.standardCode,
        versionLabel: asset.versionLabel,
        reason: "already ingested",
      })
      continue
    }

    // Chunk content
    const textChunks = chunkText(content)
    console.log(
      `  ✓ ${asset.standardCode} (${asset.versionLabel}) — ${ruleCount} rules, ${textChunks.length} chunks`
    )

    // Generate embeddings and store
    let storedCount = 0
    let tokenTotal = 0
    let failedChunks = 0

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]
      const tokens = Math.ceil(chunk.length / 4)
      tokenTotal += tokens

      try {
        const embedding = await generateEmbedding(chunk)
        await sleep(RATE_LIMIT_MS)

        const vectorStr = `[${embedding.join(",")}]`

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
            docId,
            i,
            chunk,
            tokens,
            JSON.stringify({
              sourceType: "ifrs-knowledge-foundation",
              standardCode: asset.standardCode,
              standardVersion: asset.versionLabel,
              sourceUrl: asset.sourceUrl,
              jurisdiction: asset.jurisdiction,
              effectiveDate: asset.effectiveDate,
              assetId: asset.assetId,
              contentHash,
              productKey: "ifrs_knowledge",
              sensitivity: "internal",
            }),
            vectorStr,
            JSON.stringify(embedding),
            "ifrs-bridge-batch",
          ]
        )

        storedCount++
        process.stdout.write(`  ✓ Chunk ${i + 1}/${textChunks.length} stored (${tokens} tokens)\n`)
      } catch (err) {
        failedChunks++
        console.error(`  ✗ Chunk ${i + 1} failed: ${err.message}`)
        // Continue with remaining chunks
      }
    }

    console.log(`  ✓ Done: ${storedCount}/${textChunks.length} chunks`)

    results.push({
      dir,
      status: failedChunks === 0 ? "completed" : "partial",
      standardCode: asset.standardCode,
      versionLabel: asset.versionLabel,
      ruleCount,
      chunkCount: storedCount,
      tokenCount: tokenTotal,
      failedChunks,
      contentHash,
    })

    globalChunkCount += storedCount
    globalTokenCount += tokenTotal

    // Batch delay after every BATCH_SIZE standards
    if ((idx + 1) % BATCH_SIZE === 0 && idx + 1 < eligible.length) {
      console.log(`\n  ⏳ Batch delay (${BATCH_DELAY_MS}ms) after ${idx + 1} standards...\n`)
      await sleep(BATCH_DELAY_MS)
    }
  }

  // Summary
  const completed = results.filter((r) => r.status === "completed")
  const partial = results.filter((r) => r.status === "partial")
  const failed = results.filter((r) => r.status === "failed")
  const skippedAlready = results.filter((r) => r.status === "skipped")

  console.log()
  console.log("═".repeat(70))
  console.log("  BATCH INGESTION SUMMARY")
  console.log("═".repeat(70))
  console.log(`  ✓ Successful: ${completed.length}/${eligible.length}`)
  if (partial.length > 0)
    console.log(`  ⚠ Partial: ${partial.length}/${eligible.length} (${partial.reduce((s, r) => s + r.failedChunks, 0)} chunk failures)`)
  if (failed.length > 0)
    console.log(`  ✗ Failed: ${failed.length}/${eligible.length}`)
  if (skippedAlready.length > 0)
    console.log(`  ⏭ Skipped (already ingested): ${skippedAlready.length}`)
  console.log(`  Total chunks: ${globalChunkCount}`)
  console.log(`  Total tokens: ~${globalTokenCount}`)

  if (completed.length > 0) {
    console.log()
    console.log("  Ingested standards:")
    for (const r of completed) {
      console.log(`    ✓ ${r.standardCode} (${r.versionLabel}): ${r.chunkCount} chunks, ~${r.tokenCount} tokens`)
    }
  }

  if (partial.length > 0) {
    console.log()
    console.log("  Partial standards:")
    for (const r of partial) {
      console.log(
        `    ⚠ ${r.standardCode} (${r.versionLabel}): ${r.chunkCount}/${r.chunkCount + r.failedChunks} chunks`
      )
    }
  }

  if (failed.length > 0) {
    console.log()
    console.log("  Failed standards:")
    for (const r of failed) {
      console.log(`    ✗ ${r.dir}: ${r.error}`)
    }
  }

  await pool.end()

  console.log()
  console.log("═".repeat(70))
  console.log("  NEXT: Test retrieval with hybrid search")
  console.log("═".repeat(70))
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
