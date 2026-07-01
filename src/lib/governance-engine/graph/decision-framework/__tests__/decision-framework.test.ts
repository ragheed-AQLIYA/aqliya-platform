// ENG-001F: Decision Framework — Unit Tests
//
// Covers:
//   - All 4 recommendation levels (NO_ACTION, MONITOR, CONSIDER, RECOMMEND)
//   - Confidence independence from suitability
//   - DR-01: Decision consumes, never measures
//   - DR-02: Decision recommends, never executes
//   - DR-03: Every recommendation cites evidence
//   - DR-04: No recommendation without confidence
//   - adrRequired mapping
//   - Assumptions based on graph characteristics
//   - Edge cases: empty graph, perfect governance, minimal data
//
// Pure function tests — no I/O, no side effects.

import { describe, it, expect } from '@jest/globals';
import { produceRecommendation } from '../decision-aggregator';
import type {
  DecisionInput,
  EvidenceItem,
  RecommendationLevel,
} from '../decision-framework-types';
import type { ValidationSummary } from '../../validation/types/validation-issues';
import type { GraphStatistics } from '../../statistics/types/statistics-types';
import type { ReadinessResult } from '../../readiness/types/readiness-types';
import type { SuitabilityResult } from '../../suitability/suitability-types';

// ---------------------------------------------------------------------------
// Fixture Builders
// ---------------------------------------------------------------------------

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

function failingValidation(issueCount: number): ValidationSummary {
  return {
    validatedAt: new Date().toISOString(),
    totalIssues: issueCount,
    counts: {
      errors: Math.ceil(issueCount * 0.6),
      warnings: Math.ceil(issueCount * 0.3),
      infos: Math.ceil(issueCount * 0.1),
    },
    byCode: {},
    issues: [],
    passed: false,
  };
}

function readiness(overallScore: number): ReadinessResult {
  const pct = overallScore / 100;
  return {
    overallScore,
    dimensions: {
      integrity: { score: Math.round(overallScore * 0.9), weight: 30, maxScore: 30, explanation: '' },
      completeness: { score: Math.round(overallScore * 0.85), weight: 25, maxScore: 25, explanation: '' },
      connectivity: { score: Math.round(overallScore * 0.8), weight: 20, maxScore: 20, explanation: '' },
      traceability: { score: Math.round(overallScore * 0.75), weight: 25, maxScore: 25, explanation: '' },
    },
    sources: { validationSummaryVersion: 'test', graphStatisticsVersion: '' },
    version: '1.0' as const,
  };
}

function stats(nodeCount: number, edgeCount: number): GraphStatistics {
  return {
    topology: { nodeCount, edgeCount, avgDegree: edgeCount / Math.max(nodeCount, 1), graphDensity: 0.1 },
    connectivity: { connectedComponents: 1, largestComponentSize: nodeCount, orphanNodes: 0, reachableNodes: nodeCount },
    traversal: { maxDepth: 3, longestChain: ['A', 'B', 'C'], avgPathLength: 2 },
    structural: { cycleCount: nodeCount > 10 ? 2 : 0, isolatedNodes: 0, duplicateEdges: nodeCount > 10 ? 1 : 0 },
  };
}

function suitability(fit: 'LOW' | 'MEDIUM' | 'HIGH', score: number): SuitabilityResult {
  const baseDim = (s: number) => ({
    score: s,
    weight: 25,
    maxScore: 25,
    explanation: '',
  });

  // Distribute score across dimensions
  const dims = fit === 'HIGH'
    ? { topology: baseDim(90), traversal: baseDim(85), complexity: baseDim(80), governance: baseDim(75) }
    : fit === 'MEDIUM'
      ? { topology: baseDim(55), traversal: baseDim(50), complexity: baseDim(45), governance: baseDim(40) }
      : { topology: baseDim(20), traversal: baseDim(15), complexity: baseDim(10), governance: baseDim(10) };

  return {
    overallScore: score,
    dimensions: dims,
    architecturalFit: fit,
    explanation: '',
    sources: { readinessScore: score, graphNodeCount: 100 },
    version: '1.0' as const,
  };
}

function buildInput(
  validationSummary: ValidationSummary,
  graphStatistics: GraphStatistics,
  readinessResult: ReadinessResult,
  suitabilityResult: SuitabilityResult,
): DecisionInput {
  return { validationSummary, graphStatistics, readinessResult, suitabilityResult };
}

// ---------------------------------------------------------------------------
// Recommendation Level Scenarios
// ---------------------------------------------------------------------------

describe('produceRecommendation — Recommendation Levels', () => {
  it('returns RECOMMEND for HIGH suitability + high confidence', () => {
    // Large graph + high readiness = high confidence
    const result = produceRecommendation(
      buildInput(
        cleanValidation(),
        stats(200, 800),
        readiness(85),
        suitability('HIGH', 88),
      ),
    );

    expect(result.recommendationLevel).toBe('RECOMMEND');
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it('returns CONSIDER for HIGH suitability + low confidence', () => {
    // Small graph + low readiness = low confidence
    const result = produceRecommendation(
      buildInput(
        failingValidation(5),
        stats(5, 8),
        readiness(25),
        suitability('HIGH', 80),
      ),
    );

    expect(result.recommendationLevel).toBe('CONSIDER');
    expect(result.confidence).toBeLessThan(0.6);
  });

  it('returns CONSIDER for MEDIUM suitability + high confidence', () => {
    const result = produceRecommendation(
      buildInput(
        cleanValidation(),
        stats(100, 300),
        readiness(75),
        suitability('MEDIUM', 50),
      ),
    );

    expect(result.recommendationLevel).toBe('CONSIDER');
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it('returns MONITOR for MEDIUM suitability + low confidence', () => {
    const result = produceRecommendation(
      buildInput(
        cleanValidation(),
        stats(8, 12),
        readiness(30),
        suitability('MEDIUM', 45),
      ),
    );

    expect(result.recommendationLevel).toBe('MONITOR');
    expect(result.confidence).toBeLessThan(0.6);
  });

  it('returns NO_ACTION for LOW suitability + high confidence', () => {
    const result = produceRecommendation(
      buildInput(
        cleanValidation(),
        stats(150, 400),
        readiness(80),
        suitability('LOW', 20),
      ),
    );

    expect(result.recommendationLevel).toBe('NO_ACTION');
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it('returns MONITOR for LOW suitability + low confidence', () => {
    const result = produceRecommendation(
      buildInput(
        cleanValidation(),
        stats(3, 2),
        readiness(15),
        suitability('LOW', 15),
      ),
    );

    expect(result.recommendationLevel).toBe('MONITOR');
    expect(result.confidence).toBeLessThan(0.6);
  });
});

// ---------------------------------------------------------------------------
// Confidence Independence (DR-04)
// ---------------------------------------------------------------------------

describe('produceRecommendation — Confidence Independence', () => {
  it('confidence is independent of suitability fit', () => {
    // Same graph size + readiness → same confidence regardless of suitability
    const baseStats = stats(100, 300);
    const baseReadiness = readiness(75);

    const highFit = produceRecommendation(
      buildInput(cleanValidation(), baseStats, baseReadiness, suitability('HIGH', 85)),
    );

    const lowFit = produceRecommendation(
      buildInput(cleanValidation(), baseStats, baseReadiness, suitability('LOW', 15)),
    );

    // Both should have same confidence (same data quality inputs)
    expect(highFit.confidence).toBe(lowFit.confidence);
    // But different recommendation levels
    expect(highFit.recommendationLevel).not.toBe(lowFit.recommendationLevel);
  });

  it('confidence increases with graph size', () => {
    const small = produceRecommendation(
      buildInput(cleanValidation(), stats(3, 5), readiness(80), suitability('HIGH', 85)),
    );

    const large = produceRecommendation(
      buildInput(cleanValidation(), stats(300, 1000), readiness(80), suitability('HIGH', 85)),
    );

    expect(large.confidence).toBeGreaterThan(small.confidence);
  });

  it('confidence increases with readiness score', () => {
    const lowReadiness = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(20), suitability('HIGH', 85)),
    );

    const highReadiness = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(90), suitability('HIGH', 85)),
    );

    expect(highReadiness.confidence).toBeGreaterThan(lowReadiness.confidence);
  });
});

// ---------------------------------------------------------------------------
// DR Compliance
// ---------------------------------------------------------------------------

describe('produceRecommendation — DR Compliance', () => {
  it('DR-01: consumes only 4 inputs — does not access raw data', () => {
    // The function signature proves DR-01: only DecisionInput
    // which contains ValidationSummary, GraphStatistics, ReadinessResult,
    // SuitabilityResult. No registries, no Markdown, no file paths.
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('HIGH', 85)),
    );

    // Verify it processed the inputs into a recommendation
    expect(result).toHaveProperty('recommendationLevel');
    expect(result).toHaveProperty('confidence');
  });

  it('DR-02: produces a recommendation — does not execute actions', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('HIGH', 85)),
    );

    // Output is a recommendation object, not an executed action
    expect(result.recommendationLevel).toBeDefined();
    expect(result.nextAction).toContain('Create'); // suggests action, doesn't execute
    expect(result.adrRequired).toBe(true); // doesn't generate ADR
  });

  it('DR-03: every recommendation cites specific evidence', () => {
    const result = produceRecommendation(
      buildInput(failingValidation(12), stats(100, 300), readiness(75), suitability('HIGH', 85)),
    );

    expect(result.supportingEvidence.length).toBeGreaterThanOrEqual(4); // at least 1 per source

    // Every source engine is cited
    const sources = new Set(result.supportingEvidence.map((e) => e.source));
    expect(sources.has('ValidationSummary')).toBe(true);
    expect(sources.has('GraphStatistics')).toBe(true);
    expect(sources.has('ReadinessResult')).toBe(true);
    expect(sources.has('SuitabilityResult')).toBe(true);

    // Each evidence item has the required fields
    for (const item of result.supportingEvidence) {
      expect(item).toHaveProperty('source');
      expect(item).toHaveProperty('key');
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('role');
      expect(typeof item.role).toBe('string');
      expect(item.role.length).toBeGreaterThan(0);
    }
  });

  it('DR-04: always includes confidence score between 0 and 1', () => {
    const scenarios = [
      buildInput(cleanValidation(), stats(200, 800), readiness(90), suitability('HIGH', 90)),
      buildInput(cleanValidation(), stats(3, 2), readiness(10), suitability('LOW', 10)),
      buildInput(failingValidation(20), stats(50, 150), readiness(50), suitability('MEDIUM', 50)),
      buildInput(cleanValidation(), stats(0, 0), readiness(0), suitability('LOW', 0)),
    ];

    for (const input of scenarios) {
      const result = produceRecommendation(input);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.confidence).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// ADR Required Logic
// ---------------------------------------------------------------------------

describe('produceRecommendation — ADR Required', () => {
  it('adrRequired is true for RECOMMEND', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(200, 800), readiness(85), suitability('HIGH', 88)),
    );
    expect(result.recommendationLevel).toBe('RECOMMEND');
    expect(result.adrRequired).toBe(true);
  });

  it('adrRequired is true for CONSIDER', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('MEDIUM', 50)),
    );
    expect(result.recommendationLevel).toBe('CONSIDER');
    expect(result.adrRequired).toBe(true);
  });

  it('adrRequired is false for MONITOR', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(8, 12), readiness(30), suitability('LOW', 15)),
    );
    expect(result.recommendationLevel).toBe('MONITOR');
    expect(result.adrRequired).toBe(false);
  });

  it('adrRequired is false for NO_ACTION', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(150, 400), readiness(80), suitability('LOW', 20)),
    );
    expect(result.recommendationLevel).toBe('NO_ACTION');
    expect(result.adrRequired).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Assumptions
// ---------------------------------------------------------------------------

describe('produceRecommendation — Assumptions', () => {
  it('always surfaces at least 4 inherent assumptions', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('MEDIUM', 50)),
    );

    expect(result.assumptions.length).toBeGreaterThanOrEqual(4);
    // Core assumptions are always present
    expect(result.assumptions.some((a) => a.includes('registries'))).toBe(true);
    expect(result.assumptions.some((a) => a.includes('Validation'))).toBe(true);
  });

  it('adds small graph assumption for tiny datasets', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(3, 5), readiness(75), suitability('HIGH', 85)),
    );

    expect(result.assumptions.some((a) => a.includes('Small graph'))).toBe(true);
  });

  it('adds zero-issues assumption when no validation issues found', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('HIGH', 85)),
    );

    expect(result.assumptions.some((a) => a.includes('Zero validation issues'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Evidence Content
// ---------------------------------------------------------------------------

describe('produceRecommendation — Evidence', () => {
  it('includes validation issue count in evidence', () => {
    const result = produceRecommendation(
      buildInput(failingValidation(12), stats(100, 300), readiness(75), suitability('HIGH', 85)),
    );

    const issueEvidence = result.supportingEvidence.find((e) => e.key === 'totalIssues');
    expect(issueEvidence).toBeDefined();
    expect(issueEvidence!.value).toBe(12);
  });

  it('includes nodeCount and edgeCount in evidence', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(150, 500), readiness(75), suitability('MEDIUM', 50)),
    );

    expect(result.supportingEvidence.some((e) => e.key === 'nodeCount' && e.value === 150)).toBe(true);
    expect(result.supportingEvidence.some((e) => e.key === 'edgeCount' && e.value === 500)).toBe(true);
  });

  it('includes readiness overallScore in evidence', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(72), suitability('MEDIUM', 50)),
    );

    const readinessEvidence = result.supportingEvidence.find((e) => e.key === 'overallScore');
    expect(readinessEvidence).toBeDefined();
    expect(readinessEvidence!.value).toBe(72);
  });

  it('includes suitability architecturalFit in evidence', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('HIGH', 85)),
    );

    const fitEvidence = result.supportingEvidence.find((e) => e.key === 'architecturalFit');
    expect(fitEvidence).toBeDefined();
    expect(fitEvidence!.value).toBe('HIGH');
  });
});

// ---------------------------------------------------------------------------
// Next Action
// ---------------------------------------------------------------------------

describe('produceRecommendation — Next Action', () => {
  it('nextAction is concrete and actionable for RECOMMEND', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(200, 800), readiness(85), suitability('HIGH', 88)),
    );

    expect(result.nextAction).toContain('Architecture Decision Record');
    expect(result.nextAction.length).toBeGreaterThan(20);
  });

  it('nextAction is appropriate for NO_ACTION', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(150, 400), readiness(80), suitability('LOW', 20)),
    );

    expect(result.nextAction).toContain('No action');
  });
});

// ---------------------------------------------------------------------------
// Version & Determinism
// ---------------------------------------------------------------------------

describe('produceRecommendation — Contract', () => {
  it('has version 1.0', () => {
    const result = produceRecommendation(
      buildInput(cleanValidation(), stats(100, 300), readiness(75), suitability('MEDIUM', 50)),
    );

    expect(result.version).toBe('1.0');
  });

  it('is deterministic — same inputs produce same result', () => {
    const input = buildInput(
      cleanValidation(),
      stats(100, 300),
      readiness(75),
      suitability('HIGH', 85),
    );

    const result1 = produceRecommendation(input);
    const result2 = produceRecommendation(input);

    expect(result1.recommendationLevel).toBe(result2.recommendationLevel);
    expect(result1.confidence).toBe(result2.confidence);
    expect(result1.supportingEvidence).toEqual(result2.supportingEvidence);
    expect(result1.assumptions).toEqual(result2.assumptions);
  });
});
