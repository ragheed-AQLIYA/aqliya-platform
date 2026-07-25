// Barrel re-export — preserves the exact same public API as the original sales-actions.ts
// All 33 external importers continue to import from "@/actions/sales-actions"

export {
  listSalesDealsAction,
  getSalesDealAction,
  createSalesDealAction,
  updateSalesDealAction,
  updateDealNextActionAction,
  listSalesDealAuditEventsAction,
  createOpportunityFromAccountAction,
} from "./deals";

export {
  listSalesAccountsAction,
  getSalesAccountAction,
  createSalesAccountAction,
  updateSalesAccountAction,
  createAccountAction,
  recalculateAccountIcpScoreAction,
  setAccountIcpReviewedAction,
  generateAccountResearchAction,
  markAccountResearchReviewedAction,
} from "./accounts";

export {
  listSalesPipelineStagesAction,
  getSalesDashboardStatsAction,
  listOrgSalesActivitiesAction,
  listOrgSalesAuditEventsAction,
  listOrgSalesSignalsAction,
  createSalesSignalAction,
} from "./pipeline";

export {
  recordSalesReviewDecisionAction,
  listPendingOpportunityReviewsAction,
  listPendingReviewDraftsAction,
  listOrgSalesApprovalsAction,
  submitOpportunityReviewAction,
  approveOpportunityAction,
  linkEvidenceAction,
  requestClaimReviewAction,
  submitOpportunityReviewActionPrisma,
  linkDealEvidenceAction,
  unlinkDealEvidenceAction,
  listDealEvidenceLinksAction,
  scaffoldUploadSalesProofAssetFileAction,
} from "./governance";

export {
  createSalesInteractionAction,
  updateSalesInteractionAction,
  deleteSalesInteractionAction,
} from "./interactions";

export {
  recalculateDealRiskAction,
  analyzeDealObjectionAction,
  draftFollowUpAction,
  approveFollowUpDraftAction,
  rejectFollowUpDraftAction,
  dismissSalesNbaActionAction,
  snoozeSalesNbaActionAction,
  upsertConversionMemoAction,
  submitConversionMemoAction,
  getSalesFounderReportAction,
  createOutreachDraftAction,
  submitOutreachDraftAction,
  reviewOutreachDraftAction,
} from "./ai-intelligence";
