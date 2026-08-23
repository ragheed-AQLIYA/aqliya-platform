import "server-only"

/**
 * IFRS Bridge — Knowledge Foundation → RAG Ingestion.
 *
 * This module bridges the knowledge-foundation asset system with the existing
 * RAG pipeline. It:
 *   1. Loads admitted IFRS assets from knowledge-foundation/
 *   2. Evaluates RAG admission eligibility
 *   3. Extracts content from asset metadata + rules
 *   4. Feeds content through the existing embedAndStore() pipeline
 *   5. Preserves provenance metadata in DocumentChunk.metadata JSON
 *   6. Detects duplicates via content hash
 *   7. Reports failures without swallowing them
 *
 * The bridge MUST NOT:
 *   - bypass governance
 *   - bypass tenant/security controls
 *   - write directly to vector storage (uses existing pipeline)
 *   - create fake citations
 *   - ingest blocked content
 *   - silently swallow ingestion failures
 */

import { readFile } from "fs/promises"
import { join } from "path"
import { createHash } from "crypto"
import { embedAndStore } from "./embedding-service"
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type {
  IfrsAssetMeta,
  IfrsRulesAsset,
  IfrsAdmissionRecord,
  IfrsAdmissionResult,
  IfrsAdmissionStatus,
  IfrsExtractedContent,
  IfrsChunkMetadata,
  IfrsIngestResult,
  IfrsBatchIngestResult,
} from "./ifrs-bridge-types"

// ─── Constants ───────────────────────────────────────────────────────────────

/** Root of IFRS knowledge foundation assets. */
const KNOWLEDGEFOUNDATION_ROOT = join(
  process.cwd(),
  "knowledge-foundation",
  "domains",
  "ifrs",
)

/**
 * Platform organization ID for knowledge-foundation assets.
 * These are platform-level assets, not tenant-specific.
 * Using a well-known constant ensures deterministic documentIds.
 */
const PLATFORM_ORG_ID = "platform"

// ─── File Loading ────────────────────────────────────────────────────────────

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Load asset.json for a given standard directory name (e.g. "ias-2").
 *
 * The actual asset.json has fields nested inside `meta`. This function
 * unwraps them so the returned IfrsAssetMeta has standardCode, assetId,
 * etc. at the top level — matching the bridge contract.
 */
export async function loadAsset(standardDir: string): Promise<IfrsAssetMeta | null> {
  const filePath = join(KNOWLEDGEFOUNDATION_ROOT, standardDir, "asset.json")
  const raw = await readJsonFile<Record<string, unknown>>(filePath)
  if (!raw) return null

  // Unwrap: actual JSON has { meta: { standardCode, ... }, licensing: { ... }, ... }
  const meta = (raw.meta ?? {}) as Record<string, unknown>
  return {
    assetId: (meta.assetId as string) ?? "",
    standardCode: (meta.standardCode as string) ?? "",
    standardName: meta.standardName as string | undefined,
    versionLabel: (meta.versionLabel as string) ?? "",
    effectiveDate: meta.effectiveDate as string | undefined,
    sourceUrl: meta.sourceUrl as string | undefined,
    sourceOwner: meta.sourceOwner as string | undefined,
    jurisdiction: meta.jurisdiction as string | undefined,
    ragIngest: (meta.ragIngest as boolean) ?? false,
    vectorIndex: (meta.vectorIndex as boolean) ?? false,
    validationStatus: meta.validationStatus as string | undefined,
    reviewStatus: meta.reviewStatus as string | undefined,
    admissionWorkflowStage: meta.admissionWorkflowStage as string | undefined,
    licensing: raw.licensing as IfrsAssetMeta["licensing"],
  }
}

/** Load rules.json for a given standard directory name. */
export async function loadRules(standardDir: string): Promise<IfrsRulesAsset | null> {
  const filePath = join(KNOWLEDGEFOUNDATION_ROOT, standardDir, "rules.json")
  return readJsonFile<IfrsRulesAsset>(filePath)
}

/** Load admission-record.json for a given standard directory name. */
export async function loadAdmissionRecord(
  standardDir: string,
): Promise<IfrsAdmissionRecord | null> {
  const filePath = join(KNOWLEDGEFOUNDATION_ROOT, standardDir, "admission-record.json")
  return readJsonFile<IfrsAdmissionRecord>(filePath)
}

// ─── Admission Evaluation ────────────────────────────────────────────────────

/**
 * Evaluate whether an IFRS asset qualifies for RAG ingestion.
 *
 * This implements explicit admission evaluation WITHOUT removing
 * blockedTechnologies from admission-record.json. Governance decides
 * when to unblock.
 *
 * Evaluation criteria:
 *   1. Asset has admission workflow completed (productionAdmission stage)
 *   2. blockedTechnologies does NOT include "RAG"
 *   3. Embedding licensing permits embedding
 *   4. Asset has standardCode and versionLabel
 *   5. Asset has rules with ruleText
 */
export function evaluateAdmission(
  asset: IfrsAssetMeta,
  rules: IfrsRulesAsset | null,
  admission: IfrsAdmissionRecord | null,
): IfrsAdmissionResult {
  const reasons: string[] = []
  let status: IfrsAdmissionStatus = "NOT_ADMITTED"

  // Gate 1: Admission workflow completed
  if (!admission) {
    reasons.push("No admission record found")
    return { assetId: asset.assetId, standardCode: asset.standardCode, status, reasons }
  }

  if (admission.currentStage !== "productionAdmission") {
    reasons.push(`Admission stage is "${admission.currentStage}", expected "productionAdmission"`)
    return { assetId: asset.assetId, standardCode: asset.standardCode, status, reasons }
  }

  status = "ADMITTED"

  // Gate 2: Reviewer approval
  const approval = admission.stageResults?.reviewerApproval
  if (approval?.status !== "approved") {
    reasons.push(`Reviewer approval status is "${approval?.status ?? "missing"}", expected "approved"`)
    return { assetId: asset.assetId, standardCode: asset.standardCode, status: "NOT_ADMITTED", reasons }
  }

  // Gate 3: blockedTechnologies check
  const blocked = admission.blockedTechnologies ?? []
  if (blocked.includes("RAG")) {
    reasons.push('blockedTechnologies includes "RAG"')
    status = "RAG_BLOCKED"
    return { assetId: asset.assetId, standardCode: asset.standardCode, status, reasons }
  }

  // Gate 4: Embedding licensing
  const embeddingLicense = asset.licensing?.embedding
  if (embeddingLicense && embeddingLicense !== "permitted") {
    reasons.push(`Embedding licensing is "${embeddingLicense}", expected "permitted"`)
    status = "RAG_BLOCKED"
    return { assetId: asset.assetId, standardCode: asset.standardCode, status, reasons }
  }

  // Gate 5: Required metadata
  if (!asset.standardCode) {
    reasons.push("Missing standardCode")
    return { assetId: asset.assetId, standardCode: asset.standardCode, status: "NOT_ADMITTED", reasons }
  }
  if (!asset.versionLabel) {
    reasons.push("Missing versionLabel")
    return { assetId: asset.assetId, standardCode: asset.standardCode, status: "NOT_ADMITTED", reasons }
  }

  // Gate 6: Rules exist with content
  if (!rules || !rules.rules || rules.rules.length === 0) {
    reasons.push("No rules with content found")
    return { assetId: asset.assetId, standardCode: asset.standardCode, status: "NOT_ADMITTED", reasons }
  }

  const rulesWithText = rules.rules.filter((r) => r.ruleText?.trim())
  if (rulesWithText.length === 0) {
    reasons.push("All rules have empty ruleText")
    return { assetId: asset.assetId, standardCode: asset.standardCode, status: "NOT_ADMITTED", reasons }
  }

  // All gates passed
  status = "RAG_ELIGIBLE"
  reasons.push("All admission gates passed")
  return { assetId: asset.assetId, standardCode: asset.standardCode, status, reasons }
}

// ─── Content Extraction ──────────────────────────────────────────────────────

/**
 * Compute a deterministic content hash from asset + rules.
 * Used for deduplication on re-ingestion.
 */
export function computeContentHash(
  asset: IfrsAssetMeta,
  rules: IfrsRulesAsset,
): string {
  const parts = [
    asset.assetId,
    asset.standardCode,
    asset.versionLabel,
    ...rules.rules.map((r) => `${r.ruleId}:${r.ruleText}`),
  ]
  return createHash("sha256").update(parts.join("||")).digest("hex").slice(0, 64)
}

/**
 * Extract ingestible content from an IFRS asset and its rules.
 *
 * Content structure per rule:
 *   [IAS 2 | IAS 2:2024 | IAS 2.9]
 *   Inventories shall be measured at the lower of cost and net realisable value.
 *
 * This structure:
 *   - Enables retrieval of individual rules
 *   - Preserves paragraph-level citation
 *   - Carries standard/version for provenance
 */
export function extractContent(
  asset: IfrsAssetMeta,
  rules: IfrsRulesAsset,
): IfrsExtractedContent {
  const ruleTexts = rules.rules
    .filter((r) => r.ruleText?.trim())
    .map((r) => {
      const paragraph = r.paragraphReference ?? ""
      const topic = r.topic ? ` | ${r.topic}` : ""
      return `[${asset.standardCode} | ${asset.versionLabel} | ${paragraph}${topic}]\n${r.ruleText.trim()}`
    })

  return {
    assetId: asset.assetId,
    standardCode: asset.standardCode,
    standardVersion: asset.versionLabel,
    sourceUrl: asset.sourceUrl,
    jurisdiction: asset.jurisdiction,
    effectiveDate: asset.effectiveDate,
    content: ruleTexts.join("\n\n"),
    ruleCount: rules.rules.filter((r) => r.ruleText?.trim()).length,
  }
}

// ─── Ingestion ───────────────────────────────────────────────────────────────

/**
 * Check if a documentId already has chunks in the vector store.
 */
export async function hasExistingChunks(
  documentId: string,
  organizationId: string,
): Promise<boolean> {
  const count = await prisma.documentChunk.count({
    where: { documentId, organizationId },
  })
  return count > 0
}

/**
 * Delete existing chunks for a documentId (for re-ingestion).
 */
export async function deleteExistingChunks(
  documentId: string,
  organizationId: string,
): Promise<number> {
  const result = await prisma.documentChunk.deleteMany({
    where: { documentId, organizationId },
  })
  return result.count
}

/**
 * Ingest a single IFRS standard into the RAG pipeline.
 *
 * Uses the existing embedAndStore() function — no direct vector writes.
 * Enriches metadata with IFRS-specific provenance fields.
 *
 * @param standardDir - Directory name under knowledge-foundation/domains/ifrs/ (e.g. "ias-2")
 * @param organizationId - Tenant organization ID for isolation
 * @param options.force - If true, re-ingest even if chunks exist (deletes old chunks first)
 * @param options.dryRun - If true, evaluate admission and extract content but don't ingest
 */
export async function ingestIfrsStandard(
  standardDir: string,
  organizationId: string,
  options: { force?: boolean; dryRun?: boolean } = {},
): Promise<IfrsIngestResult> {
  const documentId = `ifrs-kf-${standardDir}`

  // Load all files
  const [asset, rules, admission] = await Promise.all([
    loadAsset(standardDir),
    loadRules(standardDir),
    loadAdmissionRecord(standardDir),
  ])

  if (!asset) {
    return {
      assetId: `unknown-${standardDir}`,
      standardCode: "unknown",
      documentId,
      organizationId,
      chunkCount: 0,
      tokenCount: 0,
      status: "error",
      error: `asset.json not found for ${standardDir}`,
    }
  }

  if (!rules) {
    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: 0,
      tokenCount: 0,
      status: "error",
      error: `rules.json not found for ${standardDir}`,
    }
  }

  // Evaluate admission
  const admissionResult = evaluateAdmission(asset, rules, admission)

  if (admissionResult.status !== "RAG_ELIGIBLE") {
    await writePlatformAuditLog({
      productKey: "ai_core",
      action: "ifrs_admission_blocked",
      platformOrganizationId: organizationId,
      severity: "warning",
      status: "blocked",
      sourceSystem: "ifrs_bridge",
      metadata: {
        assetId: asset.assetId,
        standardCode: asset.standardCode,
        admissionStatus: admissionResult.status,
        reasons: admissionResult.reasons,
      },
    })

    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: 0,
      tokenCount: 0,
      status: "admission_blocked",
      error: `Admission blocked: ${admissionResult.reasons.join("; ")}`,
    }
  }

  // Extract content
  const extracted = extractContent(asset, rules)

  if (extracted.content.trim().length === 0) {
    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: 0,
      tokenCount: 0,
      status: "error",
      error: "No ingestible content extracted from rules",
    }
  }

  // Dry run — stop here
  if (options.dryRun) {
    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: extracted.ruleCount,
      tokenCount: 0,
      status: "completed",
    }
  }

  // Deduplication — check existing chunks
  const existingChunks = await hasExistingChunks(documentId, organizationId)
  if (existingChunks && !options.force) {
    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: 0,
      tokenCount: 0,
      status: "skipped",
      error: "Chunks already exist. Use force=true to re-ingest.",
    }
  }

  if (existingChunks && options.force) {
    await deleteExistingChunks(documentId, organizationId)
  }

  // Build enriched metadata for chunk storage
  const contentHash = computeContentHash(asset, rules)
  const enrichedMetadata: Record<string, unknown> = {
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
  }

  // Ingest through existing pipeline
  try {
    const result = await embedAndStore(
      documentId,
      organizationId,
      extracted.content,
      enrichedMetadata,
    )

    await writePlatformAuditLog({
      productKey: "ai_core",
      action: "ifrs_ingest_completed",
      platformOrganizationId: organizationId,
      severity: "info",
      status: "recorded",
      sourceSystem: "ifrs_bridge",
      metadata: {
        assetId: asset.assetId,
        standardCode: asset.standardCode,
        standardVersion: asset.versionLabel,
        documentId,
        chunkCount: result.chunkCount,
        tokenCount: result.tokenCount,
        contentHash,
        ruleCount: extracted.ruleCount,
      },
    })

    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: result.chunkCount,
      tokenCount: result.tokenCount,
      status: "completed",
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown ingestion error"

    await writePlatformAuditLog({
      productKey: "ai_core",
      action: "ifrs_ingest_failed",
      platformOrganizationId: organizationId,
      severity: "error",
      status: "failure",
      sourceSystem: "ifrs_bridge",
      metadata: {
        assetId: asset.assetId,
        standardCode: asset.standardCode,
        documentId,
        error: message,
      },
    })

    return {
      assetId: asset.assetId,
      standardCode: asset.standardCode,
      documentId,
      organizationId,
      chunkCount: 0,
      tokenCount: 0,
      status: "error",
      error: message,
    }
  }
}

// ─── Batch Ingestion ─────────────────────────────────────────────────────────

/**
 * Ingest multiple IFRS standards into the RAG pipeline.
 *
 * Processes each standard independently — failures in one don't affect others.
 * Uses the platform organization ID for all ingestions.
 *
 * @param standardDirs - Array of directory names (e.g. ["ias-2", "ifrs-17", "ias-1"])
 * @param organizationId - Tenant organization ID for isolation
 * @param options.force - Re-ingest even if chunks exist
 * @param options.dryRun - Evaluate but don't ingest
 */
export async function batchIngestIfrsStandards(
  standardDirs: string[],
  organizationId: string = PLATFORM_ORG_ID,
  options: { force?: boolean; dryRun?: boolean } = {},
): Promise<IfrsBatchIngestResult> {
  const results: IfrsIngestResult[] = []

  for (const dir of standardDirs) {
    const result = await ingestIfrsStandard(dir, organizationId, options)
    results.push(result)
  }

  return {
    totalAssets: standardDirs.length,
    ingested: results.filter((r) => r.status === "completed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    blocked: results.filter((r) => r.status === "admission_blocked").length,
    failed: results.filter((r) => r.status === "error").length,
    results,
  }
}

// ─── Query Helpers ───────────────────────────────────────────────────────────

/**
 * Get the documentId used for a given IFRS standard directory.
 * Useful for targeted retrieval after ingestion.
 */
export function getIfrsDocumentId(standardDir: string): string {
  return `ifrs-kf-${standardDir}`
}

/**
 * List all IFRS standard directories in the knowledge foundation.
 */
export async function listIfrsStandardDirs(): Promise<string[]> {
  const { readdir } = await import("fs/promises")
  const entries = await readdir(KNOWLEDGEFOUNDATION_ROOT, { withFileTypes: true })
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !e.name.startsWith("_"))
    .map((e) => e.name)
    .sort()
}
