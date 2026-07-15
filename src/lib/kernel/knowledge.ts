/**
 * Knowledge Kernel Bridge
 *
 * Single import surface for all knowledge-foundation and knowledge-review
 * modules. Consumer code should import from "@/lib/kernel" instead of
 * directly from "@/lib/knowledge-foundation/*" or "@/lib/knowledge-review/*".
 */

// ── knowledge-foundation/types ──────────────────────────────────────────────
export type {
  CreateVersionInput,
  UpdateVersionStatusInput,
  ApproveVersionInput,
  RollbackInput,
  ReleasePackage,
  DiffResult,
  VersionListItem,
  FoundationVersionStatusCounts,
  FoundationCandidateMetrics,
  FoundationKPIs,
} from "../knowledge-foundation/types";

// ── knowledge-foundation/release-readiness ──────────────────────────────────
export type { ReleaseReadinessResult } from "../knowledge-foundation/release-readiness";
export { evaluateReleaseReadiness } from "../knowledge-foundation/release-readiness";

// ── knowledge-foundation/provenance-summary ─────────────────────────────────
export type { ProvenanceSummary } from "../knowledge-foundation/provenance-summary";
export { summarizeProvenanceManifest } from "../knowledge-foundation/provenance-summary";

// ── knowledge-foundation/candidate-pool-overview ────────────────────────────
export type { CandidatePoolOverview, BoundCandidatePoolItem } from "../knowledge-foundation/candidate-pool-overview";
export { getCandidatePoolOverview, listBoundCandidatesPool } from "../knowledge-foundation/candidate-pool-overview";

// ── knowledge-foundation/release-integrity ──────────────────────────────────
export type { ReleaseIntegrityResult } from "../knowledge-foundation/release-integrity";
export { verifyReleaseIntegrity, verifyFoundationRelease } from "../knowledge-foundation/release-integrity";

// ── knowledge-foundation/provenance-manifest ────────────────────────────────
export type { ProvenanceEvidenceSummary, ProvenanceCandidateEntry, VersionProvenanceManifest } from "../knowledge-foundation/provenance-manifest";
export { buildVersionProvenanceManifest } from "../knowledge-foundation/provenance-manifest";

// ── knowledge-foundation/events ─────────────────────────────────────────────
export type { KnowledgeFoundationEventType, KnowledgeFoundationEvent } from "../knowledge-foundation/events";
export { onFoundationEvent, onAnyFoundationEvent, emitFoundationEvent, clearFoundationHandlers } from "../knowledge-foundation/events";

// ── knowledge-foundation/governance-report ──────────────────────────────────
export type { FoundationGovernanceReport } from "../knowledge-foundation/governance-report";
export { generateFoundationGovernanceReport } from "../knowledge-foundation/governance-report";

// ── knowledge-foundation/diff-engine ────────────────────────────────────────
export { generateDiff, getDiffForVersion } from "../knowledge-foundation/diff-engine";

// ── knowledge-foundation/rollback-service ───────────────────────────────────
export { ROLLBACK_ALLOWED_TARGET_STATUSES, executeRollback } from "../knowledge-foundation/rollback-service";
export type { RollbackAllowedTargetStatus } from "../knowledge-foundation/rollback-service";

// ── knowledge-foundation/release-generator ──────────────────────────────────
export type { ReleaseManifest } from "../knowledge-foundation/release-generator";
export { generateReleasePackage } from "../knowledge-foundation/release-generator";

// ── knowledge-foundation/kf-service ─────────────────────────────────────────
export {
  createVersion,
  approveVersion,
  releaseVersion,
  activateVersion,
  deprecateVersion,
  getVersions,
  getVersion,
  getFoundationKPIs,
} from "../knowledge-foundation/kf-service";

// ── knowledge-foundation/candidate-bridge ───────────────────────────────────
export type { BoundCandidateRow, EligiblePromotedCandidate, VersionCandidateStats } from "../knowledge-foundation/candidate-bridge";
export {
  syncVersionCandidateCount,
  listEligiblePromotedCandidates,
  listBoundCandidates,
  getVersionCandidateStats,
  bindCandidatesToVersion,
  unbindCandidateFromVersion,
  markVersionBindingsReleased,
} from "../knowledge-foundation/candidate-bridge";

// ── knowledge-review/events ────────────────────────────────────────────────
export type { KnowledgeReviewEventType, KnowledgeReviewEvent } from "../knowledge-review/events";
export { onReviewEvent, onAnyReviewEvent, emitReviewEvent, clearHandlers } from "../knowledge-review/events";

// ── knowledge-review/audit-handler ──────────────────────────────────────────
export { registerAuditHandler } from "../knowledge-review/audit-handler";
