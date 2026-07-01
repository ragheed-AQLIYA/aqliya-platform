// ENG-001C: Traversal Metrics
//
// Measures: maxDepth, longestChain, avgPathLength
//
// Statistics Neutrality — reports measurements only.
// Pure function — no I/O, no mutation, no side effects.

import type { TraversalMetrics } from './types/statistics-types';
import type { InternalGraph } from './graph-builder';

/**
 * Calculate traversal metrics from the internal graph.
 *
 * - maxDepth: Longest shortest-path distance between any two nodes (graph diameter)
 * - longestChain: IDs forming the diameter path
 * - avgPathLength: Average shortest-path distance over all reachable pairs
 *
 * Uses BFS from each node to compute all-pairs shortest paths.
 * For large graphs this is O(V*(V+E)), but for governance graphs
 * (typically <1000 nodes) this is acceptable.
 */
export function calculateTraversal(graph: InternalGraph): TraversalMetrics {
  if (graph.nodes.length <= 1) {
    return {
      maxDepth: 0,
      longestChain: graph.nodes.length === 1 ? [graph.nodes[0]] : [],
      avgPathLength: 0,
    };
  }

  let maxDepth = 0;
  let longestChain: string[] = [];
  let totalPathLength = 0;
  let totalPairs = 0;

  for (const startNode of graph.nodes) {
    const distances = bfsDistances(startNode, graph);
    for (const [targetNode, dist] of distances) {
      if (dist > maxDepth) {
        maxDepth = dist;
        // Reconstruct path
        longestChain = reconstructPath(startNode, targetNode, graph);
      }
      totalPathLength += dist;
      totalPairs++;
    }
  }

  const avgPathLength = totalPairs > 0 ? totalPathLength / totalPairs : 0;

  return {
    maxDepth,
    longestChain,
    avgPathLength: round3(avgPathLength),
  };
}

/**
 * BFS from a start node; returns Map<nodeId, distance> for all reachable nodes.
 */
function bfsDistances(
  start: string,
  graph: InternalGraph,
): Map<string, number> {
  const distances = new Map<string, number>();
  const queue: string[] = [start];
  distances.set(start, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;
    const neighbors = graph.adjacency.get(current);

    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDist + 1);
          queue.push(neighbor);
        }
      }
    }
  }

  return distances;
}

/**
 * Reconstruct the shortest path from start to target using BFS parent tracking.
 */
function reconstructPath(
  start: string,
  target: string,
  graph: InternalGraph,
): string[] {
  if (start === target) return [start];

  const parent = new Map<string, string | null>();
  const queue: string[] = [start];
  parent.set(start, null);
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === target) break;

    const neighbors = graph.adjacency.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let node: string | null = target;
  while (node !== null) {
    path.unshift(node);
    node = parent.get(node) || null;
  }

  return path;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
