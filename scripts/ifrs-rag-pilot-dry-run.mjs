#!/usr/bin/env node
/**
 * IFRS RAG Pilot — Dry Run Validation
 *
 * Validates that the 3 pilot assets pass admission gates, extract content,
 * and produce correct metadata. Does NOT call OpenAI (no key required).
 *
 * Run: node scripts/ifrs-rag-pilot-dry-run.mjs
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

// ─── Admission Evaluation (mirrors ifrs-bridge.ts) ──────────────────────────

function evaluateAdmission(asset, rules, admission) {
  const reasons = []
  let status = "NOT_ADMITTED"

  if (!admission) {
    reasons.push("No admission record found")
    return { status, reasons }
  }
  if (admission.currentStage !== "productionAdmission") {
    reasons.push(`Stage is "${admission.currentStage}"`)
    return { status, reasons }
  }
  status = "ADMITTED"

  const approval = admission.stageResults?.reviewerApproval
  if (approval?.status !== "approved") {
    reasons.push(`Reviewer approval: "${approval?.status ?? "missing"}"`)
    return { status: "NOT_ADMITTED", reasons }
  }

  const blocked = admission.blockedTechnologies ?? []
  if (blocked.includes("RAG")) {
    reasons.push("blockedTechnologies includes RAG")
    return { status: "RAG_BLOCKED", reasons }
  }

  const emb = asset.licensing?.embedding
  if (emb && emb !== "permitted") {
    reasons.push(`Embedding licensing: "${emb}"`)
    return { status: "RAG_BLOCKED", reasons }
  }

  if (!asset.standardCode) { reasons.push("Missing standardCode"); return { status: "NOT_ADMITTED", reasons } }
  if (!asset.versionLabel) { reasons.push("Missing versionLabel"); return { status: "NOT_ADMITTED", reasons } }

  if (!rules?.rules?.length) { reasons.push("No rules"); return { status: "NOT_ADMITTED", reasons } }
  const withText = rules.rules.filter(r => r.ruleText?.trim())
  if (withText.length === 0) { reasons.push("All rules empty"); return { status: "NOT_ADMITTED", reasons } }

  return { status: "RAG_ELIGIBLE", reasons: ["All gates passed"], ruleCount: withText.length }
}

// ─── Content Extraction (mirrors ifrs-bridge.ts) ────────────────────────────

function extractContent(asset, rules) {
  const ruleTexts = rules.rules
    .filter(r => r.ruleText?.trim())
    .map(r => {
      const para = r.paragraphReference ?? ""
      const topic = r.topic ? ` | ${r.topic}` : ""
      return `[${asset.standardCode} | ${asset.versionLabel} | ${para}${topic}]\n${r.ruleText.trim()}`
    })
  return ruleTexts.join("\n\n")
}

function computeContentHash(asset, rules) {
  const parts = [asset.assetId, asset.standardCode, asset.versionLabel, ...rules.rules.map(r => `${r.ruleId}:${r.ruleText}`)]
  return createHash("sha256").update(parts.join("||")).digest("hex").slice(0, 64)
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(70))
  console.log("  IFRS RAG PILOT — DRY RUN VALIDATION")
  console.log("═".repeat(70))
  console.log()

  // Check DB connectivity
  const url = process.env.DATABASE_URL
  let existingChunks = {}
  if (url) {
    try {
      const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 5000 })
      const client = await pool.connect()
      for (const dir of PILOT_DIRS) {
        const docId = `ifrs-kf-${dir}`
        const res = await client.query(
          `SELECT COUNT(*) as cnt FROM "DocumentChunk" WHERE "documentId" = $1 AND "organizationId" = $2`,
          [docId, PLATFORM_ORG]
        )
        existingChunks[dir] = parseInt(res.rows[0].cnt)
      }
      client.release()
      await pool.end()
      console.log("✓ Database connected — existing chunks checked")
    } catch (err) {
      console.log(`✗ Database error: ${err.message}`)
    }
  } else {
    console.log("⚠ No DATABASE_URL — skipping chunk check")
  }
  console.log()

  const results = []

  for (const dir of PILOT_DIRS) {
    console.log(`── ${dir.toUpperCase()} ${"─".repeat(60 - dir.length)}`)

    const rawAsset = await readJson(join(ROOT, dir, "asset.json"))
    const asset = unwrapAsset(rawAsset)
    const rules = await readJson(join(ROOT, dir, "rules.json"))
    const admission = await readJson(join(ROOT, dir, "admission-record.json"))

    if (!asset) { console.log("  ✗ asset.json not found\n"); continue }
    if (!rules) { console.log("  ✗ rules.json not found\n"); continue }

    const admResult = evaluateAdmission(asset, rules, admission)
    const icon = admResult.status === "RAG_ELIGIBLE" ? "✓" : "✗"
    console.log(`  ${icon} Admission: ${admResult.status}`)
    if (admResult.reasons.length) console.log(`    Reasons: ${admResult.reasons.join("; ")}`)

    if (admResult.status === "RAG_ELIGIBLE") {
      const content = extractContent(asset, rules)
      const hash = computeContentHash(asset, rules)
      const docId = `ifrs-kf-${dir}`
      const chunks = existingChunks[dir] ?? "unknown"

      console.log(`  ✓ Standard: ${asset.standardCode} (${asset.versionLabel})`)
      console.log(`  ✓ Rules: ${admResult.ruleCount}`)
      console.log(`  ✓ Content length: ${content.length} chars`)
      console.log(`  ✓ Content hash: ${hash}`)
      console.log(`  ✓ DocumentId: ${docId}`)
      console.log(`  ✓ Existing chunks: ${chunks}`)
      console.log(`  ✓ Source URL: ${asset.sourceUrl ?? "none"}`)
      console.log(`  ✓ Jurisdiction: ${asset.jurisdiction ?? "none"}`)

      // Show first 200 chars of content
      console.log(`  ✓ Content preview:`)
      console.log(`    ${content.slice(0, 200).replace(/\n/g, "\n    ")}`)

      results.push({ dir, status: "ELIGIBLE", ruleCount: admResult.ruleCount, contentLength: content.length, hash, existingChunks: chunks })
    } else {
      results.push({ dir, status: admResult.status, reasons: admResult.reasons })
    }
    console.log()
  }

  // Summary
  console.log("═".repeat(70))
  console.log("  SUMMARY")
  console.log("═".repeat(70))
  const eligible = results.filter(r => r.status === "ELIGIBLE")
  const blocked = results.filter(r => r.status !== "ELIGIBLE")
  console.log(`  Eligible: ${eligible.length}/${results.length}`)
  if (eligible.length > 0) {
    console.log(`  Total rules to ingest: ${eligible.reduce((s, r) => s + r.ruleCount, 0)}`)
    console.log(`  Total content: ${eligible.reduce((s, r) => s + r.contentLength, 0)} chars`)
    const alreadyIngested = eligible.filter(r => r.existingChunks > 0)
    if (alreadyIngested.length > 0) {
      console.log(`  Already in DB: ${alreadyIngested.map(r => r.dir).join(", ")}`)
    }
  }
  if (blocked.length > 0) {
    console.log(`  Blocked: ${blocked.map(r => `${r.dir} (${r.reasons?.join("; ")})`).join(", ")}`)
  }
  console.log()

  if (eligible.length > 0 && !process.env.OPENAI_API_KEY) {
    console.log("⚠ OPENAI_API_KEY not set — cannot generate embeddings")
    console.log("  Set it and run: node scripts/ifrs-rag-pilot-ingest.mjs")
  }

  console.log()
  console.log("═".repeat(70))
}

main().catch(err => { console.error("FATAL:", err); process.exit(1) })
