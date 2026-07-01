// ENG-001F: Decision Framework — Data Contract
//
// DR-01 — Decision consumes. Decision never measures.
//   The Decision Framework reads all 4 engine outputs. It does NOT
//   recalculate any metrics, run validators, or analyze raw data.
//
// DR-02 — Decision recommends. Decision never executes.
//   Output is a human-reviewable recommendation. No automated actions,
//   no ADR generation, no pipeline mutations.
//
// DR-03 — Every recommendation must cite evidence.
//   The supportingEvidence array links each conclusion to a specific
//   engine output metric with its source.
//
// DR-04 — No recommendation without confidence.
//   Every recommendation includes a confidence score (0-1) that is
//   independent of the suitability assessment. Confidence reflects
//   data completeness and quality.
//
// Pure types — no I/O, no mutation, no side effects.
//
// AI-assisted. Humans decide. Evidence governs.

import type { ValidationSummary } from '../validation/types/validation-issues';
import type { GraphStatistics } from '../statistics/types/statistics-types';
import type { ReadinessResult } from '../readiness/types/readiness-types';
import type { SuitabilityResult } from '../suitability/suitability-types';

// ---------------------------------------------------------------------------
// Recommendation Level
// ---------------------------------------------------------------------------

/**
 * Action recommendation levels.
 *
 * Ordered from least to most assertive:
 *   NO_ACTION  → Do not pursue graph-capable architecture at this time.
 *   MONITOR    → Keep observing; re-evaluate when governance data matures.
 *   CONSIDER   → Evaluate graph-capable architecture in upcoming planning.
 *   RECOMMEND  → Proceed with ADR for graph-capable storage evaluation.
 */
export type RecommendationLevel = 'NO_ACTION' | 'MONITOR' | 'CONSIDER' | 'RECOMMEND';

// ---------------------------------------------------------------------------
// Supporting Evidence
// ---------------------------------------------------------------------------

/**
 * A single evidence item linking a recommendation conclusion to
 * a specific, measurable engine output.
 */
export interface EvidenceItem {
  /** Source engine that produced this metric */
  source: 'ValidationSummary' | 'GraphStatistics' | 'ReadinessResult' | 'SuitabilityResult';
  /** Metric key (e.g., "totalIssues", "nodeCount", "architecturalFit") */
  key: string;
  /** Actual value from the engine output */
  value: string | number | boolean;
  /** What this evidence supports in the recommendation */
  role: string;
}

// ---------------------------------------------------------------------------
// Decision Recommendation
// ---------------------------------------------------------------------------

/**
 * A human-reviewable recommendation about graph-capable architecture.
 *
 * This is NOT a decision. It is a defensible recommendation
 * that a human reviewer can approve, reject, or modify.
 */
export interface DecisionRecommendation {
  /** Action level: NO_ACTION | MONITOR | CONSIDER | RECOMMEND */
  recommendationLevel: RecommendationLevel;

  /**
   * Human-readable rationale synthesizing all 4 engine outputs.
   * Explains why this recommendation was chosen.
   */
  rationale: string;

  /**
   * Specific, measurable evidence items supporting the recommendation.
   * Every source engine must contribute at least one evidence item.
   */
  supportingEvidence: EvidenceItem[];

  /**
   * Confidence in the recommendation (0.0 – 1.0).
   *
   * Independent of suitability. Based on:
   *   - Pipeline completeness (all stages succeeded)
   *   - Data volume (more nodes/edges = more reliable)
   *   - Governance quality (readiness scores)
   */
  confidence: number;

  /**
   * Inherent assumptions underlying this analysis.
   * Every recommendation must surface its assumptions so reviewers
   * can evaluate their validity.
   */
  assumptions: string[];

  /**
   * Recommended next action for the human reviewer/team.
   * Concrete, actionable, and appropriate to the recommendation level.
   */
  nextAction: string;

  /**
   * Whether an Architecture Decision Record should be created.
   *
   * TRUE:  The characteristics justify formal ADR review.
   * FALSE: Current state does not warrant ADR overhead.
   *
   * ADR generation is the responsibility of the CLI or human operator,
   * NOT the Decision Framework (DR-02).
   */
  adrRequired: boolean;

  /** Contract version for future extensibility */
  version: '1.0';
}

// ---------------------------------------------------------------------------
// Decision Framework Input
// ---------------------------------------------------------------------------

/**
 * Complete input to the Decision Framework.
 *
 * DR-01: ALL 4 engine outputs. Nothing else.
 * Decision does not access raw registries, Markdown files,
 * or any source data.
 */
export interface DecisionInput {
  validationSummary: ValidationSummary;
  graphStatistics: GraphStatistics;
  readinessResult: ReadinessResult;
  suitabilityResult: SuitabilityResult;
}

// ---------------------------------------------------------------------------
// Pipeline Stage Data — Executor Input
// ---------------------------------------------------------------------------

/**
 * The subset of pipeline state that the Decision Framework executor receives.
 * This wraps all previous stage outputs into a single input.
 */
export interface DecisionExecutorInput {
  validationSummary: ValidationSummary | null;
  graphStatistics: GraphStatistics | null;
  readinessResult: ReadinessResult | null;
  suitabilityResult: SuitabilityResult | null;
}
