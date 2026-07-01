// ENG-001C: Statistics Aggregator
//
// Combines all 4 metric calculators into a single GraphStatistics result.
// Pure function — no I/O, no mutation, no side effects.
//
// Statistics Neutrality: This aggregator does NOT score, rank, classify,
// recommend, interpret, or decide. It simply collects measurements.

import type { GraphStatistics } from './types/statistics-types';
import type { InternalGraph } from './graph-builder';
import { calculateTopology } from './topology-metrics';
import { calculateConnectivity } from './connectivity-metrics';
import { calculateTraversal } from './traversal-metrics';
import { calculateStructural } from './structural-metrics';
import { buildGraph } from './graph-builder';
import type { ExtractedRegistries } from '../types/extracted-registries';

/**
 * Compute all graph statistics from ExtractedRegistries.
 *
 * Builds the internal graph once, then passes it to each metric calculator.
 * All calculators are pure functions — no shared state, no mutation.
 */
export function computeStatistics(registries: ExtractedRegistries): GraphStatistics {
  const graph = buildGraph(registries);

  return {
    topology: calculateTopology(graph),
    connectivity: calculateConnectivity(graph),
    traversal: calculateTraversal(graph),
    structural: calculateStructural(graph),
  };
}
