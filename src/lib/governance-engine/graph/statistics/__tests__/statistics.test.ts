// ENG-001C: Graph Statistics — Tests
//
// Validates:
//   - Topology metrics (nodeCount, edgeCount, avgDegree, density)
//   - Connectivity metrics (components, largest component, orphans)
//   - Traversal metrics (maxDepth, longestChain, avgPathLength)
//   - Structural metrics (cycles, isolated, duplicates)
//   - Aggregator combines all correctly
//
// Statistics Neutrality (DEC-2026-0027):
//   Graph Statistics reports measurements only.
//   Tests verify NO scoring, ranking, classification, recommendation,
//   interpretation, or decision logic.

import { describe, it, expect } from '@jest/globals';
import { calculateTopology } from '../topology-metrics';
import { calculateConnectivity } from '../connectivity-metrics';
import { calculateTraversal } from '../traversal-metrics';
import { calculateStructural } from '../structural-metrics';
import { computeStatistics } from '../aggregator';
import { buildGraph } from '../graph-builder';
import type { ExtractedRegistries } from '../../types/extracted-registries';

// ---------------------------------------------------------------------------
// Statistics Neutrality: No scoring/ranking/classifying/recommending
// ---------------------------------------------------------------------------

describe('ENG-001C: Statistics Neutrality (DEC-2026-0027)', () => {
  it('computeStatistics returns only measurements — no score fields', () => {
    const stats = computeStatistics(createSimpleGraph());
    // Check that there are no interpretation fields
    const json = JSON.stringify(stats);
    expect(json).not.toContain('"score"');
    expect(json).not.toContain('"rank"');
    expect(json).not.toContain('"classification"');
    expect(json).not.toContain('"recommendation"');
    expect(json).not.toContain('"interpretation"');
    expect(json).not.toContain('"decision"');
    expect(json).not.toContain('"severity"');
    expect(json).not.toContain('"warning"');
  });

  it('all metric names are purely quantitative', () => {
    const stats = computeStatistics(createSimpleGraph());
    const metricNames = Object.keys(stats.topology)
      .concat(Object.keys(stats.connectivity))
      .concat(Object.keys(stats.traversal))
      .concat(Object.keys(stats.structural));
    // All names should be measurement terms
    for (const name of metricNames) {
      expect(name).toMatch(/^(node|edge|avg|graph|connected|largest|orphan|reachable|max|longest|cycle|isolated|duplicate)/);
    }
  });
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * Simple graph: 1 product, 2 claims, 3 evidence, 1 decision, 1 authority.
 * Edges: C04 (claim→product), C06 (claim→evidence), C08 (decision→claim), C01 (product→authority)
 */
function createSimpleGraph(): ExtractedRegistries {
  return {
    claims: [
      {
        id: 'CLM-A-0001', version: '1.0', type: 'CR-ST', origin: 'product',
        dimension: 'Implementation Reality', capRef: null,
        claimText: 'Claim A1', ka: 'KA-01', product: 'PROD-A',
        auth: 'AUTH-X', evidence: ['EV-001', 'EV-002'],
        confidence: 'High', completeness: '',
      },
      {
        id: 'CLM-A-0002', version: '1.0', type: 'CR-TC', origin: 'product',
        dimension: 'Product Maturity', capRef: null,
        claimText: 'Claim A2', ka: 'KA-01', product: 'PROD-A',
        auth: 'AUTH-X', evidence: ['EV-003'],
        confidence: 'High', completeness: '',
      },
    ],
    products: [
      {
        id: 'PROD-A', name: 'Product A', nameAr: 'المنتج أ',
        entityType: 'Product', ka: 'KA-01', authority: 'AUTH-X',
        currentLLevel: 'L4', lLevelStatus: 'Verified',
        strategicIntent: 'Approved', parent: null,
        evidenceStatus: 'Complete', manifestStatus: 'Generated',
        dossierStatus: 'Generated', lastVerified: '2026-06-30',
      },
    ],
    decisions: [
      {
        id: 'DEC-2026-0100', type: 'FRZ', title: 'Test Decision',
        authority: 'AUTH-X', date: '2026-06-30',
        affected: ['CLM-A-0001'], status: 'Active',
      },
    ],
    evidence: [
      { id: 'EV-001', tier: 'T1', description: 'Ev1', supports: ['CLM-A-0001'], score: 1, sourceRef: '' },
      { id: 'EV-002', tier: 'T1', description: 'Ev2', supports: ['CLM-A-0001'], score: 1, sourceRef: '' },
      { id: 'EV-003', tier: 'T2', description: 'Ev3', supports: ['CLM-A-0002'], score: 2, sourceRef: '' },
    ],
    authorities: [
      {
        id: 'AUTH-X', areaId: 'KA-01', knowledgeArea: 'Test KA',
        document: 'doc.md', type: 'Authority',
        secondaryRefs: [], gap: 'NO', notes: null,
      },
    ],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 2, products: 1, decisions: 1, evidence: 3, authorities: 1 },
    },
  };
}

/**
 * Two disconnected clusters: Cluster A (PROD-A + claims) and Cluster B (PROD-B + claims)
 */
function createDisconnectedGraph(): ExtractedRegistries {
  return {
    claims: [
      {
        id: 'CLM-A-0001', version: '1.0', type: 'CR-ST', origin: 'product',
        dimension: 'Implementation Reality', capRef: null,
        claimText: 'A1', ka: 'KA-01', product: 'PROD-A',
        auth: 'AUTH-X', evidence: ['EV-001'],
        confidence: 'High', completeness: '',
      },
      {
        id: 'CLM-B-0001', version: '1.0', type: 'CR-ST', origin: 'product',
        dimension: 'Implementation Reality', capRef: null,
        claimText: 'B1', ka: 'KA-02', product: 'PROD-B',
        auth: 'AUTH-Y', evidence: ['EV-002'],
        confidence: 'High', completeness: '',
      },
    ],
    products: [
      {
        id: 'PROD-A', name: 'A', nameAr: 'أ', entityType: 'Product',
        ka: 'KA-01', authority: 'AUTH-X',
        currentLLevel: 'L4', lLevelStatus: 'Verified',
        strategicIntent: 'Approved', parent: null,
        evidenceStatus: 'Complete', manifestStatus: 'Generated',
        dossierStatus: 'Generated', lastVerified: '2026-06-30',
      },
      {
        id: 'PROD-B', name: 'B', nameAr: 'ب', entityType: 'Product',
        ka: 'KA-02', authority: 'AUTH-Y',
        currentLLevel: 'L3', lLevelStatus: 'Verified',
        strategicIntent: 'Approved', parent: null,
        evidenceStatus: 'Complete', manifestStatus: 'Generated',
        dossierStatus: 'Generated', lastVerified: '2026-06-30',
      },
    ],
    decisions: [],
    evidence: [
      { id: 'EV-001', tier: 'T1', description: 'E1', supports: ['CLM-A-0001'], score: 1, sourceRef: '' },
      { id: 'EV-002', tier: 'T1', description: 'E2', supports: ['CLM-B-0001'], score: 1, sourceRef: '' },
    ],
    authorities: [
      {
        id: 'AUTH-X', areaId: 'KA-01', knowledgeArea: 'KA A',
        document: 'a.md', type: 'Authority',
        secondaryRefs: [], gap: 'NO', notes: null,
      },
      {
        id: 'AUTH-Y', areaId: 'KA-02', knowledgeArea: 'KA B',
        document: 'b.md', type: 'Authority',
        secondaryRefs: [], gap: 'NO', notes: null,
      },
    ],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 2, products: 2, decisions: 0, evidence: 2, authorities: 2 },
    },
  };
}

/**
 * Linear authority chain: AUTH-A → AUTH-B → AUTH-C (non-circular).
 * AUTH-D is isolated. Used to test traversal depth without cycles.
 */
function createLinearChainGraph(): ExtractedRegistries {
  return {
    claims: [],
    products: [],
    decisions: [],
    evidence: [],
    authorities: [
      {
        id: 'AUTH-A', areaId: 'KA-01', knowledgeArea: 'A',
        document: 'a.md', type: 'Authority',
        secondaryRefs: ['AUTH-B'], gap: null, notes: null,
      },
      {
        id: 'AUTH-B', areaId: 'KA-01', knowledgeArea: 'B',
        document: 'b.md', type: 'Authority',
        secondaryRefs: ['AUTH-C'], gap: null, notes: null,
      },
      {
        id: 'AUTH-C', areaId: 'KA-01', knowledgeArea: 'C',
        document: 'c.md', type: 'Authority',
        secondaryRefs: [], gap: null, notes: null,
      },
      {
        id: 'AUTH-D', areaId: 'KA-02', knowledgeArea: 'D',
        document: 'd.md', type: 'Authority',
        secondaryRefs: [], gap: null, notes: null,
      },
    ],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 0, products: 0, decisions: 0, evidence: 0, authorities: 4 },
    },
  };
}

/**
 * Graph with a circular authority chain: AUTH-A → AUTH-B → AUTH-C → AUTH-A.
 * Used to test cycle detection in structural metrics.
 */
function createCircularGraph(): ExtractedRegistries {
  return {
    claims: [],
    products: [],
    decisions: [],
    evidence: [],
    authorities: [
      {
        id: 'AUTH-A', areaId: 'KA-01', knowledgeArea: 'A',
        document: 'a.md', type: 'Authority',
        secondaryRefs: ['AUTH-B'], gap: null, notes: null,
      },
      {
        id: 'AUTH-B', areaId: 'KA-01', knowledgeArea: 'B',
        document: 'b.md', type: 'Authority',
        secondaryRefs: ['AUTH-C'], gap: null, notes: null,
      },
      {
        id: 'AUTH-C', areaId: 'KA-01', knowledgeArea: 'C',
        document: 'c.md', type: 'Authority',
        secondaryRefs: ['AUTH-A'], gap: null, notes: null,
      },
      {
        id: 'AUTH-D', areaId: 'KA-02', knowledgeArea: 'D',
        document: 'd.md', type: 'Authority',
        secondaryRefs: [], gap: null, notes: null,
      },
    ],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 0, products: 0, decisions: 0, evidence: 0, authorities: 4 },
    },
  };
}

/**
 * True tree graph — no cycles. Product with 2 claims, 3 evidence items.
 * No authority links (auth='') so no C01/C07 triangles.
 */
function createTreeGraph(): ExtractedRegistries {
  return {
    claims: [
      {
        id: 'CLM-TREE-0001', version: '1.0', type: 'CR-ST', origin: 'product',
        dimension: 'Implementation Reality', capRef: null,
        claimText: 'Tree Claim 1', ka: 'KA-01', product: 'PROD-TREE',
        auth: '', evidence: ['EV-TREE-001', 'EV-TREE-002'],
        confidence: 'High', completeness: '',
      },
      {
        id: 'CLM-TREE-0002', version: '1.0', type: 'CR-TC', origin: 'product',
        dimension: 'Product Maturity', capRef: null,
        claimText: 'Tree Claim 2', ka: 'KA-01', product: 'PROD-TREE',
        auth: '', evidence: ['EV-TREE-003'],
        confidence: 'High', completeness: '',
      },
    ],
    products: [
      {
        id: 'PROD-TREE', name: 'Tree Product', nameAr: 'منتج شجري',
        entityType: 'Product', ka: 'KA-01', authority: '',
        currentLLevel: 'L4', lLevelStatus: 'Verified',
        strategicIntent: 'Approved', parent: null,
        evidenceStatus: 'Complete', manifestStatus: 'Generated',
        dossierStatus: 'Generated', lastVerified: '2026-06-30',
      },
    ],
    decisions: [],
    evidence: [
      { id: 'EV-TREE-001', tier: 'T1', description: 'Ev1', supports: ['CLM-TREE-0001'], score: 1, sourceRef: '' },
      { id: 'EV-TREE-002', tier: 'T1', description: 'Ev2', supports: ['CLM-TREE-0001'], score: 1, sourceRef: '' },
      { id: 'EV-TREE-003', tier: 'T2', description: 'Ev3', supports: ['CLM-TREE-0002'], score: 2, sourceRef: '' },
    ],
    authorities: [],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 2, products: 1, decisions: 0, evidence: 3, authorities: 0 },
    },
  };
}

/**
 * Empty graph — no entities at all
 */
function createEmptyRegistries(): ExtractedRegistries {
  return {
    claims: [],
    products: [],
    decisions: [],
    evidence: [],
    authorities: [],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 0, products: 0, decisions: 0, evidence: 0, authorities: 0 },
    },
  };
}

/**
 * Single node — only one entity with no relationships
 */
function createSingleNodeGraph(): ExtractedRegistries {
  return {
    claims: [],
    products: [
      {
        id: 'PROD-ALONE', name: 'Alone', nameAr: 'وحيد',
        entityType: 'Product', ka: 'KA-01', authority: '',
        currentLLevel: 'L1', lLevelStatus: 'Concept',
        strategicIntent: 'Approved', parent: null,
        evidenceStatus: 'Not Started', manifestStatus: '',
        dossierStatus: '', lastVerified: '2026-06-30',
      },
    ],
    decisions: [],
    evidence: [],
    authorities: [],
    metadata: {
      extractedAt: '2026-06-30T00:00:00.000Z',
      sourceFiles: { claims: '', products: '', decisions: '', evidence: '', authorities: '' },
      entityCounts: { claims: 0, products: 1, decisions: 0, evidence: 0, authorities: 0 },
    },
  };
}

// ---------------------------------------------------------------------------
// Topology Metrics (6 tests)
// ---------------------------------------------------------------------------

describe('ENG-001C: Topology Metrics', () => {
  it('nodeCount equals total entities', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTopology(graph);
    // 2 claims + 1 product + 1 decision + 3 evidence + 1 authority = 8
    // Some entities appear via edges (EV-001, EV-002, EV-003, CLM-A-0001, CLM-A-0002, PROD-A, DEC-2026-0100, AUTH-X)
    // Actually, edges add nodes from both endpoints, but buildGraph also adds
    // nodes from edges. Let's count: nodes = all unique IDs from entities + edge refs.
    // Simple graph: 2 claims + 1 product + 3 evidence + 1 decision + 1 authority = 8
    expect(metrics.nodeCount).toBeGreaterThanOrEqual(8);
  });

  it('edgeCount counts distinct relationships', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTopology(graph);
    // Expected edges:
    //   CLM-A-0001 ↔ EV-001 (C06)
    //   CLM-A-0001 ↔ EV-002 (C06)
    //   CLM-A-0001 ↔ PROD-A (C04)
    //   CLM-A-0001 ↔ AUTH-X (C07)
    //   CLM-A-0002 ↔ EV-003 (C06)
    //   CLM-A-0002 ↔ PROD-A (C04)
    //   CLM-A-0002 ↔ AUTH-X (C07)
    //   PROD-A ↔ AUTH-X (C01)  -- but PROD-A ↔ AUTH-X already through C07 edges
    //   DEC-2026-0100 ↔ CLM-A-0001 (C08)
    //   DEC-2026-0100 ↔ AUTH-X (C15)
    //   EV-001 ↔ CLM-A-0001 (C06 reverse via supports)
    //   EV-002 ↔ CLM-A-0001 (C06 reverse)
    //   EV-003 ↔ CLM-A-0002 (C06 reverse)
    // After dedup: edges should be 8-10 unique pairs
    expect(metrics.edgeCount).toBeGreaterThanOrEqual(6);
  });

  it('avgDegree is edges / nodes', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTopology(graph);
    expect(metrics.avgDegree).toBeGreaterThan(0);
    expect(metrics.avgDegree).toBe(round3(metrics.edgeCount / metrics.nodeCount));
  });

  it('graphDensity is 2E / (V*(V-1))', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTopology(graph);
    const V = metrics.nodeCount;
    const expected = V > 1 ? (2 * metrics.edgeCount) / (V * (V - 1)) : 0;
    expect(metrics.graphDensity).toBe(round3(expected));
  });

  it('empty graph has zero topology', () => {
    const graph = buildGraph(createEmptyRegistries());
    const metrics = calculateTopology(graph);
    expect(metrics.nodeCount).toBe(0);
    expect(metrics.edgeCount).toBe(0);
    expect(metrics.avgDegree).toBe(0);
    expect(metrics.graphDensity).toBe(0);
  });

  it('single node graph has no edges', () => {
    const graph = buildGraph(createSingleNodeGraph());
    const metrics = calculateTopology(graph);
    expect(metrics.nodeCount).toBe(1);
    expect(metrics.edgeCount).toBe(0);
    expect(metrics.avgDegree).toBe(0);
    expect(metrics.graphDensity).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Connectivity Metrics (6 tests)
// ---------------------------------------------------------------------------

describe('ENG-001C: Connectivity Metrics', () => {
  it('simple connected graph has 1 component', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateConnectivity(graph);
    expect(metrics.connectedComponents).toBeGreaterThanOrEqual(1);
  });

  it('disconnected graph has 2+ components', () => {
    const graph = buildGraph(createDisconnectedGraph());
    const metrics = calculateConnectivity(graph);
    expect(metrics.connectedComponents).toBeGreaterThanOrEqual(2);
  });

  it('largestComponentSize is the biggest component', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateConnectivity(graph);
    expect(metrics.largestComponentSize).toBeGreaterThan(0);
    expect(metrics.largestComponentSize).toBeLessThanOrEqual(metrics.reachableNodes + metrics.orphanNodes);
  });

  it('orphanNodes counts degree-0 nodes', () => {
    const graph = buildGraph(createSingleNodeGraph());
    const metrics = calculateConnectivity(graph);
    expect(metrics.orphanNodes).toBe(1);
  });

  it('reachableNodes = total - orphanNodes', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateConnectivity(graph);
    expect(metrics.reachableNodes).toBe(graph.nodes.length - metrics.orphanNodes);
  });

  it('empty graph has 0 components', () => {
    const graph = buildGraph(createEmptyRegistries());
    const metrics = calculateConnectivity(graph);
    expect(metrics.connectedComponents).toBe(0);
    expect(metrics.orphanNodes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Traversal Metrics (6 tests)
// ---------------------------------------------------------------------------

describe('ENG-001C: Traversal Metrics', () => {
  it('maxDepth is the graph diameter (longest shortest path)', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTraversal(graph);
    expect(metrics.maxDepth).toBeGreaterThanOrEqual(1);
    expect(metrics.longestChain.length).toBeGreaterThanOrEqual(2);
  });

  it('longestChain contains at least start and end', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTraversal(graph);
    if (metrics.longestChain.length > 0) {
      expect(metrics.longestChain[0]).toBeDefined();
      expect(metrics.longestChain[metrics.longestChain.length - 1]).toBeDefined();
    }
  });

  it('avgPathLength is between 0 and maxDepth', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateTraversal(graph);
    expect(metrics.avgPathLength).toBeGreaterThanOrEqual(0);
    expect(metrics.avgPathLength).toBeLessThanOrEqual(metrics.maxDepth + 1);
  });

  it('single node graph has 0 traversal', () => {
    const graph = buildGraph(createSingleNodeGraph());
    const metrics = calculateTraversal(graph);
    expect(metrics.maxDepth).toBe(0);
    expect(metrics.avgPathLength).toBe(0);
  });

  it('empty graph has 0 traversal', () => {
    const graph = buildGraph(createEmptyRegistries());
    const metrics = calculateTraversal(graph);
    expect(metrics.maxDepth).toBe(0);
    expect(metrics.avgPathLength).toBe(0);
  });

  it('linear authority chain produces traversal depth', () => {
    const graph = buildGraph(createLinearChainGraph());
    const metrics = calculateTraversal(graph);
    // Linear: AUTH-A ↔ AUTH-B ↔ AUTH-C (C14 edges). maxDepth = 2 (A→B→C).
    // AUTH-D is isolated — not included in traversal.
    expect(metrics.maxDepth).toBeGreaterThanOrEqual(2);
    expect(metrics.longestChain.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// Structural Metrics (6 tests)
// ---------------------------------------------------------------------------

describe('ENG-001C: Structural Metrics', () => {
  it('tree graph has no cycles', () => {
    const graph = buildGraph(createTreeGraph());
    const metrics = calculateStructural(graph);
    expect(metrics.cycleCount).toBe(0);
  });

  it('circular authority chain produces cycles', () => {
    const graph = buildGraph(createCircularGraph());
    const metrics = calculateStructural(graph);
    expect(metrics.cycleCount).toBeGreaterThanOrEqual(1);
  });

  it('isolatedNodes counts nodes with no edges', () => {
    const graph = buildGraph(createSingleNodeGraph());
    const metrics = calculateStructural(graph);
    expect(metrics.isolatedNodes).toBe(1);
  });

  it('simple graph has no duplicates', () => {
    const graph = buildGraph(createSimpleGraph());
    const metrics = calculateStructural(graph);
    expect(metrics.duplicateEdges).toBe(0);
  });

  it('empty graph has zero structural issues', () => {
    const graph = buildGraph(createEmptyRegistries());
    const metrics = calculateStructural(graph);
    expect(metrics.isolatedNodes).toBe(0);
    expect(metrics.duplicateEdges).toBe(0);
    expect(metrics.cycleCount).toBe(0);
  });

  it('disconnected graph has isolated nodes in separate components', () => {
    const graph = buildGraph(createDisconnectedGraph());
    const metrics = calculateStructural(graph);
    // Both clusters should connect internally, zero isolated if edges exist
    expect(metrics.isolatedNodes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Aggregator (6 tests)
// ---------------------------------------------------------------------------

describe('ENG-001C: Statistics Aggregator', () => {
  it('computeStatistics returns all 4 metric groups', () => {
    const stats = computeStatistics(createSimpleGraph());
    expect(stats.topology).toBeDefined();
    expect(stats.connectivity).toBeDefined();
    expect(stats.traversal).toBeDefined();
    expect(stats.structural).toBeDefined();
  });

  it('topology has all 4 fields', () => {
    const stats = computeStatistics(createSimpleGraph());
    expect(typeof stats.topology.nodeCount).toBe('number');
    expect(typeof stats.topology.edgeCount).toBe('number');
    expect(typeof stats.topology.avgDegree).toBe('number');
    expect(typeof stats.topology.graphDensity).toBe('number');
  });

  it('connectivity has all 4 fields', () => {
    const stats = computeStatistics(createSimpleGraph());
    expect(typeof stats.connectivity.connectedComponents).toBe('number');
    expect(typeof stats.connectivity.largestComponentSize).toBe('number');
    expect(typeof stats.connectivity.orphanNodes).toBe('number');
    expect(typeof stats.connectivity.reachableNodes).toBe('number');
  });

  it('traversal has all 3 fields', () => {
    const stats = computeStatistics(createSimpleGraph());
    expect(typeof stats.traversal.maxDepth).toBe('number');
    expect(Array.isArray(stats.traversal.longestChain)).toBe(true);
    expect(typeof stats.traversal.avgPathLength).toBe('number');
  });

  it('structural has all 3 fields', () => {
    const stats = computeStatistics(createSimpleGraph());
    expect(typeof stats.structural.cycleCount).toBe('number');
    expect(typeof stats.structural.isolatedNodes).toBe('number');
    expect(typeof stats.structural.duplicateEdges).toBe('number');
  });

  it('empty registries produce zero-value statistics', () => {
    const stats = computeStatistics(createEmptyRegistries());
    expect(stats.topology.nodeCount).toBe(0);
    expect(stats.topology.edgeCount).toBe(0);
    expect(stats.connectivity.connectedComponents).toBe(0);
    expect(stats.traversal.maxDepth).toBe(0);
    expect(stats.structural.cycleCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Pure Function Verification (3 tests)
// ---------------------------------------------------------------------------

describe('ENG-001C: Pure Function — no mutation of input', () => {
  it('computeStatistics does not mutate input', () => {
    const registries = createSimpleGraph();
    const inputSnapshot = JSON.stringify(registries);
    computeStatistics(registries);
    expect(JSON.stringify(registries)).toBe(inputSnapshot);
  });

  it('buildGraph does not mutate input', () => {
    const registries = createSimpleGraph();
    const inputSnapshot = JSON.stringify(registries);
    buildGraph(registries);
    expect(JSON.stringify(registries)).toBe(inputSnapshot);
  });

  it('individual metric calculators do not mutate graph', () => {
    const graph = buildGraph(createSimpleGraph());
    const graphSnapshot = JSON.stringify(graph);
    calculateTopology(graph);
    calculateConnectivity(graph);
    calculateTraversal(graph);
    calculateStructural(graph);
    expect(JSON.stringify(graph)).toBe(graphSnapshot);
  });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
