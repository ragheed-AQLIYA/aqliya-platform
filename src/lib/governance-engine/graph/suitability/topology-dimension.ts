// ENG-001E: Topology Dimension
//
// Measures the breadth and scale of entity relationships.
// A rich topology (many nodes with meaningful connectivity) justifies
// graph-capable architecture over simple relational hierarchies.
//
// SR-03: Every point attributable to GraphStatistics.topology.
// SR-04: No metric recalculation — consumes ENG-001C output only.
//
// Pure function — no I/O, no mutation, no side effects.

import type { SuitabilityDimension, SuitabilitySources } from './suitability-types';
import { SUITABILITY_WEIGHTS } from './suitability-types';
import type { GraphStatistics } from '../statistics/types/statistics-types';

/**
 * Score the topology dimension.
 *
 * Scoring rationale:
 *   - nodeCount: more entities → richer interconnection surface.
 *   - avgDegree: higher average connectivity → graph traversal value.
 *   - graphDensity: moderate density (0.01–0.3) is the sweet spot
 *     where relational joins become complex but graph queries excel.
 *   - edgeCount: absolute edge volume confirms non-trivial connectivity.
 */
export function scoreTopology(stats: GraphStatistics): SuitabilityDimension {
  const weight = SUITABILITY_WEIGHTS.topology;
  const { nodeCount, edgeCount, avgDegree, graphDensity } = stats.topology;

  const details: string[] = [];
  let score = 0;

  // ------------------------------------------------------------------
  // nodeCount: entity scale
  // ------------------------------------------------------------------
  if (nodeCount >= 100) {
    score += 25;
    details.push(`${nodeCount} entities (large scale: +25)`);
  } else if (nodeCount >= 50) {
    score += 20;
    details.push(`${nodeCount} entities (medium-large scale: +20)`);
  } else if (nodeCount >= 20) {
    score += 15;
    details.push(`${nodeCount} entities (moderate scale: +15)`);
  } else if (nodeCount >= 10) {
    score += 10;
    details.push(`${nodeCount} entities (small scale: +10)`);
  } else {
    score += 5;
    details.push(`${nodeCount} entities (minimal scale: +5)`);
  }

  // ------------------------------------------------------------------
  // avgDegree: interconnection density per node
  // ------------------------------------------------------------------
  if (avgDegree >= 5) {
    score += 30;
    details.push(`avgDegree ${avgDegree.toFixed(1)} (highly interconnected: +30)`);
  } else if (avgDegree >= 3) {
    score += 25;
    details.push(`avgDegree ${avgDegree.toFixed(1)} (well interconnected: +25)`);
  } else if (avgDegree >= 1.5) {
    score += 15;
    details.push(`avgDegree ${avgDegree.toFixed(1)} (moderate connections: +15)`);
  } else {
    score += 5;
    details.push(`avgDegree ${avgDegree.toFixed(1)} (sparse connections: +5)`);
  }

  // ------------------------------------------------------------------
  // graphDensity: global connectivity sweet spot
  // ------------------------------------------------------------------
  if (graphDensity >= 0.01 && graphDensity <= 0.3) {
    score += 30;
    details.push(`Density ${graphDensity.toFixed(4)} (sweet spot for graph capability: +30)`);
  } else if (graphDensity > 0.3 && graphDensity <= 0.6) {
    score += 20;
    details.push(`Density ${graphDensity.toFixed(4)} (relatively dense: +20)`);
  } else if (graphDensity > 0.001 && graphDensity < 0.01) {
    score += 15;
    details.push(`Density ${graphDensity.toFixed(4)} (sparse graph: +15)`);
  } else {
    details.push(`Density ${graphDensity.toFixed(4)} (extreme density: no bonus)`);
  }

  // ------------------------------------------------------------------
  // edgeCount: absolute edge volume bonus
  // ------------------------------------------------------------------
  if (edgeCount >= 500) {
    score += 15;
    details.push(`${edgeCount} edges (high volume: +15)`);
  } else if (edgeCount >= 100) {
    score += 10;
    details.push(`${edgeCount} edges (moderate volume: +10)`);
  } else if (edgeCount >= 30) {
    score += 5;
    details.push(`${edgeCount} edges (notable volume: +5)`);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  const explanation = buildTopologyExplanation(finalScore, weight, details);

  return {
    score: finalScore,
    weight,
    maxScore: weight,
    explanation,
  };
}

function buildTopologyExplanation(
  score: number,
  weight: number,
  details: string[],
): string {
  const contribution = Math.round((score / 100) * weight * 100) / 100;

  const lines: string[] = [
    `Topology: ${score} / 100`,
    `Weight: ${weight}%`,
    '',
    'Evaluates entity scale and interconnection richness.',
    score >= 70
      ? 'Rich topology justifies graph-capable architecture.'
      : score >= 40
        ? 'Moderate topology — graph capability may add value.'
        : 'Limited topology — graph capability provides marginal benefit.',
    '',
    'Contributors:',
    ...details.map((d) => `  - ${d}`),
    '',
    `Weighted contribution: ${contribution} / ${weight}`,
  ];

  return lines.join('\n');
}
