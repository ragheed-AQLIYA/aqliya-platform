"use server";

/**
 * Kernel-level bridge for AuditOS audit functions.
 *
 * Re-exports the most commonly imported audit utilities so consumers
 * import from the kernel layer instead of `@/lib/audit/*` submodules.
 *
 * Submodule-specific imports (e.g. `@/lib/audit/presentation/*`,
 * `@/lib/audit/db/*`) remain unchanged — only barrel-level consumers
 * should use this bridge.
 */

// ── Actor context ──────────────────────────────────────────────
export { getAuditActor, requireRole } from "@/lib/audit/actor-context";
export type { AuditActor } from "@/lib/audit/actor-context";

// ── Tenant guard ───────────────────────────────────────────────
export { assertEngagementAccess, assertOrganizationAccess, TenantAccessError } from "@/lib/audit/tenant-guard";

// ── Audit events ───────────────────────────────────────────────
export { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
export type { AuditOsAuditInput } from "@/lib/audit/audit-events";

// ── Rate limiting ──────────────────────────────────────────────
export { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
export type { RateLimitCategory } from "@/lib/audit/rate-limit";

// ── Workflow ───────────────────────────────────────────────────
export { getNextWorkflowAction, getWorkflowProgressStep, getEngagementStatusLabel, getApprovalStatusLabel, getOperatorStatusDisplay } from "@/lib/audit/workflow-next-action";
export type { NextWorkflowAction, OperatorStatusTone } from "@/lib/audit/workflow-next-action";
export { evaluateTabGate, evaluateAllTabGates } from "@/lib/audit/workflow-gating";
export type { WorkflowContext } from "@/lib/audit/workflow-gating";

// ── Disclosure types ───────────────────────────────────────────
export { extractRuleCitations, formatRuleCitationMarker, RULE_CITATION_PREFIX } from "@/lib/audit/notes/disclosure-types";

// ── Engagement archival ────────────────────────────────────────
export { evaluateEngagementArchival } from "@/lib/audit/engagement-archival";
export type { ArchivedEngagementRow } from "@/lib/audit/engagement-archival";
export { listArchivedEngagements } from "@/lib/audit/engagement-archival-service";

// ── Materiality ────────────────────────────────────────────────
export { calculatePerformanceMateriality, classifyBalanceMateriality } from "@/lib/audit/materiality";

// ── File scanning ──────────────────────────────────────────────
export { isScanRejected, scanEvidenceFile } from "@/lib/audit/file-scanner";
export { getStorageProvider, buildStorageKey } from "@/lib/audit/storage";
export { pingClamAv, scanBufferWithClamAv } from "@/lib/audit/clamav-client";

// ── Feature flags (audit-specific) ─────────────────────────────
export { isFsV2Enabled } from "@/lib/audit/fs-engine";
export { isReportingGraphEnabled } from "@/lib/audit/reporting-graph/graph-sync-service";

// ── Audit services (read-side) ────────────────────────────────
export {
  getEngagement,
  getTrialBalance,
  getMappings,
  getFinancialStatements,
  getDisclosureNotes,
  getEvidence,
  getEvidencePaginated,
  getMissingEvidence,
  getFindings,
  getFindingsPaginated,
  getRecommendations,
  getRecommendationsPaginated,
  getReviewComments,
  getOpenReviewCount,
  getApprovalRecords,
  getApprovalStatus,
  getAuditEvents,
  getPublicationPackage,
  getValidationRun,
  getEngagementWorkflowStatus,
  getCanonicalAccounts,
  getTrialBalanceLines,
  getDashboardSummary,
  getEngagements,
  getAuditUsers,
  getAISuggestions,
  recordAuditEvent,
  createEngagement,
  uploadTrialBalance,
  getTraceability,
  updateManualMapping,
  getAccountMappingById,
  createReviewComment,
  updateReviewCommentStatus,
  createApprovalRecord,
  publishEngagement,
  archiveEngagement,
  restoreEngagement,
  updateEngagementPresentationProfile,
  runValidation,
  disposeValidationIssue,
  createFinding,
  updateFindingStatus,
  createRecommendation,
  updateRecommendationStatus,
  createEvidence,
  updateEvidenceState,
  updateEvidenceStateWithEvent,
  updateEvidenceStorageService,
  linkEvidenceToEntity,
  createAIOutput,
  updateAIOutputStatus,
  generateDraftNotes,
  acceptDraftNote,
  generateEvidenceSuggestions,
  acceptEvidenceSuggestion,
  generateFindingDrafts,
  acceptFindingDraft,
  generateRecommendationDrafts,
  acceptRecommendationDraft,
  generateAnalyticalReview,
  createPilotFeedback,
  updatePilotFeedbackStatus,
  getPilotFeedback,
  createProductionBlocker,
  updateProductionBlockerStatus,
  getProductionBlockers,
  createOrUpdatePilotSignoff,
  getPilotSignoffChecklist,
} from "@/lib/audit/services";

// ── Governance bridge ──────────────────────────────────────────
export {
  buildProvenanceMetadata,
  mapEngagementStatusToApprovalState,
  mapFindingStatusToApprovalState,
  mapRecommendationStatusToApprovalState,
  getGovernanceAuditMetadata,
  checkPublicationGovernance,
  evaluateFindingEscalation,
  evaluateEvidenceEscalation,
  buildEvidenceRequirementsFromEvidenceList,
} from "@/lib/audit/governance-bridge";

// ── Reporting graph types ──────────────────────────────────────
export type {
  ReportingGraph,
  ReportingGraphNode,
  ReportingGraphNodeType,
  GraphSnapshotRecord,
} from "@/lib/audit/reporting-graph/types";
