// ENG-001E: Suitability Engine — Unit Tests
//
// Covers:
//   - LOW architectural fit (small/simple graph)
//   - MEDIUM architectural fit (moderate graph with complexity)
//   - HIGH architectural fit (large graph with cycles and governance gaps)
//   - Edge cases: zero nodes, isolated graph, extreme density
//   - All 4 dimensions score independently
//   - Every score is attributable (SR-03)
//   - No technology references in explanations (SR-02)
//
// Pure function tests — no I/O, no side effects.

import { describe, it, expect } from '@jest/globals';
import { computeSuitability } from '../aggregator';
import { scoreTopology } from '../topology-dimension';
import { scoreTraversal } from '../traversal-dimension';
import { scoreComplexity } from '../complexity-dimension';
import { scoreGovernance } from '../governance-dimension';
import type { GraphStatistics } from '../../statistics/types/statistics-types';
import type { ValidationSummary } from '../../validation/types/validation-issues';
import type { ReadinessResult } from '../../readiness/types/readiness-types';
import type { SuitabilityInput } from '../suitability-types';

// ---------------------------------------------------------------------------
// Fixture Builders
// ---------------------------------------------------------------------------

/** Minimal clean validation — zero issues, passed */
function cleanValidation(): ValidationSummary {
  return {
    validatedAt: new Date().toISOString(),
    totalIssues: 0,
    counts: { errors: 0, warnings: 0, infos: 0 },
    byCode: {},
    issues: [],
    passed: true,
  };
}

/** Validation with significant issues */
function failingValidation(issueCount: number = 12): ValidationSummary {
  return {
    validatedAt: new Date().toISOString(),
    totalIssues: issueCount,
    counts: {
      errors: Math.ceil(issueCount * 0.6),
      warnings: Math.ceil(issueCount * 0.3),
      infos: Math.ceil(issueCount * 0.1),
    },
    byCode: {
      'REF-001': Math.ceil(issueCount * 0.4),
      'CAR-001': Math.ceil(issueCount * 0.3),
      'CHN-001': Math.ceil(issueCount * 0.2),
      'AUTH-001': Math.ceil(issueCount * 0.1),
    },
    issues: [],
    passed: false,
  };
}

/** Small/simple graph stats — LOW fit */
function smallGraphStats(): GraphStatistics {
  return {
    topology: { nodeCount: 7, edgeCount: 12, avgDegree: 1.7, graphDensity: 0.2857 },
    connectivity: { connectedComponents: 1, largestComponentSize: 7, orphanNodes: 1, reachableNodes: 6 },
    traversal: { maxDepth: 2, longestChain: ['AUTH-001', 'PROD-001', 'CLM-001'], avgPathLength: 1.5 },
    structural: { cycleCount: 0, isolatedNodes: 1, duplicateEdges: 0 },
  };
}

/** Truly tiny graph — topology should score very low */
function tinyGraphStats(): GraphStatistics {
  return {
    topology: { nodeCount: 3, edgeCount: 2, avgDegree: 1.33, graphDensity: 0.333 },
    connectivity: { connectedComponents: 1, largestComponentSize: 3, orphanNodes: 1, reachableNodes: 2 },
    traversal: { maxDepth: 1, longestChain: ['A', 'B'], avgPathLength: 1.0 },
    structural: { cycleCount: 0, isolatedNodes: 1, duplicateEdges: 0 },
  };
}

/** Moderate graph stats — should yield MEDIUM fit */
function lightMediumGraphStats(): GraphStatistics {
  return {
    topology: { nodeCount: 20, edgeCount: 30, avgDegree: 1.5, graphDensity: 0.079 },
    connectivity: { connectedComponents: 2, largestComponentSize: 18, orphanNodes: 2, reachableNodes: 18 },
    traversal: { maxDepth: 3, longestChain: ['KA-01', 'PROD-01', 'CLM-001'], avgPathLength: 1.8 },
    structural: { cycleCount: 1, isolatedNodes: 2, duplicateEdges: 1 },
  };
}

/** Moderate graph stats — MEDIUM fit */
function mediumGraphStats(): GraphStatistics {
  return {
    topology: { nodeCount: 45, edgeCount: 140, avgDegree: 3.1, graphDensity: 0.07 },
    connectivity: { connectedComponents: 2, largestComponentSize: 40, orphanNodes: 3, reachableNodes: 42 },
    traversal: { maxDepth: 4, longestChain: ['KA-01', 'PROD-01', 'CLM-001', 'CLM-002', 'EV-001'], avgPathLength: 2.8 },
    structural: { cycleCount: 1, isolatedNodes: 3, duplicateEdges: 2 },
  };
}

/** Large/complex graph stats — HIGH fit */
function largeGraphStats(): GraphStatistics {
  return {
    topology: { nodeCount: 150, edgeCount: 680, avgDegree: 4.5, graphDensity: 0.03 },
    connectivity: { connectedComponents: 1, largestComponentSize: 145, orphanNodes: 2, reachableNodes: 148 },
    traversal: { maxDepth: 7, longestChain: ['KA-01', 'PROD-01', 'CLM-001', 'CLM-002', 'CLM-003', 'EV-001', 'EV-002', 'DEC-001'], avgPathLength: 3.4 },
    structural: { cycleCount: 4, isolatedNodes: 2, duplicateEdges: 6 },
  };
}

/** Edge case: empty graph */
function emptyGraphStats(): GraphStatistics {
  return {
    topology: { nodeCount: 0, edgeCount: 0, avgDegree: 0, graphDensity: 0 },
    connectivity: { connectedComponents: 0, largestComponentSize: 0, orphanNodes: 0, reachableNodes: 0 },
    traversal: { maxDepth: 0, longestChain: [], avgPathLength: 0 },
    structural: { cycleCount: 0, isolatedNodes: 0, duplicateEdges: 0 },
  };
}

/** Edge case: single-node graph */
function singleNodeStats(): GraphStatistics {
  return {
    topology: { nodeCount: 1, edgeCount: 0, avgDegree: 0, graphDensity: 0 },
    connectivity: { connectedComponents: 1, largestComponentSize: 1, orphanNodes: 1, reachableNodes: 0 },
    traversal: { maxDepth: 0, longestChain: [], avgPathLength: 0 },
    structural: { cycleCount: 0, isolatedNodes: 1, duplicateEdges: 0 },
  };
}

/** Edge case: extreme density (almost complete graph) */
function extremeDensityStats(): GraphStatistics {
  return {
    topology: { nodeCount: 20, edgeCount: 180, avgDegree: 9, graphDensity: 0.947 },
    connectivity: { connectedComponents: 1, largestComponentSize: 20, orphanNodes: 0, reachableNodes: 20 },
    traversal: { maxDepth: 1, longestChain: ['A', 'B'], avgPathLength: 1.0 },
    structural: { cycleCount: 10, isolatedNodes: 0, duplicateEdges: 0 },
  };
}

/** Build a ReadinessResult with specific dimension scores */
function readinessWithScores(
  integrityScore: number,
  completenessScore: number,
  connectivityScore: number,
  traceabilityScore: number,
): ReadinessResult {
  const buildDim = (score: number, weight: number, label: string) => ({
    score,
    weight,
    maxScore: weight,
    explanation: `${label}: ${score}/100`,
  });

  const dims = {
    integrity: buildDim(integrityScore, 30, 'Integrity'),
    completeness: buildDim(completenessScore, 25, 'Completeness'),
    connectivity: buildDim(connectivityScore, 20, 'Connectivity'),
    traceability: buildDim(traceabilityScore, 25, 'Traceability'),
  };

  const overallScore =
    (integrityScore / 100) * 30 +
    (completenessScore / 100) * 25 +
    (connectivityScore / 100) * 20 +
    (traceabilityScore / 100) * 25;

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    dimensions: dims,
    sources: { validationSummaryVersion: 'test', graphStatisticsVersion: '' },
    version: '1.0' as const,
  };
}

function buildInput(
  validationSummary: ValidationSummary,
  graphStatistics: GraphStatistics,
  readinessResult: ReadinessResult,
): SuitabilityInput {
  return { validationSummary, graphStatistics, readinessResult };
}

// ---------------------------------------------------------------------------
// Suitability Result — Complete Pipeline
// ---------------------------------------------------------------------------

describe('computeSuitability — Architectural Fit Scenarios', () => {
  it('returns LOW fit for a small simple graph with clean validation', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), smallGraphStats(), readinessWithScores(92, 85, 78, 88)),
    );

    expect(result.architecturalFit).toBe('LOW');
    expect(result.overallScore).toBeLessThan(35);
    expect(result.version).toBe('1.0');
  });

  it('returns MEDIUM fit for a moderate graph with some complexity', () => {
    const result = computeSuitability(
      buildInput(
        { ...cleanValidation(), totalIssues: 3, counts: { errors: 1, warnings: 1, infos: 1 }, passed: false },
        lightMediumGraphStats(),
        readinessWithScores(82, 80, 75, 78),
      ),
    );

    expect(result.architecturalFit).toBe('MEDIUM');
    expect(result.overallScore).toBeGreaterThanOrEqual(35);
    expect(result.overallScore).toBeLessThan(65);
  });

  it('returns HIGH fit for a large complex graph with governance gaps', () => {
    const result = computeSuitability(
      buildInput(failingValidation(20), largeGraphStats(), readinessWithScores(42, 55, 65, 38)),
    );

    expect(result.architecturalFit).toBe('HIGH');
    expect(result.overallScore).toBeGreaterThanOrEqual(65);
  });

  it('returns LOW fit for an empty graph', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), emptyGraphStats(), readinessWithScores(100, 100, 100, 100)),
    );

    expect(result.architecturalFit).toBe('LOW');
    expect(result.overallScore).toBeLessThan(20);
  });
});

describe('computeSuitability — Structure & Contracts', () => {
  it('produces all 4 dimensions with score 0–100', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), mediumGraphStats(), readinessWithScores(72, 65, 68, 60)),
    );

    const dims = result.dimensions;
    expect(dims.topology.score).toBeGreaterThanOrEqual(0);
    expect(dims.topology.score).toBeLessThanOrEqual(100);
    expect(dims.traversal.score).toBeGreaterThanOrEqual(0);
    expect(dims.traversal.score).toBeLessThanOrEqual(100);
    expect(dims.complexity.score).toBeGreaterThanOrEqual(0);
    expect(dims.complexity.score).toBeLessThanOrEqual(100);
    expect(dims.governance.score).toBeGreaterThanOrEqual(0);
    expect(dims.governance.score).toBeLessThanOrEqual(100);
  });

  it('uses correct weights summing to 100', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), mediumGraphStats(), readinessWithScores(72, 65, 68, 60)),
    );

    const weightSum =
      result.dimensions.topology.weight +
      result.dimensions.traversal.weight +
      result.dimensions.complexity.weight +
      result.dimensions.governance.weight;

    expect(weightSum).toBe(100);
  });

  it('overallScore matches weighted sum of dimension scores', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), mediumGraphStats(), readinessWithScores(72, 65, 68, 60)),
    );

    const expected =
      (result.dimensions.topology.score / 100) * result.dimensions.topology.weight +
      (result.dimensions.traversal.score / 100) * result.dimensions.traversal.weight +
      (result.dimensions.complexity.score / 100) * result.dimensions.complexity.weight +
      (result.dimensions.governance.score / 100) * result.dimensions.governance.weight;

    expect(result.overallScore).toBeCloseTo(expected, 1);
  });

  it('produces explainable explanation for every dimension', () => {
    const result = computeSuitability(
      buildInput(failingValidation(12), largeGraphStats(), readinessWithScores(42, 55, 65, 38)),
    );

    // Each dimension explanation should reference specific metrics
    expect(result.dimensions.topology.explanation).toContain('entities');
    expect(result.dimensions.traversal.explanation).toContain('maxDepth');
    expect(result.dimensions.complexity.explanation).toContain('cycles');
    expect(result.dimensions.governance.explanation).toContain('Integrity');
  });

  it('does not mention any technology or vendor name (SR-02)', () => {
    const result = computeSuitability(
      buildInput(failingValidation(12), largeGraphStats(), readinessWithScores(42, 55, 65, 38)),
    );

    const allText = JSON.stringify(result).toLowerCase();
    // The word "databases" appears only in the disclaimer: "does NOT recommend specific technologies, databases, or products"
    // This is an anti-recommendation statement and is correct. No specific product/vendor is named.
    const forbidden = ['neo4j', 'postgresql', 'arangodb', 'janusgraph', 'neo4j', 'amazon neptune', 'microsoft sql', 'oracle'];

    for (const term of forbidden) {
      expect(allText).not.toContain(term);
    }
  });

  it('contains provenance sources', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), mediumGraphStats(), readinessWithScores(72, 65, 68, 60)),
    );

    expect(result.sources.readinessScore).toBeDefined();
    expect(result.sources.graphNodeCount).toBe(45);
  });

  it('is deterministic — same inputs produce same result', () => {
    const input = buildInput(cleanValidation(), smallGraphStats(), readinessWithScores(92, 85, 78, 88));

    const result1 = computeSuitability(input);
    const result2 = computeSuitability(input);

    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result1.architecturalFit).toBe(result2.architecturalFit);
    expect(result1.dimensions.topology.score).toBe(result2.dimensions.topology.score);
  });
});

// ---------------------------------------------------------------------------
// Dimension: Topology
// ---------------------------------------------------------------------------

describe('scoreTopology', () => {
  it('scores low for minimal graphs', () => {
    const result = scoreTopology(tinyGraphStats());
    expect(result.score).toBeLessThan(50);
  });

  it('scores high for large graphs with rich connectivity', () => {
    const result = scoreTopology(largeGraphStats());
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it('scores near zero for empty graph', () => {
    const result = scoreTopology(emptyGraphStats());
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('handles single-node graph without error', () => {
    const result = scoreTopology(singleNodeStats());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.explanation).toContain('Topology');
  });
});

// ---------------------------------------------------------------------------
// Dimension: Traversal
// ---------------------------------------------------------------------------

describe('scoreTraversal', () => {
  it('scores low for shallow graphs', () => {
    const result = scoreTraversal(smallGraphStats());
    expect(result.score).toBeLessThan(50);
  });

  it('scores high for graphs with deep chains', () => {
    const result = scoreTraversal(largeGraphStats());
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it('handles zero-node graph without error', () => {
    const result = scoreTraversal(emptyGraphStats());
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('produces attributable explanation', () => {
    const result = scoreTraversal(largeGraphStats());
    expect(result.explanation).toContain('maxDepth');
    expect(result.explanation).toContain('Contributors');
  });
});

// ---------------------------------------------------------------------------
// Dimension: Complexity
// ---------------------------------------------------------------------------

describe('scoreComplexity', () => {
  it('scores low for simple graphs with no cycles', () => {
    const result = scoreComplexity(smallGraphStats());
    expect(result.score).toBeLessThan(30);
  });

  it('scores high for graphs with many cycles', () => {
    const result = scoreComplexity(largeGraphStats());
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it('handles extreme density graphs', () => {
    const result = scoreComplexity(extremeDensityStats());
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('does not mention technology (SR-02)', () => {
    const result = scoreComplexity(largeGraphStats());
    expect(result.explanation.toLowerCase()).not.toContain('database');
  });
});

// ---------------------------------------------------------------------------
// Dimension: Governance Fit
// ---------------------------------------------------------------------------

describe('scoreGovernance', () => {
  it('scores low for clean validation with high readiness', () => {
    const result = scoreGovernance(cleanValidation(), readinessWithScores(92, 85, 78, 88));
    expect(result.score).toBeLessThan(30);
  });

  it('scores high for failing validation with low integrity', () => {
    const result = scoreGovernance(failingValidation(20), readinessWithScores(35, 50, 55, 30));
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it('treats moderate validation gaps as medium', () => {
    const result = scoreGovernance(
      { ...cleanValidation(), totalIssues: 8, counts: { errors: 3, warnings: 3, infos: 2 }, passed: false },
      readinessWithScores(68, 72, 70, 65),
    );
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(80);
  });

  it('handles edge case: zero issues + max readiness', () => {
    const result = scoreGovernance(
      cleanValidation(),
      readinessWithScores(100, 100, 100, 100),
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThan(20);
  });
});

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------

describe('computeSuitability — Edge Cases', () => {
  it('handles single-node graph', () => {
    const result = computeSuitability(
      buildInput(cleanValidation(), singleNodeStats(), readinessWithScores(100, 100, 100, 100)),
    );

    expect(result.architecturalFit).toBe('LOW');
    expect(result.overallScore).toBeLessThan(30);
  });

  it('handles extreme density graph', () => {
    const result = computeSuitability(
      buildInput(
        { ...cleanValidation(), totalIssues: 3, counts: { errors: 1, warnings: 1, infos: 1 }, passed: false },
        extremeDensityStats(),
        readinessWithScores(75, 80, 85, 70),
      ),
    );

    // Extreme density means many cycles but very short paths
    expect(result.dimensions.complexity.score).toBeGreaterThan(30);
    expect(result.dimensions.traversal.score).toBeLessThan(50);
  });

  it('dimensions are independently scorable', () => {
    // Verify that changing one input only affects its relevant dimension
    const baseGraph = mediumGraphStats();
    const baseReadiness = readinessWithScores(72, 65, 68, 60);
    const clean = cleanValidation();
    const failing = failingValidation(15);

    const resultClean = computeSuitability(buildInput(clean, baseGraph, baseReadiness));
    const resultFailing = computeSuitability(buildInput(failing, baseGraph, baseReadiness));

    // Only governance dimension should change
    expect(resultClean.dimensions.topology.score).toBe(resultFailing.dimensions.topology.score);
    expect(resultClean.dimensions.traversal.score).toBe(resultFailing.dimensions.traversal.score);
    expect(resultClean.dimensions.complexity.score).toBe(resultFailing.dimensions.complexity.score);
    // Governance fit WILL differ
    expect(resultClean.dimensions.governance.score).not.toBe(resultFailing.dimensions.governance.score);
  });
});
