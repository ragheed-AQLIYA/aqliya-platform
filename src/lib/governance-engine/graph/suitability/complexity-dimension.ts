// ENG-001E: Complexity Dimension
//
// Measures structural irregularity — features that make a governance
// graph architecturally challenging beyond simple hierarchy:
//   - Cycles:  hard to model in relational (recursive CTEs).
//   - Duplicate edges: multiple relationship types between same entities.
//   - Density-adjusted edge multiplicity: non-trivial edge patterns.
//
// SR-03: Every point attributable to GraphStatistics.structural.
// SR-04: No metric recalculation.
//
// Pure function — no I/O, no mutation, no side effects.

import type { SuitabilityDimension } from './suitability-types';
import { SUITABILITY_WEIGHTS } from './suitability-types';
import type { GraphStatistics } from '../statistics/types/statistics-types';

/**
 * Score the complexity dimension.
 *
 * Scoring rationale:
 *   - cycleCount: cycles break tree assumptions — graph handles them natively.
 *   - duplicateEdges: multiple edge types between same entity pair →
 *     junction tables in relational, natural in graph.
 *   - isolatedRatio: fewer orphans means more of the graph is structurally
 *     connected, increasing complexity.
 */
export function scoreComplexity(stats: GraphStatistics): SuitabilityDimension {
  const weight = SUITABILITY_WEIGHTS.complexity;
  const { cycleCount, isolatedNodes, duplicateEdges } = stats.structural;
  const { nodeCount, avgDegree } = stats.topology;

  const details: string[] = [];
  let score = 0;

  const isolatedRatio = nodeCount > 0 ? isolatedNodes / nodeCount : 0;

  // ------------------------------------------------------------------
  // cycleCount: presence of directed cycles
  // ------------------------------------------------------------------
  if (cycleCount >= 5) {
    score += 40;
    details.push(`${cycleCount} cycles (many circular dependencies: +40)`);
  } else if (cycleCount >= 3) {
    score += 35;
    details.push(`${cycleCount} cycles (significant cycles: +35)`);
  } else if (cycleCount >= 1) {
    score += 25;
    details.push(`${cycleCount} cycle(s) (non-trivial: +25)`);
  } else {
    details.push('No cycles detected (tree-like structure: +0)');
  }

  // ------------------------------------------------------------------
  // duplicateEdges: multiple edge types between same entities
  // ------------------------------------------------------------------
  if (duplicateEdges >= 5) {
    score += 30;
    details.push(`${duplicateEdges} duplicate edges (many multi-type relationships: +30)`);
  } else if (duplicateEdges >= 2) {
    score += 20;
    details.push(`${duplicateEdges} duplicate edges (some multi-type relationships: +20)`);
  } else if (duplicateEdges >= 1) {
    score += 10;
    details.push(`${duplicateEdges} duplicate edge(s) (+10)`);
  } else {
    details.push('No duplicate edges (each pair has single relationship type: +0)`');
  }

  // ------------------------------------------------------------------
  // avgDegree complexity multiplier — high degree with cycles = very complex
  // ------------------------------------------------------------------
  if (avgDegree >= 4 && cycleCount > 0) {
    score += 20;
    details.push(`High degree (${avgDegree.toFixed(1)}) with cycles — structurally complex: +20`);
  } else if (avgDegree >= 4) {
    score += 10;
    details.push(`High degree (${avgDegree.toFixed(1)}) — dense relationships: +10`);
  } else if (avgDegree >= 2 && cycleCount > 0) {
    score += 10;
    details.push(`Moderate degree (${avgDegree.toFixed(1)}) with cycles: +10`);
  }

  // ------------------------------------------------------------------
  // isolatedRatio: structurally disconnected nodes
  //   Low isolation = well-connected = more structural complexity
  // ------------------------------------------------------------------
  if (isolatedRatio <= 0.05 && nodeCount >= 10) {
    score += 10;
    details.push(`${(isolatedRatio * 100).toFixed(0)}% isolated nodes (well-integrated: +10)`);
  } else if (isolatedRatio <= 0.2) {
    score += 5;
    details.push(`${(isolatedRatio * 100).toFixed(0)}% isolated nodes (+5)`);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  const explanation = buildComplexityExplanation(finalScore, weight, details);

  return {
    score: finalScore,
    weight,
    maxScore: weight,
    explanation,
  };
}

function buildComplexityExplanation(
  score: number,
  weight: number,
  details: string[],
): string {
  const contribution = Math.round((score / 100) * weight * 100) / 100;

  const lines: string[] = [
    `Complexity: ${score} / 100`,
    `Weight: ${weight}%`,
    '',
    'Evaluates structural irregularity — cycles, multiplicity, and integration.',
    score >= 70
      ? 'High structural complexity strongly justifies graph-capable architecture.'
      : score >= 40
        ? 'Moderate complexity — graph capability may simplify data modeling.'
        : 'Low complexity — relational model can likely represent the structure.',
    '',
    'Contributors:',
    ...details.map((d) => `  - ${d}`),
    '',
    `Weighted contribution: ${contribution} / ${weight}`,
  ];

  return lines.join('\n');
}
