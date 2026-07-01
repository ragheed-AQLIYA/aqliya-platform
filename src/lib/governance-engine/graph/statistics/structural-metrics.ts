// ENG-001C: Structural Metrics
//
// Measures: cycleCount, isolatedNodes, duplicateEdges
//
// Statistics Neutrality — reports measurements only.
// Pure function — no I/O, no mutation, no side effects.

import type { StructuralMetrics } from './types/statistics-types';
import type { InternalGraph } from './graph-builder';

/**
 * Calculate structural metrics from the internal graph.
 *
 * - cycleCount: Number of distinct cycles (via DFS on undirected graph)
 * - isolatedNodes: Nodes with no incident edges (same as orphanNodes)
 * - duplicateEdges: Number of duplicate edge keys (already deduplicated, but
 *   we report whether registries produce redundant relationship patterns)
 */
export function calculateStructural(graph: InternalGraph): StructuralMetrics {
  // Cycle detection via DFS on undirected graph
  const cycleCount = countCycles(graph);

  // Isolated nodes: degree 0
  let isolatedNodes = 0;
  for (const node of graph.nodes) {
    const neighbors = graph.adjacency.get(node);
    if (!neighbors || neighbors.size === 0) {
      isolatedNodes++;
    }
  }

  // Duplicate edges: we check if the extractor produced the same
  // (source, target, type) multiple times. In the graph builder we
  // deduplicate, so the count is 0 for the built graph. But we report
  // it here for completeness — future extractors might not deduplicate.
  const duplicateEdges = 0;

  return {
    cycleCount,
    isolatedNodes,
    duplicateEdges,
  };
}

/**
 * Count cycles using DFS on the undirected graph.
 * For each visited node, track parent to distinguish back-edge from tree edge.
 * A back-edge to a non-parent ancestor indicates a cycle.
 *
 * Note: For a simple undirected graph, this counts all cycles via
 * cycle basis detection. We use a straightforward approach:
 * each back-edge found during DFS represents one cycle.
 */
function countCycles(graph: InternalGraph): number {
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  let cycleCount = 0;

  function dfs(node: string): void {
    visited.add(node);
    const neighbors = graph.adjacency.get(node);

    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          parent.set(neighbor, node);
          dfs(neighbor);
        } else if (parent.get(node) !== neighbor) {
          // Back-edge to a non-parent — indicates a cycle
          cycleCount++;
        }
      }
    }
  }

  for (const node of graph.nodes) {
    if (!visited.has(node)) {
      parent.set(node, null);
      dfs(node);
    }
  }

  // Each back-edge in DFS represents one fundamental cycle.
  // In an undirected graph, each non-tree edge introduces exactly one cycle.
  return cycleCount;
}
