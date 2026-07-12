// ─── Barrel re-export for backward compatibility ───
// All existing imports from "@/lib/audit/db" continue to work unchanged.

export {
  getDashboardSummary,
  getEngagements,
  getEngagement,
  getEngagementWorkflowStatus,
  getEngagementOrganizationId,
  getApprovalStatus,
  getCanonicalAccounts,
  createClient,
  createEngagement,
  updateEngagementPresentationProfile,
  updateEngagementStatus,
  publishEngagement,
  archiveEngagement,
  restoreEngagement,
} from "./engagement-db";

export {
  getTrialBalance,
  getTrialBalanceLines,
  getMappings,
  rebuildFinancialStatementsForEngagement,
  confirmMapping,
  confirmAllSuggestedMappings,
  getAccountMappingById,
  updateManualMapping,
  getUnmappedAccounts,
  getFinancialStatements,
  getEquityStatementLines,
  saveTrialBalance,
  createSuggestedMappingsForTrialBalance,
} from "./financial-db";

export {
  getFindings,
  getFindingsPaginated,
  getFinding,
  createFinding,
  updateFindingStatus,
  getRecommendations,
  getRecommendationsPaginated,
  getRecommendation,
  createRecommendation,
  updateRecommendationStatus,
} from "./finding-db";

export {
  getEvidence,
  getEvidencePaginated,
  getMissingEvidence,
  createEvidence,
  updateEvidenceState,
  updateEvidenceStorage,
  createEvidenceLink,
  getEvidenceLinksForEvidence,
  getEvidenceLinksForTarget,
} from "./evidence-db";

export {
  getReviewComments,
  getOpenReviewCount,
  createReviewComment,
  updateReviewCommentStatus,
  getApprovalRecords,
  createApprovalRecord,
  getDisclosureNotes,
  updateDisclosureNote,
  createDisclosureNote,
} from "./review-db";

export {
  getValidationRun,
  runValidation,
  disposeValidationIssue,
} from "./validation-db";

export {
  getPublicationPackage,
  getAuditEvents,
  recordAuditEvent,
  getTraceability,
  getFullTraceability,
} from "./publication-db";

export {
  getAISuggestions,
  acceptAISuggestion,
  createAIOutput,
  getAIOutputsForEntity,
  updateAIOutputStatus,
} from "./ai-db";

export {
  createPilotFeedback,
  updatePilotFeedbackStatus,
  getPilotFeedback,
  createProductionBlocker,
  updateProductionBlockerStatus,
  getProductionBlockers,
  createOrUpdatePilotSignoff,
  getPilotSignoffChecklist,
} from "./pilot-db";

export { getAuditUsers } from "./user-db";
