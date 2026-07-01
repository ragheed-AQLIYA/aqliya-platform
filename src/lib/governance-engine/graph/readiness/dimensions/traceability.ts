// ENG-001D: Traceability Dimension
//
// Measures evidence traceability through chain and traversal analysis.
// Weight: 25%
//
// Scoring:
//   Base: 100
//   Chain error penalties:
//     CHN-001 (broken chain): -15 each
//     CHN-002 (circular chain): -10 each
//   Depth bonus (from traversal):
//     maxDepth >= 5:  +15
//     maxDepth >= 3:  +10
//     maxDepth >= 1:   +5
//     maxDepth = 0:     0
//   Orphan penalty (from connectivity):
//     orphanNodes > 0:  -5  (traceability requires all nodes reachable)
//   Ceiling: 100, Floor: 0
//
// Pure function — no I/O, no mutation, no side effects.

import type { ReadinessDimension } from '../types/readiness-types';
import { READINESS_WEIGHTS } from '../types/readiness-types';
import type { ValidationSummary } from '../../validation/types/validation-issues';
import type { GraphStatistics } from '../../statistics/types/statistics-types';
import { VALIDATION_CODES } from '../../validation/types/validation-issues';
import { buildExplanation } from '../explanation';

export function calculateTraceability(
  validationSummary: ValidationSummary,
  graphStatistics: GraphStatistics,
): ReadinessDimension {
  const weight = READINESS_WEIGHTS.traceability;
  const { traversal, connectivity, structural } = graphStatistics;
  const details: string[] = [];

  // Base score
  let score = 100;

  // Chain error penalties
  const brokenChains = validationSummary.byCode[VALIDATION_CODES.CHAIN_BROKEN] || 0;
  const circularChains = validationSummary.byCode[VALIDATION_CODES.CHAIN_CIRCULAR] || 0;

  if (brokenChains > 0) {
    const penalty = Math.min(50, brokenChains * 15);
    score -= penalty;
    details.push(`${brokenChains} broken chain(s) (-${penalty})`);
  }

  if (circularChains > 0) {
    const penalty = Math.min(40, circularChains * 10);
    score -= penalty;
    details.push(`${circularChains} circular chain(s) (-${penalty})`);
  }

  // Depth bonus from traversal
  if (traversal.maxDepth >= 5) {
    score += 15;
    details.push(`Max depth ${traversal.maxDepth} (+15 bonus)`);
  } else if (traversal.maxDepth >= 3) {
    score += 10;
    details.push(`Max depth ${traversal.maxDepth} (+10 bonus)`);
  } else if (traversal.maxDepth >= 1) {
    score += 5;
    details.push(`Max depth ${traversal.maxDepth} (+5 bonus)`);
  } else {
    details.push('No traversal depth (maxDepth = 0)');
  }

  // Orphan penalty
  if (connectivity.orphanNodes > 0) {
    score -= 5;
    details.push(`${connectivity.orphanNodes} orphan(s) (-5)`);
  }

  // Cycle transparency
  // Cycles don't inherently reduce traceability (they may be intentional)
  // but we note them for transparency
  if (structural.cycleCount > 0) {
    details.push(`${structural.cycleCount} cycle(s) detected (informational)`);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score * 100) / 100));

  const explanation = buildExplanation({
    label: 'Traceability',
    score: finalScore,
    weight,
    passed: brokenChains === 0 && circularChains === 0,
    details: details.length > 0 ? details : ['No traceability issues.'],
    summary:
      brokenChains === 0 && circularChains === 0
        ? 'All evidence chains intact.'
        : `${brokenChains} broken chain(s), ${circularChains} circular chain(s).`,
  });

  return {
    score: finalScore,
    weight,
    maxScore: weight,
    explanation,
  };
}
