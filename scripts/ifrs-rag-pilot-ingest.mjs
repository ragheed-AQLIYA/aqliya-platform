#!/usr/bin/env node
/**
 * IFRS RAG Pilot — Live Ingestion
 *
 * Ingests the 3 pilot assets (IAS 2, IFRS 17, IAS 1) into the RAG pipeline.
 * Requires: OPENAI_API_KEY, DATABASE_URL, pgvector extension.
 *
 * Run: node scripts/ifrs-rag-pilot-ingest.mjs
 * Dry run: node scripts/ifrs-rag-pilot-dry-run.mjs
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import "dotenv/config"

const require = createRequire(import.meta.url)
const pg = require("pg")

const ROOT = join(process.cwd(), "knowledge-foundation", "domains", "ifrs")
const PILOT_DIRS = ["ias-2", "ifrs-17", "ias-1"]
const PLATFORM_ORG = "platform"
const EMBEDDING_MODEL = "text-embedding-3-small"
const EMBEDDING_DIMS = 1536

// ─── File Loading ────────────────────────────────────────────────────────────

async function readJson(filePath) {
  try {
    const raw = await readFile(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Unwrap asset.json: actual JSON has { meta: { standardCode, ... }, licensing: { ... } } */
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
  if (admission.currentStage !== "productionAdmission") return { ok: false, reasons: [`Stage: ${admission.currentStage}`] }
  const approval = admission.stageResults?.reviewerApproval
  if (approval?.status !== "approved") return { ok: false, reasons: [`Approval: ${approval?.status ?? "missing"}`] }
  if ((admission.blockedTechnologies ?? []).includes("RAG")) return { ok: false, reasons: ["RAG blocked"] }
  const emb = asset.licensing?.embedding
  if (emb && emb !== "permitted") return { ok: false, reasons: [`Embedding: ${emb}`] }
  if (!asset.standardCode) return { ok: false, reasons: ["Missing standardCode"] }
  if (!asset.versionLabel) return { ok: false, reasons: ["Missing versionLabel"] }
  if (!rules?.rules?.length) return { ok: false, reasons: ["No rules"] }
  const withText = rules.rules.filter(r => r.ruleText?.trim())
  if (withText.length === 0) return { ok: false, reasons: ["All rules empty"] }
  return { ok: true, ruleCount: withText.length }
}

// ─── Content Extraction ─────────────────────────────────────────────────────

function extractContent(asset, rules) {
  return rules.rules
    .filter(r => r.ruleText?.trim())
    .map(r => {
      const para = r.paragraphReference ?? ""
      const topic = r.topic ? ` | ${r.topic}` : ""
      return `[${asset.standardCode} | ${asset.versionLabel} | ${para}${topic}]\n${r.ruleText.trim()}`
    })
    .join("\n\n")
}

function computeContentHash(asset, rules) {
  const parts = [asset.assetId, asset.standardCode, asset.versionLabel, ...rules.rules.map(r => `${r.ruleId}:${r.ruleText}`)]
  return createHash("sha-256").update(parts.join("||")).digest("hex").slice(0, 64)
}

// ─── OpenAI Embedding ──────────────────────────────────────────────────────

async function generateEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY not set")

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
  console.log("  IFRS RAG PILOT — LIVE INGESTION")
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

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10_000 })
  const results = []

  for (const dir of PILOT_DIRS) {
    console.log()
    console.log(`── ${dir.toUpperCase()} ${"─".repeat(60 - dir.length)}`)

    const rawAsset = await readJson(join(ROOT, dir, "asset.json"))
    const asset = unwrapAsset(rawAsset)
    const rules = await readJson(join(ROOT, dir, "rules.json"))
    const admission = await readJson(join(ROOT, dir, "admission-record.json"))

    if (!asset) { console.log("  ✗ asset.json not found"); results.push({ dir, status: "error", error: "no asset.json" }); continue }
    if (!rules) { console.log("  ✗ rules.json not found"); results.push({ dir, status: "error", error: "no rules.json" }); continue }

    const admResult = evaluateAdmission(asset, rules, admission)
    if (!admResult.ok) {
      console.log(`  ✗ Admission blocked: ${admResult.reasons.join("; ")}`)
      results.push({ dir, status: "blocked", reasons: admResult.reasons })
      continue
    }

    const docId = `ifrs-kf-${dir}`
    const content = extractContent(asset, rules)
    const contentHash = computeContentHash(asset, rules)

    // Check existing chunks
    const existing = await pool.query(
      `SELECT COUNT(*) as cnt FROM "DocumentChunk" WHERE "documentId" = $1 AND "organizationId" = $2`,
      [docId, PLATFORM_ORG]
    )
    const existingCount = parseInt(existing.rows[0].cnt)
    if (existingCount > 0) {
      console.log(`  ⚠ ${existingCount} chunks already exist — deleting for re-ingestion`)
      await pool.query(
        `DELETE FROM "DocumentChunk" WHERE "documentId" = $1 AND "organizationId" = $2`,
        [docId, PLATFORM_ORG]
      )
    }

    // Chunk content
    const textChunks = chunkText(content)
    console.log(`  ✓ ${asset.standardCode} (${asset.versionLabel}) — ${admResult.ruleCount} rules, ${textChunks.length} chunks`)

    // Generate embeddings and store
    let storedCount = 0
    let tokenTotal = 0

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]
      const tokens = Math.ceil(chunk.length / 4) // rough estimate
      tokenTotal += tokens

      try {
        const embedding = await generateEmbedding(chunk)

        // Convert to pgvector format: "[0.1,0.2,...]"
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
            "ifrs-bridge-pilot",
          ]
        )

        storedCount++
        process.stdout.write(`  ✓ Chunk ${i + 1}/${textChunks.length} stored (${tokens} tokens)\n`)
      } catch (err) {
        console.error(`  ✗ Chunk ${i + 1} failed: ${err.message}`)
      }
    }

    console.log(`  ✓ Done: ${storedCount}/${textChunks.length} chunks, ~${tokenTotal} tokens`)

    results.push({
      dir,
      status: "completed",
      standardCode: asset.standardCode,
      versionLabel: asset.versionLabel,
      ruleCount: admResult.ruleCount,
      chunkCount: storedCount,
      tokenCount: tokenTotal,
      contentHash,
    })
  }

  // Summary
  console.log()
  console.log("═".repeat(70))
  console.log("  PILOT INGESTION SUMMARY")
  console.log("═".repeat(70))

  const completed = results.filter(r => r.status === "completed")
  const failed = results.filter(r => r.status !== "completed")

  for (const r of completed) {
    console.log(`  ✓ ${r.standardCode} (${r.versionLabel}): ${r.chunkCount} chunks, ~${r.tokenCount} tokens`)
  }
  for (const r of failed) {
    console.log(`  ✗ ${r.dir}: ${r.status} — ${r.error || r.reasons?.join("; ")}`)
  }

  console.log()
  console.log(`  Total: ${completed.length}/${results.length} ingested`)
  if (completed.length > 0) {
    console.log(`  Total chunks: ${completed.reduce((s, r) => s + r.chunkCount, 0)}`)
    console.log(`  Total tokens: ~${completed.reduce((s, r) => s + r.tokenCount, 0)}`)
  }

  await pool.end()

  console.log()
  console.log("═".repeat(70))
  console.log("  NEXT: Test retrieval with hybrid search")
  console.log("═".repeat(70))
}

main().catch(err => { console.error("FATAL:", err); process.exit(1) })
