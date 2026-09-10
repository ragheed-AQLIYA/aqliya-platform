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
export {
  getAuditActor,
  requireRole,
  isUsingDemoFallback,
  ensureAuditUserProvisioned,
  canDraft,
  canReview,
  canApprove,
} from "@/lib/audit/actor-context";
export type { AuditActor } from "@/lib/audit/actor-context";

// ── Tenant guard ───────────────────────────────────────────────
export { assertEngagementAccess, assertClientAccess, assertOrganizationAccess, TenantAccessError } from "@/lib/audit/tenant-guard";

// ── Audit events ───────────────────────────────────────────────
export { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
export type { AuditOsAuditInput } from "@/lib/audit/audit-events";

// ── Rate limiting ──────────────────────────────────────────────
export { enforceAuditRateLimit, resetRateLimit } from "@/lib/audit/rate-limit";
export type { RateLimitCategory } from "@/lib/audit/rate-limit";

// ── Workflow ───────────────────────────────────────────────────
export {
  getNextWorkflowAction,
  getWorkflowProgressStep,
  getEngagementStatusLabel,
  getApprovalStatusLabel,
  getOperatorStatusDisplay,
  APPROVAL_STATUS_LABELS,
  ENGAGEMENT_STATUS_LABELS,
} from "@/lib/audit/workflow-next-action";
export type { NextWorkflowAction, OperatorStatusTone, OperatorStatusDisplay } from "@/lib/audit/workflow-next-action";
export { evaluateTabGate, evaluateAllTabGates, isTabAccessible } from "@/lib/audit/workflow-gating";
export type { WorkflowContext, TabGateResult } from "@/lib/audit/workflow-gating";

// ── Disclosure types ───────────────────────────────────────────
export { extractRuleCitations, formatRuleCitationMarker, RULE_CITATION_PREFIX } from "@/lib/audit/notes/disclosure-types";

// ── Engagement archival ────────────────────────────────────────
export {
  evaluateEngagementArchival,
  ARCHIVABLE_ENGAGEMENT_STATUSES,
} from "@/lib/audit/engagement-archival";
export type { ArchivedEngagementRow, ArchivalEligibility } from "@/lib/audit/engagement-archival";
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
  confirmMapping,
  confirmAllSuggestedMappings,
  getUnmappedAccounts,
  getEquityStatementLines,
  getFinding,
  getRecommendation,
  acceptAISuggestion,
  updateNoteStatus,
  getAIOutputsForEntity,
  getFullTraceability,
  createEvidenceWithStorage,
} from "@/lib/audit/services";
export type { AuditAIActorContext } from "@/lib/audit/services";

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
  ReportingGraphEdgeType,
  ReportingGraphEdge,
  ReportingGraphStats,
  GraphBuildInput,
  GraphSnapshotRecord,
} from "@/lib/audit/reporting-graph/types";

// ── Presentation policy types ──────────────────────────────────
export {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
  BUILTIN_PRESENTATION_POLICIES,
  PROFILE_DEFAULT_POLICY_SLUG,
  getBuiltinPolicyBySlug,
  parsePresentationPolicyRules,
  policyUsesAuditedHeadlineRules,
} from "@/lib/audit/presentation/presentation-policy-types";
export type {
  PresentationPolicyRules,
  ResolvedPresentationContext,
} from "@/lib/audit/presentation/presentation-policy-types";

// ── Presentation policy service ────────────────────────────────
export {
  listPresentationPoliciesForOrganization,
  getPresentationPolicyRulesById,
  createOrgPresentationPolicyFromTemplate,
  updateOrgPresentationPolicy,
  assignPresentationPolicyToEngagement,
  listPresentationPolicyTemplates,
} from "@/lib/audit/presentation/presentation-policy-service";
export type {
  PresentationPolicySummary,
  PresentationPolicyEditableFields,
} from "@/lib/audit/presentation/presentation-policy-service";

// ── Presentation profile rebuild types ─────────────────────────
export type {
  PresentationProfileRebuildStatus,
  PresentationProfileRebuildResult,
} from "@/lib/audit/presentation/presentation-profile-rebuild-types";
