// ENG-001D: Readiness Score Aggregator
//
// Combines all 4 dimensions into a single ReadinessResult.
// RR-01: Reads ONLY ValidationSummary + GraphStatistics.
// RR-03: Deterministic — same inputs → same result.
//
// Pure function — no I/O, no mutation, no side effects.

import type { ReadinessResult, ReadinessInput } from './types/readiness-types';
import { calculateIntegrity } from './dimensions/integrity';
import { calculateCompleteness } from './dimensions/completeness';
import { calculateConnectivity } from './dimensions/connectivity';
import { calculateTraceability } from './dimensions/traceability';

/**
 * Compute the Readiness Score from validation and statistics.
 *
 * Input:  ValidationSummary + GraphStatistics  (RR-01)
 * Output: ReadinessResult with per-dimension breakdown
 *
 * Deterministic: same inputs → same result (RR-03)
 * Explainable: every point attributable (RR-04 / DEC-2026-0029)
 */
export function computeReadiness(input: ReadinessInput): ReadinessResult {
  const { validationSummary, graphStatistics } = input;

  // Calculate each dimension independently
  const integrity = calculateIntegrity(validationSummary);
  const completeness = calculateCompleteness(graphStatistics);
  const connectivity = calculateConnectivity(graphStatistics);
  const traceability = calculateTraceability(validationSummary, graphStatistics);

  // Weighted sum: (score / 100) * weight for each dimension
  const overallScore =
    (integrity.score / 100) * integrity.weight +
    (completeness.score / 100) * completeness.weight +
    (connectivity.score / 100) * connectivity.weight +
    (traceability.score / 100) * traceability.weight;

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    dimensions: {
      integrity,
      completeness,
      connectivity,
      traceability,
    },
    sources: {
      validationSummaryVersion: validationSummary.validatedAt,
      graphStatisticsVersion: '',
    },
    version: '1.0',
  };
}
