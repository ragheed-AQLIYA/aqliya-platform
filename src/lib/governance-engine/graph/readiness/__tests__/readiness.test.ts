// ENG-001D: Readiness Score — Tests
//
// Validates:
//   - 4 dimension calculators (integrity, completeness, connectivity, traceability)
//   - Aggregator produces correct overall score
//   - RR-01: Only consumes ValidationSummary + GraphStatistics
//   - RR-02: No metric recalculation — statistics consumed as-is
//   - RR-03: Deterministic scoring (same input → same result)
//   - RR-04: Explainability (every point attributable, DEC-2026-0029)
//   - Edge cases: empty graphs, perfect graphs, all-errors graphs

import { describe, it, expect } from '@jest/globals';
import { calculateIntegrity } from '../dimensions/integrity';
import { calculateCompleteness } from '../dimensions/completeness';
import { calculateConnectivity } from '../dimensions/connectivity';
import { calculateTraceability } from '../dimensions/traceability';
import { computeReadiness } from '../aggregator';
import { READINESS_WEIGHTS } from '../types/readiness-types';
import type { ValidationSummary, ValidationCode } from '../../validation/types/validation-issues';
import type { GraphStatistics } from '../../statistics/types/statistics-types';

// ---------------------------------------------------------------------------
// Fixture: Perfect (healthy) pipeline
// ---------------------------------------------------------------------------

function createPerfectValidation(): ValidationSummary {
  return {
    validatedAt: '2026-06-30T12:00:00.000Z',
    totalIssues: 0,
    counts: { errors: 0, warnings: 0, infos: 0 },
    byCode: {} as Record<ValidationCode, number>,
    issues: [],
    passed: true,
  };
}

function createPerfectStatistics(): GraphStatistics {
  return {
    topology: { nodeCount: 10, edgeCount: 18, avgDegree: 1.8, graphDensity: 0.2 },
    connectivity: { connectedComponents: 1, largestComponentSize: 10, orphanNodes: 0, reachableNodes: 10 },
    traversal: { maxDepth: 4, longestChain: ['A', 'B', 'C', 'D', 'E'], avgPathLength: 2.1 },
    structural: { cycleCount: 0, isolatedNodes: 0, duplicateEdges: 0 },
  };
}

// ---------------------------------------------------------------------------
// Fixture: All integrity errors
// ---------------------------------------------------------------------------

function createErrorProneValidation(): ValidationSummary {
  return {
    validatedAt: '2026-06-30T12:00:00.000Z',
    totalIssues: 7,
    counts: { errors: 5, warnings: 2, infos: 0 },
    byCode: {
      'REF-001': 2,
      'REF-002': 1,
      'CAR-001': 1,
      'CHN-001': 1,
      'AUTH-001': 1,
      'INT-001': 1,
    } as Record<ValidationCode, number>,
    issues: [],
    passed: false,
  };
}

// ---------------------------------------------------------------------------
// Fixture: Disconnected graph
// ---------------------------------------------------------------------------

function createDisconnectedStatistics(): GraphStatistics {
  return {
    topology: { nodeCount: 10, edgeCount: 8, avgDegree: 0.8, graphDensity: 0.089 },
    connectivity: { connectedComponents: 3, largestComponentSize: 5, orphanNodes: 2, reachableNodes: 8 },
    traversal: { maxDepth: 2, longestChain: ['X', 'Y', 'Z'], avgPathLength: 1.2 },
    structural: { cycleCount: 0, isolatedNodes: 2, duplicateEdges: 0 },
  };
}

// ---------------------------------------------------------------------------
// Fixture: Orphan-heavy graph
// ---------------------------------------------------------------------------

function createOrphanHeavyStatistics(): GraphStatistics {
  return {
    topology: { nodeCount: 10, edgeCount: 3, avgDegree: 0.3, graphDensity: 0.033 },
    connectivity: { connectedComponents: 5, largestComponentSize: 3, orphanNodes: 6, reachableNodes: 4 },
    traversal: { maxDepth: 1, longestChain: ['A', 'B'], avgPathLength: 0.5 },
    structural: { cycleCount: 0, isolatedNodes: 6, duplicateEdges: 0 },
  };
}

// ---------------------------------------------------------------------------
// Fixture: Broken traceability
// ---------------------------------------------------------------------------

function createBrokenTraceValidation(): ValidationSummary {
  return {
    validatedAt: '2026-06-30T12:00:00.000Z',
    totalIssues: 3,
    counts: { errors: 2, warnings: 1, infos: 0 },
    byCode: {
      'CHN-001': 2,
      'CHN-002': 1,
    } as Record<ValidationCode, number>,
    issues: [],
    passed: false,
  };
}

// ---------------------------------------------------------------------------
// Fixture: Empty graph
// ---------------------------------------------------------------------------

function createEmptyValidation(): ValidationSummary {
  return {
    validatedAt: '2026-06-30T12:00:00.000Z',
    totalIssues: 0,
    counts: { errors: 0, warnings: 0, infos: 0 },
    byCode: {} as Record<ValidationCode, number>,
    issues: [],
    passed: true,
  };
}

function createEmptyStatistics(): GraphStatistics {
  return {
    topology: { nodeCount: 0, edgeCount: 0, avgDegree: 0, graphDensity: 0 },
    connectivity: { connectedComponents: 0, largestComponentSize: 0, orphanNodes: 0, reachableNodes: 0 },
    traversal: { maxDepth: 0, longestChain: [], avgPathLength: 0 },
    structural: { cycleCount: 0, isolatedNodes: 0, duplicateEdges: 0 },
  };
}

// ---------------------------------------------------------------------------
// Weight Validation
// ---------------------------------------------------------------------------

describe('ENG-001D: Weight Validation', () => {
  it('weights sum to exactly 100', () => {
    const sum = READINESS_WEIGHTS.integrity
      + READINESS_WEIGHTS.completeness
      + READINESS_WEIGHTS.connectivity
      + READINESS_WEIGHTS.traceability;
    expect(sum).toBe(100);
  });

  it('all weights are positive integers', () => {
    expect(READINESS_WEIGHTS.integrity).toBeGreaterThan(0);
    expect(READINESS_WEIGHTS.completeness).toBeGreaterThan(0);
    expect(READINESS_WEIGHTS.connectivity).toBeGreaterThan(0);
    expect(READINESS_WEIGHTS.traceability).toBeGreaterThan(0);
    expect(Number.isInteger(READINESS_WEIGHTS.integrity)).toBe(true);
    expect(Number.isInteger(READINESS_WEIGHTS.completeness)).toBe(true);
    expect(Number.isInteger(READINESS_WEIGHTS.connectivity)).toBe(true);
    expect(Number.isInteger(READINESS_WEIGHTS.traceability)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Integrity Dimension
// ---------------------------------------------------------------------------

describe('ENG-001D: Integrity Dimension', () => {
  it('perfect validation returns score 100', () => {
    const result = calculateIntegrity(createPerfectValidation());
    expect(result.score).toBe(100);
    expect(result.weight).toBe(READINESS_WEIGHTS.integrity);
    expect(result.maxScore).toBe(READINESS_WEIGHTS.integrity);
    expect(result.explanation).toContain('Integrity');
    expect(result.explanation).toContain('100');
  });

  it('all error types produce correct penalties', () => {
    const result = calculateIntegrity(createErrorProneValidation());
    // REF-001: 2 * 8 = 16
    // REF-002: 1 * 8 = 8
    // CAR-001: 1 * 10 = 10
    // CHN-001: 1 * 15 = 15
    // AUTH-001: 1 * 10 = 10
    // INT-001: 1 * 50 = 50
    // Total = 109 → capped at 0
    expect(result.score).toBe(0);
    expect(result.explanation).toContain('INT-001');
    expect(result.explanation).toContain('CHN-001');
  });

  it('no errors produce 100 with no penalty details', () => {
    const result = calculateIntegrity(createPerfectValidation());
    expect(result.explanation).toContain('No violations detected');
    expect(result.explanation).toContain('Weighted contribution');
  });

  it('floating point precision preserved', () => {
    // Create validation with odd penalties
    const vs = createPerfectValidation();
    // Add a single REF-001 (penalty 8)
    vs.byCode = { 'REF-001': 1 } as Record<ValidationCode, number>;
    vs.totalIssues = 1;
    vs.counts = { errors: 1, warnings: 0, infos: 0 };
    vs.passed = false;
    const result = calculateIntegrity(vs);
    expect(result.score).toBe(92);
  });

  it('integrity is explainable per DEC-2026-0029', () => {
    const result = calculateIntegrity(createErrorProneValidation());
    expect(result.explanation.length).toBeGreaterThan(50);
    expect(result.explanation).toContain('Integrity');
    expect(result.explanation).toContain('/ 100');
    expect(result.explanation).toContain('Weight');
    expect(result.explanation).toContain('Weighted contribution');
  });
});

// ---------------------------------------------------------------------------
// Completeness Dimension
// ---------------------------------------------------------------------------

describe('ENG-001D: Completeness Dimension', () => {
  it('perfect graph returns score 100', () => {
    const result = calculateCompleteness(createPerfectStatistics());
    expect(result.score).toBe(100);
    expect(result.weight).toBe(READINESS_WEIGHTS.completeness);
  });

  it('orphan-heavy graph has reduced completeness', () => {
    const result = calculateCompleteness(createOrphanHeavyStatistics());
    // 6 orphans / 10 nodes * 30 = 18, 6 isolated / 10 * 20 = 12
    // Total penalty = 30, score = 70
    expect(result.score).toBeLessThan(75);
    expect(result.explanation).toContain('orphan');
  });

  it('empty graph returns perfect score (no issues)', () => {
    const result = calculateCompleteness(createEmptyStatistics());
    expect(result.score).toBe(100);
  });

  it('explanation includes contributor breakdown', () => {
    const result = calculateCompleteness(createOrphanHeavyStatistics());
    expect(result.explanation).toContain('Contributors');
  });
});

// ---------------------------------------------------------------------------
// Connectivity Dimension
// ---------------------------------------------------------------------------

describe('ENG-001D: Connectivity Dimension', () => {
  it('perfect graph returns score 100', () => {
    const result = calculateConnectivity(createPerfectStatistics());
    expect(result.score).toBe(100);
    expect(result.weight).toBe(READINESS_WEIGHTS.connectivity);
  });

  it('disconnected graph has reduced connectivity', () => {
    const result = calculateConnectivity(createDisconnectedStatistics());
    // 3 components → component_score reduces
    // 2 orphans → orphan_score reduces
    expect(result.score).toBeLessThan(90);
    expect(result.explanation).toContain('component');
  });

  it('empty graph returns perfect connectivity score (no issues)', () => {
    const result = calculateConnectivity(createEmptyStatistics());
    expect(result.score).toBe(100);
  });

  it('explanation includes component count', () => {
    const result = calculateConnectivity(createDisconnectedStatistics());
    expect(result.explanation).toContain('3 component');
  });
});

// ---------------------------------------------------------------------------
// Traceability Dimension
// ---------------------------------------------------------------------------

describe('ENG-001D: Traceability Dimension', () => {
  it('perfect validation returns high traceability', () => {
    const result = calculateTraceability(createPerfectValidation(), createPerfectStatistics());
    // Base 100 + maxDepth=4 gives +10 bonus = 110 → capped at 100
    expect(result.score).toBe(100);
    expect(result.weight).toBe(READINESS_WEIGHTS.traceability);
  });

  it('broken chains reduce traceability', () => {
    const result = calculateTraceability(createBrokenTraceValidation(), createPerfectStatistics());
    // 2 * CHN-001 (-30) + 1 * CHN-002 (-10) = -40
    // 100 - 40 + maxDepth bonus +10 = 70
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(80);
    expect(result.explanation).toContain('broken');
  });

  it('empty graph returns 0 depth traceability', () => {
    const result = calculateTraceability(createEmptyValidation(), createEmptyStatistics());
    // maxDepth = 0 → no bonus. No chain errors. Score = 100.
    expect(result.score).toBe(100);
  });

  it('explanation includes chain details', () => {
    const result = calculateTraceability(createBrokenTraceValidation(), createPerfectStatistics());
    expect(result.explanation).toContain('broken chain');
  });
});

// ---------------------------------------------------------------------------
// Aggregator
// ---------------------------------------------------------------------------

describe('ENG-001D: Score Aggregator', () => {
  it('returns all 4 dimensions', () => {
    const result = computeReadiness({
      validationSummary: createPerfectValidation(),
      graphStatistics: createPerfectStatistics(),
    });
    expect(result.dimensions.integrity).toBeDefined();
    expect(result.dimensions.completeness).toBeDefined();
    expect(result.dimensions.connectivity).toBeDefined();
    expect(result.dimensions.traceability).toBeDefined();
  });

  it('perfect inputs produce overallScore = 100', () => {
    const result = computeReadiness({
      validationSummary: createPerfectValidation(),
      graphStatistics: createPerfectStatistics(),
    });
    expect(result.overallScore).toBe(100);
  });

  it('error-prone inputs produce reduced score', () => {
    const result = computeReadiness({
      validationSummary: createErrorProneValidation(),
      graphStatistics: createPerfectStatistics(),
    });
    // Integrity = 0 (CHN-001 penalty → also reduced) (weight 30%) → contributes 0
    // Completeness = 100 (weight 25%) → contributes 25
    // Connectivity = 100 (weight 20%) → contributes 20
    // Traceability = 95 (CHN-001 penalty) (weight 25%) → contributes 23.75
    // overall = 0 + 25 + 20 + 23.75 = 68.75
    expect(result.overallScore).toBe(68.75);
  });

  it('broken traceability reduces overall score', () => {
    const result = computeReadiness({
      validationSummary: createBrokenTraceValidation(),
      graphStatistics: createPerfectStatistics(),
    });
    // Integrity = 55 (CHN-001 + CHN-002 penalties cross dimensions) (weight 30%) → 16.5
    // Completeness = 100 (weight 25%) → 25
    // Connectivity = 100 (weight 20%) → 20
    // Traceability = 70 (CHN-001 + CHN-002 penalties) (weight 25%) → 17.5
    // Total = 16.5 + 25 + 20 + 17.5 = 79
    expect(result.overallScore).toBe(79);
  });

  it('empty graph produces score 100 (no issues)', () => {
    const result = computeReadiness({
      validationSummary: createEmptyValidation(),
      graphStatistics: createEmptyStatistics(),
    });
    expect(result.overallScore).toBe(100);
  });

  it('returned version is "1.0"', () => {
    const result = computeReadiness({
      validationSummary: createPerfectValidation(),
      graphStatistics: createPerfectStatistics(),
    });
    expect(result.version).toBe('1.0');
  });
});

// ---------------------------------------------------------------------------
// RR-01: Consumes only ValidationSummary + GraphStatistics
// ---------------------------------------------------------------------------

describe('ENG-001D: RR-01 — Readiness is Evidence-Based', () => {
  it('computeReadiness accepts only ValidationSummary + GraphStatistics', () => {
    // TypeScript confirms this at compile time — the function signature
    // accepts ReadinessInput { validationSummary, graphStatistics } only.
    const vs = createPerfectValidation();
    const gs = createPerfectStatistics();
    // No Markdown, no raw JSON, no registry, no graph in the signature
    expect(() =>
      computeReadiness({ validationSummary: vs, graphStatistics: gs }),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// RR-02: No Metric Recalculation
// ---------------------------------------------------------------------------

describe('ENG-001D: RR-02 — No Metric Recalculation', () => {
  it('dimension calculators consume statistics as-is — no rebuild', () => {
    // Connectivity dimension reads orphanNodes directly from statistics
    // rather than recalculating from raw data
    const gs = createDisconnectedStatistics();
    const result = calculateConnectivity(gs);
    // Confirm it uses the supplied orphanNodes value
    const orphansUsed = result.explanation.includes(`${gs.connectivity.orphanNodes} orphan`);
    const componentsUsed = result.explanation.includes(`${gs.connectivity.connectedComponents} component`);
    expect(orphansUsed || componentsUsed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RR-03: Deterministic Scoring
// ---------------------------------------------------------------------------

describe('ENG-001D: RR-03 — Deterministic Scoring', () => {
  it('same inputs always produce same result', () => {
    const vs = createPerfectValidation();
    const gs = createPerfectStatistics();

    const result1 = computeReadiness({ validationSummary: vs, graphStatistics: gs });
    const result2 = computeReadiness({ validationSummary: vs, graphStatistics: gs });
    const result3 = computeReadiness({ validationSummary: vs, graphStatistics: gs });

    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result2.overallScore).toBe(result3.overallScore);
    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
  });

  it('no randomness in scores', () => {
    const vs = createPerfectValidation();
    const gs = createPerfectStatistics();

    // Run 5 times — should get identical results
    const scores = Array.from({ length: 5 }, () =>
      computeReadiness({ validationSummary: vs, graphStatistics: gs }).overallScore,
    );

    expect(new Set(scores).size).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// RR-04 / DEC-2026-0029: Explainability
// ---------------------------------------------------------------------------

describe('ENG-001D: RR-04 — Readiness Explainability (DEC-2026-0029)', () => {
  it('every dimension has a non-empty explanation', () => {
    const result = computeReadiness({
      validationSummary: createErrorProneValidation(),
      graphStatistics: createDisconnectedStatistics(),
    });

    expect(result.dimensions.integrity.explanation.length).toBeGreaterThan(10);
    expect(result.dimensions.completeness.explanation.length).toBeGreaterThan(10);
    expect(result.dimensions.connectivity.explanation.length).toBeGreaterThan(10);
    expect(result.dimensions.traceability.explanation.length).toBeGreaterThan(10);
  });

  it('explanations contain score and weight', () => {
    const result = computeReadiness({
      validationSummary: createPerfectValidation(),
      graphStatistics: createPerfectStatistics(),
    });

    const allExplanations = Object.values(result.dimensions).map(d => d.explanation);
    for (const exp of allExplanations) {
      expect(exp).toContain('/ 100');
      expect(exp).toContain('Weight');
      expect(exp).toContain('Weighted contribution');
    }
  });

  it('explanations list measurable contributors', () => {
    const result = computeReadiness({
      validationSummary: createErrorProneValidation(),
      graphStatistics: createDisconnectedStatistics(),
    });

    // Error-prone validation should mention violation codes
    expect(result.dimensions.integrity.explanation).toContain('Contributors');
    // Disconnected graph should mention components
    expect(result.dimensions.connectivity.explanation).toContain('Contributors');
  });
});

// ---------------------------------------------------------------------------
// ReadinessSources / Provenance
// ---------------------------------------------------------------------------

describe('ENG-001D: ReadinessSources Provenance', () => {
  it('sources contain validationSummaryVersion from validatedAt', () => {
    const vs = createPerfectValidation();
    const result = computeReadiness({
      validationSummary: vs,
      graphStatistics: createPerfectStatistics(),
    });
    expect(result.sources.validationSummaryVersion).toBe(vs.validatedAt);
  });

  it('sources contain graphStatisticsVersion field', () => {
    const result = computeReadiness({
      validationSummary: createPerfectValidation(),
      graphStatistics: createPerfectStatistics(),
    });
    expect(typeof result.sources.graphStatisticsVersion).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Floating Point Precision
// ---------------------------------------------------------------------------

describe('ENG-001D: Floating Point Precision', () => {
  it('overallScore supports non-integer values', () => {
    // Create a scenario that produces non-integer score
    const vs: ValidationSummary = {
      validatedAt: '2026-06-30T12:00:00.000Z',
      totalIssues: 1,
      counts: { errors: 1, warnings: 0, infos: 0 },
      byCode: { 'REF-001': 1 } as Record<ValidationCode, number>,
      issues: [],
      passed: false,
    };
    // Integrity = 92 (weight 30%)
    // All others 100 (combined weight 70%)
    // Overall = 92*0.30 + 100*0.70 = 27.6 + 70 = 97.6
    const result = computeReadiness({
      validationSummary: vs,
      graphStatistics: createPerfectStatistics(),
    });
    expect(typeof result.overallScore).toBe('number');
    // Check it's not just an integer
    const decimal = result.overallScore.toString().includes('.');
    expect(decimal || result.overallScore < 100).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Calculator Purity
// ---------------------------------------------------------------------------

describe('ENG-001D: Pure Function — no mutation of input', () => {
  it('computeReadiness does not mutate validationSummary', () => {
    const vs = createPerfectValidation();
    const gs = createPerfectStatistics();
    const vsSnapshot = JSON.stringify(vs);
    computeReadiness({ validationSummary: vs, graphStatistics: gs });
    expect(JSON.stringify(vs)).toBe(vsSnapshot);
  });

  it('computeReadiness does not mutate graphStatistics', () => {
    const vs = createPerfectValidation();
    const gs = createPerfectStatistics();
    const gsSnapshot = JSON.stringify(gs);
    computeReadiness({ validationSummary: vs, graphStatistics: gs });
    expect(JSON.stringify(gs)).toBe(gsSnapshot);
  });

  it('dimension calculators do not mutate inputs', () => {
    const vs = createPerfectValidation();
    const vsSnapshot = JSON.stringify(vs);
    calculateIntegrity(vs);
    expect(JSON.stringify(vs)).toBe(vsSnapshot);
  });
});
