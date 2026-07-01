// ENG-001C: Graph Statistics — Module Barrel
export { computeStatistics } from './aggregator';
export { buildGraph } from './graph-builder';
export { calculateTopology } from './topology-metrics';
export { calculateConnectivity } from './connectivity-metrics';
export { calculateTraversal } from './traversal-metrics';
export { calculateStructural } from './structural-metrics';
export type {
  GraphStatistics,
  TopologyMetrics,
  ConnectivityMetrics,
  TraversalMetrics,
  StructuralMetrics,
} from './types/statistics-types';
