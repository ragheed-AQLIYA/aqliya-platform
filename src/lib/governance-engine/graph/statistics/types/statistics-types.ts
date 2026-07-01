// ENG-001C: Graph Statistics — Data Contract
//
// Statistics Neutrality (DEC-2026-0027):
//   Graph Statistics reports measurements only.
//   It MUST NOT score, rank, classify, recommend, interpret, or decide.
//
// Pure types — no I/O, no mutation, no side effects.

// ---------------------------------------------------------------------------
// Topology Metrics
// ---------------------------------------------------------------------------

export interface TopologyMetrics {
  /** Total number of entities (claims + products + decisions + evidence + authorities) */
  nodeCount: number;
  /** Total number of relationships (edges) across all C01–C21 links */
  edgeCount: number;
  /** Average degree = total edges / total nodes (0 if no nodes) */
  avgDegree: number;
  /** Graph density = 2*E / (V*(V-1)) for directed, E / (V*(V-1)/2) for undirected. 0 if V < 2 */
  graphDensity: number;
}

// ---------------------------------------------------------------------------
// Connectivity Metrics
// ---------------------------------------------------------------------------

export interface ConnectivityMetrics {
  /** Number of weakly connected components in the undirected graph */
  connectedComponents: number;
  /** Number of nodes in the largest connected component */
  largestComponentSize: number;
  /** Number of nodes with degree 0 (no edges at all) */
  orphanNodes: number;
  /** Total nodes reachable from any starting node (non-orphan count) */
  reachableNodes: number;
}

// ---------------------------------------------------------------------------
// Traversal Metrics
// ---------------------------------------------------------------------------

export interface TraversalMetrics {
  /** Maximum depth (longest shortest-path distance) in the graph */
  maxDepth: number;
  /** IDs of nodes forming the longest chain found */
  longestChain: string[];
  /** Average shortest-path length between all reachable node pairs */
  avgPathLength: number;
}

// ---------------------------------------------------------------------------
// Structural Metrics
// ---------------------------------------------------------------------------

export interface StructuralMetrics {
  /** Number of distinct cycles detected in the directed graph */
  cycleCount: number;
  /** Number of nodes with no incident edges (same as orphans, but structural perspective) */
  isolatedNodes: number;
  /** Number of duplicate edges (same source + target + relationship type) */
  duplicateEdges: number;
}

// ---------------------------------------------------------------------------
// Aggregated Statistics
// ---------------------------------------------------------------------------

export interface GraphStatistics {
  topology: TopologyMetrics;
  connectivity: ConnectivityMetrics;
  traversal: TraversalMetrics;
  structural: StructuralMetrics;
}
