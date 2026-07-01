// ENG-001D: Connectivity Dimension
//
// Measures how well-connected the entity graph is.
// Weight: 20%
//
// Scoring:
//   Component score: 100 * (1 - (components - 1) / max(1, nodes))
//     — 1 component = 100, more components = lower score
//   Isolated/orphan score: 100 * (1 - orphanNodes / max(1, nodes))
//     — 0 orphans = 100, more orphans = lower score
//   Largest component bonus: +5 if largestComponentSize / nodes > 0.8
//   Final = avg(component_score, orphan_score) + bonus
//   Ceiling: 100, Floor: 0
//
// Pure function — no I/O, no mutation, no side effects.

import type { ReadinessDimension } from '../types/readiness-types';
import { READINESS_WEIGHTS } from '../types/readiness-types';
import type { GraphStatistics } from '../../statistics/types/statistics-types';
import { buildExplanation } from '../explanation';

export function calculateConnectivity(
  graphStatistics: GraphStatistics,
): ReadinessDimension {
  const weight = READINESS_WEIGHTS.connectivity;
  const { topology, connectivity: conn } = graphStatistics;
  const totalNodes = topology.nodeCount;
  const details: string[] = [];

  if (totalNodes === 0) {
    const explanation = buildExplanation({
      label: 'Connectivity',
      score: 100,
      weight,
      passed: true,
      details: ['Empty graph — no connectivity issues.'],
      summary: 'No entities to evaluate.',
    });

    return { score: 100, weight, maxScore: weight, explanation };
  }

  // Component score: more components = less connected
  const componentScore =
    conn.connectedComponents <= 1
      ? 100
      : Math.max(0, Math.round(
          100 * (1 - (conn.connectedComponents - 1) / Math.max(1, totalNodes)) * 100,
        ) / 100);

  if (conn.connectedComponents > 1) {
    details.push(
      `${conn.connectedComponents} component(s) → component score ${componentScore}`,
    );
  } else {
    details.push('Single connected component (+100)');
  }

  // Orphan score: fewer orphans = more connected
  const orphanScore =
    conn.orphanNodes === 0
      ? 100
      : Math.max(0, Math.round(
          100 * (1 - conn.orphanNodes / Math.max(1, totalNodes)) * 100,
        ) / 100);

  if (conn.orphanNodes > 0) {
    details.push(
      `${conn.orphanNodes}/${totalNodes} orphan(s) → orphan score ${orphanScore}`,
    );
  } else {
    details.push('No orphan nodes (+100)');
  }

  // Largest component bonus
  let bonus = 0;
  if (
    conn.connectedComponents > 0 &&
    totalNodes > 0 &&
    conn.largestComponentSize / totalNodes > 0.8
  ) {
    bonus = 5;
    details.push(
      `Largest component = ${conn.largestComponentSize}/${totalNodes} (+${bonus} bonus)`,
    );
  }

  const score = Math.min(100, Math.round(
    ((componentScore + orphanScore) / 2 + bonus) * 100,
  ) / 100);

  const explanation = buildExplanation({
    label: 'Connectivity',
    score,
    weight,
    passed: conn.connectedComponents <= 1 && conn.orphanNodes === 0,
    details,
    summary: conn.connectedComponents <= 1 && conn.orphanNodes === 0
      ? 'Fully connected — single component, no orphans.'
      : `${conn.connectedComponents} component(s), ${conn.orphanNodes} orphan(s).`,
  });

  return {
    score: Math.round(score * 100) / 100,
    weight,
    maxScore: weight,
    explanation,
  };
}
