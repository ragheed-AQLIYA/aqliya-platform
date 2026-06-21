/**
 * Intelligence Core contracts — stable types for cross-product semantics.
 */
export type {
  EvidenceAssessment,
  EvidenceItem,
  IntelligenceDimension,
  IntelligenceLevel,
  IntelligenceSignal,
  IntelligenceSummary,
  ReadinessAssessment,
  ReadinessRequirement,
  RiskAssessment,
  RiskFactor,
  WorkflowHealth,
} from "@/lib/platform/intelligence";

export {
  calculateOverallScore,
  levelToScore,
  scoreToLevel,
} from "@/lib/platform/intelligence";

export type {
  CoreEventDomain,
  CoreEventEnvelope,
  StampAuditEventInput,
} from "./event-envelope";

export {
  CORE_EVENT_SCHEMA_VERSION,
  CoreEventContract,
  buildEventEnvelope,
  inferEventDomain,
  parseEventEnvelopeFromMetadata,
  stampPlatformAuditEvent,
} from "./event-envelope";

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
} from "@/lib/governance/runtime-types";
