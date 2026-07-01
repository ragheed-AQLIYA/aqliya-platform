// ENG-001E: Traversal Dimension
//
// Measures the depth and breadth of path traversal requirements.
// Deep chains, long shortest paths, and high reachability indicate
// multi-hop query patterns that graph-capable architecture handles
// naturally and relational models handle with complex recursive queries.
//
// SR-03: Every point attributable to GraphStatistics (traversal + connectivity).
// SR-04: No metric recalculation.
//
// Pure function — no I/O, no mutation, no side effects.

import type { SuitabilityDimension } from './suitability-types';
import { SUITABILITY_WEIGHTS } from './suitability-types';
import type { GraphStatistics } from '../statistics/types/statistics-types';

/**
 * Score the traversal dimension.
 *
 * Scoring rationale:
 *   - maxDepth: deeper traversal paths → recursive/self-join complexity.
 *   - longestChain: multi-hop governance paths (e.g., authority →
 *     knowledgeArea → product → claim → evidence) justify graph.
 *   - avgPathLength: mean distance between reachable node pairs.
 *   - reachableRatio: proportion of nodes in the connected component.
 */
export function scoreTraversal(stats: GraphStatistics): SuitabilityDimension {
  const weight = SUITABILITY_WEIGHTS.traversal;
  const { maxDepth, longestChain, avgPathLength } = stats.traversal;
  const { reachableNodes } = stats.connectivity;
  const { nodeCount } = stats.topology;

  const details: string[] = [];
  let score = 0;

  const reachableRatio = nodeCount > 0 ? reachableNodes / nodeCount : 0;

  // ------------------------------------------------------------------
  // maxDepth: deepest traversal path
  // ------------------------------------------------------------------
  if (maxDepth >= 7) {
    score += 35;
    details.push(`maxDepth ${maxDepth} (very deep traversal: +35)`);
  } else if (maxDepth >= 5) {
    score += 30;
    details.push(`maxDepth ${maxDepth} (deep traversal: +30)`);
  } else if (maxDepth >= 3) {
    score += 20;
    details.push(`maxDepth ${maxDepth} (moderate traversal: +20)`);
  } else {
    score += 5;
    details.push(`maxDepth ${maxDepth} (shallow traversal: +5)`);
  }

  // ------------------------------------------------------------------
  // longestChain: multi-hop governance chain length
  // ------------------------------------------------------------------
  const chainLen = longestChain.length;
  if (chainLen >= 7) {
    score += 30;
    details.push(`Longest chain ${chainLen} nodes (very long chain: +30)`);
  } else if (chainLen >= 5) {
    score += 25;
    details.push(`Longest chain ${chainLen} nodes (long chain: +25)`);
  } else if (chainLen >= 3) {
    score += 15;
    details.push(`Longest chain ${chainLen} nodes (moderate chain: +15)`);
  } else {
    score += 5;
    details.push(`Longest chain ${chainLen} nodes (short chain: +5)`);
  }

  // ------------------------------------------------------------------
  // avgPathLength: mean shortest-path distance
  // ------------------------------------------------------------------
  if (avgPathLength >= 3.5) {
    score += 20;
    details.push(`avgPathLength ${avgPathLength.toFixed(1)} (long paths: +20)`);
  } else if (avgPathLength >= 2.5) {
    score += 15;
    details.push(`avgPathLength ${avgPathLength.toFixed(1)} (moderate paths: +15)`);
  } else if (avgPathLength >= 1.5) {
    score += 10;
    details.push(`avgPathLength ${avgPathLength.toFixed(1)} (short paths: +10)`);
  } else {
    score += 5;
    details.push(`avgPathLength ${avgPathLength.toFixed(1)} (minimal paths: +5)`);
  }

  // ------------------------------------------------------------------
  // reachableRatio: connectivity coverage
  // ------------------------------------------------------------------
  if (reachableRatio >= 0.9) {
    score += 15;
    details.push(`${(reachableRatio * 100).toFixed(0)}% nodes reachable (well-connected: +15)`);
  } else if (reachableRatio >= 0.6) {
    score += 10;
    details.push(`${(reachableRatio * 100).toFixed(0)}% nodes reachable (partially connected: +10)`);
  } else if (reachableRatio > 0) {
    score += 5;
    details.push(`${(reachableRatio * 100).toFixed(0)}% nodes reachable (loosely connected: +5)`);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  const explanation = buildTraversalExplanation(finalScore, weight, details);

  return {
    score: finalScore,
    weight,
    maxScore: weight,
    explanation,
  };
}

function buildTraversalExplanation(
  score: number,
  weight: number,
  details: string[],
): string {
  const contribution = Math.round((score / 100) * weight * 100) / 100;

  const lines: string[] = [
    `Traversal: ${score} / 100`,
    `Weight: ${weight}%`,
    '',
    'Evaluates multi-hop query and path traversal requirements.',
    score >= 70
      ? 'Deep traversal needs strongly justify graph-capable architecture.'
      : score >= 40
        ? 'Moderate traversal requirements — graph capability may benefit.'
        : 'Limited traversal depth — relational queries likely sufficient.',
    '',
    'Contributors:',
    ...details.map((d) => `  - ${d}`),
    '',
    `Weighted contribution: ${contribution} / ${weight}`,
  ];

  return lines.join('\n');
}
