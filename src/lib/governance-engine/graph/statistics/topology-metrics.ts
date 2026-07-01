// ENG-001C: Topology Metrics
//
// Measures: nodeCount, edgeCount, avgDegree, graphDensity
//
// Statistics Neutrality — reports measurements only.
// Pure function — no I/O, no mutation, no side effects.

import type { TopologyMetrics } from './types/statistics-types';
import type { InternalGraph } from './graph-builder';

/**
 * Calculate topology metrics from the internal graph.
 *
 * - nodeCount: Total entities
 * - edgeCount: Total relationships
 * - avgDegree: Edge count / node count (0 if no nodes)
 * - graphDensity: For undirected graph: 2*E / (V*(V-1)). 0 if V < 2
 */
export function calculateTopology(graph: InternalGraph): TopologyMetrics {
  const V = graph.nodes.length;
  const E = graph.edges.length;

  const avgDegree = V > 0 ? E / V : 0;
  const graphDensity = V > 1 ? (2 * E) / (V * (V - 1)) : 0;

  return {
    nodeCount: V,
    edgeCount: E,
    avgDegree: round3(avgDegree),
    graphDensity: round3(graphDensity),
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
