// ─── LocalContentOS — LCGPA Regulatory Intelligence Engine :: Types ───
//
// PURPOSE: Type foundation for continuous regulatory intelligence.
//
// The engine answers, continuously and auditably:
//   What changed? When? What official evidence proves it?
//   When does it become effective? What is affected?
//   Who approved it? Which regulatory version produced each calculation?
//
// DESIGN CONTRACT:
//   - Every type here is serialisable and deterministic.
//   - No module in this package performs I/O directly. All external access is
//     injected through ports (see `RegulatoryFetcher`, `Clock`).
//   - Nothing in this package may mutate authoritative regulatory state without
//     passing the governance gate (see `governance.ts`).

// ─── Engine Versioning ───

/**
 * Schema version of the regulatory intelligence data model.
 * Bump on any breaking change to normalized structures.
 */
export const REGULATORY_SCHEMA_VERSION = "1.0.0" as const;

/**
 * Version of the normalization/parsing contract.
 * Reproducibility requires (artifactSha256 + parserVersion + schemaVersion + ruleVersion).
 */
export const REGULATORY_PARSER_VERSION = "lcgpa-mandatory-list@1.0.0" as const;

// ─── Source Authority Tiers (§4) ───

/**
 * Authority tier of a monitored source.
 *
 * TIER 1 — LCGPA itself. The ONLY tier permitted to update authoritative state.
 * TIER 2 — Other official Saudi government sources. Corroboration + announcements.
 * TIER 3 — Supporting official sources referencing LCGPA requirements. Corroboration.
 * TIER 4 — Third-party (commercial, press, aggregators). DISCOVERY / CROSS-CHECK ONLY.
 */
export const AuthorityTier = {
  REGULATORY_AUTHORITY: 1,
  OFFICIAL_GOVERNMENT: 2,
  SUPPORTING_OFFICIAL: 3,
  THIRD_PARTY: 4,
} as const;
export type AuthorityTier = (typeof AuthorityTier)[keyof typeof AuthorityTier];

export const AUTHORITY_TIER_LABELS: Record<AuthorityTier, string> = {
  1: "TIER_1_REGULATORY_AUTHORITY",
  2: "TIER_2_OFFICIAL_GOVERNMENT",
  3: "TIER_3_SUPPORTING_OFFICIAL",
  4: "TIER_4_THIRD_PARTY",
};

// ─── Source Registry (§5) ───

export const SOURCE_TYPES = [
  "WEB_PAGE",
  "DOCUMENT",
  "XLSX",
  "CSV",
  "PDF",
  "API",
  "JSON",
  "ANNOUNCEMENT",
  "CIRCULAR",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const MONITORING_METHODS = [
  "HTTP_FETCH",
  "DOCUMENT_DISCOVERY",
  "API_POLL",
  "FILE_FINGERPRINT",
  "CONTENT_HASH",
] as const;
export type MonitoringMethod = (typeof MONITORING_METHODS)[number];

export const CHECK_FREQUENCIES = ["HOURLY", "DAILY", "WEEKLY", "ON_DEMAND"] as const;
export type CheckFrequency = (typeof CHECK_FREQUENCIES)[number];

export const SOURCE_STATUSES = [
  /** Registered but the canonical artifact behind it has never been confirmed by an operator. */
  "UNVERIFIED",
  /** Confirmed reachable and fingerprinted at least once. */
  "HEALTHY",
  /** Last check failed but the source is not yet considered down. */
  "DEGRADED",
  /** Consecutive failures exceeded the source's tolerance. */
  "UNAVAILABLE",
  /** Content changed in a way that failed integrity validation. */
  "QUARANTINED",
  /** Operator disabled the source. */
  "DISABLED",
] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

/**
 * A monitored regulatory source.
 *
 * INVARIANT: `authorityTier === 1` is required for a source whose artifacts may
 * update authoritative regulatory state. Enforced by `assertCanUpdateAuthority`.
 */
export interface RegulatorySource {
  /** Stable slug identity, e.g. "lcgpa-mandatory-list-documents". */
  id: string;
  /** Issuing authority name, e.g. "LCGPA". */
  authority: string;
  /** Human-readable source name. */
  name: string;
  /** What this source is and why it is monitored. */
  description: string;
  /** Canonical URL that is polled. */
  url: string;
  /** Expected artifact/content type. */
  sourceType: SourceType;
  /** Authority tier — governs whether this source may mutate authoritative state. */
  authorityTier: AuthorityTier;
  /** How the source is checked. */
  monitoringMethod: MonitoringMethod;
  /** Configured check cadence. */
  checkFrequency: CheckFrequency;
  /** Whether the scheduler should include this source. */
  enabled: boolean;
  /** Last check attempt (success or failure). */
  lastCheckedAt: Date | null;
  /** Last check that produced a usable response. */
  lastSuccessfulCheckAt: Date | null;
  /** Last check that failed. */
  lastFailedAt: Date | null;
  /** SHA-256 of the last artifact observed at this source. */
  lastArtifactHash: string | null;
  /** Last version identifier observed/derived for this source. */
  lastKnownVersion: string | null;
  /** Consecutive failure counter, reset on success. */
  consecutiveFailures: number;
  /** Current status. */
  status: SourceStatus;
  /**
   * Operator verification record. A TIER 1 source may not acquire authoritative
   * artifacts until an authenticated operator has confirmed the canonical URL.
   */
  verification: SourceVerification | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Operator confirmation that a registered URL is the true canonical artifact location. */
export interface SourceVerification {
  /** Authenticated user who confirmed the canonical URL. */
  verifiedById: string;
  verifiedAt: Date;
  /** Evidence the operator relied on (screenshot ref, document ref, ticket, etc.). */
  evidence: string;
  /** The exact URL confirmed to serve the artifact. */
  confirmedUrl: string;
}

// ─── Monitoring (§7, §26, §39) ───

export const SOURCE_CHECK_OUTCOMES = [
  "NO_CHANGE",
  "CHANGE_DETECTED",
  "FIRST_OBSERVATION",
  "SOURCE_UNAVAILABLE",
  "INTEGRITY_FAILURE",
  "SKIPPED_NOT_DUE",
  "SKIPPED_DISABLED",
  "SKIPPED_UNVERIFIED",
] as const;
export type SourceCheckOutcome = (typeof SOURCE_CHECK_OUTCOMES)[number];

/** Metadata observed on the HTTP response. Advisory only — never authoritative. */
export interface ResourceMetadata {
  etag?: string;
  lastModified?: string;
  contentLength?: number;
  contentType?: string;
  /** Version string declared by the source, if any. */
  declaredVersion?: string;
  /** Publication date declared by the source, if any. */
  declaredPublishedAt?: string;
}

/** Result of a single source check. Persisted as an immutable event. */
export interface SourceCheckResult {
  checkId: string;
  sourceId: string;
  checkedAt: Date;
  outcome: SourceCheckOutcome;
  httpStatus: number | null;
  /** SHA-256 of the body observed on this check, when a body was retrieved. */
  observedSha256: string | null;
  /** SHA-256 recorded before this check. */
  previousSha256: string | null;
  metadata: ResourceMetadata | null;
  /** Machine-readable failure code when the check did not succeed. */
  errorCode: string | null;
  errorMessage: string | null;
  /** Next scheduled check for this source. */
  nextCheckAt: Date | null;
  /** Attempt number within the current failure streak. */
  attemptCount: number;
  correlationId: string;
}

/** Read model for source health (§39). */
export interface SourceHealth {
  sourceId: string;
  name: string;
  authorityTier: AuthorityTier;
  status: SourceStatus;
  enabled: boolean;
  lastCheckedAt: Date | null;
  lastSuccessfulCheckAt: Date | null;
  lastFailedAt: Date | null;
  lastChangeAt: Date | null;
  lastArtifactSha256: string | null;
  consecutiveFailures: number;
  nextCheckAt: Date | null;
}

// ─── Artifacts (§8, §9, §10) ───

export const ARTIFACT_STATUSES = [
  "ACQUIRED",
  "VERIFIED",
  "PARSED",
  "PARSE_FAILED",
  "QUARANTINED",
  "SUPERSEDED",
  "REJECTED",
] as const;
export type ArtifactStatus = (typeof ARTIFACT_STATUSES)[number];

/**
 * An immutable capture of exactly what an official source served.
 *
 * INVARIANT: artifacts are never overwritten. A changed SHA-256 always produces
 * a NEW artifact version; the previous artifact is retained forever.
 */
export interface RegulatoryArtifact {
  /** Deterministic identity: `${sourceId}:${sha256}`. */
  artifactId: string;
  sourceId: string;
  /** The registry URL that was monitored. */
  sourceUrl: string;
  /** The URL the bytes were actually retrieved from (may differ after redirect). */
  directUrl: string;
  filename: string;
  mimeType: string;
  /** Size in bytes of the preserved raw body. */
  size: number;
  /** SHA-256 of the RAW body, computed before any parsing or modification. */
  sha256: string;
  acquiredAt: Date;
  /** Authenticated actor or system principal that performed acquisition. */
  acquiredBy: string;
  /** Publication date declared by the source (never inferred). */
  publishedAt: Date | null;
  /** Regulatory effectivity window declared by the source (never inferred). */
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  /** Version identifier declared by the source, if any. */
  version: string | null;
  status: ArtifactStatus;
  /** Populated when status is QUARANTINED or REJECTED. */
  blockedReason: string | null;
  /** Integrity findings recorded at acquisition time. */
  integrity: IntegrityReport;
}

/** Result of security + integrity validation of an untrusted artifact (§41). */
export interface IntegrityReport {
  sha256: string;
  sizeBytes: number;
  declaredMimeType: string;
  /** MIME type inferred from magic bytes. */
  detectedMimeType: string | null;
  extension: string | null;
  /** Blocking problems. Non-empty ⇒ artifact must be QUARANTINED. */
  errors: string[];
  /** Non-blocking observations. */
  warnings: string[];
  checks: IntegrityCheck[];
}

export interface IntegrityCheck {
  name: string;
  passed: boolean;
  detail: string;
}

// ─── Provenance (§11) ───

/**
 * Complete provenance for a normalized regulatory value.
 * Answers: "Show me exactly which source produced this regulatory value."
 */
export interface RegulatoryProvenance {
  sourceAuthority: string;
  sourceId: string;
  sourceUrl: string;
  directArtifactUrl: string;
  artifactFilename: string;
  artifactSha256: string;
  artifactSize: number;
  acquiredAt: Date;
  acquiredBy: string;
  publicationDate: Date | null;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  datasetVersion: string;
  documentVersion: string;
  parserVersion: string;
  schemaVersion: string;
  ruleVersion: string;
}

// ─── Documents & Document Versions (§12) ───

export interface RegulatoryDocument {
  documentId: string;
  authority: string;
  sourceId: string;
  titleAr: string;
  titleEn: string | null;
  documentType:
    | "MANDATORY_LIST"
    | "CIRCULAR"
    | "AMENDMENT"
    | "SECTOR_UPDATE"
    | "TEMPLATE"
    | "REGULATION"
    | "ANNOUNCEMENT";
  createdAt: Date;
}

export interface RegulatoryDocumentVersion {
  documentVersionId: string;
  documentId: string;
  /** Version label declared by the authority, or derived deterministically. */
  version: string;
  artifactSha256: string;
  /** When the authority published it. Null when not stated — never guessed. */
  publicationDate: Date | null;
  /** When it takes legal effect. Null when not stated — never guessed. */
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  supersedesVersionId: string | null;
  createdAt: Date;
}

// ─── Normalized Regulatory Data (§13, §14) ───

export const REGULATORY_PRODUCT_STATUSES = [
  "ACTIVE",
  "REMOVED",
  "SUSPENDED",
  "UNKNOWN",
] as const;
export type RegulatoryProductStatus = (typeof REGULATORY_PRODUCT_STATUSES)[number];

/**
 * A normalized product entry inside a regulatory dataset version.
 *
 * `UNKNOWN`/`null` is the correct value for anything the official artifact does
 * not state. Values are never inferred, defaulted or back-filled (§45).
 */
/**
 * State of a single year in a published minimum-local-content schedule.
 * `NOT_APPLICABLE` ("-") and `TBD` are recorded as published; neither is a zero.
 */
export const MINIMUM_LC_STATES = ["STATED", "NOT_APPLICABLE", "TBD"] as const;
export type MinimumLcState = (typeof MINIMUM_LC_STATES)[number];

/** One year of a published minimum local content schedule. */
export interface MinimumLcScheduleEntry {
  year: number;
  /** 0-100. Null whenever the artifact does not state a number. */
  pct: number | null;
  state: MinimumLcState;
  /** The literal cell value exactly as published. */
  raw: string;
}

export interface RegulatoryProduct {
  productCode: string;
  productNameAr: string;
  productNameEn: string | null;
  /**
   * Official LCGPA sector code. NULL whenever the authority publishes none —
   * and in the Mandatory List workbooks it publishes none. The sector's
   * official identity is its Arabic name. Never derive a code from the name:
   * any internal classification belongs in a separate, clearly non-official
   * structure.
   */
  sectorCode: string | null;
  /** Official Arabic sector name, exactly as published. */
  sectorNameAr: string | null;
  sectorNameEn: string | null;
  category: string | null;
  hsCode: string | null;
  /** Minimum local content percentage 0-100, or null when not stated. */
  minimumLcPct: number | null;
  /** Requirement identifiers attached to the product (certificates, standards). */
  requirements: string[];
  /** Free-text applicability scope as stated by the authority. */
  applicability: string | null;
  regulatoryStatus: RegulatoryProductStatus;
  /** Product-level effectivity, when the artifact states one. */
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  /** Product code exactly as published, before canonicalisation. */
  productCodeRaw?: string | null;
  /** Official product definition, as published. */
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  /** Price ceiling exactly as published — no unit conversion is applied. */
  priceCeilingRaw?: number | null;
  /** Manufacturer local-content baseline requirement text, as published. */
  manufacturerBaseline?: string | null;
  /** Multi-year minimum local content schedule, as published. */
  minimumLcSchedule?: MinimumLcScheduleEntry[];
}

export const DATASET_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "PUBLISHED",
  "ACTIVE",
  "SUPERSEDED",
  "ROLLED_BACK",
  "QUARANTINED",
] as const;
export type DatasetStatus = (typeof DATASET_STATUSES)[number];

/**
 * A normalized, versioned regulatory dataset produced from exactly one artifact.
 *
 * DATASET VERSION is independent of RULE VERSION (§13, §42): new product data is
 * a DATASET CHANGE, not automatically a RULE CHANGE.
 */
export interface RegulatoryDataset {
  datasetId: string;
  /** e.g. "LCGPA_MANDATORY_LIST_2026-08". */
  datasetVersion: string;
  documentVersionId: string;
  sourceId: string;
  artifactSha256: string;
  products: RegulatoryProduct[];
  parserVersion: string;
  schemaVersion: string;
  /** Frozen computation rule version this dataset was normalized under. */
  ruleVersion: string;
  status: DatasetStatus;
  /** Regulatory effectivity of the dataset as a whole. */
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  /** Set when the dataset became ACTIVE. */
  activatedAt: Date | null;
  /** Set when the dataset was superseded or rolled back. */
  deactivatedAt: Date | null;
  provenance: RegulatoryProvenance;
}

// ─── Semantic Change Detection (§15, §16) ───

export const REGULATORY_CHANGE_TYPES = [
  "PRODUCT_ADDED",
  "PRODUCT_REMOVED",
  "PRODUCT_RESTORED",
  "PRODUCT_RENAMED",
  "PRODUCT_CODE_CHANGED",
  "PRODUCT_DESCRIPTION_CHANGED",
  "CATEGORY_CHANGED",
  "SECTOR_CHANGED",
  "HS_CODE_CHANGED",
  "MINIMUM_LC_CHANGED",
  "REQUIREMENT_ADDED",
  "REQUIREMENT_REMOVED",
  "EFFECTIVE_DATE_CHANGED",
  "EXPIRY_DATE_CHANGED",
  "APPLICABILITY_CHANGED",
  "REGULATORY_STATUS_CHANGED",
  "PRICE_CEILING_CHANGED",
  "BASELINE_REQUIREMENT_CHANGED",
  "MINIMUM_LC_SCHEDULE_CHANGED",
] as const;
export type RegulatoryChangeType = (typeof REGULATORY_CHANGE_TYPES)[number];

export const CHANGE_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type ChangeSeverity = (typeof CHANGE_SEVERITIES)[number];

/** A single semantic difference between two dataset versions (§16). */
export interface RegulatoryChange {
  changeId: string;
  datasetBefore: string;
  datasetAfter: string;
  productCode: string;
  changeType: RegulatoryChangeType;
  /** Normalized field name the change applies to; "*" for whole-record changes. */
  field: string;
  oldValue: string | null;
  newValue: string | null;
  detectedAt: Date;
  /** Effective date of the NEW value as stated by the artifact; null when unstated. */
  effectiveFrom: Date | null;
  sourceArtifactBefore: string | null;
  sourceArtifactAfter: string;
  severity: ChangeSeverity;
  /** Human-readable justification of the assigned severity (§17). */
  severityRationale: string;
}

/** The complete diff between two dataset versions. */
export interface RegulatoryDiff {
  diffId: string;
  /**
   * True when there was no previous dataset. Every product then appears as
   * PRODUCT_ADDED — this is the system learning the existing regulatory state,
   * not the authority changing it.
   */
  isBaseline: boolean;
  datasetBefore: string | null;
  datasetAfter: string;
  changes: RegulatoryChange[];
  summary: {
    productsBefore: number;
    productsAfter: number;
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
    byType: Partial<Record<RegulatoryChangeType, number>>;
    bySeverity: Record<ChangeSeverity, number>;
  };
  computedAt: Date;
}

// ─── Governance (§24, §25, §50) ───

export const GOVERNANCE_STATES = [
  "DETECTED",
  "VERIFIED",
  "PARSED",
  "DIFFED",
  "CLASSIFIED",
  "IMPACT_ANALYZED",
  "PENDING_REVIEW",
  "AUTO_APPROVED",
  "APPROVED",
  "REJECTED",
  "PUBLISHED",
  "ACTIVE",
  "ROLLED_BACK",
  "QUARANTINED",
  "FAILED",
] as const;
export type GovernanceState = (typeof GOVERNANCE_STATES)[number];

export interface GovernanceTransition {
  from: GovernanceState;
  to: GovernanceState;
  at: Date;
  /** Authenticated user id, or a named system principal for automated steps. */
  actorId: string;
  actorName: string | null;
  reason: string;
  correlationId: string;
}

/** The governed lifecycle of one detected regulatory change set. */
export interface GovernanceCase {
  caseId: string;
  sourceId: string;
  artifactSha256: string;
  datasetVersion: string;
  diffId: string | null;
  impactId: string | null;
  state: GovernanceState;
  history: GovernanceTransition[];
  createdAt: Date;
  updatedAt: Date;
  /** Populated on APPROVED / AUTO_APPROVED. */
  approval: ApprovalRecord | null;
  /** Populated on REJECTED. */
  rejection: RejectionRecord | null;
}

export interface ApprovalRecord {
  approvedById: string;
  approvedByName: string | null;
  approvedAt: Date;
  /** True when an auto-approval policy matched instead of a human reviewer. */
  automatic: boolean;
  policyId: string | null;
  note: string;
}

export interface RejectionRecord {
  rejectedById: string;
  rejectedByName: string | null;
  rejectedAt: Date;
  reason: string;
}

/** Policy permitting automatic approval for a bounded class of changes (§24). */
export interface AutoApprovalPolicy {
  policyId: string;
  description: string;
  /** Only changes whose types are all in this set may auto-approve. */
  allowedChangeTypes: RegulatoryChangeType[];
  /** Maximum severity permitted for auto-approval. */
  maxSeverity: ChangeSeverity;
  /** Maximum number of changes in the diff. */
  maxChangeCount: number;
  /** Auto-approval requires the source to be at or above this tier. */
  requiredAuthorityTier: AuthorityTier;
  enabled: boolean;
}

// ─── Impact Analysis (§21, §22) ───

export const IMPACT_LEVELS = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];

/** Entities affected by a regulatory change, resolved from the database. */
export interface AffectedEntities {
  calculationIds: string[];
  projectIds: string[];
  tenderIds: string[];
  supplierIds: string[];
  contractIds: string[];
  reportIds: string[];
  complianceAssessmentIds: string[];
}

export interface RegulatoryImpactAssessment {
  impactId: string;
  changeIds: string[];
  diffId: string;
  impactLevel: ImpactLevel;
  affectedProducts: string[];
  affected: AffectedEntities;
  /** Counts derived from `affected` — never invented. */
  estimatedScope: {
    calculations: number;
    projects: number;
    tenders: number;
    suppliers: number;
    contracts: number;
    reports: number;
    complianceAssessments: number;
  };
  requiresReview: boolean;
  computedAt: Date;
  /** Explanation of how impactLevel was derived. */
  rationale: string;
}

/**
 * Port for resolving affected entities from the LocalContentOS database.
 * Implemented by the application layer; never by this package.
 */
export interface ImpactResolver {
  findAffected(productCodes: string[]): Promise<AffectedEntities>;
}

// ─── Alerts (§23) ───

export const ALERT_CATEGORIES = [
  "NEW_REGULATION",
  "DOCUMENT_UPDATED",
  "PRODUCT_ADDED",
  "PRODUCT_REMOVED",
  "PRODUCT_CHANGED",
  "MINIMUM_LC_CHANGED",
  "EFFECTIVE_DATE_CHANGED",
  "SOURCE_UNAVAILABLE",
  "SOURCE_AUTHENTICATION_FAILURE",
  "PARSING_FAILURE",
  "DATA_VALIDATION_FAILURE",
  "REGULATORY_CONFLICT",
  "IMPACT_HIGH",
  "POSSIBLE_CHANGE_DETECTED",
] as const;
export type AlertCategory = (typeof ALERT_CATEGORIES)[number];

export const ALERT_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED", "SUPPRESSED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export interface RegulatoryAlert {
  alertId: string;
  category: AlertCategory;
  severity: ChangeSeverity;
  sourceId: string;
  changeId: string | null;
  summary: string;
  /** Artifact hashes, URLs and values that substantiate the alert. */
  evidence: string[];
  effectiveDate: Date | null;
  impactLevel: ImpactLevel | null;
  recommendedAction: string;
  createdAt: Date;
  status: AlertStatus;
}

// ─── Conflict Detection (§29) ───

export interface RegulatoryConflict {
  conflictId: string;
  sourceAId: string;
  sourceBId: string;
  artifactAHash: string;
  artifactBHash: string;
  productCode: string;
  conflictingFields: {
    field: string;
    valueA: string | null;
    valueB: string | null;
    dateA: Date | null;
    dateB: Date | null;
  }[];
  detectedAt: Date;
  /** Conflicts are never auto-resolved. */
  resolution: "PENDING_HUMAN_REVIEW";
}

// ─── Change Journal (§34) ───

export interface RegulatoryChangeEvent {
  /** Human-facing sequential identity, e.g. "CHANGE-2026-00017". */
  eventId: string;
  detectedAt: Date;
  sourceId: string;
  sourceName: string;
  artifactFilename: string;
  artifactSha256: string;
  datasetVersion: string;
  changeIds: string[];
  summary: string;
  effectiveFrom: Date | null;
  impactLevel: ImpactLevel | null;
  governanceState: GovernanceState;
  activatedAt: Date | null;
  correlationId: string;
}

// ─── Audit Trail (§49) ───

export const REGULATORY_AUDIT_ACTIONS = [
  "SOURCE_REGISTERED",
  "SOURCE_VERIFIED",
  "SOURCE_CHECKED",
  "ARTIFACT_ACQUIRED",
  "ARTIFACT_VERIFIED",
  "ARTIFACT_QUARANTINED",
  "DATASET_CREATED",
  "CHANGE_DETECTED",
  "CHANGE_CLASSIFIED",
  "IMPACT_ANALYZED",
  "REVIEW_REQUESTED",
  "CHANGE_APPROVED",
  "CHANGE_REJECTED",
  "DATASET_PUBLISHED",
  "DATASET_ACTIVATED",
  "DATASET_ROLLED_BACK",
  "CONFLICT_DETECTED",
  "PARSER_FAILED",
] as const;
export type RegulatoryAuditAction = (typeof REGULATORY_AUDIT_ACTIONS)[number];

export interface RegulatoryAuditEvent {
  auditId: string;
  action: RegulatoryAuditAction;
  actorId: string;
  actorName: string | null;
  timestamp: Date;
  sourceId: string | null;
  entityType: string;
  entityId: string;
  before: string | null;
  after: string | null;
  reason: string;
  correlationId: string;
}

// ─── Ports ───

/** HTTP response as observed by the engine. Body is the raw, unmodified bytes. */
export interface FetchedResource {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  /** Raw bytes exactly as served. Null when the request failed. */
  body: Buffer | null;
  /** Final URL after redirects. */
  finalUrl: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Outbound fetch port.
 * The engine performs NO network I/O of its own — a fetcher must be injected.
 */
export interface RegulatoryFetcher {
  fetch(url: string): Promise<FetchedResource>;
}

/** Deterministic time source. Injected so every test is reproducible. */
export interface Clock {
  now(): Date;
}

/** Default clock. */
export const systemClock: Clock = {
  now: () => new Date(),
};

/** Fixed clock for tests and replay. */
export function fixedClock(at: Date): Clock {
  return { now: () => new Date(at.getTime()) };
}
