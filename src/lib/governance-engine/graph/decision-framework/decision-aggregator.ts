// ENG-001F: Decision Framework — Aggregator
//
// Combines all 4 engine outputs into a single DecisionRecommendation.
//
// DR-01: Consumes only ValidationSummary + GraphStatistics +
//        ReadinessResult + SuitabilityResult.
// DR-02: Produces a recommendation, never executes actions.
// DR-03: Every conclusion cites specific evidence.
// DR-04: Always includes confidence.
//
// Pure function — no I/O, no mutation, no side effects.

import type {
  DecisionRecommendation,
  DecisionInput,
  EvidenceItem,
  RecommendationLevel,
} from './decision-framework-types';
import type { ValidationSummary } from '../validation/types/validation-issues';
import type { GraphStatistics } from '../statistics/types/statistics-types';
import type { ReadinessResult } from '../readiness/types/readiness-types';
import type { SuitabilityResult } from '../suitability/suitability-types';

// ---------------------------------------------------------------------------
// Confidence Calculation
// ---------------------------------------------------------------------------

/**
 * Compute recommendation confidence (0.0 – 1.0).
 *
 * Confidence is INDEPENDENT of suitability. It reflects:
 *   - Input completeness: did all sources produce meaningful data?
 *   - Measurement reliability: larger graphs yield more reliable statistics.
 *   - Governance quality: higher readiness → better governed data.
 *
 * Maximum possible: 1.0
 *   - Input completeness: 0.3 (all inputs have data)
 *   - Graph measurement quality: 0.3 (based on node count)
 *   - Governance quality: 0.4 (based on readiness overall score)
 */
function computeConfidence(
  validationSummary: ValidationSummary,
  graphStatistics: GraphStatistics,
  readinessResult: ReadinessResult,
): number {
  let confidence = 0;

  // ------------------------------------------------------------------
  // 1. Input completeness (max 0.3)
  // ------------------------------------------------------------------
  const hasValidation = validationSummary.totalIssues >= 0; // always true if present
  const hasReadiness = readinessResult.overallScore >= 0; // always true if present
  const hasNodeCount = graphStatistics.topology.nodeCount > 0;

  let completeness = 0;
  if (hasValidation) completeness += 0.1;
  if (hasReadiness) completeness += 0.1;
  if (hasNodeCount) completeness += 0.1;
  confidence += completeness;

  // ------------------------------------------------------------------
  // 2. Graph measurement quality (max 0.3)
  //    More nodes → more reliable statistics
  // ------------------------------------------------------------------
  const { nodeCount } = graphStatistics.topology;
  if (nodeCount >= 200) {
    confidence += 0.3;
  } else if (nodeCount >= 100) {
    confidence += 0.25;
  } else if (nodeCount >= 50) {
    confidence += 0.2;
  } else if (nodeCount >= 20) {
    confidence += 0.15;
  } else if (nodeCount >= 10) {
    confidence += 0.1;
  } else if (nodeCount > 0) {
    confidence += 0.05;
  }

  // ------------------------------------------------------------------
  // 3. Governance quality (max 0.4)
  //    Higher readiness → better-governed → more reliable data
  // ------------------------------------------------------------------
  const { overallScore } = readinessResult;
  if (overallScore >= 80) {
    confidence += 0.4;
  } else if (overallScore >= 60) {
    confidence += 0.35;
  } else if (overallScore >= 40) {
    confidence += 0.25;
  } else if (overallScore >= 20) {
    confidence += 0.15;
  } else if (overallScore > 0) {
    confidence += 0.05;
  }

  return Math.round(Math.min(1, Math.max(0, confidence)) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Recommendation Level Mapping
// ---------------------------------------------------------------------------

/**
 * Determine the recommendation level from suitability and confidence.
 *
 * Mapping rationale:
 *
 *   HIGH suitability + strong confidence → RECOMMEND
 *     Clear architectural fit with reliable data.
 *
 *   HIGH suitability + limited confidence → CONSIDER
 *     Strong architectural signs but data limitations warrant caution.
 *
 *   MEDIUM suitability + strong confidence → CONSIDER
 *     Moderate fit confirmed by reliable data — warrants evaluation.
 *
 *   MEDIUM suitability + limited confidence → MONITOR
 *     Uncertain; keep observing as governance data matures.
 *
 *   LOW suitability + strong confidence → NO_ACTION
 *     Confidently not suitable for graph-capable architecture.
 *
 *   LOW suitability + limited confidence → MONITOR
 *     Current data is insufficient; may change with more information.
 */
function determineRecommendation(
  architecturalFit: 'LOW' | 'MEDIUM' | 'HIGH',
  confidence: number,
): RecommendationLevel {
  const HIGH_CONFIDENCE = 0.6;

  switch (architecturalFit) {
    case 'HIGH':
      return confidence >= HIGH_CONFIDENCE ? 'RECOMMEND' : 'CONSIDER';

    case 'MEDIUM':
      return confidence >= HIGH_CONFIDENCE ? 'CONSIDER' : 'MONITOR';

    case 'LOW':
    default:
      return confidence >= HIGH_CONFIDENCE ? 'NO_ACTION' : 'MONITOR';
  }
}

// ---------------------------------------------------------------------------
// Evidence Construction
// ---------------------------------------------------------------------------

/**
 * Build the supportingEvidence array from all 4 engine outputs.
 * Every source engine contributes at least one evidence item (DR-03).
 */
function buildEvidence(
  validationSummary: ValidationSummary,
  graphStatistics: GraphStatistics,
  readinessResult: ReadinessResult,
  suitabilityResult: SuitabilityResult,
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  // ValidationSummary
  evidence.push({
    source: 'ValidationSummary',
    key: 'totalIssues',
    value: validationSummary.totalIssues,
    role: `Governance issue count — ${validationSummary.totalIssues > 0 ? 'indicates governance gaps that graph architecture may help resolve' : 'no governance issues detected'}`,
  });

  // GraphStatistics — topology
  evidence.push({
    source: 'GraphStatistics',
    key: 'nodeCount',
    value: graphStatistics.topology.nodeCount,
    role: 'Entity scale — larger graphs benefit more from graph-capable architecture',
  });

  evidence.push({
    source: 'GraphStatistics',
    key: 'edgeCount',
    value: graphStatistics.topology.edgeCount,
    role: 'Relationship volume — measures interconnection complexity',
  });

  evidence.push({
    source: 'GraphStatistics',
    key: 'cycleCount',
    value: graphStatistics.structural.cycleCount,
    role: 'Structural cycles — cycles break relational tree assumptions',
  });

  // ReadinessResult
  evidence.push({
    source: 'ReadinessResult',
    key: 'overallScore',
    value: readinessResult.overallScore,
    role: 'Overall governance readiness — higher scores indicate better-governed data',
  });

  evidence.push({
    source: 'ReadinessResult',
    key: 'integrity',
    value: readinessResult.dimensions.integrity.score,
    role: 'Data integrity — low integrity supports need for graph-driven traceability',
  });

  // SuitabilityResult
  evidence.push({
    source: 'SuitabilityResult',
    key: 'architecturalFit',
    value: suitabilityResult.architecturalFit,
    role: 'Overall architectural fit assessment for graph-capable architecture',
  });

  evidence.push({
    source: 'SuitabilityResult',
    key: 'suitabilityScore',
    value: suitabilityResult.overallScore,
    role: 'Quantified architectural fit score (0-100)',
  });

  return evidence;
}

// ---------------------------------------------------------------------------
// Assumptions
// ---------------------------------------------------------------------------

/**
 * Inherent assumptions of the governance analysis pipeline.
 *
 * These are surfaced so human reviewers can evaluate their validity
 * in the context of their specific deployment.
 */
function buildAssumptions(
  validationSummary: ValidationSummary,
  graphStatistics: GraphStatistics,
): string[] {
  const assumptions: string[] = [
    'The extracted registries represent the complete governance landscape.',
    'Validation rules correctly identify governance gaps relevant to the organization.',
    'Graph statistics accurately reflect structural characteristics of the governance model.',
    'Suitability assesses architectural characteristics only, not technology/product suitability.',
  ];

  if (graphStatistics.topology.nodeCount < 20) {
    assumptions.push(
      'Small graph size (< 20 nodes) limits statistical reliability of measurements.',
    );
  }

  if (validationSummary.totalIssues === 0) {
    assumptions.push(
      'Zero validation issues may indicate incomplete coverage rather than perfect governance.',
    );
  }

  return assumptions;
}

// ---------------------------------------------------------------------------
// Rationale Builder
// ---------------------------------------------------------------------------

/**
 * Build the human-readable rationale for the recommendation.
 */
function buildRationale(
  recommendation: RecommendationLevel,
  architecturalFit: 'LOW' | 'MEDIUM' | 'HIGH',
  confidence: number,
  nodeCount: number,
  readinessScore: number,
): string {
  const fitLabel: Record<string, string> = {
    LOW: 'the current governance graph does not exhibit strong characteristics',
    MEDIUM: 'the governance graph shows moderate architectural characteristics',
    HIGH: 'the governance graph exhibits strong architectural characteristics',
  };

  const confidenceLabel =
    confidence >= 0.6
      ? 'high confidence'
      : confidence >= 0.3
        ? 'moderate confidence'
        : 'limited confidence';

  const lines: string[] = [
    `Recommendation: ${recommendation}`,
    '',
    `Based on analysis of ${nodeCount} governance entities with overall readiness ${readinessScore}/100,`,
    `${fitLabel[architecturalFit]} (${confidenceLabel}, score: ${confidence.toFixed(2)}).`,
    '',
  ];

  switch (recommendation) {
    case 'RECOMMEND':
      lines.push(
        'The architectural characteristics strongly justify evaluating graph-capable storage.',
        'An Architecture Decision Record should be initiated to formally assess options.',
      );
      break;
    case 'CONSIDER':
      lines.push(
        'Architectural characteristics warrant consideration of graph-capable architecture.',
        'Further analysis or data maturation may be needed before committing to ADR.',
      );
      break;
    case 'MONITOR':
      lines.push(
        'Current characteristics do not strongly justify graph-capable architecture.',
        'The governance graph should be monitored as it evolves; re-evaluate when',
        'entity count, structural complexity, or governance maturity increases.',
      );
      break;
    case 'NO_ACTION':
      lines.push(
        'Current governance characteristics do not justify graph-capable architecture.',
        'No action is recommended at this time.',
      );
      break;
  }

  lines.push(
    '',
    'Note: This recommendation assesses architectural characteristics only.',
    'It does NOT recommend specific technologies, databases, or products.',
    'Technology decisions belong to the ADR process, not this analysis.',
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Next Action Builder
// ---------------------------------------------------------------------------

function buildNextAction(recommendation: RecommendationLevel): string {
  switch (recommendation) {
    case 'RECOMMEND':
      return 'Create an Architecture Decision Record to evaluate graph-capable storage options for the governance model.';
    case 'CONSIDER':
      return 'Schedule a technical review to evaluate whether graph-capable architecture should be further analyzed.';
    case 'MONITOR':
      return 'Continue monitoring governance graph evolution. Re-run this assessment when the entity count grows by 50% or significant structural changes occur.';
    case 'NO_ACTION':
    default:
      return 'No action required at this time. Re-assess when the governance model undergoes significant expansion.';
  }
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Compute a Decision Recommendation from all 4 governance engine outputs.
 *
 * This is the single entry point for ENG-001F.
 *
 * Input:  ValidationSummary + GraphStatistics + ReadinessResult + SuitabilityResult
 * Output: DecisionRecommendation — human-reviewable, evidence-backed, confidence-scored.
 *
 * Deterministic: same inputs → same recommendation.
 * Explainable: every conclusion cites specific evidence (DR-03).
 * Confident: every recommendation includes confidence (DR-04).
 */
export function produceRecommendation(input: DecisionInput): DecisionRecommendation {
  const { validationSummary, graphStatistics, readinessResult, suitabilityResult } = input;

  // Step 1: Compute confidence (independent of suitability)
  const confidence = computeConfidence(validationSummary, graphStatistics, readinessResult);

  // Step 2: Determine recommendation level from suitability + confidence
  const architecturalFit = suitabilityResult.architecturalFit;
  const recommendation = determineRecommendation(architecturalFit, confidence);

  // Step 3: Build supporting evidence
  const supportingEvidence = buildEvidence(
    validationSummary,
    graphStatistics,
    readinessResult,
    suitabilityResult,
  );

  // Step 4: Surface assumptions
  const assumptions = buildAssumptions(validationSummary, graphStatistics);

  // Step 5: Build rationale
  const rationale = buildRationale(
    recommendation,
    architecturalFit,
    confidence,
    graphStatistics.topology.nodeCount,
    readinessResult.overallScore,
  );

  // Step 6: Determine ADR requirement
  const adrRequired = recommendation === 'RECOMMEND' || recommendation === 'CONSIDER';

  // Step 7: Build next action
  const nextAction = buildNextAction(recommendation);

  return {
    recommendationLevel: recommendation,
    rationale,
    supportingEvidence,
    confidence,
    assumptions,
    nextAction,
    adrRequired,
    version: '1.0',
  };
}
