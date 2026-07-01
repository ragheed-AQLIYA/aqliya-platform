// ENG-001C: Connectivity Metrics
//
// Measures: connectedComponents, largestComponentSize, orphanNodes, reachableNodes
//
// Statistics Neutrality — reports measurements only.
// Pure function — no I/O, no mutation, no side effects.

import type { ConnectivityMetrics } from './types/statistics-types';
import type { InternalGraph } from './graph-builder';

/**
 * Calculate connectivity metrics using BFS on the undirected graph.
 *
 * - connectedComponents: Distinct weakly connected components
 * - largestComponentSize: Nodes in the biggest component
 * - orphanNodes: Nodes with degree 0 (no edges)
 * - reachableNodes: Total non-orphan nodes (connected to at least one edge)
 */
export function calculateConnectivity(graph: InternalGraph): ConnectivityMetrics {
  const visited = new Set<string>();
  const components: string[][] = [];

  // BFS to find connected components
  for (const node of graph.nodes) {
    if (visited.has(node)) continue;

    // Start new component
    const component: string[] = [];
    const queue: string[] = [node];
    visited.add(node);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      const neighbors = graph.adjacency.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }

    components.push(component);
  }

  const connectedComponents = components.length;

  // Largest component
  let largestComponentSize = 0;
  for (const comp of components) {
    if (comp.length > largestComponentSize) {
      largestComponentSize = comp.length;
    }
  }

  // Orphan nodes: degree 0 (no adjacency entries, or empty adjacency)
  let orphanNodes = 0;
  for (const node of graph.nodes) {
    const neighbors = graph.adjacency.get(node);
    if (!neighbors || neighbors.size === 0) {
      orphanNodes++;
    }
  }

  // Reachable nodes = total nodes - orphan nodes
  const reachableNodes = graph.nodes.length - orphanNodes;

  return {
    connectedComponents,
    largestComponentSize,
    orphanNodes,
    reachableNodes,
  };
}
