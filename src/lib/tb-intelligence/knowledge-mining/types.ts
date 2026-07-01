/**
 * Phase 8 — Knowledge Foundation Feedback Loop types.
 *
 * Defines the pipeline from pattern aggregation → candidate knowledge → human review → promotion.
 */

export type KnowledgeCandidateStatus =
  | "CANDIDATE"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PROMOTED";

/** A candidate knowledge entry that emerged from repeated firm-memory patterns. */
export type KnowledgeCandidateDTO = {
  id: string;
  organizationId: string | null;
  candidatePhrase: string;
  canonicalAccountId: string;
  canonicalCode: string;
  category: string;
  supportCount: number;
  organizationCount: number;
  confidence: number;
  status: KnowledgeCandidateStatus;
  source: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  evidenceCount?: number;
  promotionCount?: number;
};

/** Aggregated pattern from raw TBMappingFeedback / TBMappingPattern / TBClassificationHistory. */
export type AggregatedPattern = {
  /** The normalised account phrase that was consistently mapped. */
  phrase: string;
  /** The canonical COA code it maps to. */
  canonicalCode: string;
  /** The canonical account category. */
  category: string;
  /** How many distinct feedback/pattern records support this. */
  supportCount: number;
  /** How many distinct organizations. */
  organizationCount: number;
  /** Total confidence across all supporting evidence. */
  aggregateConfidence: number;
  /** Sample source records (IDs) for traceability. */
  evidenceSample: Array<{
    evidenceType: "feedback" | "pattern" | "history";
    evidenceId: string;
    organizationId: string;
    accountCode: string;
    accountName: string | null;
  }>;
};

/** Input to the pattern aggregation job. */
export type AggregationInput = {
  /** Minimum support count to qualify as a candidate. */
  minSupportCount?: number;
  /** Minimum distinct organizations. */
  minOrganizationCount?: number;
  /** If set, only aggregate for this organization. */
  organizationId?: string;
  /** Confidence threshold (0-1). */
  minConfidence?: number;
};

/** Review decision for a candidate. */
export type ReviewDecision = {
  candidateId: string;
  reviewerId: string;
  decision: "APPROVED" | "REJECTED";
  notes?: string;
};

/** Input for promotion action. artifactPath is generated during promotion, not supplied. */
export type PromotionInput = {
  candidateId: string;
  promotedBy: string;
  artifactType: "candidate-synonyms" | "candidate-rule-pack";
  notes?: string;
};

/** Result of promotion action. */
export type PromotionResult = {
  success: boolean;
  artifactPath: string;
  error?: string;
};

/** KPIs for the knowledge mining pipeline. */
export type KnowledgeMiningKPIs = {
  measuredAt: string;
  totalCandidates: number;
  byStatus: Record<KnowledgeCandidateStatus, number>;
  approvalRate: number | null;
  promotionRate: number | null;
  totalEvidenceRecords: number;
  topEmergingPatterns: Array<{
    phrase: string;
    canonicalCode: string;
    supportCount: number;
    confidence: number;
  }>;
  knowledgeCoverage: number | null;
};

export const KNOWLEDGE_CANDIDATE_LABELS: Record<KnowledgeCandidateStatus, string> = {
  CANDIDATE: "Candidate",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PROMOTED: "Promoted",
};
