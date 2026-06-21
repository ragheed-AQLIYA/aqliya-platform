/**
 * Governance Engine facade — task routing, approval, escalation, provenance.
 */
export { GovernanceEngine } from "./engine";
export type {
  GovernanceEvaluateInput,
  GovernanceEvaluateResult,
} from "./engine";

export {
  actorDisplayName,
  attachEvidenceStatus,
  buildAuditFindingPrompt,
  buildCommercialClaimReviewPrompt,
  buildEvidenceReviewPrompt,
  buildMappingRecommendationPrompt,
  buildStatementDraftingPrompt,
  canMutateByLineage,
  canTransitionApprovalState,
  createDraftProvenance,
  evaluateEscalation,
  explainProvenance,
  getApprovalBlockingReasons,
  getEscalationLevel,
  getEscalationMessage,
  getGovernanceContext,
  isFinalizationAllowed,
  listSupportedGovernanceTasks,
  markApprovedByHuman,
  markEscalated,
  markReviewRequired,
  requireHumanApproval,
  requiresHumanApproval,
} from "@/lib/governance";

export type {
  ApprovalState,
  AuditFindingPromptInput,
  CommercialClaimPromptInput,
  DoctrineReference,
  EscalationLevel,
  EscalationRecord,
  EscalationResult,
  EscalationTrigger,
  EvidenceRequirement,
  EvidenceReviewPromptInput,
  EvidenceStatus,
  GovernanceContext,
  GovernanceReference,
  GovernanceTaskType,
  MappingRecommendationPromptInput,
  OutputBoundary,
  PromptAssemblyResult,
  PromptLayer,
  PromptLayerContent,
  ProvenanceMetadata,
  StatementDraftingPromptInput,
} from "@/lib/governance";
