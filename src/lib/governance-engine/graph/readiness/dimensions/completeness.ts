// ENG-001D: Completeness Dimension
//
// Measures data completeness based on graph statistics.
// Weight: 25%
//
// Scoring:
//   Base: 100
//   Orphan penalty: (orphanNodes / max(1, totalNodes)) * 30
//     — Fewer orphans = more complete (max -30)
//   Duplicate penalty: duplicateEdges * 10
//     — Each duplicate reduces completeness (max -20)
//   Isolated penalty: (isolatedNodes / max(1, totalNodes)) * 20
//     — Isolated nodes contribute nothing (max -20)
//   Floor: 0
//
// Pure function — no I/O, no mutation, no side effects.

import type { ReadinessDimension } from '../types/readiness-types';
import { READINESS_WEIGHTS } from '../types/readiness-types';
import type { GraphStatistics } from '../../statistics/types/statistics-types';
import { buildExplanation } from '../explanation';

export function calculateCompleteness(
  graphStatistics: GraphStatistics,
): ReadinessDimension {
  const weight = READINESS_WEIGHTS.completeness;
  const { topology, connectivity, structural } = graphStatistics;
  const totalNodes = topology.nodeCount;
  const details: string[] = [];

  // Orphan penalty: nodes with no edges
  const orphanRatio = totalNodes > 0 ? connectivity.orphanNodes / totalNodes : 0;
  const orphanPenalty = Math.round(orphanRatio * 30 * 100) / 100;

  if (connectivity.orphanNodes > 0) {
    details.push(
      `${connectivity.orphanNodes}/${totalNodes} orphan nodes (-${orphanPenalty})`,
    );
  }

  // Duplicate penalty
  const duplicatePenalty = Math.min(20, structural.duplicateEdges * 10);

  if (structural.duplicateEdges > 0) {
    details.push(
      `${structural.duplicateEdges} duplicate edge(s) (-${duplicatePenalty})`,
    );
  }

  // Isolated penalty (structural perspective)
  const isolatedRatio = totalNodes > 0 ? structural.isolatedNodes / totalNodes : 0;
  const isolatedPenalty = Math.round(isolatedRatio * 20 * 100) / 100;

  if (structural.isolatedNodes > 0) {
    details.push(
      `${structural.isolatedNodes}/${totalNodes} isolated node(s) (-${isolatedPenalty})`,
    );
  }

  const totalPenalty = orphanPenalty + duplicatePenalty + isolatedPenalty;
  const score = Math.max(0, 100 - totalPenalty);

  const explanation = buildExplanation({
    label: 'Completeness',
    score,
    weight,
    passed: totalPenalty === 0,
    details: details.length > 0 ? details : ['All nodes connected. No orphans or duplicates.'],
    summary: totalPenalty === 0
      ? 'Complete graph — all nodes connected, no duplicates.'
      : `Penalty: -${Math.round(totalPenalty * 100) / 100} points.`,
  });

  return {
    score: Math.round(score * 100) / 100,
    weight,
    maxScore: weight,
    explanation,
  };
}
