/**
 * SalesOS Store — barrel export
 *
 * Re-exports all domain modules so existing imports from
 * "@/lib/sales/store" continue to work unchanged.
 */

// Types
export type { SalesEvidenceRef, SalesAuditEntry, OrgStore } from "./common";

// Common — seed/test helpers + generic CRUD
export {
  resetSalesStoreForTests,
  ensureSalesSeed,
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
  listGovernedForOpportunity,
  listGovernedForAccount,
} from "./common";

// Accounts domain
export {
  listAccounts,
  getAccount,
  createAccount,
  listContactsForAccount,
  createContact,
} from "./accounts";

// Opportunities domain
export {
  listOpportunities,
  listOpportunitiesForAccount,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  createInteraction,
  listInteractionsForOpportunity,
  listInteractionsForAccount,
  listAllInteractions,
  listActivities,
  listActivitiesForOpportunity,
  createActivity,
} from "./opportunities";

// Evidence & Audit domain
export {
  linkEvidence,
  listEvidenceForOpportunity,
  appendAuditEntry,
  listAuditEntries,
} from "./evidence-audit";

// Meetings & Outreach domain
export {
  listMeetings,
  createMeeting,
  listOutreach,
} from "./meetings";

// Signals domain
export {
  listSignals,
  getSignal,
  listSignalsForOpportunity,
  listSignalsForAccount,
  createSignal,
  updateSignal,
  deleteSignal,
} from "./signals";

// Objections domain
export {
  listObjections,
  getObjection,
  listObjectionsForOpportunity,
  listObjectionsForAccount,
  createObjection,
  updateObjection,
  deleteObjection,
} from "./objections";

// Competitor Mentions domain
export {
  listCompetitorMentions,
  getCompetitorMention,
  listCompetitorMentionsForOpportunity,
  createCompetitorMention,
  updateCompetitorMention,
  deleteCompetitorMention,
} from "./competitors";

// Proof Assets domain
export {
  listProofAssets,
  getProofAsset,
  listProofAssetsForOpportunity,
  createProofAsset,
  updateProofAsset,
  deleteProofAsset,
} from "./proof-assets";

// Insights domain (ICP + Win/Loss)
export {
  listICPInsights,
  getICPInsight,
  createICPInsight,
  updateICPInsight,
  deleteICPInsight,
  listWinLossInsights,
  getWinLossInsight,
  listWinLossInsightsForOpportunity,
  createWinLossInsight,
  updateWinLossInsight,
  deleteWinLossInsight,
} from "./insights";

// Next Actions domain
export {
  listNextActions,
  getNextAction,
  listNextActionsForOpportunity,
  createNextAction,
  updateNextAction,
  deleteNextAction,
} from "./next-actions";
