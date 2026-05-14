// ===== Task Types =====
export type GovernanceTaskType =
  | 'trial_balance_upload'
  | 'account_mapping'
  | 'statement_drafting'
  | 'notes_generation'
  | 'evidence_review'
  | 'audit_findings'
  | 'commercial_claim_review'
  | 'pilot_decision'
  | 'approval_review';

// ===== Core Governance Types =====

export interface DoctrineReference {
  documentId: string;
  title: string;
  principle: string;
  relevance: string;
}

export interface GovernanceReference {
  source: string;
  rule: string;
  enforcement: string;
}

export type EvidenceStatus = 'complete' | 'partial' | 'missing' | 'conflicting' | 'weak' | 'unverifiable';

export interface EvidenceRequirement {
  description: string;
  status: EvidenceStatus;
  requiredForApproval: boolean;
  notes?: string;
}

export type ApprovalState =
  | 'draft_generated'
  | 'evidence_pending'
  | 'review_required'
  | 'under_review'
  | 'changes_requested'
  | 'approved_by_human'
  | 'rejected_by_human'
  | 'finalized';

export type EscalationLevel = 'none' | 'notice' | 'review_required' | 'senior_review_required' | 'blocked';

export type EscalationTrigger =
  | 'missing_evidence'
  | 'weak_evidence'
  | 'conflicting_evidence'
  | 'low_mapping_confidence'
  | 'unsupported_accounting_treatment'
  | 'governance_ambiguity'
  | 'commercial_overclaim_risk'
  | 'approval_bypass_attempt'
  | 'reviewer_disagreement'
  | 'high_materiality'
  | 'unusual_transaction'
  | 'policy_conflict';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

export type OutputBoundary = 'draft_only' | 'review_required' | 'approved' | 'final';

// ===== Prompt Types =====

export type PromptLayer =
  | 'system_doctrine'
  | 'product_doctrine'
  | 'governance'
  | 'evidence'
  | 'human_approval'
  | 'task_specific';

export interface PromptLayerContent {
  layer: PromptLayer;
  content: string;
}

export interface PromptAssemblyResult {
  layers: PromptLayerContent[];
  fullPrompt: string;
  governanceContext: GovernanceContext;
  warnings: string[];
}

// ===== Provenance Types =====

export interface ProvenanceMetadata {
  taskType: GovernanceTaskType;
  generatedAt: string;
  approvalState: ApprovalState;
  reviewRequired: boolean;
  doctrineReferences: DoctrineReference[];
  governanceReferences: GovernanceReference[];
  evidenceRequirements: EvidenceRequirement[];
  escalationLevel: EscalationLevel;
  outputBoundary: OutputBoundary;
  humanApprovalRequired: boolean;
  escalatedAt?: string;
  reviewedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
  explainabilityMessage: string;
}

export interface EscalationRecord {
  trigger: EscalationTrigger;
  level: EscalationLevel;
  message: string;
  timestamp: string;
  resolvedBy?: string;
}

// ===== Retrieval Types =====

export interface GovernanceContext {
  taskType: GovernanceTaskType;
  doctrineReferences: DoctrineReference[];
  governanceReferences: GovernanceReference[];
  evidenceRequirements: EvidenceRequirement[];
  humanApprovalRequired: boolean;
  escalationTriggers: EscalationTrigger[];
  outputBoundary: OutputBoundary;
  recommendedPromptLayers: PromptLayer[];
}

// ===== Escalation Types =====

export interface EscalationResult {
  level: EscalationLevel;
  triggers: EscalationRecord[];
  requiresHumanResolution: boolean;
  blocked: boolean;
  message: string;
}

// ===== Domain-Specific Input Types =====

export interface StatementDraftingPromptInput {
  accountsMapped: boolean;
  trialBalanceValidated: boolean;
  evidenceCompleteness: EvidenceStatus;
  hasPriorPeriodData: boolean;
  financialPeriod: string;
  accountingStandard: string;
}

export interface MappingRecommendationPromptInput {
  accountCount: number;
  mappedCount: number;
  lowConfidenceCount: number;
  unmappedCount: number;
}

export interface EvidenceReviewPromptInput {
  evidenceItemsTotal: number;
  evidenceItemsReviewed: number;
  evidenceItemsVerified: number;
  materialityThreshold: number;
}

export interface AuditFindingPromptInput {
  findingType: string;
  severity: string;
  evidenceLinked: boolean;
  evidenceSufficient: boolean;
}

export interface CommercialClaimPromptInput {
  claimType: string;
  targetAudience: string;
  isPilotResult: boolean;
  hasEvidenceSupport: boolean;
}
