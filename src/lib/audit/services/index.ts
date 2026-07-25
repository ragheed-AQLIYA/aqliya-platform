/**
 * Audit Services — barrel export
 *
 * Re-exports all domain modules so existing imports from
 * "@/lib/audit/services" continue to work unchanged.
 */

// Common utilities and types
export type { AuditAIActorContext } from "./common";

// Engagement domain
export {
  getDashboardSummary,
  getEngagements,
  getEngagement,
  getEngagementWorkflowStatus,
  publishEngagement,
  createEngagement,
  updateEngagementPresentationProfile,
  archiveEngagement,
  restoreEngagement,
} from "./engagement";

// Trial Balance domain
export {
  getTrialBalance,
  getTrialBalanceLines,
  getMappings,
  confirmMapping,
  confirmAllSuggestedMappings,
  getAccountMappingById,
  updateManualMapping,
  getUnmappedAccounts,
  getValidationRun,
  runValidation,
  disposeValidationIssue,
  getFinancialStatements,
  getEquityStatementLines,
  getDisclosureNotes,
  uploadTrialBalance,
  getCanonicalAccounts,
} from "./trial-balance";

// Evidence domain
export {
  getEvidence,
  getEvidencePaginated,
  getMissingEvidence,
  createEvidence,
  createEvidenceWithStorage,
  updateEvidenceState,
  updateEvidenceStateWithEvent,
  updateEvidenceStorageService,
  linkEvidenceToEntity,
} from "./evidence";

// Findings domain
export {
  getFindings,
  getFindingsPaginated,
  getFinding,
  getRecommendations,
  getRecommendationsPaginated,
  getRecommendation,
  createFinding,
  updateFindingStatus,
  createRecommendation,
  updateRecommendationStatus,
} from "./findings";

// Review domain
export {
  getReviewComments,
  getOpenReviewCount,
  getApprovalRecords,
  getApprovalStatus,
  getPublicationPackage,
  createReviewComment,
  updateReviewCommentStatus,
  createApprovalRecord,
} from "./review";

// AI domain
export {
  getAISuggestions,
  acceptAISuggestion,
  createAIOutput,
  generateDraftNotes,
  generateEvidenceSuggestions,
  acceptEvidenceSuggestion,
  acceptDraftNote,
  updateNoteStatus,
  getAIOutputsForEntity,
  updateAIOutputStatus,
  generateFindingDrafts,
  acceptFindingDraft,
  generateRecommendationDrafts,
  generateAnalyticalReview,
  acceptRecommendationDraft,
} from "./ai";

// Events domain
export {
  getAuditEvents,
  recordAuditEvent,
  getTraceability,
  getFullTraceability,
  getAuditUsers,
} from "./events";

// Pilot domain
export {
  createPilotFeedback,
  updatePilotFeedbackStatus,
  getPilotFeedback,
  createProductionBlocker,
  updateProductionBlockerStatus,
  getProductionBlockers,
  createOrUpdatePilotSignoff,
  getPilotSignoffChecklist,
} from "./pilot";
