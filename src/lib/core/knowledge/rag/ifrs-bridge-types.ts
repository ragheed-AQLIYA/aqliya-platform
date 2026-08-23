/**
 * IFRS Bridge Types — canonical contract for Knowledge Foundation → RAG ingestion.
 *
 * These types define the bridge contract without introducing new Prisma models.
 * All metadata is stored in the existing DocumentChunk.metadata JSON field.
 */

// ─── Knowledge Foundation Asset ──────────────────────────────────────────────

/** Minimal shape of asset.json for bridge consumption. */
export interface IfrsAssetMeta {
  assetId: string
  standardCode: string
  standardName?: string
  versionLabel: string
  effectiveDate?: string
  sourceUrl?: string
  sourceOwner?: string
  jurisdiction?: string
  ragIngest: boolean
  vectorIndex: boolean
  validationStatus?: string
  reviewStatus?: string
  admissionWorkflowStage?: string
  licensing?: {
    embedding?: string
    redistribution?: string
    [key: string]: unknown
  }
}

/** Minimal shape of a rule in rules.json. */
export interface IfrsRule {
  ruleId: string
  paragraphReference: string
  ruleText: string
  topic?: string
  confidenceScore?: number
  validationStatus?: string
}

/** Minimal shape of rules.json for bridge consumption. */
export interface IfrsRulesAsset {
  meta: {
    assetId: string
    parentAssetId?: string
    standardCode: string
    versionLabel: string
    ruleCount?: number
    [key: string]: unknown
  }
  rules: IfrsRule[]
}

/** Minimal shape of admission-record.json for bridge consumption. */
export interface IfrsAdmissionRecord {
  catalogId: string
  standardCode: string
  currentStage: string
  blockedTechnologies?: string[]
  stageResults?: {
    licensingCheck?: {
      embeddingPermitted?: boolean
      note?: string
    }
    reviewerApproval?: {
      status?: string
    }
  }
}

// ─── Admission Evaluation ────────────────────────────────────────────────────

/** Admission status for RAG evaluation. */
export type IfrsAdmissionStatus =
  | "NOT_ADMITTED"
  | "ADMITTED"
  | "RAG_ELIGIBLE"
  | "RAG_BLOCKED"

/** Result of admission evaluation for a single asset. */
export interface IfrsAdmissionResult {
  assetId: string
  standardCode: string
  status: IfrsAdmissionStatus
  reasons: string[]
}

// ─── Content Extraction ──────────────────────────────────────────────────────

/** Extracted content ready for RAG ingestion. */
export interface IfrsExtractedContent {
  assetId: string
  standardCode: string
  standardVersion: string
  sourceUrl?: string
  jurisdiction?: string
  effectiveDate?: string
  /** Combined text: asset header + all rule texts. */
  content: string
  /** Total number of rules used to build content. */
  ruleCount: number
}

// ─── Ingestion Metadata ─────────────────────────────────────────────────────

/**
 * Enriched metadata attached to each DocumentChunk.
 * Stored in DocumentChunk.metadata JSON field — no schema migration required.
 */
export interface IfrsChunkMetadata {
  /** Knowledge foundation source type. */
  sourceType: "ifrs-knowledge-foundation"
  /** Standard code, e.g. "IAS 2". */
  standardCode: string
  /** Standard version, e.g. "IAS 2:2024". */
  standardVersion: string
  /** Source URL for the authoritative standard. */
  sourceUrl?: string
  /** Jurisdiction, e.g. "global". */
  jurisdiction?: string
  /** Effective date of the standard. */
  effectiveDate?: string
  /** Knowledge foundation asset ID. */
  assetId: string
  /** Content hash for deduplication. */
  contentHash?: string
}

// ─── Ingestion Result ────────────────────────────────────────────────────────

/** Result of ingesting a single IFRS standard. */
export interface IfrsIngestResult {
  assetId: string
  standardCode: string
  documentId: string
  organizationId: string
  chunkCount: number
  tokenCount: number
  status: "completed" | "skipped" | "admission_blocked" | "error"
  error?: string
}

/** Result of batch ingestion. */
export interface IfrsBatchIngestResult {
  totalAssets: number
  ingested: number
  skipped: number
  blocked: number
  failed: number
  results: IfrsIngestResult[]
}
