/**
 * Phase 8 — Knowledge Foundation Feedback Loop.
 *
 * Public API for the knowledge mining pipeline.
 *
 * Pipeline:
 *   TBMappingFeedback + TBMappingPattern + TBClassificationHistory
 *        ↓
 *   PatternAggregator (cross-org dedup)
 *        ↓
 *   CandidateRuleGenerator (creates KnowledgeCandidate records)
 *        ↓
 *   KnowledgeCandidateService (CRUD)
 *        ↓
 *   ReviewWorkflow (CANDIDATE → UNDER_REVIEW → APPROVED/REJECTED)
 *        ↓
 *   PromotionService (APPROVED → PROMOTED + candidate artifact)
 *        ↓
 *   Human Merge (into synonyms.ts / production rules)
 */

export { aggregatePatterns } from "./pattern-aggregator";
export type { AggregatedPattern, AggregationInput } from "./types";

export {
  generateCandidatesFromPatterns,
  runFullMiningPipeline,
} from "./candidate-rule-generator";
export type { GenerateCandidatesInput, GenerateCandidatesResult } from "./candidate-rule-generator";

export {
  listCandidates,
  getCandidate,
  deleteCandidate,
} from "./knowledge-candidate-service";
export type {
  CandidateFilter,
  CandidateListResult,
} from "./knowledge-candidate-service";
export type { KnowledgeCandidateDTO } from "./types";

export {
  applyReviewDecision,
  submitForReview,
  getPendingReviewCandidates,
} from "./review-workflow";
export type { ReviewResult } from "./review-workflow";

export {
  promoteCandidates,
  batchPromoteCandidates,
} from "./promotion-service";
export type { PromotionResult } from "./types";
export { getKnowledgeMiningKPIs } from "./kpis";

export { KNOWLEDGE_CANDIDATE_LABELS } from "./types";
